import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'SocialSync — Publish Everywhere',
  description:
    'Compose once and publish to X, Facebook, Instagram, TikTok, and Reddit simultaneously from a single, beautiful interface.',
  keywords: ['social media', 'content publishing', 'scheduler', 'cross-posting', 'SocialSync'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: 'rgba(17, 17, 30, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
