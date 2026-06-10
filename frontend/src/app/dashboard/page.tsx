"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { getUser, clearTokens, isLoggedIn } from "@/lib/auth";
import type { Project } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: "active" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [editing, setEditing] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", status: "active" });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.projects.list(page);
      const data = await res.json();
      setProjects(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    fetchProjects();
  }, [fetchProjects, router]);

  const handleLogout = async () => {
    const rt = localStorage.getItem("refreshToken") || "";
    await api.auth.logout(rt);
    clearTokens();
    router.push("/login");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await api.projects.create(form);
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed"); return; }
      setShowCreate(false);
      setForm({ name: "", description: "", status: "active" });
      fetchProjects();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    await api.projects.delete(id);
    fetchProjects();
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setEditForm({ name: p.name, description: p.description, status: p.status });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await api.projects.update(editing.id, editForm);
      if (res.ok) { setEditing(null); fetchProjects(); }
    } finally {
      setSaving(false);
    }
  };

  const canModify = (p: Project) =>
    user?.role === "admin" || user?.id === p.owner_id;

  const totalPages = Math.ceil(total / 10);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Navbar */}
      <nav style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10
      }}>
        <span style={{ fontWeight: 700, fontSize: 18 }}>Shipyard</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {user?.email} <span className="badge badge-role">{user?.role}</span>
          </span>
          <button className="btn-ghost" onClick={handleLogout} style={{ padding: "6px 14px" }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Projects</h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>{total} total</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New project
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {/* Project list */}
        {loading ? (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: 48 }}>Loading…</p>
        ) : projects.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <p style={{ color: "var(--muted)" }}>No projects yet. Create one above.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {projects.map(p => (
              <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>{p.description || "No description"}</p>
                  <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
                    Owner ID: {p.owner_id} · {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                {canModify(p) && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <button className="btn-ghost" style={{ padding: "5px 12px", fontSize: 13 }} onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button className="btn-danger" style={{ padding: "5px 12px", fontSize: 13 }} onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
            <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ padding: "9px 12px", fontSize: 13, color: "var(--muted)" }}>
              Page {page} of {totalPages}
            </span>
            <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <Modal title="New project" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} required onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {formError && <p className="error-msg">{formError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal title="Edit project" onClose={() => setEditing(null)}>
          <form onSubmit={handleEdit}>
            <div className="form-group">
              <label>Name</label>
              <input value={editForm.name} required onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={editForm.description}
                onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24
    }}>
      <div className="card" style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>{title}</h3>
          <button className="btn-ghost" style={{ padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}