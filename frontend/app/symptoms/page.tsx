"use client";

import { Suspense } from "react";
import { Stethoscope } from "lucide-react";
import { SymptomForm } from "@/components/sections/symptom-form";

function SymptomContent() {
  return (
    <section className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-600">Step 1 of 3</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
            Describe Your Symptoms
          </h1>
          <p className="mt-1 text-slate-600">
            Tell us what you're feeling, in your own words.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
          <span className="inline-flex items-center gap-2">
            <Stethoscope size={16} />
            Easy Patient Mode
          </span>
        </div>
      </div>

      <SymptomForm />
    </section>
  );
}

export default function SymptomPage() {
  return (
    <main className="container py-6 md:py-10">
      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-500">
            Loading triage...
          </div>
        }
      >
        <SymptomContent />
      </Suspense>
    </main>
  );
}
