"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageLoading, PageError } from "@/components/ui/loading";
import { Building2, Plus, Trash2, UserCog, Copy, Check } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Org = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  _count: { users: number; hrModels: number; incidents: number };
};

export default function OrganizationsPage() {
  const { data: orgs, isLoading, error } = useSWR<Org[]>("/api/admin/organizations", fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [lastInvite, setLastInvite] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();

  async function impersonate(org: Org) {
    await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: org.id }),
    });
    await update({ impersonateOrganizationId: org.id });
    router.push("/");
    router.refresh();
  }

  async function deleteOrg(org: Org) {
    if (!confirm(`Delete organization "${org.name}"? This will delete ALL their data.`)) return;
    await fetch(`/api/admin/organizations/${org.id}`, { method: "DELETE" });
    mutate("/api/admin/organizations");
  }

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message={error.message} />;
  if (!orgs) return <PageError />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6" /> Organizations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, manage, and impersonate client organizations
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> New organization
        </button>
      </div>

      {showCreate && (
        <CreateOrgForm
          onDone={(inviteUrl) => {
            setShowCreate(false);
            setLastInvite(inviteUrl);
            mutate("/api/admin/organizations");
          }}
        />
      )}

      {lastInvite && <InviteCard url={lastInvite} onClose={() => setLastInvite(null)} />}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Users</th>
              <th className="px-4 py-3 font-medium">Models</th>
              <th className="px-4 py-3 font-medium">Incidents</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-t border-border/50 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{org.slug}</td>
                <td className="px-4 py-3">{org._count.users}</td>
                <td className="px-4 py-3">{org._count.hrModels}</td>
                <td className="px-4 py-3">{org._count.incidents}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(org.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => impersonate(org)}
                      title="Impersonate"
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-50 text-amber-700 text-xs"
                    >
                      <UserCog className="w-3.5 h-3.5" /> Enter
                    </button>
                    <button
                      onClick={() => deleteOrg(org)}
                      title="Delete"
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateOrgForm({ onDone }: { onDone: (inviteUrl: string) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    const res = await fetch("/api/admin/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, adminEmail }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErr(data.error || "Failed to create");
      return;
    }
    onDone(data.inviteUrl);
  }

  return (
    <form onSubmit={submit} className="bg-white border border-border rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Organization Name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
            }}
            required
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Admin Email</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
            className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm"
          />
        </div>
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create organization"}
      </button>
    </form>
  );
}

function InviteCard({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <p className="text-sm font-medium text-green-900 mb-2">✓ Organization created</p>
      <p className="text-xs text-green-800 mb-3">Share this admin invite link (in production this would be emailed):</p>
      <div className="flex items-center gap-2">
        <input readOnly value={url} className="flex-1 h-9 rounded-lg border border-green-300 bg-white px-3 text-xs font-mono" onFocus={(e) => e.target.select()} />
        <button onClick={copy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-white">
          Dismiss
        </button>
      </div>
    </div>
  );
}
