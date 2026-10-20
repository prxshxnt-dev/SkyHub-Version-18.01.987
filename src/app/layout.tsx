import React from 'react';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import ThemeProvider from '@/components/ThemeProvider';
import { SearchProvider } from '@/context/SearchContext';
import { NotificationProvider } from '@/components/NotificationProvider';
import { PerformanceProvider } from '@/context/PerformanceContext';
import { ToastProvider } from '@/context/ToastContext';
import { RootContent } from '@/components/layout/RootContent';

import { Space_Grotesk, Inter, Source_Code_Pro } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'SKY — POCO M6 Pro 5G & Redmi 12 5G Custom ROMs Ecosystem',
  description: 'Official custom ROMs, kernels, recoveries, and firmware hub for Xiaomi Redmi 12 5G and POCO M6 Pro 5G (sky / sm4450).',
  openGraph: {
    title: 'SKY — POCO M6 Pro 5G & Redmi 12 5G Custom ROMs Ecosystem',
    description: 'Official custom ROMs, kernels, recoveries, and firmware hub for Xiaomi Redmi 12 5G and POCO M6 Pro 5G (sky / sm4450).',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} ${sourceCodePro.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('skyhub-theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (!theme) theme = 'dark';
                  document.documentElement.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen overflow-x-hidden transition-colors duration-300">
        <PerformanceProvider>
          <ToastProvider>
            <FirebaseClientProvider>
              <SearchProvider>
                <ThemeProvider>
                  <NotificationProvider>
                    <RootContent>
                      {children}
                    </RootContent>
                  </NotificationProvider>
                </ThemeProvider>
              </SearchProvider>
              <Toaster />
            </FirebaseClientProvider>
          </ToastProvider>
        </PerformanceProvider>
      </body>
    </html>
  );
}
