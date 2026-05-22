"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="container py-10 md:py-16">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-soft md:p-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-3 inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-medium text-blue-800">LifeLine AI</p>
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Describe your health problem. Get calm, clear emergency guidance.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
            Type or speak in Hindi, English, or mixed language. Upload reports. Get a simple risk analysis and best nearby hospital recommendation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/symptoms" className="rounded-xl bg-primary px-5 py-3 text-center font-medium text-white transition hover:bg-blue-700">Start Symptom Check</Link>
            <Link href="/upload" className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-center font-medium text-blue-700 hover:bg-blue-50">Upload Medical Reports</Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
