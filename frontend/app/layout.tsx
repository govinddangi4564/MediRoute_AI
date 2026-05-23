import type { Metadata } from "next";
import "./globals.css";
import { PatientHeader } from "@/components/sections/patient-header";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "MediRoute AI - Emergency Health Assistant",
  description: "AI-powered emergency triage and hospital routing. Get instant health guidance in Hindi or English.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <PatientHeader />
          {children}
          <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 0", background: "rgba(250,247,240,0.86)" }}>
            <div className="site-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "13px", color: "var(--muted)" }}>
              <span>MediRoute AI 2026</span>
              <span>For guidance only - not a medical diagnosis</span>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
