import type { Metadata } from 'next';
import './globals.css';
import { PatientHeader } from '@/components/sections/patient-header';

export const metadata: Metadata = {
  title: 'LifeLine AI | Patient Care',
  description: 'AI-powered emergency triage and hospital guidance for patients.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <PatientHeader />
          <div>{children}</div>
        </div>
      </body>
    </html>
  );
}
