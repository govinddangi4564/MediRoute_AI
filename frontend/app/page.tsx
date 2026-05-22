"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartPulse, Languages, MapPinned, ShieldCheck } from 'lucide-react';

const trustPoints = [
  {
    title: 'AI Symptom Analysis',
    copy: 'Understand your symptoms in plain language without medical jargon.',
    icon: HeartPulse
  },
  {
    title: 'Hindi + English Support',
    copy: 'Speak or type in Hindi, English, or natural mixed language.',
    icon: Languages
  },
  {
    title: 'Nearest Hospital Routing',
    copy: 'Find better matched hospitals by emergency level and travel ETA.',
    icon: MapPinned
  },
  {
    title: 'Emergency-First Guidance',
    copy: 'Immediate first-aid and next steps during panic situations.',
    icon: ShieldCheck
  }
];

export default function LandingPage() {
  return (
    <main className="container py-8 md:py-12">
      <section className="ll-shell overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="ll-eyebrow">Trusted Patient Triage</p>
          <h1 className="ll-title max-w-4xl">
            Calm, clear emergency guidance for your family in minutes.
          </h1>
          <p className="ll-subtitle max-w-3xl">
            Describe symptoms, upload reports, and get an understandable AI assessment with best nearby hospital options.
            Designed for elderly users, rural users, and high-stress moments.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/symptoms" className="ll-btn-primary text-center">
              Describe Health Problem
            </Link>
            <Link href="/upload" className="ll-btn-secondary text-center">
              Upload Reports / Prescriptions
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="ll-chip">Hindi + English Voice Input</span>
            <span className="ll-chip">Emergency Severity Detection</span>
            <span className="ll-chip">Hospital Routing with ETA</span>
          </div>
        </motion.div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {trustPoints.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              className="ll-kpi-card"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f1ff] text-[#0f5ec5]">
                  <Icon size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.copy}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="ll-kpi-card">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Step 1</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Share Symptoms</p>
          <p className="mt-1 text-sm text-slate-600">Type or speak naturally in Hindi/English mixed language.</p>
        </div>
        <div className="ll-kpi-card">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Step 2</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Get AI Triage</p>
          <p className="mt-1 text-sm text-slate-600">See severity, likely cause, confidence, first aid, and next steps.</p>
        </div>
        <div className="ll-kpi-card">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Step 3</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Reach Best Hospital</p>
          <p className="mt-1 text-sm text-slate-600">View nearby hospitals, route ETA, and emergency-fit recommendation.</p>
        </div>
      </section>
    </main>
  );
}
