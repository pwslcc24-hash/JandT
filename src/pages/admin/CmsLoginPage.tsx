import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEditor } from "@/cms/context/EditorContext";
import { isSupabaseConfigured } from "@/cms/api/auth";

export default function CmsLoginPage() {
  const { login, devLogin } = useEditor();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cms-login-page">
      <form className="cms-login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <p className="cms-login-sub">Sign in to access Edit Mode and the dashboard.</p>

        {error && <p className="cms-login-error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {!isSupabaseConfigured && (
          <button
            type="button"
            className="cms-login-dev"
            onClick={() => {
              devLogin();
              navigate("/");
            }}
          >
            Dev: Sign in as Admin (no Supabase)
          </button>
        )}

        <Link to="/" className="cms-login-back">
          ← Back to site
        </Link>
      </form>
    </div>
  );
}
