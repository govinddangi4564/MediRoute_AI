"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
        <Link href="/symptoms" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white">Go to Symptom Input</Link>
      </main>
    );
  }

  return (
    <main className="container py-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-soft">
          <h1 className="text-2xl font-semibold text-slate-900">Real-Time Emergency Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Auto-refresh every 30 seconds for nearby hospital readiness.</p>
          {lastUpdated && <p className="mt-2 text-xs text-slate-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </section>

        {analysis && (
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs text-slate-500">Severity</p>
              <p className="mt-1 font-semibold text-slate-900">{analysis.severity.toUpperCase()}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs text-slate-500">Emergency</p>
              <p className="mt-1 font-semibold text-slate-900">{analysis.emergencyLevel}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs text-slate-500">Department</p>
              <p className="mt-1 font-semibold text-slate-900">{analysis.department}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-4">
              <p className="text-xs text-slate-500">Confidence</p>
              <p className="mt-1 font-semibold text-slate-900">{analysis.confidenceScore}%</p>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Live Nearby Hospitals</h2>
          <div className="mt-4 space-y-3">
            {hospitals.map((h) => (
              <div key={h.id} className={`rounded-xl border p-4 ${h.id === bestId ? 'border-primary bg-blue-50' : 'border-slate-200'}`}>
                <p className="font-semibold text-slate-900">{h.name} {h.id === bestId ? '(Best Match)' : ''}</p>
                <p className="text-sm text-slate-600">{h.address}</p>
                <p className="mt-1 text-sm text-slate-700">ETA: {h.etaMinutes} min | Distance: {h.distanceKm} km | Rating: {h.rating}</p>
              </div>
            ))}
            {!hospitals.length && <p className="text-sm text-slate-600">No hospitals found in live refresh.</p>}
          </div>

          {bestHospital && (
            <div className="mt-5">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${bestHospital.lat},${bestHospital.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              >
                Navigate to Best Hospital
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
