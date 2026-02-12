import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TravelCart — AI Flight Price Tracking | Book at the Perfect Moment',
  description: "Stop guessing when to book flights. TravelCart's AI watches prices 24/7 and tells you exactly when to buy. Average savings: $287 per trip.",
  keywords: 'flight price tracker, cheap flights, flight deals, when to book flights, flight price predictor, flight alerts',
  authors: [{ name: 'TravelCart' }],
  openGraph: {
    title: 'TravelCart — Book Flights at the Perfect Moment',
    description: "Our AI watches prices 24/7 and tells you exactly when to book. Stop guessing, start saving.",
    url: 'https://travelcart.app',
    siteName: 'TravelCart',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TravelCart - AI Flight Price Tracking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelCart — AI Flight Price Tracking',
    description: "Stop guessing when to book. Our AI tells you exactly when to buy.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
