import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">{APP_CONFIG.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The marketplace where talent meets opportunity.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/services" className="hover:text-black dark:hover:text-white transition-colors">Browse Services</Link></li>
              <li><Link href="/seller/onboard" className="hover:text-black dark:hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link href="/auth/register" className="hover:text-black dark:hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Account</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/messages" className="hover:text-black dark:hover:text-white transition-colors">Messages</Link></li>
              <li><Link href="/profile" className="hover:text-black dark:hover:text-white transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cgu" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="hover:text-black dark:hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/cgu" className="hover:text-black dark:hover:text-white transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/cookies" className="hover:text-black dark:hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
