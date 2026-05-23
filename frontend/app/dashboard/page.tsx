"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, Clock, ExternalLink, HeartPulse, MapPin, Navigation, RefreshCw } from "lucide-react";
import { getHospitalRecommendations } from "@/lib/api";
import { AnalysisResult, HospitalRecommendation } from "@/types";

const SEVERITY_COLORS: Record<string, string> = {
  low: "#46745d",
  moderate: "#9a7652",
  high: "var(--danger)",
  critical: "var(--danger)",
};

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [hospitals, setHospitals] = useState<HospitalRecommendation[]>([]);
  const [bestId, setBestId] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("lifelineAnalysis");
    if (!raw) {
      setError("No active triage. Please analyze symptoms first.");
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(raw) as AnalysisResult;
    setAnalysis(parsed);

    const fetchLive = async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      if (!navigator.geolocation) {
        setError("Location is not available.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const data = await getHospitalRecommendations({
              lat: coords.latitude,
              lng: coords.longitude,
              department: parsed.department,
              severity: parsed.severity,
            });
            setHospitals(data.hospitals);
            setBestId(data.bestHospitalId);
            setLastUpdated(new Date());
            setError("");
          } catch {
            setError("Live refresh failed.");
          } finally {
            setLoading(false);
            setRefreshing(false);
          }
        },
        () => {
          setError("Please allow location access.");
          setLoading(false);
          setRefreshing(false);
        }
      );
    };

    fetchLive();
    const timer = window.setInterval(() => fetchLive(true), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const best = useMemo(() => hospitals.find((hospital) => hospital.id === bestId), [hospitals, bestId]);

  if (loading) {
    return (
      <section className="clinical-page">
        <div className="site-container">
          <div className="clinical-card-white mx-auto max-w-[520px] text-center text-[var(--muted)]">
            <RefreshCw className="mx-auto mb-4 animate-spin text-[var(--accent)]" size={28} />
            Loading live care dashboard...
          </div>
        </div>
      </section>
    );
  }

  if (error && !analysis) {
    return (
      <section className="clinical-page">
        <div className="site-container">
          <div className="clinical-card-white mx-auto max-w-[560px] text-center">
            <AlertTriangle className="mx-auto mb-4 text-[var(--danger)]" size={30} />
            <p className="text-[14px] leading-6 text-[var(--muted)]">{error}</p>
            <Link href="/symptoms" className="btn btn-primary mt-6">Go to symptoms</Link>
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
              <Activity size={13} /> Live dashboard
            </span>
            <h1 className="clinical-title">Monitor the active triage and care routing.</h1>
            <p className="clinical-subtitle">
              A compact operational view for the current patient flow. Hospital data refreshes every 30 seconds when location is available.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-[var(--line)] bg-[var(--warm-white)] px-3 py-2 text-[12.5px] text-[var(--muted)]">
            <span className="h-2 w-2" style={{ background: refreshing ? "var(--earth)" : "#46745d" }} />
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Updating..."}
          </div>
        </div>

        {error && <div className="alert alert-danger mb-5">{error}</div>}

        {analysis && (
          <div className="mb-5 grid gap-3 md:grid-cols-4">
            {[
              ["Severity", analysis.severity.toUpperCase(), SEVERITY_COLORS[analysis.severity]],
              ["Emergency", analysis.emergencyLevel, "var(--ink)"],
              ["Department", analysis.department, "var(--ink)"],
              ["Confidence", `${analysis.confidenceScore}%`, "var(--accent)"],
            ].map(([label, value, color]) => (
              <div key={label} className="kpi">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
                <p className="text-[16px] font-semibold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_0.76fr]">
          <div className="clinical-card-white">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div>
                <h2 className="text-[17px] font-semibold text-[var(--ink)]">Nearby hospital feed</h2>
                <p className="mt-1 text-[13px] text-[var(--muted)]">Ranked by ETA, distance, and fit.</p>
              </div>
              {refreshing && <RefreshCw className="animate-spin text-[var(--earth)]" size={17} />}
            </div>

            <div className="space-y-3">
              {hospitals.map((hospital) => (
                <article
                  key={hospital.id}
                  className="grid gap-3 border border-[var(--line)] bg-[#fbf8f1] p-4 sm:grid-cols-[1fr_auto]"
                  style={{ borderColor: hospital.id === bestId ? "var(--accent-muted)" : "var(--line)" }}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[14.5px] font-semibold text-[var(--ink)]">{hospital.name}</h3>
                      {hospital.id === bestId && <span className="border border-[#b8d4c0] bg-[var(--green-light)] px-2 py-0.5 text-[10px] font-bold uppercase text-[#46745d]">Best</span>}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-5 text-[var(--muted)]">{hospital.address}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--muted)]">
                      <span><Clock size={13} className="mr-1 inline" />{hospital.etaMinutes} min</span>
                      <span><MapPin size={13} className="mr-1 inline" />{hospital.distanceKm} km</span>
                      <span>{hospital.rating} rating</span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline self-start justify-center"
                  >
                    Route <ExternalLink size={14} />
                  </a>
                </article>
              ))}
              {!hospitals.length && <p className="text-[13.5px] text-[var(--muted)]">No hospitals found yet.</p>}
            </div>
          </div>

          <aside className="clinical-card-white">
            <h2 className="flex items-center gap-2 text-[17px] font-semibold text-[var(--ink)]">
              <Navigation size={18} className="text-[var(--accent)]" /> Current routing decision
            </h2>

            {best ? (
              <div className="mt-5">
                <div className="border border-[var(--line)] bg-[#f8f4eb] p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Top match</p>
                  <h3 className="text-[18px] font-semibold text-[var(--ink)]">{best.name}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{best.address}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[12.5px] text-[var(--muted)]">
                    <span className="border border-[var(--line)] bg-[var(--warm-white)] px-3 py-1">{best.etaMinutes} min away</span>
                    <span className="border border-[var(--line)] bg-[var(--warm-white)] px-3 py-1">{best.distanceKm} km</span>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${best.lat},${best.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary mt-4 w-full justify-center"
                  id="dash-navigate"
                >
                  Navigate to hospital <ExternalLink size={15} />
                </a>
              </div>
            ) : (
              <p className="mt-4 text-[13.5px] leading-6 text-[var(--muted)]">Top match is not available yet.</p>
            )}

            <div className="mt-5 border border-[var(--line)] bg-[var(--accent-light)] p-4 text-[13px] leading-6 text-[var(--accent-dark)]">
              <HeartPulse className="mb-2" size={18} />
              Keep this page open during handoff. It refreshes automatically and keeps the latest hospital ranking visible.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
