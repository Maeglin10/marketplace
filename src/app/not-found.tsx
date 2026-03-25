import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';

export default function NotFound() {
  return (
    <main>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 px-4">
        <h1 className="text-8xl font-bold text-gray-100">404</h1>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">Page not found</h2>
          <p className="text-gray-500">The page you're looking for doesn't exist.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
          <Link href="/services">
            <Button variant="outline">Browse Services</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
