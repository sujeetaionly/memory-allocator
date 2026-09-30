import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/components/common/AppProviders';

export const metadata: Metadata = {
  title: 'Memory Allocator Guide · C++20 Low-Level Systems & Quant Engineering',
  description:
    'A comprehensive, interactive guide to physical RAM, pointers, the OS heap bottleneck, and custom C++20 memory allocators running up to 125x faster than std::malloc.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-white text-gray-700 dark:bg-dark-surface dark:text-dark-high-emphasis min-h-screen">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
