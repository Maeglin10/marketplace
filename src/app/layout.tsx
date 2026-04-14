import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://aevia-skymarket.vercel.app'),
  title: {
    default: 'ServiceHub — Find Top Freelance Services & Talent',
    template: '%s | ServiceHub',
  },
  description: 'Connect with verified freelance professionals for design, development, marketing, and more. Secure payments, real reviews, and instant messaging. Start hiring today.',
  keywords: ['freelance marketplace', 'hire freelancers', 'services marketplace', 'logo design', 'web development', 'SEO services', 'ServiceHub'],
  authors: [{ name: 'Valentin Milliand' }],
  creator: 'Valentin Milliand',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aevia-skymarket.vercel.app',
    siteName: 'ServiceHub',
    title: 'ServiceHub — Find Top Freelance Services & Talent',
    description: 'Connect with verified freelance professionals. Secure payments, real reviews, instant messaging.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'ServiceHub — Freelance Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServiceHub — Find Top Freelance Services',
    description: 'Connect with verified freelance professionals. Secure payments, real reviews.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: 'https://aevia-skymarket.vercel.app' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'ServiceHub',
          'url': 'https://aevia-skymarket.vercel.app',
          'description': 'A production-ready freelance service marketplace platform.',
          'author': { '@type': 'Person', 'name': 'Valentin Milliand' }
        }) }} />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-semibold">Skip to main content</a>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
