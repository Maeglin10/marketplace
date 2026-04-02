import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';

const featuredServices = [
  {
    id: '1',
    title: 'Professional Logo Design',
    seller: 'Sarah K.',
    price: 49,
    rating: 4.9,
    reviews: 312,
    category: 'Design',
    emoji: '🎨',
  },
  {
    id: '2',
    title: 'Full-Stack Web Development',
    seller: 'Marc T.',
    price: 299,
    rating: 5.0,
    reviews: 87,
    category: 'Development',
    emoji: '💻',
  },
  {
    id: '3',
    title: 'SEO & Content Strategy',
    seller: 'Lena R.',
    price: 129,
    rating: 4.8,
    reviews: 204,
    category: 'Marketing',
    emoji: '📈',
  },
];

const stats = [
  { label: 'Services', value: '1,200+' },
  { label: 'Sellers', value: '850+' },
  { label: 'Average Rating', value: '4.9★' },
  { label: 'Secure', value: '100%' },
];

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight animate-fade-in">
            {APP_CONFIG.tagline}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-fade-in animation-delay-150">
            Connect with talented service providers or offer your expertise to a global audience.
            Our secure marketplace makes it easy to find, hire, and deliver quality services.
          </p>
          <p className="text-base text-gray-500 dark:text-gray-500 max-w-xl mx-auto animate-slide-up animation-delay-300">
            Trusted by thousands of buyers and sellers worldwide — get started today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-450">
            <Link href="/services">
              <Button size="lg">Browse Services</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">Start Selling</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Why {APP_CONFIG.name}?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Secure Payments',
                desc: 'Protected transactions via Stripe Connect. Funds are held securely until work is delivered. Supports cards, Apple Pay, Google Pay, SEPA & more.',
              },
              {
                icon: '💬',
                title: 'Real-time Chat',
                desc: 'Communicate instantly with buyers or sellers. Live messaging with no page refresh — always stay connected.',
              },
              {
                icon: '⭐',
                title: 'Ratings & Reviews',
                desc: 'Build your reputation with verified reviews from completed orders. Earn trust from the community.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white text-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Featured Services</h2>
            <Link href="/services" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Link key={service.id} href={`/services/${service.id}`}>
                <div className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                  {/* Thumbnail placeholder */}
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-5xl">
                    {service.emoji}
                  </div>
                  <div className="p-4 space-y-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {service.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">{service.rating}</span>
                      <span>({service.reviews})</span>
                      <span className="mx-1">·</span>
                      <span>{service.seller}</span>
                    </div>
                    <div className="pt-1 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Starting at</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">${service.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Find a Service', desc: 'Browse thousands of services and filter by category, price, or rating.' },
              { step: '2', title: 'Place Your Order', desc: 'Pay securely with your preferred payment method. Your funds are protected.' },
              { step: '3', title: 'Get It Done', desc: 'Work with your seller, communicate in real-time, and release payment on completion.' },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-2 border-black dark:border-white flex items-center justify-center text-xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
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
                <li><Link href="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
                <li><Link href="/seller/onboard" className="hover:text-white transition-colors">Become a Seller</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/messages" className="hover:text-white transition-colors">Messages</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
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
