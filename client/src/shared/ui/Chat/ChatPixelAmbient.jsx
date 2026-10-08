import { useId } from "react";

export default function ChatPixelAmbient() {
  const id = useId().replace(/:/g, "");
  const gridId = `chat-pixel-grid-${id}`;
  const fadeId = `chat-pixel-fade-${id}`;
  const glowId = `chat-pixel-glow-${id}`;
  const waveId = `chat-pixel-wave-${id}`;

  return (
    <div
      className="dp-chat-pixel-ambient pointer-events-none absolute z-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg className="h-full w-full" viewBox="0 0 1200 280" preserveAspectRatio="none" focusable="false">
        <defs>
          <pattern id={gridId} width="16" height="16" patternUnits="userSpaceOnUse">
            <rect x="2" y="2" width="11" height="11" rx="0.8" fill="#ff4b55" />
          </pattern>
          <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="42%" stopColor="white" stopOpacity="0.08" />
            <stop offset="72%" stopColor="white" stopOpacity="0.52" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="100%" r="75%">
            <stop offset="0%" stopColor="#ff6d75" stopOpacity="0.7" />
            <stop offset="52%" stopColor="#f43f50" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f43f50" stopOpacity="0" />
          </radialGradient>
          <mask id={`${fadeId}-mask`}>
            <rect width="1200" height="280" fill={`url(#${fadeId})`} />
          </mask>
          <clipPath id={waveId}>
            <path d="M0 218 C155 214 220 177 355 203 C505 232 590 244 706 211 C824 178 911 184 1027 219 C1102 242 1155 228 1200 205 L1200 280 L0 280 Z" />
          </clipPath>
        </defs>
        <g className="dp-chat-pixel-motion">
          <rect width="1200" height="280" fill={`url(#${glowId})`} opacity="0.5" />
          <rect width="1200" height="280" fill={`url(#${gridId})`} mask={`url(#${fadeId}-mask)`} />
          <rect
            width="1200"
            height="280"
            fill={`url(#${gridId})`}
            clipPath={`url(#${waveId})`}
            mask={`url(#${fadeId}-mask)`}
            opacity="0.55"
          />
        </g>
      </svg>
    </div>
  );
}
