import type { Metadata } from 'next';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { AuthProvider } from '@/lib/auth/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'EzRoot – Ruteplanlægning',
  description: 'B2B ruteplanlægning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body>
        <ThemeWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}
