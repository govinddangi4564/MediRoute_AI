"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Route, Star } from 'lucide-react';
import { getHospitalRecommendations } from '@/lib/api';
import { AnalysisResult, HospitalRecommendation } from '@/types';

type UserLocation = {
  lat: number;
  lng: number;
};

function getNavigationUrl(hospital: HospitalRecommendation, userLocation: UserLocation | null) {
  const params = new URLSearchParams({
    api: '1',
    destination: `${hospital.lat},${hospital.lng}`,
    travelmode: 'driving'
  });

  if (userLocation) {
    params.set('origin', `${userLocation.lat},${userLocation.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function getMapUrl(hospital: HospitalRecommendation | undefined, userLocation: UserLocation | null) {
  if (!hospital) return '';

  if (!userLocation) {
    const params = new URLSearchParams({
      q: `${hospital.lat},${hospital.lng}`,
      z: '13',
      output: 'embed'
    });
    return `https://www.google.com/maps?${params.toString()}`;
  }

  const params = new URLSearchParams({
    output: 'embed',
    saddr: `${userLocation.lat},${userLocation.lng}`,
    daddr: `${hospital.lat},${hospital.lng}`,
    dirflg: 'd'
  });

  return `https://www.google.com/maps?${params.toString()}`;
}

export default function HospitalsPage() {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<HospitalRecommendation[]>([]);
  const [bestId, setBestId] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
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
            const location = { lat: coords.latitude, lng: coords.longitude };
            setUserLocation(location);
            const data = await getHospitalRecommendations({
              lat: location.lat,
              lng: location.lng,
              department: analysis.department,
              severity: analysis.severity
            });
            const initialSelectedId = data.bestHospitalId || data.hospitals[0]?.id || '';
            setHospitals(data.hospitals);
            setBestId(data.bestHospitalId);
            setSelectedId(initialSelectedId);
            setUsingFallback(Boolean(data.isFallback));
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

  const selectedHospital = useMemo(
    () => hospitals.find((h) => h.id === selectedId) || hospitals.find((h) => h.id === bestId) || hospitals[0],
    [bestId, hospitals, selectedId]
  );

  const mapUrl = getMapUrl(selectedHospital, userLocation);

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

      {usingFallback ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Showing sample hospitals because live hospital data is unavailable. Add a valid Google Maps Places API key to get real nearby results.
        </div>
      ) : null}

      {selectedHospital && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="ll-shell mb-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1f5eb1]">
            {selectedHospital.id === bestId ? 'Top Match for You' : 'Selected Hospital'}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{selectedHospital.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{selectedHospital.address}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="ll-chip">ETA {selectedHospital.etaMinutes} min</span>
            <span className="ll-chip">{selectedHospital.distanceKm} km away</span>
            <span className="ll-chip">Dept: {selectedHospital.specialization}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedHospital.phone ? (
              <a href={`tel:${selectedHospital.phone}`} className="ll-btn-secondary inline-flex items-center gap-2">
                <Phone size={16} />
                Call Hospital
              </a>
            ) : null}
            <a
              href={getNavigationUrl(selectedHospital, userLocation)}
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
            const isSelected = hospital.id === selectedHospital?.id;
            return (
              <motion.article
                key={hospital.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(hospital.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedId(hospital.id);
                  }
                }}
                className={`cursor-pointer rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-[#2f7be0] bg-[#eaf3ff] shadow-soft'
                    : 'border-[#d8e7f9] bg-white'
                }`}
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  {isBest ? (
                    <span className="inline-flex rounded-full bg-[#0f62cd] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-white">
                      Best Match
                    </span>
                  ) : null}
                  {isSelected && !isBest ? (
                    <span className="inline-flex rounded-full bg-[#dbeafe] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-[#1554aa]">
                      Selected
                    </span>
                  ) : null}
                </div>
                <h2 className="text-base font-semibold text-slate-900">{hospital.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{hospital.address}</p>
                <p className="mt-2 flex items-center gap-1 text-sm text-slate-700">
                  <Star size={13} className="text-amber-500" />
                  {hospital.rating} | {hospital.distanceKm} km | ETA {hospital.etaMinutes} min
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">Specialization: {hospital.specialization}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={getNavigationUrl(hospital, userLocation)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="ll-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs"
                  >
                    <Route size={14} />
                    Navigate
                  </a>
                  {hospital.phone ? (
                    <a
                      href={`tel:${hospital.phone}`}
                      onClick={(event) => event.stopPropagation()}
                      className="ll-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs"
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  ) : null}
                </div>
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
