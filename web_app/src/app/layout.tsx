import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/common/AppProviders';

export const metadata: Metadata = {
  title: 'Low-Level C++ Systems & Memory Allocators Academy',
  description:
    'A zero-to-hero interactive systems programming academy. Learn physical RAM, pointers, the heap bottleneck, and custom C++20 memory allocators running 125x faster than std::malloc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400;1,600&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
