import React, { useMemo } from "react";
import HologramCard from "./HologramCard";

function riskClass(score) {
  if (score >= 70) return "is-critical";
  if (score >= 50) return "is-high";
  if (score >= 30) return "is-moderate";
  return "";
}

export default function AsteroidTile({ asteroid, isWatched, onWatch, onChat }) {
  const riskCls = useMemo(() => riskClass(asteroid.riskScore), [asteroid.riskScore]);
  const dangerGlow = asteroid.isHazardous ? "0 0 90px rgba(255,80,120,0.10)" : undefined;

  return (
    <HologramCard
      accent={asteroid.isHazardous ? "rgba(255,80,120,0.35)" : "rgba(87,185,255,0.22)"}
      style={{ boxShadow: dangerGlow }}
      padding="16px"
    >
      <div className="cw-holoHeader">
        <div>
          <div className="cw-holoTitle">OBJECT</div>
          <div style={{ color: "rgba(245,250,255,0.98)", fontWeight: 750, fontSize: 16, marginTop: 6 }}>
            {asteroid.name}
          </div>
          <div className="cw-holoSub">ID: {asteroid.nasaId}</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="cw-btn3d"
            style={{ height: 38, padding: "0 12px", fontSize: 12 }}
            onClick={() => onChat && onChat(asteroid)}
          >
            Chat
          </button>
          <button
            type="button"
            className="cw-btn3d"
            style={{ height: 38, padding: "0 14px", fontSize: 12 }}
            onClick={() => onWatch(asteroid.id)}
          >
            {isWatched ? "Unwatch" : "Watch"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div className="cw-holoTitle">DISTANCE</div>
            <div style={{ color: "rgba(245,250,255,0.98)", fontWeight: 750, marginTop: 6 }}>
              {(asteroid.missDistance / 1000000).toFixed(2)}M km
            </div>
          </div>
          <div>
            <div className="cw-holoTitle">VELOCITY</div>
            <div style={{ color: "rgba(245,250,255,0.98)", fontWeight: 750, marginTop: 6 }}>
              {asteroid.velocity.toFixed(0)} km/h
            </div>
          </div>
        </div>

        <div>
          <div className="cw-holoTitle">RISK SCORE</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 6 }}>
            <div style={{ color: "rgba(245,250,255,0.98)", fontWeight: 850, fontSize: 22 }}>
              {asteroid.riskScore}
            </div>
            {asteroid.isHazardous ? (
              <div style={{ color: "rgba(255,80,120,0.92)", fontSize: 12, letterSpacing: "0.14em" }}>
                HAZARDOUS
              </div>
            ) : (
              <div style={{ color: "rgba(214,226,255,0.60)", fontSize: 12, letterSpacing: "0.14em" }}>
                MONITORED
              </div>
            )}
          </div>
          <div className="cw-riskBar" style={{ marginTop: 10 }}>
            <div className={`cw-riskFill ${riskCls}`} style={{ "--p": `${Math.min(asteroid.riskScore, 100)}%` }} />
          </div>
        </div>
      </div>
    </HologramCard>
  );
}
