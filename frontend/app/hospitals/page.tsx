"use client";

import { useEffect, useMemo, useState } from 'react';
import { Phone, Navigation } from 'lucide-react';
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

  const bestHospital = useMemo(() => hospitals.find((h) => h.id === bestId), [bestId, hospitals]);

  const mapUrl = bestHospital
    ? `https://www.google.com/maps?q=${bestHospital.lat},${bestHospital.lng}&z=13&output=embed`
    : '';

  if (loading) {
    return <main className="container py-10 text-center text-slate-600">Loading nearby hospitals...</main>;
  }

  if (error) {
    return <main className="container py-10 text-center text-danger">{error}</main>;
  }

  return (
    <main className="container py-6 md:py-10">
      <div className="grid gap-5 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-2">
          {hospitals.map((hospital) => {
            const isBest = hospital.id === bestId;
            return (
              <article key={hospital.id} className={`rounded-2xl border p-4 shadow-soft ${isBest ? 'border-primary bg-blue-50' : 'border-blue-100 bg-white'}`}>
                {isBest && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Best Match</p>}
                <h2 className="text-lg font-semibold text-slate-900">{hospital.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{hospital.address}</p>
                <p className="mt-2 text-sm text-slate-700">Rating: {hospital.rating} | {hospital.distanceKm} km | ETA {hospital.etaMinutes} min</p>
                <p className="mt-1 text-sm text-slate-700">Specialization: {hospital.specialization}</p>
                <div className="mt-3 flex gap-2">
                  {hospital.phone && (
                    <a href={`tel:${hospital.phone}`} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-blue-700">
                      <Phone size={14} /> Call
                    </a>
                  )}
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`} target="_blank" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-white" rel="noreferrer">
                    <Navigation size={14} /> Route
                  </a>
                </div>
              </article>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-soft lg:col-span-3">
          {mapUrl ? <iframe title="Hospital map" src={mapUrl} className="h-[500px] w-full" loading="lazy" /> : <div className="p-6 text-slate-600">Map not available.</div>}
        </section>
      </div>
    </main>
  );
}
