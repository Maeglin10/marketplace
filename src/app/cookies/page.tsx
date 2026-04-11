import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Cookie Policy | Marketplace',
  description: 'Our cookie policy explains how we use cookies to improve your experience.',
};

export default function CookiesPage() {
  return (
    <main>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-8 text-gray-700 dark:text-gray-300">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit our marketplace. They help us provide a better experience by remembering your preferences and keeping you logged in.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Cookies We Use</h2>
            <ul className="space-y-3 list-disc pl-5">
              <li><strong>Essential cookies</strong> — Required for authentication and session management. Cannot be disabled.</li>
              <li><strong>Preference cookies</strong> — Remember your theme (light/dark mode) and display preferences.</li>
              <li><strong>Analytics cookies</strong> — Help us understand how users interact with the platform (anonymized data).</li>
              <li><strong>Payment cookies</strong> — Set by Stripe to ensure secure payment processing.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality, including your ability to stay logged in.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Contact</h2>
            <p>Questions about our cookie policy? Contact us at <a href="mailto:privacy@servicehub.com" className="text-blue-600 hover:underline">privacy@servicehub.com</a>.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
