"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Building2, Clock, ExternalLink, LocateFixed, MapPin, PhoneCall, Star } from "lucide-react";
import { getHospitalRecommendations } from "@/lib/api";
import { AnalysisResult, HospitalRecommendation } from "@/types";
import { useLang } from "@/contexts/LanguageContext";

function EmptyState({ message }: { message: string }) {
  const { t } = useLang();
  return (
    <section className="clinical-page">
      <div className="site-container">
        <div className="clinical-card-white mx-auto max-w-[560px] text-center">
          <AlertTriangle className="mx-auto mb-4 text-[var(--danger)]" size={30} />
          <p className="text-[14px] leading-6 text-[var(--muted)]">{message}</p>
          <Link href="/symptoms" className="btn btn-primary mt-6">{t("hospitals.empty.cta")}</Link>
        </div>
      </div>
    </section>
  );
}

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

function departmentFromSpecialist(specialist?: string) {
  const normalized = (specialist || "").toLowerCase();
  if (normalized.includes("cardio")) return "Cardiology";
  if (normalized.includes("neuro")) return "Neurology";
  if (normalized.includes("ortho")) return "Orthopedics";
  if (normalized.includes("ent")) return "ENT";
  return "General Medicine";
}

export default function HospitalsPage() {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<HospitalRecommendation[]>([]);
  const [bestId, setBestId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedAnalysis = parseSavedJson<AnalysisResult>("lifelineAnalysis");
    const savedReport = parseSavedJson<{ specialist?: string }>("lifelineReportAnalysis");
    const routingContext: Pick<AnalysisResult, "department" | "severity"> | null = savedAnalysis
      ? { department: savedAnalysis.department, severity: savedAnalysis.severity }
      : savedReport
        ? { department: departmentFromSpecialist(savedReport.specialist), severity: "moderate" }
        : null;

    if (!routingContext) {
      setError(t("hospitals.error.noAnalysis"));
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError(t("hospitals.error.noLocation"));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await getHospitalRecommendations({
            lat: coords.latitude,
            lng: coords.longitude,
            department: routingContext.department,
            severity: routingContext.severity,
          });
          setHospitals(data.hospitals);
          setBestId(data.bestHospitalId);
        } catch {
          setError(t("hospitals.error.fetch"));
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(t("hospitals.error.permission"));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, []);

  const best = useMemo(() => hospitals.find((hospital) => hospital.id === bestId), [bestId, hospitals]);
  const mapUrl = best ? `https://www.google.com/maps?q=${best.lat},${best.lng}&z=14&output=embed` : "";

  if (loading) {
    return (
      <section className="clinical-page">
        <div className="site-container">
          <div className="clinical-card-white mx-auto max-w-[520px] text-center text-[var(--muted)]">
            <LocateFixed className="mx-auto mb-4 animate-pulse text-[var(--accent)]" size={28} />
            {t("hospitals.loading")}
          </div>
        </div>
      </section>
    );
  }

  if (error) return <EmptyState message={error} />;

  return (
    <section className="clinical-page">
      <div className="site-container">
        <div className="clinical-header">
          <div>
            <span className="clinical-eyebrow">
              <Building2 size={13} /> {t("hospitals.topline")}
            </span>
            <h1 className="clinical-title">{t("hospitals.title")}</h1>
            <p className="clinical-subtitle">
              {t("hospitals.copy")}
            </p>
          </div>
          <a href="tel:112" className="btn btn-danger">
            <PhoneCall size={16} /> {t("common.call112")}
          </a>
        </div>

        {best && (
          <div className="clinical-card-white mb-5 border-[var(--accent-muted)]">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex items-center gap-2 border border-[#b8d4c0] bg-[var(--green-light)] px-3 py-1 text-[12px] font-semibold text-[#46745d]">
                  <Star size={14} /> {t("hospitals.best")}
                </span>
                <h2 className="mt-4 text-[22px] font-semibold text-[var(--ink)]">{best.name}</h2>
                <p className="mt-1 max-w-[680px] text-[13.5px] text-[var(--muted)]">{best.address}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-[13px] text-[var(--muted)]">
                  <span className="border border-[var(--line)] bg-[#f8f4eb] px-3 py-1"><Clock size={14} className="mr-1 inline" /> {best.etaMinutes} min</span>
                  <span className="border border-[var(--line)] bg-[#f8f4eb] px-3 py-1"><MapPin size={14} className="mr-1 inline" /> {best.distanceKm} km</span>
                  <span className="border border-[var(--line)] bg-[#f8f4eb] px-3 py-1"><Star size={14} className="mr-1 inline" /> {best.rating}</span>
                  <span className="border border-[var(--line)] bg-[#f8f4eb] px-3 py-1">{best.specialization}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:min-w-[190px]">
                {best.phone && (
                  <a href={`tel:${best.phone}`} className="btn btn-outline justify-center" id="call-best">
                    <PhoneCall size={16} /> {t("hospitals.call")}
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${best.lat},${best.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary justify-center"
                  id="nav-best"
                >
                  {t("hospitals.navigate")} <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[390px_1fr]">
          <div className="space-y-3">
            {hospitals.map((hospital, index) => {
              const isBest = hospital.id === bestId;
              return (
                <article
                  key={hospital.id}
                  className="border bg-[var(--warm-white)] p-4 transition hover:border-[var(--accent-muted)]"
                  style={{ borderColor: isBest ? "var(--accent-muted)" : "var(--line)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {isBest && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">{t("hospitals.recommended")}</p>}
                      <h3 className="text-[14.5px] font-semibold leading-snug text-[var(--ink)]">{hospital.name}</h3>
                      <p className="mt-1 text-[12.5px] leading-5 text-[var(--muted)]">{hospital.address}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[var(--muted)]">#{index + 1}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--muted)]">
                    <span>{hospital.etaMinutes} min</span>
                    <span>{hospital.distanceKm} km</span>
                    <span>{hospital.rating} {t("hospitals.rating")}</span>
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--earth)]">{hospital.specialization}</p>
                </article>
              );
            })}
          </div>

          <div className="min-h-[430px] overflow-hidden border border-[var(--line)] bg-[#f4efe5]">
            {mapUrl ? (
              <iframe title="Hospital map" src={mapUrl} className="h-full min-h-[430px] w-full border-0" loading="lazy" />
            ) : (
              <div className="flex h-full min-h-[430px] items-center justify-center text-[14px] text-[var(--muted)]">{t("hospitals.mapUnavailable")}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
