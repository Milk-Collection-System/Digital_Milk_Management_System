import { useState } from "react";
import Logo from "../components/Logo";

const REMEMBER_KEY = "dmm_remembered_user";

export default function Login({ onLogin }) {
  const [identifier, setIdentifier] = useState(
    () => localStorage.getItem(REMEMBER_KEY) || ""
  );
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(
    Boolean(localStorage.getItem(REMEMBER_KEY))
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your username/mobile and password.");
      return;
    }

    if (remember) {
      localStorage.setItem(REMEMBER_KEY, identifier.trim());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    // Temporary frontend session.
    // Real MySQL + JWT authentication will replace this later.
    onLogin({
      name: "Admin",
      role: "Administrator",
      identifier: identifier.trim()
    });
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <main className="login-card">

        <div className="login-brand">
          <Logo />
        </div>

        <div className="login-heading">
          <span className="eyebrow">SECURE COLLECTION CENTER</span>
          <h1>Welcome back</h1>
          <p>
            Sign in to manage your milk collection center.
          </p>
        </div>

        <form className="login-form" onSubmit={submit}>

          <div className="login-field">
            <label htmlFor="login-identifier">
              Username / Mobile
            </label>

            <div className="input-shell">
              <span className="input-icon">?</span>

              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter username or mobile"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">

            <div className="field-label-row">
              <label htmlFor="login-password">
                Password
              </label>

              <button
                type="button"
                className="forgot-btn"
                onClick={() =>
                  setError(
                    "Password recovery will be connected to the backend."
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            <div className="input-shell">
              <span className="input-icon">?</span>

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />

            <span>Remember me on this device</span>
          </label>

          {error && (
            <div className="login-error" role="alert">
              ? {error}
            </div>
          )}

          <button className="login-submit" type="submit">
            <span>Login to Dashboard</span>
            <span>?</span>
          </button>

        </form>

        <div className="login-footer">
          <span className="security-badge">
            ? Secure access
          </span>

          <span>
            Digital Milk Management System
          </span>
        </div>

      </main>
    </div>
  );
}
