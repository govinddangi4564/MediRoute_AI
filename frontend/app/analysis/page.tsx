"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ShieldCheck, Siren, FileHeart, CircleAlert, Stethoscope, ArrowRight } from 'lucide-react';
import { AnalysisResult } from '@/types';

const severityUi = {
  low: { tone: 'bg-[#e8f8ec] text-[#146f2a] border-[#bde9c7]', label: 'Low Risk' },
  moderate: { tone: 'bg-[#fff8e7] text-[#8f6610] border-[#f6dfa5]', label: 'Moderate Risk' },
  high: { tone: 'bg-[#fff0f0] text-[#b92f2f] border-[#f3c4c4]', label: 'High Risk' },
  critical: { tone: 'bg-[#d93d3d] text-white border-[#d93d3d]', label: 'Critical Risk' }
} as const;

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [reportSummary, setReportSummary] = useState<{
    summary: string;
    redFlags: string[];
    specialist: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('lifelineAnalysis');
    const report = localStorage.getItem('lifelineReportAnalysis');
    if (saved) {
      try {
        setAnalysis(JSON.parse(saved));
      } catch {
        localStorage.removeItem('lifelineAnalysis');
      }
    }
    if (report) {
      try {
        const parsed = JSON.parse(report) as {
          summary?: string;
          redFlags?: string[];
          specialist?: string;
        };
        setReportSummary({
          summary: parsed.summary || 'Could not read report summary.',
          redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
          specialist: parsed.specialist || 'General Physician'
        });
      } catch {
        localStorage.removeItem('lifelineReportAnalysis');
      }
    }
  }, []);

  const ui = useMemo(
    () => (analysis ? severityUi[analysis.severity] : severityUi.moderate),
    [analysis]
  );

  if (!analysis && !reportSummary) {
    return (
      <main className="container py-10">
        <div className="ll-shell mx-auto max-w-2xl text-center">
          <p className="text-slate-700">No analysis yet. Please submit symptoms or reports first.</p>
          <Link href="/symptoms" className="ll-btn-primary mt-4 inline-block">
            Go to Symptom Input
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-5">
        {analysis && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="ll-shell"
          >
            <p className="ll-eyebrow">Step 3 of 3</p>
            <h1 className="ll-title text-2xl md:text-3xl">AI Emergency Analysis Result</h1>
            <p className="ll-subtitle">This is guidance support and not a final diagnosis.</p>

            <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${ui.tone}`}>
              {analysis.severity === 'critical' ? <Siren size={16} /> : <AlertTriangle size={16} />}
              {ui.label} ({analysis.emergencyLevel})
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="ll-kpi-card">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Likely Condition</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{analysis.possibleDisease}</p>
              </div>
              <div className="ll-kpi-card">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">AI Confidence</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{analysis.confidenceScore}%</p>
              </div>
              <div className="ll-kpi-card">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recommended Department</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{analysis.department}</p>
              </div>
            </div>

            {analysis.severity === 'critical' || analysis.severity === 'high' ? (
              <div className="ll-danger-note mt-5">
                Severe symptoms detected. Do not delay. Visit emergency hospital now.
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-[#d8e7f9] bg-white p-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ShieldCheck size={16} className="text-[#1a63c8]" />
                  First Aid Steps
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {analysis.firstAid.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-[#d8e7f9] bg-white p-4">
                <h2 className="text-base font-semibold text-slate-900">Immediate Guidance</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  {analysis.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">{analysis.explanation}</p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => router.push('/hospitals')}
                className="ll-btn-primary"
              >
                Find Best Nearby Hospital
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="ll-btn-secondary"
              >
                Open Real-Time Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('lifelineAnalysis');
                  localStorage.removeItem('lifelineReportAnalysis');
                  localStorage.removeItem('lifelineSymptoms');
                  router.push('/symptoms');
                }}
                className="ll-btn-secondary"
              >
                Start New Patient
              </button>
            </div>
          </motion.section>
        )}

        {reportSummary && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="ll-shell overflow-hidden"
          >
            <div className="rounded-2xl border border-[#d8e7f9] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#275286]">
                    <FileHeart size={14} />
                    REPORT INSIGHT
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Your Report, Explained Simply</h2>
                  <p className="mt-1 text-sm text-slate-600">Easy language summary from uploaded medical documents.</p>
                </div>
                <div className="rounded-xl border border-[#cfe2fb] bg-white px-4 py-2 text-sm font-semibold text-[#204e8a]">
                  Confidence: AI-assisted
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#d6e6f8] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Summary</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{reportSummary.summary}</p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[#d6e6f8] bg-white p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <Stethoscope size={14} className="text-[#1e63c1]" />
                    Suggested Specialist
                  </p>
                  <p className="mt-2 text-base font-semibold text-[#153d70]">{reportSummary.specialist}</p>
                </div>

                <div className="rounded-xl border border-[#d6e6f8] bg-white p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <CircleAlert size={14} className="text-[#1e63c1]" />
                    Attention Points
                  </p>
                  {reportSummary.redFlags.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {reportSummary.redFlags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">No major red flags detected from this report summary.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => router.push('/hospitals')}
                  className="ll-btn-primary inline-flex items-center justify-center gap-2"
                >
                  Find Relevant Hospital
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => router.push('/upload')}
                  className="ll-btn-secondary"
                >
                  Upload Another Report
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('lifelineAnalysis');
                    localStorage.removeItem('lifelineReportAnalysis');
                    localStorage.removeItem('lifelineSymptoms');
                    router.push('/symptoms');
                  }}
                  className="ll-btn-secondary"
                >
                  Start New Patient
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
