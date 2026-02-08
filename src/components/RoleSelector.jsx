import React, { useMemo } from "react";

function RoleCard({ role, title, subtitle, accent, selected, onSelect }) {
  const style = useMemo(
    () => ({
      "--accent": accent,
    }),
    [accent]
  );

  return (
    <button
      type="button"
      className={`cw-roleCard ${selected ? "is-selected" : ""}`}
      style={style}
      onClick={() => onSelect(role)}
    >
      <div className="cw-roleCardInner">
        <div className="cw-roleCardHeader">
          <div className="cw-roleTag">ROLE</div>
          <div className="cw-roleTitle">{title}</div>
        </div>
        <div className="cw-roleSubtitle">{subtitle}</div>
        <div className="cw-rolePulse" />
        <div className="cw-roleScanlines" />
      </div>
    </button>
  );
}

export default function RoleSelector({ selectedRole, onSelect }) {
  return (
    <div className="cw-roleGrid" role="radiogroup" aria-label="Select role">
      <RoleCard
        role="scientist"
        title="Scientist"
        subtitle="Mission control access • risk modeling • research tools"
        accent="#57B9FF"
        selected={selectedRole === "scientist"}
        onSelect={onSelect}
      />
      <RoleCard
        role="enthusiast"
        title="Enthusiast"
        subtitle="Track objects • build watchlists • stay informed"
        accent="#2FF0C6"
        selected={selectedRole === "enthusiast"}
        onSelect={onSelect}
      />
    </div>
  );
}
