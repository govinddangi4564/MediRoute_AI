"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnalysisResult } from '@/types';
import { severityColor } from '@/lib/utils';

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [reportSummary, setReportSummary] = useState<{ summary: string; redFlags: string[]; specialist: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('lifelineAnalysis');
    const report = localStorage.getItem('lifelineReportAnalysis');
    if (saved) setAnalysis(JSON.parse(saved));
    if (report) setReportSummary(JSON.parse(report));
  }, []);

  if (!analysis && !reportSummary) {
    return (
      <main className="container py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-soft">
          <p className="text-slate-700">No analysis yet. Please submit symptoms or reports first.</p>
          <Link href="/symptoms" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white">Go to Symptom Input</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-5">
        {analysis && (
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-soft">
            <h1 className="text-2xl font-semibold text-slate-900">AI Emergency Analysis</h1>
            <div className={`mt-4 inline-flex rounded-full border px-4 py-1 text-sm font-semibold ${severityColor[analysis.severity]}`}>
              Risk: {analysis.severity.toUpperCase()} ({analysis.emergencyLevel})
            </div>
            <p className="mt-4 text-slate-700"><span className="font-medium">Possible condition:</span> {analysis.possibleDisease}</p>
            <p className="mt-2 text-slate-700"><span className="font-medium">Confidence:</span> {analysis.confidenceScore}%</p>
            <p className="mt-2 text-slate-700">{analysis.explanation}</p>

            <h2 className="mt-5 font-semibold text-slate-900">First Aid</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {analysis.firstAid.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <h2 className="mt-5 font-semibold text-slate-900">Immediate Guidance</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {analysis.recommendations.map((item) => <li key={item}>{item}</li>)}
            </ul>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => router.push('/hospitals')} className="rounded-xl bg-primary px-5 py-3 font-medium text-white hover:bg-blue-700">
                Find Best Nearby Hospital
              </button>
              <button onClick={() => router.push('/dashboard')} className="rounded-xl border border-blue-200 bg-white px-5 py-3 font-medium text-blue-700 hover:bg-blue-50">
                Open Real-Time Dashboard
              </button>
            </div>
          </section>
        )}

        {reportSummary && (
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Report Summary</h2>
            <p className="mt-3 text-slate-700">{reportSummary.summary}</p>
            <p className="mt-4 font-medium text-slate-800">Suggested specialist: {reportSummary.specialist}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {reportSummary.redFlags.map((flag) => <li key={flag}>{flag}</li>)}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
