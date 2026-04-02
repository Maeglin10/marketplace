import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Large stylised 404 */}
      <div className="relative select-none mb-6">
        <span className="text-[160px] sm:text-[220px] font-black text-gray-100 dark:text-gray-900 leading-none tracking-tighter">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-black dark:bg-white flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-8 h-8 text-white dark:text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-3 mb-10 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          Oops! The page you are looking for has been moved, deleted, or never existed. Let us
          help you find your way back.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-base font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Back to Home
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Browse Services
        </Link>
      </div>

      {/* Subtle footer hint */}
      <p className="mt-12 text-xs text-gray-300 dark:text-gray-700">
        If you believe this is a mistake, please contact support.
      </p>
    </div>
  );
}
