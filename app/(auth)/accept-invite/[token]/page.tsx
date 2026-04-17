"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { use } from "react";
import { Shield } from "lucide-react";

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [invite, setInvite] = useState<{ email: string; organizationName: string; role: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setLoadError(data.error);
        else setInvite(data);
      })
      .catch(() => setLoadError("Invalid invite link"));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setSubmitError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    const res = await fetch(`/api/invites/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSubmitError(data.error || "Failed to accept invite");
      setSubmitting(false);
      return;
    }

    // Auto sign-in
    await signIn("credentials", {
      email: invite!.email,
      password,
      redirect: false,
    });
    router.push("/");
    router.refresh();
  }

  if (loadError) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl border border-border p-8 shadow-sm">
        <h1 className="text-lg font-bold mb-2">Invite not valid</h1>
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl border border-border p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading invite...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Accept your invite</h1>
          <p className="text-xs text-muted-foreground">
            Joining <strong>{invite.organizationName}</strong> as <strong>{invite.role}</strong>
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Invited email: <code className="bg-muted px-1.5 rounded">{invite.email}</code>
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        {submitError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {submitError}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Creating account..." : "Accept invite"}
        </button>
      </form>
    </div>
  );
}
