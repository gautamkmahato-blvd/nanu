import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ToastProvider } from "./mails/v1/_components/ui/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Context Mode — AI-Powered Email & Calendar Workspace',
  description: 'AI that reads, prioritizes, and acts on your email. Schedule meetings, search conversations, and draft replies — all through a single chat interface.',
  metadataBase: new URL('https://thumbnix.com'),
  openGraph: {
    title: 'Context Mode — AI-Powered Email & Calendar Workspace',
    description: 'AI that reads, prioritizes, and acts on your email. Schedule meetings, search conversations, and draft replies — all through a single chat interface.',
    url: 'https://thumbnix.com',
    siteName: 'Context Mode',
    images: [
      {
        url: 'https://res.cloudinary.com/dqryhg3rs/image/upload/v1782108531/Screenshot_2026-06-22_at_11.23.14_AM_y4lbyi.png',
        width: 1200,
        height: 630,
        alt: 'Context Mode — AI Email Workspace',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Context Mode — AI-Powered Email & Calendar Workspace',
    description: 'AI that reads, prioritizes, and acts on your email. Schedule meetings, search conversations, and draft replies.',
    images: ['https://res.cloudinary.com/dqryhg3rs/image/upload/v1782108531/Screenshot_2026-06-22_at_11.23.14_AM_y4lbyi.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mail-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}


