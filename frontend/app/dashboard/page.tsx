"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock3, Activity, Route } from 'lucide-react';
import { getHospitalRecommendations } from '@/lib/api';
import { AnalysisResult, HospitalRecommendation } from '@/types';

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [hospitals, setHospitals] = useState<HospitalRecommendation[]>([]);
  const [bestId, setBestId] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('lifelineAnalysis');
    if (!raw) {
      setError('No active triage found. Please analyze symptoms first.');
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(raw) as AnalysisResult;
    setAnalysis(parsed);

    const fetchLive = async () => {
      if (!navigator.geolocation) {
        setError('Location not available in this browser.');
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
              severity: parsed.severity
            });
            setHospitals(data.hospitals);
            setBestId(data.bestHospitalId);
            setLastUpdated(new Date());
            setError('');
          } catch {
            setError('Live hospital refresh failed.');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('Please allow location for live hospital updates.');
          setLoading(false);
        }
      );
    };

    fetchLive();
    const timer = setInterval(fetchLive, 30000);
    return () => clearInterval(timer);
  }, []);

  const bestHospital = useMemo(() => hospitals.find((h) => h.id === bestId), [hospitals, bestId]);

  if (loading) {
    return <main className="container py-10 text-center text-slate-600">Loading live dashboard...</main>;
  }

  if (error && !analysis) {
    return (
      <main className="container py-10 text-center">
        <p className="text-danger">{error}</p>
        <Link href="/symptoms" className="ll-btn-primary mt-4 inline-block">
          Go to Symptom Input
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-6 md:py-10">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ll-shell"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ll-eyebrow">Live Monitoring</p>
            <h1 className="ll-title text-2xl md:text-3xl">Real-Time Emergency Dashboard</h1>
            <p className="ll-subtitle">Auto refresh every 30 seconds for updated nearby hospital options.</p>
          </div>
          <div className="rounded-xl border border-[#d7e6f8] bg-[#f4f8ff] px-3 py-2 text-sm font-medium text-[#275286]">
            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} />
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Updating...'}
            </span>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm font-medium text-danger">{error}</p> : null}

        {analysis ? (
          <section className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="ll-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Severity</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{analysis.severity.toUpperCase()}</p>
            </div>
            <div className="ll-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Emergency</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{analysis.emergencyLevel}</p>
            </div>
            <div className="ll-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Department</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{analysis.department}</p>
            </div>
            <div className="ll-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Confidence</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{analysis.confidenceScore}%</p>
            </div>
          </section>
        ) : null}
      </motion.section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="ll-shell">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Activity size={17} className="text-[#1a63c8]" />
            Live Nearby Hospitals
          </h2>
          <div className="mt-4 space-y-3">
            {hospitals.map((h) => (
              <div
                key={h.id}
                className={`rounded-xl border p-4 ${
                  h.id === bestId ? 'border-[#7baeea] bg-[#eaf3ff]' : 'border-[#d7e5f8] bg-white'
                }`}
              >
                <p className="font-semibold text-slate-900">
                  {h.name} {h.id === bestId ? '(Best Match)' : ''}
                </p>
                <p className="text-sm text-slate-600">{h.address}</p>
                <p className="mt-1 text-sm text-slate-700">
                  ETA: {h.etaMinutes} min | Distance: {h.distanceKm} km | Rating: {h.rating}
                </p>
              </div>
            ))}
            {!hospitals.length ? (
              <p className="text-sm text-slate-600">No hospitals found in live refresh.</p>
            ) : null}
          </div>
        </div>

        <div className="ll-shell">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Route size={17} className="text-[#1a63c8]" />
            Quick Routing
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Use this quick action to open turn-by-turn navigation to the current top-matched hospital.
          </p>

          {bestHospital ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${bestHospital.lat},${bestHospital.lng}`}
              target="_blank"
              rel="noreferrer"
              className="ll-btn-primary mt-4 inline-flex"
            >
              Navigate to {bestHospital.name}
            </a>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Top match not available yet.</p>
          )}

          <div className="mt-4 rounded-xl border border-[#d8e7f9] bg-[#f6faff] p-3 text-sm text-slate-700">
            Keep this page open during emergency. Data refreshes every 30 seconds.
          </div>
        </div>
      </section>
    </main>
  );
}
