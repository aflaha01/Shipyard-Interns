"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { saveTokens } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login(form);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      saveTokens(data.accessToken, data.refreshToken);
      router.push("/dashboard");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Shipyard</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} required
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} required
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}
            style={{ width: "100%", marginTop: 8 }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
          No account? <Link href="/register">Register</Link>
        </p>

        <div style={{ marginTop: 20, padding: "12px", background: "var(--bg)", borderRadius: "var(--radius)", fontSize: 13 }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Sample accounts</p>
          <p>admin@shipyard.dev / admin123</p>
          <p>lead@shipyard.dev / lead123</p>
          <p>dev@shipyard.dev / dev123</p>
        </div>
      </div>
    </div>
  );
}