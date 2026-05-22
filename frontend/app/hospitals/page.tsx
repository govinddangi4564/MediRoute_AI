"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Route, Star } from 'lucide-react';
import { getHospitalRecommendations } from '@/lib/api';
import { AnalysisResult, HospitalRecommendation } from '@/types';

export default function HospitalsPage() {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<HospitalRecommendation[]>([]);
  const [bestId, setBestId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const raw = localStorage.getItem('lifelineAnalysis');
      if (!raw) {
        setError('Please run symptom analysis first.');
        setLoading(false);
        return;
      }

      const analysis = JSON.parse(raw) as AnalysisResult;
      if (!navigator.geolocation) {
        setError('Location access unavailable in this browser.');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const data = await getHospitalRecommendations({
              lat: coords.latitude,
              lng: coords.longitude,
              department: analysis.department,
              severity: analysis.severity
            });
            setHospitals(data.hospitals);
            setBestId(data.bestHospitalId);
          } catch {
            setError('Could not fetch hospital recommendations.');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('Please enable location to find nearby hospitals.');
          setLoading(false);
        }
      );
    };

    run();
  }, []);

  const bestHospital = useMemo(
    () => hospitals.find((h) => h.id === bestId),
    [bestId, hospitals]
  );

  const mapUrl = bestHospital
    ? `https://www.google.com/maps?q=${bestHospital.lat},${bestHospital.lng}&z=13&output=embed`
    : '';

  if (loading) {
    return <main className="container py-10 text-center text-slate-600">Finding nearby hospitals...</main>;
  }

  if (error) {
    return <main className="container py-10 text-center text-danger">{error}</main>;
  }

  return (
    <main className="container py-6 md:py-10">
      <div className="mb-4">
        <p className="ll-eyebrow">Hospital Routing</p>
        <h1 className="ll-title text-2xl md:text-3xl">Best Nearby Hospital Recommendation</h1>
        <p className="ll-subtitle">Ranked by emergency fit, distance, and travel ETA.</p>
      </div>

      {bestHospital && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="ll-shell mb-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1f5eb1]">Top Match for You</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{bestHospital.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{bestHospital.address}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="ll-chip">ETA {bestHospital.etaMinutes} min</span>
            <span className="ll-chip">{bestHospital.distanceKm} km away</span>
            <span className="ll-chip">Dept: {bestHospital.specialization}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {bestHospital.phone ? (
              <a href={`tel:${bestHospital.phone}`} className="ll-btn-secondary inline-flex items-center gap-2">
                <Phone size={16} />
                Call Hospital
              </a>
            ) : null}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${bestHospital.lat},${bestHospital.lng}`}
              target="_blank"
              rel="noreferrer"
              className="ll-btn-primary inline-flex items-center gap-2"
            >
              <Route size={16} />
              Start Navigation
            </a>
          </div>
        </motion.section>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-2">
          {hospitals.map((hospital, index) => {
            const isBest = hospital.id === bestId;
            return (
              <motion.article
                key={hospital.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-2xl border p-4 ${
                  isBest
                    ? 'border-[#81b1ea] bg-[#eaf3ff]'
                    : 'border-[#d8e7f9] bg-white'
                }`}
              >
                {isBest ? (
                  <p className="mb-2 inline-flex rounded-full bg-[#0f62cd] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-white">
                    Best Match
                  </p>
                ) : null}
                <h2 className="text-base font-semibold text-slate-900">{hospital.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{hospital.address}</p>
                <p className="mt-2 flex items-center gap-1 text-sm text-slate-700">
                  <Star size={13} className="text-amber-500" />
                  {hospital.rating} | {hospital.distanceKm} km | ETA {hospital.etaMinutes} min
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Specialization: {hospital.specialization}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#d8e7f9] bg-white shadow-soft lg:col-span-3">
          {mapUrl ? (
            <iframe
              title="Hospital map"
              src={mapUrl}
              className="h-[520px] w-full"
              loading="lazy"
            />
          ) : (
            <div className="p-6 text-slate-600">Map not available.</div>
          )}
        </section>
      </div>
    </main>
  );
}
