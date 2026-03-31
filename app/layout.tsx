import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'NeonPredict',
  description: 'A mobile-first dark theme prediction trading app with a TikTok-style feed and glassmorphism UI.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="bg-black text-white font-sans antialiased overflow-hidden overscroll-none" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
