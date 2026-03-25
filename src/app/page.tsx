import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            {APP_CONFIG.tagline}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with talented service providers or offer your expertise to a global audience.
            Our secure marketplace makes it easy to find, hire, and deliver quality services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services">
              <Button size="lg">Browse Services</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Start Selling</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Why {APP_CONFIG.name}?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white text-xl">
                🔒
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="text-gray-600">
                Protected transactions via Stripe Connect. Funds are held securely until work is
                delivered. Supports cards, Apple Pay, Google Pay, SEPA & more.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white text-xl">
                💬
              </div>
              <h3 className="text-xl font-semibold">Real-time Chat</h3>
              <p className="text-gray-600">
                Communicate instantly with buyers or sellers. Live messaging with no page
                refresh — always stay connected.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white text-xl">
                ⭐
              </div>
              <h3 className="text-xl font-semibold">Ratings & Reviews</h3>
              <p className="text-gray-600">
                Build your reputation with verified reviews from completed orders. Earn trust from
                the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Find a Service', desc: 'Browse thousands of services and filter by category, price, or rating.' },
              { step: '2', title: 'Place Your Order', desc: 'Pay securely with your preferred payment method. Your funds are protected.' },
              { step: '3', title: 'Get It Done', desc: 'Work with your seller, communicate in real-time, and release payment on completion.' },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of buyers and sellers on {APP_CONFIG.name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="bg-white text-black hover:bg-gray-100" size="lg">
                Create Account
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
                size="lg"
              >
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{APP_CONFIG.name}</h3>
              <p className="text-sm text-gray-400">
                The marketplace where talent meets opportunity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/services" className="hover:text-white">Browse Services</Link></li>
                <li><Link href="/seller/onboard" className="hover:text-white">Become a Seller</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/messages" className="hover:text-white">Messages</Link></li>
                <li><Link href="/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Terms of Service</span></li>
                <li><span className="cursor-default">Cookie Policy</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
            <p>Platform fee: {APP_CONFIG.commissionPercent}% per transaction</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
