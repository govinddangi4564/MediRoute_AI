"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  FileText,
  HeartPulse,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { AnalysisResult, Severity } from "@/types";

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; tone: string; bg: string; border: string }
> = {
  low: {
    label: "Low risk",
    tone: "#46745d",
    bg: "var(--green-light)",
    border: "#b8d4c0",
  },
  moderate: {
    label: "Moderate risk",
    tone: "#9a7652",
    bg: "var(--yellow-light)",
    border: "#dec99e",
  },
  high: {
    label: "High risk",
    tone: "var(--danger)",
    bg: "var(--red-light)",
    border: "#e7b8af",
  },
  critical: {
    label: "Critical",
    tone: "var(--danger)",
    bg: "var(--red-light)",
    border: "#e7b8af",
  },
};

type ReportSummary = {
  summary: string;
  redFlags: string[];
  specialist: string;
};

function parseSavedJson<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function normalizeReportSummary(
  value: Partial<ReportSummary> | null,
): ReportSummary | null {
  if (!value) return null;
  return {
    summary: value.summary || "Could not read report summary.",
    redFlags: Array.isArray(value.redFlags) ? value.redFlags : [],
    specialist: value.specialist || "General Physician",
  };
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    const storedAnalysis = parseSavedJson<AnalysisResult>("lifelineAnalysis");
    const storedReport = normalizeReportSummary(
      parseSavedJson<Partial<ReportSummary>>("lifelineReportAnalysis"),
    );
    setAnalysis(storedAnalysis);
    setReportSummary(storedReport);
  }, []);

  const severity = useMemo(
    () => (analysis ? SEVERITY_CONFIG[analysis.severity] : null),
    [analysis],
  );
  const isSevere =
    analysis?.severity === "high" || analysis?.severity === "critical";

  if (!analysis && !reportSummary) {
    return (
      <section className="clinical-page">
        <div className="site-container">
          <div className="clinical-card-white mx-auto max-w-[560px] text-center">
            <ClipboardCheck
              className="mx-auto mb-4 text-[var(--accent)]"
              size={30}
            />
            <h1 className="text-[24px] font-semibold text-[var(--ink)]">
              No analysis yet
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
              Start with symptoms or upload a report so MediRoute can prepare a
              care summary.
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
            <h1 className="clinical-title">
              Review the triage result before choosing care.
            </h1>
            <p className="clinical-subtitle">
              This is a structured guidance view. It should support a patient or
              helper, not replace a clinician.
            </p>
          </div>
          <button
            onClick={() => router.push("/hospitals")}
            className="btn btn-primary"
            id="goto-hospitals-top"
          >
            Find hospitals <ArrowRight size={16} />
          </button>
        </div>

        {analysis && severity && (
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1fr]">
            <aside className="clinical-card-white">
              <div className="border-b border-[var(--line)] pb-5">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold"
                  style={{
                    borderColor: severity.border,
                    color: severity.tone,
                    backgroundColor: severity.bg,
                  }}
                >
                  <HeartPulse size={14} /> {severity.label}
                </span>
                <h2 className="mt-4 text-[23px] font-semibold leading-tight text-[var(--ink)]">
                  {analysis.possibleDisease}
                </h2>
                <p className="mt-3 text-[13.5px] leading-6 text-[var(--muted)]">
                  {analysis.explanation}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[#f8f4eb] px-4 py-3">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                    Emergency level
                  </span>
                  <p className="text-right text-[14px] font-semibold text-[var(--ink)]">
                    {analysis.emergencyLevel}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[#f8f4eb] px-4 py-3">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                    Department
                  </span>
                  <p className="text-right text-[14px] font-semibold text-[var(--ink)]">
                    {analysis.department}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[#f8f4eb] px-4 py-3">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                    AI confidence
                  </span>
                  <p className="text-right text-[14px] font-semibold text-[var(--ink)]">{`${analysis.confidenceScore}%`}</p>
                </div>
              </div>

              {isSevere && (
                <div className="mt-5 rounded-lg border border-[#e7b8af] bg-[var(--red-light)] p-4 text-[13.5px] leading-6 text-[var(--danger)]">
                  <AlertTriangle className="mb-2" size={18} />
                  High-risk symptoms should be evaluated urgently. Do not wait
                  for additional AI guidance.
                </div>
              )}
            </aside>

            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="clinical-card-white">
                  <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[var(--ink)]">
                    <Stethoscope size={18} className="text-[var(--accent)]" />{" "}
                    First-aid steps
                  </h2>
                  <ol className="mt-4 space-y-3">
                    {(Array.isArray(analysis.firstAid)
                      ? analysis.firstAid
                      : []
                    ).map((item, index) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[13.5px] leading-6 text-[var(--muted)]"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--cream)] text-xs font-semibold text-[var(--ink)]">
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="clinical-card-white">
                  <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[var(--ink)]">
                    <ClipboardCheck
                      size={18}
                      className="text-[var(--accent)]"
                    />{" "}
                    What to do next
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {(Array.isArray(analysis.recommendations)
                      ? analysis.recommendations
                      : []
                    ).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[13.5px] leading-6 text-[var(--muted)]"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/hospitals")}
                  className="btn btn-primary"
                  id="goto-hospitals"
                >
                  <MapPin size={16} /> Find nearest hospital
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn btn-outline"
                  id="goto-dashboard"
                >
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
                <h2 className="mt-3 text-[21px] font-semibold text-[var(--ink)]">
                  Plain-language report summary
                </h2>
                <p className="mt-2 text-[13px] text-[var(--muted)]">
                  Suggested specialist: {reportSummary.specialist}
                </p>
              </div>
              <div>
                <p className="text-[14px] leading-7 text-[var(--muted)]">
                  {reportSummary.summary}
                </p>
                {reportSummary.redFlags.length > 0 && (
                  <div className="mt-5 border border-[var(--line)] bg-[#f8f4eb] p-4">
                    <p className="mb-3 text-[13px] font-semibold text-[var(--ink)]">
                      Points to note
                    </p>
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
