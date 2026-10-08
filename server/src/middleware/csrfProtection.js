const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const toOrigin = (value) => {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const rejectRequest = (res) =>
  res.status(403).json({
    success: false,
    message: 'Request origin could not be verified'
  });

const createCsrfProtection = ({ allowedOrigins }) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const requestOrigin = req.get('origin');
  if (requestOrigin) {
    if (!allowedOrigins.has(toOrigin(requestOrigin))) return rejectRequest(res);
    return next();
  }

  const refererOrigin = toOrigin(req.get('referer'));
  if (refererOrigin) {
    if (!allowedOrigins.has(refererOrigin)) return rejectRequest(res);
    return next();
  }

  const fetchSite = req.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return rejectRequest(res);

  const hasCookieCredential = Boolean(
    req.cookies?.accessToken || req.cookies?.refreshToken
  );
  if (hasCookieCredential && fetchSite !== 'same-origin' && fetchSite !== 'same-site') {
    return rejectRequest(res);
  }

  return next();
};

module.exports = createCsrfProtection;
