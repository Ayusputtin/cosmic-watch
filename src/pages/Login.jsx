import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpaceLoginScene from "../components/SpaceLoginScene";
import RoleSelector from "../components/RoleSelector";
import "../styles/login.css";

const AUTH_KEY = "cosmicwatch_isAuthenticated";
const ROLE_KEY = "cosmicwatch_userRole";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isAuthed = useMemo(
    () => localStorage.getItem(AUTH_KEY) === "true",
    []
  );

  useEffect(() => {
    if (isAuthed) {
      navigate("/home", { replace: true });
    }
  }, [isAuthed, navigate]);

  const completeLogin = (nextRole) => {
    localStorage.setItem(AUTH_KEY, "true");
    localStorage.setItem(ROLE_KEY, nextRole);

    navigate("/home", { replace: true });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Select a mission role to proceed.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to initiate access.");
      return;
    }

    // Mock auth success
    completeLogin(role);
  };

  const onGuest = () => {
    setError("");
    completeLogin("enthusiast");
  };

  return (
    <div className="cw-loginRoot">
      <SpaceLoginScene />

      <div className="cw-loginOverlay">
        <section className="cw-panel" aria-label="Cosmic Watch Access Portal">
          <div className="cw-panelTop">
            <div className="cw-kicker">
              <span className="cw-kickerDot" />
              PLANETARY DEFENSE • MISSION ACCESS
            </div>
            <h1 className="cw-title">Cosmic Watch Access Portal</h1>
            <p className="cw-subtitle">
              Monitoring Near-Earth Objects to safeguard our planet
            </p>
          </div>

          <div className="cw-panelBody">
            <div>
              <RoleSelector selectedRole={role} onSelect={setRole} />
            </div>

            <div className="cw-formPanel">
              {!role ? (
                <div>
                  <div className="cw-formLabel">Awaiting role selection</div>
                  <div style={{ color: "rgba(214, 226, 255, 0.65)", fontSize: 13, lineHeight: 1.6 }}>
                    Choose a holographic mission panel to unlock the access form.
                  </div>
                  <div className="cw-actions" style={{ marginTop: 14 }}>
                    <button type="button" className="cw-button3d secondary" onClick={onGuest}>
                      Continue as Guest (Enthusiast)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <div className="cw-formLabel">Mission credentials</div>

                  <div style={{ marginTop: 10 }}>
                    <div className="cw-formLabel">Email</div>
                    <input
                      className="cw-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="you@mission-control.org"
                      autoComplete="email"
                    />
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div className="cw-formLabel">Password</div>
                    <input
                      className="cw-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="cw-actions">
                    <button type="submit" className="cw-button3d">
                      Initiate Mission Access
                    </button>
                    <button
                      type="button"
                      className="cw-button3d secondary"
                      onClick={onGuest}
                    >
                      Continue as Guest (Enthusiast)
                    </button>
                  </div>

                  {error ? <div className="cw-error">{error}</div> : null}
                </form>
              )}
            </div>
          </div>

          <div className="cw-micro">Powered by real-time NASA NEO data</div>
        </section>
      </div>
    </div>
  );
}
