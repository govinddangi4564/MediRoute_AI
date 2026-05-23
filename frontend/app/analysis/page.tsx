"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, ClipboardCheck, FileText, HeartPulse, MapPin, Stethoscope } from "lucide-react";
import { AnalysisResult, Severity } from "@/types";

const SEVERITY_CONFIG: Record<Severity, { label: string; tone: string; bg: string; border: string }> = {
  low: { label: "Low risk", tone: "#46745d", bg: "var(--green-light)", border: "#b8d4c0" },
  moderate: { label: "Moderate risk", tone: "#9a7652", bg: "var(--yellow-light)", border: "#dec99e" },
  high: { label: "High risk", tone: "var(--danger)", bg: "var(--red-light)", border: "#e7b8af" },
  critical: { label: "Critical", tone: "var(--danger)", bg: "var(--red-light)", border: "#e7b8af" },
};

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [reportSummary, setReportSummary] = useState<{ summary: string; redFlags: string[]; specialist: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedAnalysis = localStorage.getItem("lifelineAnalysis");
    const storedReport = localStorage.getItem("lifelineReportAnalysis");
    if (storedAnalysis) setAnalysis(JSON.parse(storedAnalysis));
    if (storedReport) setReportSummary(JSON.parse(storedReport));
  }, []);

  const severity = useMemo(() => (analysis ? SEVERITY_CONFIG[analysis.severity] : null), [analysis]);
  const isSevere = analysis?.severity === "high" || analysis?.severity === "critical";

  if (!analysis && !reportSummary) {
    return (
      <section className="clinical-page">
        <div className="site-container">
          <div className="clinical-card-white mx-auto max-w-[560px] text-center">
            <ClipboardCheck className="mx-auto mb-4 text-[var(--accent)]" size={30} />
            <h1 className="text-[24px] font-semibold text-[var(--ink)]">No analysis yet</h1>
            <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
              Start with symptoms or upload a report so MediRoute can prepare a care summary.
            </p>
            <Link href="/symptoms" className="btn btn-primary mt-6">
              Go to symptom intake
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="clinical-page">
      <div className="site-container">
        <div className="clinical-header">
          <div>
            <span className="clinical-eyebrow">
              <ClipboardCheck size={13} /> Care summary
            </span>
            <h1 className="clinical-title">Review the triage result before choosing care.</h1>
            <p className="clinical-subtitle">
              This is a structured guidance view. It should support a patient or helper, not replace a clinician.
            </p>
          </div>
          <button onClick={() => router.push("/hospitals")} className="btn btn-primary" id="goto-hospitals-top">
            Find hospitals <ArrowRight size={16} />
          </button>
        </div>

        {analysis && severity && (
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1fr]">
            <aside className="clinical-card-white">
              <div className="border-b border-[var(--line)] pb-5">
                <span className="inline-flex items-center gap-2 border px-3 py-1 text-[12px] font-semibold" style={{ borderColor: severity.border, color: severity.tone, background: severity.bg }}>
                  <HeartPulse size={14} /> {severity.label}
                </span>
                <h2 className="mt-4 text-[23px] font-semibold leading-tight text-[var(--ink)]">{analysis.possibleDisease}</h2>
                <p className="mt-3 text-[13.5px] leading-6 text-[var(--muted)]">{analysis.explanation}</p>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  ["Emergency level", analysis.emergencyLevel],
                  ["Department", analysis.department],
                  ["AI confidence", `${analysis.confidenceScore}%`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border border-[var(--line)] bg-[#f8f4eb] px-4 py-3">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span>
                    <span className="text-right text-[14px] font-semibold text-[var(--ink)]">{value}</span>
                  </div>
                ))}
              </div>

              {isSevere && (
                <div className="mt-5 border border-[#e7b8af] bg-[var(--red-light)] p-4 text-[13.5px] leading-6 text-[var(--danger)]">
                  <AlertTriangle className="mb-2" size={18} />
                  High-risk symptoms should be evaluated urgently. Do not wait for additional AI guidance.
                </div>
              )}
            </aside>

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="clinical-card-white">
                  <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[var(--ink)]">
                    <Stethoscope size={18} className="text-[var(--accent)]" /> First-aid steps
                  </h2>
                  <ol className="mt-4 space-y-3">
                    {analysis.firstAid.map((item, index) => (
                      <li key={item} className="flex gap-3 text-[13.5px] leading-6 text-[var(--muted)]">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--cream)] text-xs font-semibold text-[var(--ink)]">
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="clinical-card-white">
                  <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[var(--ink)]">
                    <ClipboardCheck size={18} className="text-[var(--accent)]" /> What to do next
                  </h2>
                  <div className="mt-4 clinical-list">
                    {analysis.recommendations.map((item) => (
                      <div key={item} className="clinical-list-item">
                        <span className="clinical-list-dot" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push("/hospitals")} className="btn btn-primary" id="goto-hospitals">
                  <MapPin size={16} /> Find nearest hospital
                </button>
                <button onClick={() => router.push("/dashboard")} className="btn btn-outline" id="goto-dashboard">
                  Open live dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {reportSummary && (
          <div className="clinical-card-white mt-6">
            <div className="grid gap-5 lg:grid-cols-[0.35fr_1fr]">
              <div>
                <span className="clinical-eyebrow">
                  <FileText size={13} /> Report notes
                </span>
                <h2 className="mt-3 text-[21px] font-semibold text-[var(--ink)]">Plain-language report summary</h2>
                <p className="mt-2 text-[13px] text-[var(--muted)]">Suggested specialist: {reportSummary.specialist}</p>
              </div>
              <div>
                <p className="text-[14px] leading-7 text-[var(--muted)]">{reportSummary.summary}</p>
                {reportSummary.redFlags.length > 0 && (
                  <div className="mt-5 border border-[var(--line)] bg-[#f8f4eb] p-4">
                    <p className="mb-3 text-[13px] font-semibold text-[var(--ink)]">Points to note</p>
                    <div className="clinical-list">
                      {reportSummary.redFlags.map((flag) => (
                        <div key={flag} className="clinical-list-item">
                          <span className="clinical-list-dot" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
