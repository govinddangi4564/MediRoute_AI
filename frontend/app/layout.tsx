import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LifeLine AI | Patient Care',
  description: 'AI-powered emergency triage and hospital guidance for patients.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e8f1ff_0%,#f7fbff_45%,#ffffff_100%)]">
          {children}
        </div>
      </body>
    </html>
  );
}
