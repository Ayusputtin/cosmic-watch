import React, { useMemo, useRef, useState } from "react";

export default function HologramCard({
  className = "",
  style,
  children,
  accent = "rgba(87, 185, 255, 0.22)",
  tilt = true,
  padding = "16px",
}) {
  const ref = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const baseStyle = useMemo(
    () => ({
      ...style,
      boxShadow: style?.boxShadow,
      borderColor: accent,
      padding,
    }),
    [style, accent, padding]
  );

  const onMove = (e) => {
    if (!tilt) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rx = (0.5 - py) * 7;
    const ry = (px - 0.5) * 9;

    setTiltStyle({
      transform: `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
      "--mx": `${px * 100}%`,
      "--my": `${py * 100}%`,
    });
  };

  const onLeave = () => {
    if (!tilt) return;
    setTiltStyle({ transform: "rotateX(0deg) rotateY(0deg) translateZ(0)" });
  };

  return (
    <div
      ref={ref}
      className={`cw-holoCard ${className}`}
      style={{ ...baseStyle, ...tiltStyle }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
