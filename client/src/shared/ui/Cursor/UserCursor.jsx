import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

function CursorLayer({
  layerStyle,
  visible,
  arrowX,
  arrowY,
  labelX,
  labelY,
  labelRotation,
  scale,
  showLabel,
  color,
  size,
  arrowContent,
  labelContent,
  classNames,
}) {
  return (
    <div style={layerStyle}>
      {showLabel && (
        <motion.div
          className={classNames?.label}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            x: labelX,
            y: labelY,
            rotate: labelRotation,
            scale,
            background: color,
            borderRadius: 999,
            padding: `${size * 0.18}px ${size * 0.36}px`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
            opacity: visible ? 1 : 0,
            transformOrigin: "0% 50%",
            transition: "opacity 140ms ease",
            willChange: "transform, opacity",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {labelContent}
        </motion.div>
      )}

      <motion.div
        className={classNames?.cursor}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          x: arrowX,
          y: arrowY,
          scale,
          width: size,
          height: size,
          opacity: visible ? 1 : 0,
          transformOrigin: "0% 0%",
          transition: "opacity 140ms ease",
          willChange: "transform, opacity",
          pointerEvents: "none",
        }}
      >
        <div className={classNames?.arrow} style={{ width: size, height: size }}>
          {arrowContent}
        </div>
      </motion.div>
    </div>
  );
}

export default function UserCursor({
  name = "Robert",
  color = "#F99149",
  textColor = "#FFFFFF",
  size = 26,
  labelTiltStrength = 20,
  showLabel = true,
  offsetX = 0,
  offsetY = 0,
  labelOffsetX = 20,
  labelOffsetY = 10,
  pressScale = 0.92,
  classNames,
  children,
  className = "",
  style,
}) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouchDevice(Boolean(mql.matches));
    sync();
    if (mql.addEventListener) {
      mql.addEventListener("change", sync);
      return () => mql.removeEventListener("change", sync);
    }
  }, []);

  const arrowSpring = useMemo(() => ({ stiffness: 380, damping: 32, mass: 0.6 }), []);
  const labelSpringCfg = useMemo(() => ({ stiffness: 220, damping: 26, mass: 0.7 }), []);

  const resolvedLabelOffset = useMemo(
    () => ({ x: labelOffsetX, y: labelOffsetY }),
    [labelOffsetX, labelOffsetY],
  );

  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const arrowX = useSpring(mouseX, arrowSpring);
  const arrowY = useSpring(mouseY, arrowSpring);
  const labelX = useSpring(mouseX, labelSpringCfg);
  const labelY = useSpring(mouseY, labelSpringCfg);

  const scaleMV = useMotionValue(1);
  useEffect(() => {
    const controls = animate(scaleMV, pressed ? pressScale : 1, {
      type: "spring",
      stiffness: 500,
      damping: 28,
      mass: 0.5,
    });
    return () => controls.stop();
  }, [pressed, pressScale, scaleMV]);

  const labelTiltTarget = useMotionValue(0);
  const labelRotation = useSpring(labelTiltTarget, {
    stiffness: 200,
    damping: 24,
    mass: 0.6,
  });

  const lastSampleRef = useRef(null);

  useEffect(() => {
    if (isTouchDevice || typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const last = lastSampleRef.current;
      let vx = 0;
      let vy = 0;
      if (last) {
        const dt = Math.max(1, now - last.t);
        vx = ((x - last.x) / dt) * 1000;
        vy = ((y - last.y) / dt) * 1000;
      }
      lastSampleRef.current = { x, y, t: now };

      mouseX.set(x + offsetX);
      mouseY.set(y + offsetY);

      const speed = Math.hypot(vx, vy);
      const norm = Math.min(1, speed / 1500);
      const sign = vx === 0 ? 0 : vx > 0 ? 1 : -1;
      labelTiltTarget.set(sign * norm * labelTiltStrength);
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onEnter = () => setHovering(true);
    const onLeave = () => {
      setHovering(false);
      lastSampleRef.current = null;
      labelTiltTarget.set(0);
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mousedown", onDown);
    container.addEventListener("mouseup", onUp);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mousedown", onDown);
      container.removeEventListener("mouseup", onUp);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      setPressed(false);
    };
  }, [isTouchDevice, labelTiltStrength, offsetX, offsetY, mouseX, mouseY, labelTiltTarget]);

  const visible = hovering && !isTouchDevice;

  const labelTranslateX = useTransform(labelX, (v) => v + resolvedLabelOffset.x);
  const labelTranslateY = useTransform(labelY, (v) => v + resolvedLabelOffset.y);

  const arrowContent = useMemo(
    () => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <path
          d="M5 3 L23 14 L14 16 L11 24 Z"
          fill={color}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      </svg>
    ),
    [color, size],
  );

  const labelContent = useMemo(
    () => (
      <div
        className={classNames?.labelText}
        style={{
          color: textColor,
          fontSize: Math.max(9, size * 0.42),
          lineHeight: 1.1,
          fontWeight: 700,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          whiteSpace: "nowrap",
          letterSpacing: 0.2,
        }}
      >
        {name}
      </div>
    ),
    [classNames?.labelText, name, size, textColor],
  );

  const hostStyle = {
    position: "relative",
    overflow: "hidden",
    cursor: visible ? "none" : undefined,
    ...style,
  };

  const layerStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 50,
  };

  return (
    <div ref={containerRef} className={`relative group ${className}`} style={hostStyle}>
      {children}
      <CursorLayer
        layerStyle={layerStyle}
        visible={visible}
        arrowX={arrowX}
        arrowY={arrowY}
        labelX={labelTranslateX}
        labelY={labelTranslateY}
        labelRotation={labelRotation}
        scale={scaleMV}
        showLabel={showLabel}
        color={color}
        size={size}
        arrowContent={arrowContent}
        labelContent={labelContent}
        classNames={classNames}
      />
    </div>
  );
}
