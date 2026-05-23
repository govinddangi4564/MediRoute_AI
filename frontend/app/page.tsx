"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const clinicalSignals = [
  "Symptom severity",
  "Report context",
  "Care department",
  "Nearby hospitals",
];

const capabilities = [
  {
    icon: Stethoscope,
    title: "Triage that feels understandable",
    desc: "Patients get a plain-language read on urgency, risk signs, and what to do before travelling.",
  },
  {
    icon: FileText,
    title: "Reports without medical jargon",
    desc: "Upload prescriptions or lab reports and surface the few points that matter for the next step.",
  },
  {
    icon: MapPin,
    title: "Routing based on fit",
    desc: "Hospitals are ranked by distance, department match, and emergency suitability.",
  },
];

const workflow = [
  "Describe symptoms in natural language",
  "Review severity, first-aid notes, and report context",
  "Pick the care option that is closest and suitable",
];

export default function HomePage() {
  const { lang } = useLang();
  const hi = lang === "hi";

  return (
    <main className="bg-[var(--cream)] text-[var(--ink)]">
      <section className="relative isolate overflow-hidden border-b border-[rgba(71,91,99,0.22)]">
        <Image
          src="/healthcare-consultation.webp"
          alt="Doctor and patient consultation"
          fill
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full scale-[1.02] object-cover object-[62%_center] blur-[1.4px]"
          priority
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(27,36,36,0.88)_0%,rgba(42,51,49,0.72)_42%,rgba(61,58,49,0.34)_73%,rgba(255,255,255,0.08)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-[linear-gradient(180deg,rgba(250,247,240,0)_0%,rgba(250,247,240,0.72)_100%)]" />

        <div className="site-container flex min-h-[620px] items-center pb-14 pt-24 sm:min-h-[650px]">
          <div className="max-w-[610px]">
            <div className="mb-4 inline-flex items-center gap-2 border border-white/22 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[#f4eee5] backdrop-blur-sm">
              <ShieldCheck size={14} />
              Healthcare navigation for patients
            </div>

            <h1 className="max-w-[590px] text-[34px] font-semibold leading-[1.12] text-[#fffaf1] sm:text-[46px]">
              {hi
                ? "Urgent care guidance, made easier for real patients"
                : "Urgent care guidance, made easier for real patients"}
            </h1>

            <p className="mt-5 max-w-[520px] text-[15.5px] leading-7 text-[#efe6d9]">
              {hi
                ? "MediRoute AI helps people understand symptoms, read basic reports, and find suitable nearby care without turning every health question into a maze."
                : "MediRoute AI helps people understand symptoms, read basic reports, and find suitable nearby care without turning every health question into a maze."}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/symptoms" className="btn btn-primary" id="hero-cta-symptoms">
                Check symptoms
                <ArrowRight size={16} />
              </Link>
              <Link href="/upload" className="btn btn-soft" id="hero-cta-upload">
                Upload report
              </Link>
            </div>

            <div className="mt-9 grid max-w-[560px] grid-cols-2 gap-x-6 gap-y-3 border-l border-white/26 pl-4 text-[13px] text-[#eadfce] sm:grid-cols-4">
              {clinicalSignals.map((signal) => (
                <span key={signal} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#b9d5ce]" />
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-[var(--cream)] py-5">
        <div className="site-container flex flex-wrap items-center gap-x-9 gap-y-2 text-sm text-[var(--muted)]">
          <span className="font-medium text-[var(--ink)]">Built for quick decisions</span>
          <span>No signup required</span>
          <span>Hindi + English input</span>
          <span>Doctor-aware disclaimer</span>
          <a href="tel:112" className="ml-0 inline-flex items-center gap-2 font-medium text-[var(--danger)] md:ml-auto">
            <PhoneCall size={15} /> Call 112
          </a>
        </div>
      </section>

      <section className="py-12">
        <div className="site-container grid gap-9 lg:grid-cols-[0.74fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--earth)]">
              Product surface
            </p>
            <h2 className="mt-3 max-w-[410px] text-[27px] font-semibold leading-tight text-[var(--ink)]">
              Calm interface for stressful moments.
            </h2>
            <p className="mt-4 max-w-[410px] text-[14px] leading-7 text-[var(--muted)]">
              The landing experience borrows from the consultation photo: warm clinic light, soft whites, muted blue-green accents, and direct patient language.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className={`border border-[var(--line)] bg-white/68 p-5 transition hover:border-[var(--accent-muted)] hover:bg-white ${index === 1 ? "md:mt-6" : ""}`}
                >
                  <Icon size={22} className="text-[var(--accent)]" />
                  <h3 className="mt-5 text-[16px] font-medium leading-snug text-[var(--ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-6 text-[var(--muted)]">
                    {item.desc}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[#f4efe5] py-11">
        <div className="site-container grid items-start gap-8 lg:grid-cols-[1fr_0.86fr]">
          <div className="border border-[rgba(77,95,100,0.2)] bg-[rgba(255,255,255,0.55)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-5 border-b border-[var(--line)] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">Live triage</p>
                <h2 className="mt-2 text-[23px] font-semibold text-[var(--ink)]">A realistic care summary, not a magic diagnosis.</h2>
              </div>
              <ClipboardCheck className="mt-1 shrink-0 text-[var(--earth)]" size={25} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="border border-[var(--line)] bg-white px-4 py-3">
                <p className="text-xs text-[var(--muted)]">Severity</p>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">Moderate</p>
              </div>
              <div className="border border-[var(--line)] bg-white px-4 py-3">
                <p className="text-xs text-[var(--muted)]">Department</p>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">General medicine</p>
              </div>
              <div className="border border-[var(--line)] bg-white px-4 py-3">
                <p className="text-xs text-[var(--muted)]">Route</p>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">18 min away</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-[14px] leading-6 text-[var(--muted)]">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 bg-[var(--accent)]" />
                Ask about duration, fever, breathing difficulty, and current medication.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 bg-[var(--accent)]" />
                Show emergency warning signs before hospital recommendations.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 bg-[var(--accent)]" />
                Keep every recommendation framed as guidance, not diagnosis.
              </li>
            </ul>
          </div>

          <div className="pt-1 lg:pt-5">
            <h2 className="max-w-[430px] text-[24px] font-semibold leading-tight text-[var(--ink)]">
              Designed around the moment before care.
            </h2>
            <p className="mt-4 max-w-[440px] text-[14px] leading-7 text-[var(--muted)]">
              The workflow keeps a human consultation in mind: listen first, summarize clearly, then help the patient move to the right place.
            </p>
            <div className="mt-7 border-l border-[var(--line-strong)] pl-5">
              {workflow.map((step, index) => (
                <div key={step} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center border border-[var(--line-strong)] bg-[var(--cream)] text-xs font-medium text-[var(--ink)]">
                    {index + 1}
                  </span>
                  <p className="text-[15px] font-medium text-[var(--ink)]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-11">
        <div className="site-container grid items-center gap-7 lg:grid-cols-[0.72fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--earth)]">Emergency guardrail</p>
            <h2 className="mt-3 text-[24px] font-semibold text-[var(--ink)]">
              Clear escalation when AI should step aside.
            </h2>
          </div>

          <div className="grid items-center gap-5 border border-[var(--line)] bg-white px-5 py-5 md:grid-cols-[1fr_auto] md:px-7">
            <div className="flex gap-4">
              <HeartPulse className="mt-1 shrink-0 text-[var(--danger)]" size={24} />
              <div>
                <p className="text-[16px] font-medium text-[var(--ink)]">
                  For life-threatening symptoms, call 112 immediately.
                </p>
                <p className="mt-1 max-w-[690px] text-[13.5px] leading-6 text-[var(--muted)]">
                  Severe chest pain, breathing difficulty, loss of consciousness, stroke signs, or major injury should bypass AI guidance.
                </p>
              </div>
            </div>
            <a href="tel:112" className="btn btn-danger justify-center" id="emergency-112-cta">
              <PhoneCall size={16} /> Call 112
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
