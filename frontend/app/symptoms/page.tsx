"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, MessageSquareText, PhoneCall, Stethoscope } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { analyzeSymptoms } from '@/lib/api';

const languageOptions = [
  { label: 'English', helper: 'English', value: 'en', speech: 'en-IN' },
  { label: 'Hindi', helper: 'हिंदी', value: 'hi', speech: 'hi-IN' },
  { label: 'Hindi + English', helper: 'हिंदी + English', value: 'mixed', speech: 'hi-IN' }
] as const;

const quickPrompts = [
  'Mujhe chest pain ho raha hai',
  'Bukhar and weakness',
  'Breathing problem ho rahi hai',
  'Sir ghoom raha hai / Dizziness'
];

type Lang = (typeof languageOptions)[number]['value'];

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

function SymptomContent() {
  const [language, setLanguage] = useState<Lang>('mixed');
  const [symptoms, setSymptoms] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoVoiceStarted = useRef(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const speechLang = useMemo(
    () => languageOptions.find((l) => l.value === language)?.speech ?? 'hi-IN',
    [language]
  );

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setListening(true);
      setInputMode('voice');
      setError('');
    };

    recognition.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript;
      }
      setSymptoms((prev) => `${prev} ${text}`.trim());
    };

    recognition.onerror = () => setError('Could not capture voice clearly. Please try again.');
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const submitSymptoms = async () => {
    if (!symptoms.trim()) {
      setError('Please describe symptoms first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await analyzeSymptoms({ text: symptoms, language });
      localStorage.setItem('lifelineSymptoms', symptoms);
      localStorage.setItem('lifelineAnalysis', JSON.stringify(result));
      router.push('/analysis');
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('voice') === '1' && !autoVoiceStarted.current) {
      autoVoiceStarted.current = true;
      startListening();
    }
  }, [searchParams, speechLang]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ll-shell mx-auto max-w-4xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ll-eyebrow">Step 1 of 3</p>
          <h1 className="ll-title text-2xl md:text-3xl">Describe Your Symptoms | अपनी तकलीफ बताइए</h1>
          <p className="ll-subtitle">
            You can speak or type. Simple words are enough. Hindi + English mixed language is supported.
          </p>
        </div>
        <div className="rounded-xl border border-[#d6e5f8] bg-[#f4f9ff] px-3 py-2 text-sm font-medium text-[#275286]">
          <span className="inline-flex items-center gap-2">
            <Stethoscope size={16} />
            Easy patient mode
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#d8e7f9] bg-[#f5f9ff] p-4">
        <p className="text-sm font-semibold text-slate-900">Easy steps | आसान स्टेप्स</p>
        <p className="mt-2 text-sm text-slate-700">1. Choose language</p>
        <p className="text-sm text-slate-700">2. Tap mic and speak (or type in box)</p>
        <p className="text-sm text-slate-700">3. Tap Continue to AI Analysis</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {languageOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setLanguage(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              language === option.value
                ? 'bg-[#0f5fca] text-white'
                : 'border border-[#d4e3f7] bg-[#f4f8ff] text-[#304f76] hover:bg-[#eaf2ff]'
            }`}
          >
            {option.label} <span className="ml-1 opacity-80">({option.helper})</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          onClick={startListening}
          disabled={listening}
          className={`relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all ${
            listening
              ? 'border-red-300 bg-red-50 ring-4 ring-red-500/20'
              : inputMode === 'voice'
                ? 'border-blue-300 bg-blue-50'
                : 'border-[#cfe0f5] bg-white hover:border-blue-300 hover:bg-[#f4f8ff]'
          }`}
        >
          {listening && (
            <span className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-pulse"></span>
          )}
          <div className="flex items-center gap-3 relative z-10">
            <span className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full ${listening ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {listening && <span className="absolute inset-0 rounded-full bg-red-400 opacity-40 animate-ping" />}
              {listening ? <MicOff size={22} className="relative z-10" /> : <Mic size={22} className="relative z-10" />}
            </span>
            <div>
              <p className={`text-base font-bold ${listening ? 'text-red-700' : 'text-slate-900'}`}>
                {listening ? 'Listening now...' : 'Speak with Microphone'}
              </p>
              <p className={`text-sm ${listening ? 'text-red-600/80' : 'text-slate-500'}`}>माइक दबाएं और बोलना शुरू करें</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setInputMode('text');
            textAreaRef.current?.focus();
          }}
          className={`rounded-2xl border px-4 py-4 text-left transition-all ${
            inputMode === 'text'
              ? 'border-blue-300 bg-blue-50 ring-4 ring-blue-500/10'
              : 'border-[#cfe0f5] bg-white hover:border-blue-300 hover:bg-[#f4f8ff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <MessageSquareText size={22} />
            </span>
            <div>
              <p className="text-base font-bold text-slate-900">Type Symptoms</p>
              <p className="text-sm text-slate-500">यहां अपनी तकलीफ लिखें</p>
            </div>
          </div>
        </button>
      </div>

      <textarea
        ref={textAreaRef}
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="mt-5 min-h-52 w-full rounded-2xl border border-[#d6e6f8] bg-white px-4 py-4 text-base leading-relaxed outline-none transition focus:border-[#8ab5ef] focus:ring-2 focus:ring-[#e8f2ff]"
        placeholder="Example: Mujhe chest pain ho raha hai... / मुझे सीने में दर्द हो रहा है..."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setSymptoms((prev) => (prev ? `${prev}. ${prompt}` : prompt))}
            className="ll-chip text-left"
          >
            + {prompt}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a
          href="tel:112"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f1c3c3] bg-[#fff4f4] px-4 py-3 font-semibold text-[#b53131]"
        >
          <PhoneCall size={18} />
          Emergency Call 112
        </a>
        <button
          onClick={submitSymptoms}
          disabled={loading}
          className="ll-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Analyzing symptoms...' : 'Continue to AI Analysis'}
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        This tool supports guidance only. In severe emergency, call local emergency services immediately.
      </p>
      {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
    </motion.section>
  );
}

export default function SymptomPage() {
  return (
    <main className="container py-6 md:py-10">
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading triage...</div>}>
        <SymptomContent />
      </Suspense>
    </main>
  );
}
