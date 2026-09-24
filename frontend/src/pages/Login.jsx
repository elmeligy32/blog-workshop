import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Couldn't log you in. Check your username and password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <p className="lead">Welcome back.</p>

        <div className="auth-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>

        <p className="auth-footer">
          No account yet? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
