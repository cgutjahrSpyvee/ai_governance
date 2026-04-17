export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-sm text-muted-foreground">Loading...</div>
    </div>
  );
}

export function PageError({ message }: { message?: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
      {message || "Failed to load data"}
    </div>
  );
}
