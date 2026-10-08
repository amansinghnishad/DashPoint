import { useEffect, useRef, useState } from "react";

const ARC_DOT_COUNT = 58;

const getArcPoint = (t, pointer) => {
  const inverse = 1 - t;
  const x = inverse ** 3 * -100 + 3 * inverse ** 2 * t * 300 + 3 * inverse * t ** 2 * 900 + t ** 3 * 1300;
  const baseY = inverse ** 3 * 610 + 3 * inverse ** 2 * t * 200 + 3 * inverse * t ** 2 * 200 + t ** 3 * 610;

  if (!pointer) return { x, y: baseY };

  const horizontalDistance = (x - pointer.x) / 210;
  const influence = 0.72 * Math.exp(-0.5 * horizontalDistance * horizontalDistance);
  return { x, y: baseY + (pointer.y - baseY) * influence };
};

const makeArcPath = (pointer) =>
  Array.from({ length: 41 }, (_, index) => {
    const point = getArcPoint(index / 40, pointer);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }).join(" ");

export default function CollectionCanvasAmbient() {
  const surfaceRef = useRef(null);
  const pointerRef = useRef(null);
  const frameRef = useRef(0);
  const [pointer, setPointer] = useState(null);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const surface = surfaceRef.current;
      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      pointerRef.current = isInside
        ? {
            x: ((event.clientX - rect.left) / rect.width) * 1200,
            y: ((event.clientY - rect.top) / rect.height) * 800,
          }
        : null;

      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        setPointer(pointerRef.current);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const arcPath = makeArcPath(pointer);
  const arcDots = Array.from({ length: ARC_DOT_COUNT }, (_, index) => {
    const t = (index + 1) / (ARC_DOT_COUNT + 1);
    const point = getArcPoint(t, pointer);
    const distance = pointer ? Math.abs(point.x - pointer.x) : Infinity;
    const reaction = pointer ? Math.exp(-0.5 * (distance / 190) ** 2) : 0;

    return {
      ...point,
      radius: 1 + ((index * 7) % 5) * 0.22 + reaction * 1.5,
      opacity: 0.5 + ((index * 11) % 6) * 0.08 + reaction * 0.42,
      reaction,
    };
  });

  return (
    <div
      ref={surfaceRef}
      className="dp-collection-ambient pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="collection-arc-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f4c5a8" stopOpacity="0.05" />
            <stop offset="48%" stopColor="#f99149" stopOpacity="0.7" />
            <stop offset="78%" stopColor="#a692e6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a692e6" stopOpacity="0.04" />
          </linearGradient>
          <filter id="collection-arc-blur" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <radialGradient id="collection-pointer-glow">
            <stop offset="0%" stopColor="#fff0df" stopOpacity="0.65" />
            <stop offset="35%" stopColor="#f99149" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f99149" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="dp-collection-arc-motion">
          <path
            d={arcPath}
            fill="none"
            stroke="url(#collection-arc-gradient)"
            strokeWidth="24"
            filter="url(#collection-arc-blur)"
            opacity="0.28"
          />
          <path
            d={arcPath}
            fill="none"
            stroke="url(#collection-arc-gradient)"
            strokeWidth="1.5"
            opacity="0.68"
          />
          <path
            d="M -100 675 C 270 290, 910 290, 1300 675"
            fill="none"
            stroke="url(#collection-arc-gradient)"
            strokeWidth="1"
            strokeDasharray="2 10"
            opacity="0.46"
          />
          {arcDots.map((dot, index) => (
            <circle
              key={index}
              cx={dot.x}
              cy={dot.y}
              r={dot.radius}
              fill={dot.reaction > 0.15 ? "#fff0df" : index % 4 === 0 ? "#a692e6" : "#f4b18a"}
              opacity={dot.opacity}
            />
          ))}
          {pointer ? (
            <circle
              cx={pointer.x}
              cy={pointer.y}
              r="155"
              fill="url(#collection-pointer-glow)"
              opacity="0.72"
            />
          ) : null}
        </g>
      </svg>
    </div>
  );
}
