export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center gap-6">
      {/* Spinner */}
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-gray-100 dark:border-gray-800" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-black dark:border-white border-t-transparent animate-spin" />
      </div>

      {/* Skeleton cards hint */}
      <div className="w-full max-w-3xl px-4 space-y-4 mt-4">
        <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse w-1/3 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-100 dark:border-gray-800 p-4 space-y-3 bg-white dark:bg-gray-900"
            >
              <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Loading, please wait…</p>
    </div>
  );
}
