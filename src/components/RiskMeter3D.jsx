import React, { useMemo } from "react";

function getRiskBand(score) {
  if (score >= 70) return { label: "Critical", cls: "is-critical" };
  if (score >= 50) return { label: "High", cls: "is-high" };
  if (score >= 30) return { label: "Moderate", cls: "is-moderate" };
  return { label: "Low", cls: "" };
}

export default function RiskMeter3D({ score }) {
  const band = getRiskBand(score);

  const color = useMemo(() => {
    if (score >= 70) return "rgba(255, 80, 120, 0.95)";
    if (score >= 50) return "rgba(255, 165, 55, 0.95)";
    if (score >= 30) return "rgba(255, 214, 85, 0.95)";
    return "rgba(45, 255, 192, 0.95)";
  }, [score]);

  const width = 190;
  const stroke = 12;
  const radius = (width - stroke) / 2;
  const circumference = radius * Math.PI;
  const progress = (Math.max(0, Math.min(score, 100)) / 100) * circumference;

  return (
    <div className={`cw-pulseWrap ${score >= 70 ? "cw-pulseCritical" : ""}`} style={{ display: "grid", placeItems: "center" }}>
      <svg width={width} height={width / 2 + 14} viewBox={`0 0 ${width} ${width / 2 + 14}`} className="overflow-visible">
        <defs>
          <linearGradient id="cwRiskGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="55%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke="url(#cwRiskGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            filter: `drop-shadow(0 0 10px ${color})`,
            transition: "stroke-dashoffset 900ms ease",
          }}
        />

        <path
          d={`M ${width / 2} ${width / 2} L ${width / 2 + radius * 0.98} ${width / 2}`}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transformOrigin: `${width / 2}px ${width / 2}px`,
            transform: `rotate(${(score / 100) * 180}deg)`,
            filter: `drop-shadow(0 0 12px ${color})`,
            transition: "transform 900ms ease",
            opacity: 0.95,
          }}
        />

        <text x={width / 2} y={width / 2 - 8} textAnchor="middle" style={{ fill: "rgba(245,250,255,0.98)", fontWeight: 800, fontSize: 28 }}>
          {score}
        </text>
        <text x={width / 2} y={width / 2 + 12} textAnchor="middle" style={{ fill: "rgba(214,226,255,0.65)", fontSize: 11, letterSpacing: "0.18em" }}>
          {band.label.toUpperCase()}
        </text>
      </svg>

      <div className="cw-riskBar" style={{ width: 190, marginTop: -6 }}>
        <div className={`cw-riskFill ${band.cls}`} style={{ "--p": `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  );
}
