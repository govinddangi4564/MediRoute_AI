import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PatientHeader } from '@/components/sections/patient-header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LifeLine AI | Patient Care',
  description: 'AI-powered emergency triage and hospital guidance for patients.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <div className="min-h-screen bg-[var(--lifeline-bg)] selection:bg-blue-100 selection:text-blue-900">
          <PatientHeader />
          <div>{children}</div>
        </div>
      </body>
    </html>
  );
}
