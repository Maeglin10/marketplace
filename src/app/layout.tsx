import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL("https://aevia-market.vercel.app"),
  title: {
    default: "AeviaMarket — Freelance Services Marketplace",
    template: "%s | AeviaMarket",
  },
  description:
    "AeviaMarket is a secure freelance services marketplace. Find top talent for design, development, and marketing. Protected payments via Stripe, real-time chat, and verified reviews.",
  keywords: [
    "freelance marketplace",
    "AeviaMarket",
    "hire freelancers",
    "design services",
    "web development freelance",
    "secure payments Stripe",
    "service marketplace",
    "Valentin Milliand",
  ],
  authors: [{ name: "Valentin Milliand", url: "https://valentin-milliand.vercel.app" }],
  creator: "Valentin Milliand",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aevia-market.vercel.app",
    siteName: "AeviaMarket",
    title: "AeviaMarket — Freelance Services Marketplace",
    description:
      "Secure freelance marketplace with Stripe-protected payments, real-time chat, and verified reviews. Find top talent fast.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "AeviaMarket — Freelance Services Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AeviaMarket — Freelance Services Marketplace",
    description:
      "Secure freelance marketplace with Stripe-protected payments, real-time chat, and verified reviews.",
    images: ["/og.png"],
    creator: "@valentinmilliand",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://aevia-market.vercel.app",
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AeviaMarket',
  url: 'https://aevia-market.vercel.app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  description:
    'Secure freelance services marketplace. Find top talent for design, development, and marketing with Stripe-protected payments and verified reviews.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free to join. Platform fee applies per transaction.',
  },
  author: {
    '@type': 'Person',
    name: 'Valentin Milliand',
    url: 'https://valentin-milliand.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
