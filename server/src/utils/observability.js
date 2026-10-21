const crypto = require('crypto');
const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');

const requestTotals = new Map();
const requestDurations = new Map();
const authEventTotals = new Map();
const durationBuckets = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
let requestsInFlight = 0;

const writeLog = (level, event, fields = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

const logger = {
  info: (event, fields) => writeLog('info', event, fields),
  warn: (event, fields) => writeLog('warn', event, fields),
  error: (event, fields) => writeLog('error', event, fields)
};

const routeFor = (req) => {
  const routePath = req.route?.path;
  if (typeof routePath === 'string') return `${req.baseUrl || ''}${routePath}` || '/';
  if (Array.isArray(routePath)) return `${req.baseUrl || ''}${routePath[0]}` || '/';
  if (req.path === '/health' || req.path === '/metrics' || req.path === '/') return req.path;
  return 'unmatched';
};

const requestKey = (method, route, status) => `${method}\u0000${route}\u0000${status}`;

const requestMetricsMiddleware = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  requestsInFlight += 1;
  const startedAt = process.hrtime.bigint();
  let completed = false;

  const finish = () => {
    if (completed) return;
    completed = true;
    requestsInFlight = Math.max(0, requestsInFlight - 1);

    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const method = req.method;
    const route = routeFor(req);
    const statusCode = res.writableFinished ? res.statusCode : 499;
    const status = String(statusCode);
    const key = requestKey(method, route, status);
    requestTotals.set(key, (requestTotals.get(key) || 0) + 1);
    const duration = requestDurations.get(key) || {
      count: 0,
      sum: 0,
      buckets: durationBuckets.map(() => 0)
    };
    duration.count += 1;
    duration.sum += durationSeconds;
    durationBuckets.forEach((upperBound, index) => {
      if (durationSeconds <= upperBound) duration.buckets[index] += 1;
    });
    requestDurations.set(key, duration);

    logger.info('http.request.completed', {
      requestId: req.requestId,
      method,
      route,
      statusCode,
      durationMs: Math.round(durationSeconds * 1000 * 100) / 100,
      ...(req.user?._id
        ? { userId: String(req.user._id), username: req.user.username }
        : {})
    });
  };

  res.once('finish', finish);
  res.once('close', finish);
  next();
};

const recordAuthEvent = (method, outcome, fields = {}) => {
  const key = `${method}\u0000${outcome}`;
  authEventTotals.set(key, (authEventTotals.get(key) || 0) + 1);
  logger.info('auth.sign_in', {
    method,
    outcome,
    ...fields
  });
};

const escapeLabel = (value) => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/"/g, '\\"');

const formatMetrics = () => {
  const lines = [
    '# HELP dashpoint_http_requests_total Completed HTTP requests.',
    '# TYPE dashpoint_http_requests_total counter'
  ];

  for (const [key, count] of requestTotals) {
    const [method, route, status] = key.split('\u0000');
    lines.push(`dashpoint_http_requests_total{method="${escapeLabel(method)}",route="${escapeLabel(route)}",status_code="${escapeLabel(status)}"} ${count}`);
  }

  lines.push(
    '# HELP dashpoint_http_request_duration_seconds Request duration in seconds.',
    '# TYPE dashpoint_http_request_duration_seconds histogram'
  );
  for (const [key, duration] of requestDurations) {
    const [method, route, status] = key.split('\u0000');
    const labels = `method="${escapeLabel(method)}",route="${escapeLabel(route)}",status_code="${escapeLabel(status)}"`;
    durationBuckets.forEach((upperBound, index) => {
      lines.push(`dashpoint_http_request_duration_seconds_bucket{${labels},le="${upperBound}"} ${duration.buckets[index]}`);
    });
    lines.push(`dashpoint_http_request_duration_seconds_bucket{${labels},le="+Inf"} ${duration.count}`);
    lines.push(`dashpoint_http_request_duration_seconds_sum{${labels}} ${duration.sum.toFixed(6)}`);
    lines.push(`dashpoint_http_request_duration_seconds_count{${labels}} ${duration.count}`);
  }

  lines.push(
    '# HELP dashpoint_http_requests_in_flight Current requests being processed.',
    '# TYPE dashpoint_http_requests_in_flight gauge',
    `dashpoint_http_requests_in_flight ${requestsInFlight}`,
    '# HELP process_uptime_seconds Process uptime in seconds.',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${process.uptime().toFixed(3)}`,
    '# HELP process_resident_memory_bytes Resident memory used by the process.',
    '# TYPE process_resident_memory_bytes gauge',
    `process_resident_memory_bytes ${process.memoryUsage().rss}`,
    '# HELP process_heap_used_bytes Heap memory used by the process.',
    '# TYPE process_heap_used_bytes gauge',
    `process_heap_used_bytes ${process.memoryUsage().heapUsed}`,
    '# HELP dashpoint_dependency_connected Dependency connection state (1 connected, 0 disconnected).',
    '# TYPE dashpoint_dependency_connected gauge',
    `dashpoint_dependency_connected{dependency="mongodb"} ${mongoose.connection.readyState === 1 ? 1 : 0}`,
    `dashpoint_dependency_connected{dependency="redis"} ${getRedisClient()?.isReady ? 1 : 0}`,
    '# HELP dashpoint_auth_events_total Authentication events by method and outcome.',
    '# TYPE dashpoint_auth_events_total counter'
  );

  for (const [key, count] of authEventTotals) {
    const [method, outcome] = key.split('\u0000');
    lines.push(`dashpoint_auth_events_total{method="${escapeLabel(method)}",outcome="${escapeLabel(outcome)}"} ${count}`);
  }

  return `${lines.join('\n')}\n`;
};

const metricsHandler = (req, res) => {
  const configuredToken = String(process.env.METRICS_TOKEN || '').trim();
  if (!configuredToken && process.env.NODE_ENV === 'production') {
    return res.status(404).end();
  }

  if (configuredToken) {
    const suppliedToken = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const expected = Buffer.from(configuredToken);
    const supplied = Buffer.from(suppliedToken);
    const authorized = expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
    if (!authorized) return res.status(404).end();
  }

  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  return res.status(200).send(formatMetrics());
};

module.exports = {
  logger,
  requestMetricsMiddleware,
  recordAuthEvent,
  metricsHandler
};
