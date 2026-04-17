"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-border p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold">AI Governance</h1>
          <p className="text-xs text-muted-foreground">HR Dashboard</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-1">Sign in to your account</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Access your organization&apos;s AI governance dashboard
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center mb-3">Demo accounts</p>
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          <DemoAccount label="Super Admin" email="super@platform.com" />
          <DemoAccount label="Acme Admin" email="admin@acme-corp.com" />
          <DemoAccount label="Acme Viewer" email="viewer@acme-corp.com" />
          <DemoAccount label="Globex Admin" email="admin@globex.com" />
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Password for all demo accounts: <code className="bg-muted px-1 rounded">password123</code>
        </p>
      </div>
    </div>
  );
}

function DemoAccount({ label, email }: { label: string; email: string }) {
  return (
    <div className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <code className="font-mono">{email}</code>
    </div>
  );
}
