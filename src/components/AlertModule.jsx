import React, { useMemo } from "react";
import HologramCard from "./HologramCard";

function typeMeta(type) {
  if (type === "hazardous") return { label: "Hazardous Detection", accent: "rgba(255,80,120,0.35)" };
  if (type === "approach") return { label: "Close Approach", accent: "rgba(255,165,55,0.30)" };
  return { label: "Risk Threshold", accent: "rgba(87,185,255,0.25)" };
}

export default function AlertModule({ alert, onMarkRead, onDelete, icon, badge }) {
  const meta = useMemo(() => typeMeta(alert.type), [alert.type]);

  return (
    <HologramCard
      accent={meta.accent}
      className={alert.read ? "" : "cw-pulseCritical"}
      padding="16px"
    >
      <div className="cw-holoHeader">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {icon}
          </div>
          <div>
            <div className="cw-holoTitle">{meta.label}</div>
            <div style={{ color: "rgba(245,250,255,0.98)", fontWeight: 750, fontSize: 15, marginTop: 6 }}>
              {alert.title}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {badge}
          {!alert.read ? (
            <button type="button" className="cw-btn3d" style={{ height: 36, padding: "0 12px", fontSize: 12 }} onClick={onMarkRead}>
              Mark Read
            </button>
          ) : null}
          <button type="button" className="cw-btn3d is-danger" style={{ height: 36, padding: "0 12px", fontSize: 12 }} onClick={onDelete}>
            Remove
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, color: "rgba(214,226,255,0.70)", fontSize: 13, lineHeight: 1.55 }}>
        {alert.description}
      </div>
      <div style={{ marginTop: 10, color: "rgba(214,226,255,0.55)", fontSize: 12, letterSpacing: "0.08em" }}>
        {new Date(alert.timestamp).toLocaleString()}
      </div>
    </HologramCard>
  );
}
