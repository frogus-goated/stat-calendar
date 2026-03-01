"use client";
import { useState, useEffect, useCallback } from "react";
import { UserType, ModelType } from "@/lib/types";
import Nav from "@/components/Nav";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [models, setModels] = useState<ModelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [uRes, mRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/models")]);
      setUsers(await uRes.json());
      setModels(await mRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startEdit = (user: UserType) => {
    setEditingUser(user.id);
    setSelectedModels(user.assignedModels?.map(m => m.id) || []);
  };

  const saveAssignments = async (userId: string) => {
    setSaving(true);
    await fetch(`/api/admin/users/${userId}/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelIds: selectedModels }),
    });
    setSaving(false);
    setEditingUser(null);
    fetchData();
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]);
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "viewer" : "admin";
    if (!confirm(`Change this user to ${newRole}?`)) return;
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    fetchData();
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) return <><Nav /><div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"/></div></>;

  return (
    <><Nav />
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <div className="animate-fade-in">
      <a href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Dashboard</a>
      <h1 className="font-display text-2xl font-bold">User Management</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{users.length} user(s) registered · {models.length} model(s) available</p>

      <div className="mt-6 space-y-4">
        {users.map(user => (
          <div key={user.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/20">
                  <span className="font-display text-sm font-bold text-[var(--accent)]">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{user.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.role === "admin" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-green-500/20 text-green-400"}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{user.email} · Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRole(user.id, user.role)}
                  className="btn btn-ghost text-xs">
                  {user.role === "admin" ? "Make Viewer" : "Make Admin"}
                </button>
                {editingUser === user.id ? (
                  <button onClick={() => saveAssignments(user.id)} disabled={saving}
                    className="btn btn-primary text-xs">{saving ? "Saving..." : "Save"}</button>
                ) : (
                  <button onClick={() => startEdit(user)} className="btn btn-primary text-xs">
                    Edit Access
                  </button>
                )}
                <button onClick={() => deleteUser(user.id, user.name)}
                  className="btn btn-danger text-xs">Delete</button>
              </div>
            </div>

            {/* Current assignments */}
            {editingUser !== user.id && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Assigned Models</p>
                {user.assignedModels && user.assignedModels.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {user.assignedModels.map(m => (
                      <span key={m.id} className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-2.5 py-1 text-xs">{m.name}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{user.role === "admin" ? "Admin has access to everything" : "No models assigned yet"}</p>
                )}
              </div>
            )}

            {/* Edit mode */}
            {editingUser === user.id && (
              <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--accent)]">Select models this user can view:</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {models.map(m => (
                    <button key={m.id} onClick={() => toggleModel(m.id)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left transition ${
                        selectedModels.includes(m.id)
                          ? "border-[var(--accent)] bg-[var(--accent)]/10"
                          : "border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)]"
                      }`}>
                      <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                        selectedModels.includes(m.id)
                          ? "border-[var(--accent)] bg-[var(--accent)]"
                          : "border-[var(--border)]"
                      }`}>
                        {selectedModels.includes(m.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{m.group?.name || "No group"}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setSelectedModels(models.map(m => m.id))} className="btn btn-ghost text-xs">Select All</button>
                  <button onClick={() => setSelectedModels([])} className="btn btn-ghost text-xs">Clear All</button>
                  <button onClick={() => setEditingUser(null)} className="btn btn-ghost text-xs">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-[var(--text-muted)]">No users registered yet.</p>
        </div>
      )}
    </div>
    </main></>
  );
}
