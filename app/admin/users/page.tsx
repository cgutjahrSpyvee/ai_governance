"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { PageLoading, PageError } from "@/components/ui/loading";
import { Users, UserPlus, Trash2, Copy, Check } from "lucide-react";
import { getStatusColor } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type UserRow = { id: string; email: string; name: string | null; role: string; createdAt: string };
type InviteRow = { id: string; email: string; role: string; expiresAt: string; createdAt: string };

export default function AdminUsersPage() {
  const { data, isLoading, error } = useSWR<{ users: UserRow[]; invites: InviteRow[] }>("/api/users", fetcher);
  const [showInvite, setShowInvite] = useState(false);

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!data) return <PageError />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users and invitations for your organization
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          <UserPlus className="w-4 h-4" /> Invite user
        </button>
      </div>

      {showInvite && <InviteForm onDone={() => { setShowInvite(false); mutate("/api/users"); }} />}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold">Active users ({data.users.length})</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/20 text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>

      {data.invites.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">Pending invitations ({data.invites.length})</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/20 text-left text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Expires</th>
                <th className="px-4 py-2.5 font-medium">Invited</th>
              </tr>
            </thead>
            <tbody>
              {data.invites.map((inv) => (
                <tr key={inv.id} className="border-t border-border/50">
                  <td className="px-4 py-2.5 font-medium">{inv.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{inv.role}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: UserRow }) {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const isSuper = user.role === "SUPER_ADMIN";

  async function changeRole(newRole: string) {
    setSaving(true);
    setRole(newRole);
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setSaving(false);
    mutate("/api/users");
  }

  async function remove() {
    if (!confirm(`Remove ${user.email}?`)) return;
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    mutate("/api/users");
  }

  return (
    <tr className="border-t border-border/50 hover:bg-muted/20">
      <td className="px-4 py-2.5 font-medium">{user.name || "—"}</td>
      <td className="px-4 py-2.5 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-2.5">
        {isSuper ? (
          <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor("active")}`}>Super Admin</span>
        ) : (
          <select
            value={role}
            onChange={(e) => changeRole(e.target.value)}
            disabled={saving}
            className="text-xs border border-border rounded px-2 py-1 bg-white"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        )}
      </td>
      <td className="px-4 py-2.5 text-muted-foreground text-xs">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2.5 text-right">
        {!isSuper && (
          <button onClick={remove} className="p-1 hover:bg-red-50 rounded" title="Remove">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
      </td>
    </tr>
  );
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErr(data.error || "Failed to send invite");
      return;
    }
    setInviteUrl(data.inviteUrl);
  }

  function copy() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (inviteUrl) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-sm font-medium text-green-900 mb-2">✓ Invitation sent</p>
        <p className="text-xs text-green-800 mb-3">Share this link with {email} (in production this would be emailed automatically):</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 h-9 rounded-lg border border-green-300 bg-white px-3 text-xs font-mono"
            onFocus={(e) => e.target.select()}
          />
          <button onClick={copy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={onDone} className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm"
          >
            <option value="VIEWER">Viewer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-9 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send invite"}
          </button>
        </div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </form>
  );
}
