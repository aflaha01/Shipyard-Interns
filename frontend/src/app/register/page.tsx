"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "dev" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.register(form);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      router.push("/login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create account</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>Join Shipyard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} required
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} required
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} required minLength={6}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="dev">Dev</option>
              <option value="lead">Lead</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}
            style={{ width: "100%", marginTop: 8 }}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--muted)" }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}