"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartPulse, Languages, MapPinned, Mic, ShieldCheck, Activity, BrainCircuit, ChevronRight, Stethoscope, Clock } from 'lucide-react';

const trustPoints = [
  {
    title: 'AI Symptom Analysis',
    copy: 'Understand your symptoms in plain language without medical jargon.',
    icon: HeartPulse,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Hindi + English Support',
    copy: 'Speak or type in Hindi, English, or natural mixed language.',
    icon: Languages,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    title: 'Nearest Hospital Routing',
    copy: 'Find better matched hospitals by emergency level and travel ETA.',
    icon: MapPinned,
    color: 'bg-emerald-100 text-emerald-600'
  },
  {
    title: 'Emergency-First Guidance',
    copy: 'Immediate first-aid and next steps during panic situations.',
    icon: ShieldCheck,
    color: 'bg-rose-100 text-rose-600'
  }
];

export default function LandingPage() {
  return (
    <main className="container relative overflow-hidden py-8 md:py-16 lg:py-24">
      {/* Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 opacity-50 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-40 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400/10 blur-[80px]" />
      
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left Column - Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            Life-Saving AI Triage
          </div>
          
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Calm, clear <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">emergency guidance</span> in minutes.
          </h1>
          
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Describe symptoms naturally, upload reports, and get an understandable AI assessment. We instantly route you to the best nearby hospitals based on severity and live ETA.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link 
              href="/symptoms" 
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 hover:ring-4 hover:ring-blue-600/20 hover:scale-[1.02]"
            >
              Start Triage Now
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              href="/upload" 
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              Upload Report
            </Link>
          </div>

          <div className="mt-10 rounded-2xl border border-orange-200/60 bg-gradient-to-b from-orange-50 to-white p-5 shadow-sm sm:max-w-md">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Mic size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Voice-First Experience</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Can't type? Tap the mic and speak in Hindi or English. Perfect for high-stress situations.
                </p>
                <Link href="/symptoms?voice=1" className="mt-2 inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700">
                  Try Voice Input <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Hero Graphic */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative lg:ml-auto w-full max-w-lg"
        >
          {/* Mockup Card */}
          <div className="relative rounded-[2rem] border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
            <div className="absolute -inset-0.5 -z-10 rounded-[2rem] bg-gradient-to-b from-blue-400 to-indigo-500 opacity-20 blur-md"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI Analysis Active</p>
                  <p className="text-xs text-slate-500">Processing symptoms...</p>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>

            {/* Chat bubbles */}
            <div className="mt-6 space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="ml-auto w-4/5 rounded-2xl rounded-tr-sm bg-blue-600 p-3 text-sm text-white shadow-sm"
              >
                "Mujhe kal se bohot tez chest pain ho raha hai aur saans lene mein takleef hai."
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
                className="w-5/6 rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-rose-600 mb-2">
                  <Activity size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">High Severity Detected</span>
                </div>
                <p className="text-sm text-slate-700 font-medium">Possible cardiac event or severe respiratory issue.</p>
                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-900 mb-1">Recommended Action:</p>
                  <p className="text-xs text-slate-600">Immediate emergency medical attention required. Do not wait.</p>
                </div>
              </motion.div>

              {/* Floating action pill */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 3.5 }}
                className="absolute -bottom-6 -left-6 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur-md flex items-center gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <MapPinned size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Routing to</p>
                  <p className="text-sm font-bold text-slate-900">City Hospital ER</p>
                  <p className="text-xs font-medium text-emerald-600">4 mins away</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust Points */}
      <section className="mt-24 lg:mt-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Why trust LifeLine AI?</h2>
          <p className="mt-2 text-slate-600">Built for speed, accuracy, and accessibility during emergencies.</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.color} transition-transform group-hover:scale-110`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.copy}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* How it works steps */}
      <section className="mt-16 rounded-3xl bg-slate-900 py-16 px-6 sm:px-12 lg:mt-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">3 Simple Steps to Care</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-slate-700/50 -z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-blue-400 text-xl font-bold mb-4 shadow-xl">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Share Symptoms</h3>
            <p className="text-sm text-slate-400">Type or speak naturally in Hindi/English mixed language.</p>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-blue-400 text-xl font-bold mb-4 shadow-xl">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Get AI Triage</h3>
            <p className="text-sm text-slate-400">Instantly see severity, first aid, and structured next steps.</p>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-blue-400 text-xl font-bold mb-4 shadow-xl">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Reach Hospital</h3>
            <p className="text-sm text-slate-400">View real-time routing to the most appropriate nearby hospital.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
