export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
      {/* Spinner */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-black border-t-transparent animate-spin" />
      </div>

      {/* Skeleton cards hint */}
      <div className="w-full max-w-3xl px-4 space-y-4 mt-4">
        <div className="h-6 bg-gray-100 rounded-md animate-pulse w-1/3 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-100 p-4 space-y-3">
              <div className="h-32 bg-gray-100 rounded-md animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-2">Loading, please wait…</p>
    </div>
  );
}
