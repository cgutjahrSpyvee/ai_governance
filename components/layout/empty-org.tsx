import Link from "next/link";
import { Crown, Building2 } from "lucide-react";

export default function EmptyOrgState() {
  return (
    <div className="max-w-xl mx-auto mt-20 bg-white rounded-2xl border border-border p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <Crown className="w-7 h-7" />
      </div>
      <h1 className="text-xl font-bold mb-2">Welcome, Super Admin</h1>
      <p className="text-sm text-muted-foreground mb-6">
        You&apos;re not scoped to any organization. Choose an organization to impersonate
        and view their governance data, or manage the platform.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/super-admin"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          <Crown className="w-4 h-4" /> Platform overview
        </Link>
        <Link
          href="/super-admin/organizations"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
        >
          <Building2 className="w-4 h-4" /> Manage organizations
        </Link>
      </div>
    </div>
  );
}
