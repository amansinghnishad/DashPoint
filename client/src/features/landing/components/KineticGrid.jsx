import { useRef, useEffect } from "react";

const COMPONENT_DEFAULTS = {
  background: "transparent",
  dotColor: "#18181b",
  lineColor: "#f99149",
  trailColor: "#f18940",
  spacing: 45,
  radius: 250,
  strength: 4,
  trail: true,
};

export default function KineticGrid(props) {
  const settings = { ...COMPONENT_DEFAULTS, ...props };
  const { background, dotColor, lineColor, trailColor, spacing, radius, strength, trail, style } =
    settings;

  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const trailRef = useRef([]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GAP = Math.max(8, spacing);
    const R = Math.max(1, radius);
    const PULL = (Math.max(1, Math.min(10, strength)) / 10) * 4;

    let W = 1;
    let H = 1;
    let cols = [];
    let dots = [];

    const build = (mw, mh) => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, Math.floor(mw ?? r.width));
      H = Math.max(1, Math.floor(mh ?? r.height));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = [];
      dots = [];
      const nCols = Math.floor(W / GAP) + 2;
      const nRows = Math.floor(H / GAP) + 2;
      for (let c = 0; c < nCols; c++) {
        const col = [];
        for (let rIdx = 0; rIdx < nRows; rIdx++) {
          const hx = c * GAP;
          const hy = rIdx * GAP;
          const d = { hx, hy, x: hx, y: hy, vx: 0, vy: 0 };
          col.push(d);
          dots.push(d);
        }
        cols.push(col);
      }
    };

    build();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect;
            build(cr?.width, cr?.height);
          })
        : null;
    ro?.observe(host);

    const setMouse = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      const mx = clientX - r.left;
      const my = clientY - r.top;
      mouseRef.current.x = mx;
      mouseRef.current.y = my;
      mouseRef.current.active = true;
      const now = performance.now();
      const tr = trailRef.current;
      tr.push({ x: mx, y: my, t: now });
      if (tr.length > 80) tr.shift();
    };

    const onMove = (e) => setMouse(e.clientX, e.clientY);
    const onLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) setMouse(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    host.addEventListener("mouseleave", onLeave);
    host.addEventListener("touchend", onLeave);

    let raf = 0;
    const frame = (tNow) => {
      const time = (tNow || performance.now()) * 0.0012;
      const m = mouseRef.current;
      ctx.clearRect(0, 0, W, H);

      // Update dot physics: continuous organic idle wave + attraction toward cursor.
      for (let c = 0; c < cols.length; c++) {
        for (let rIdx = 0; rIdx < cols[c].length; rIdx++) {
          const d = cols[c][rIdx];
          // Gentle ambient wave offset for home position
          const waveX = Math.sin(time + c * 0.35 + rIdx * 0.25) * 6;
          const waveY = Math.cos(time * 0.85 + c * 0.25 + rIdx * 0.4) * 6;
          const targetHx = d.hx + waveX;
          const targetHy = d.hy + waveY;

          let ax = (targetHx - d.x) * 0.06;
          let ay = (targetHy - d.y) * 0.06;

          if (m.active) {
            const dx = m.x - d.x;
            const dy = m.y - d.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < R && dist > 0.001) {
              const f = (1 - dist / R) * PULL;
              ax += (dx / dist) * f;
              ay += (dy / dist) * f;
            }
          }
          d.vx = (d.vx + ax) * 0.84;
          d.vy = (d.vy + ay) * 0.84;
          d.x += d.vx;
          d.y += d.vy;
        }
      }

      // Grid mesh lines (brighten near cursor).
      for (let c = 0; c < cols.length; c++) {
        for (let rIdx = 0; rIdx < cols[c].length; rIdx++) {
          const d = cols[c][rIdx];
          const right = cols[c + 1]?.[rIdx];
          const down = cols[c]?.[rIdx + 1];
          const prox = m.active
            ? Math.max(0, 1 - Math.sqrt((m.x - d.x) ** 2 + (m.y - d.y) ** 2) / R)
            : 0;
          if (right) {
            ctx.globalAlpha = 0.18 + prox * 0.62;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.75 + prox * 1.5;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(right.x, right.y);
            ctx.stroke();
          }
          if (down) {
            ctx.globalAlpha = 0.18 + prox * 0.62;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.75 + prox * 1.5;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(down.x, down.y);
            ctx.stroke();
          }
        }
      }

      // Dots.
      for (const d of dots) {
        const prox = m.active
          ? Math.max(0, 1 - Math.sqrt((m.x - d.x) ** 2 + (m.y - d.y) ** 2) / R)
          : 0;
        ctx.globalAlpha = 0.35 + prox * 0.65;
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2 + prox * 2.0, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Cursor trail line — visible on mouse move, fades out.
      if (trail) {
        const now = performance.now();
        const tr = trailRef.current;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < tr.length; i++) {
          const a = tr[i - 1];
          const b = tr[i];
          const age = now - b.t;
          if (age > 260) continue;
          ctx.globalAlpha = Math.max(0, 1 - age / 260) * 0.85;
          ctx.strokeStyle = trailColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      host.removeEventListener("mouseleave", onLeave);
      host.removeEventListener("touchend", onLeave);
    };
  }, [background, dotColor, lineColor, trailColor, spacing, radius, strength, trail]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      style={{
        background,
        ...(style || {}),
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
