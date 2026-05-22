"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { analyzeSymptoms } from '@/lib/api';

const languageOptions = [
  { label: 'English', value: 'en', speech: 'en-IN' },
  { label: 'Hindi', value: 'hi', speech: 'hi-IN' },
  { label: 'Hindi + English', value: 'mixed', speech: 'hi-IN' }
] as const;

const quickPrompts = [
  'Mujhe chest pain ho raha hai',
  'Bukhar and weakness',
  'Breathing problem ho rahi hai',
  'Dizziness since morning'
];

type Lang = (typeof languageOptions)[number]['value'];

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function SymptomPage() {
  const [language, setLanguage] = useState<Lang>('mixed');
  const [symptoms, setSymptoms] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

  return (
    <main className="container py-6 md:py-10">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ll-shell mx-auto max-w-4xl"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ll-eyebrow">Step 1 of 3</p>
            <h1 className="ll-title text-2xl md:text-3xl">Describe Your Symptoms</h1>
            <p className="ll-subtitle">
              Write naturally as you speak. Simple words are enough. We support Hindi, English, and mixed language.
            </p>
          </div>
          <div className="rounded-xl border border-[#d6e5f8] bg-[#f4f9ff] px-3 py-2 text-sm font-medium text-[#275286]">
            <span className="inline-flex items-center gap-2">
              <Stethoscope size={16} />
              Patient-friendly triage
            </span>
          </div>
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
              {option.label}
            </button>
          ))}
        </div>

        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="mt-5 min-h-52 w-full rounded-2xl border border-[#d6e6f8] bg-white px-4 py-4 text-base leading-relaxed outline-none transition focus:border-[#8ab5ef] focus:ring-2 focus:ring-[#e8f2ff]"
          placeholder="Example: Mujhe chest pain ho raha hai and breathing problem ho rahi hai since 20 minutes..."
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
          <button
            onClick={startListening}
            disabled={listening}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${
              listening
                ? 'border-[#f1bbbb] bg-[#fff3f3] text-[#be3333]'
                : 'border-[#c9dcf5] bg-white text-[#1a4f92] hover:bg-[#f4f8ff]'
            }`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
            {listening ? 'Listening now...' : 'Speak with Microphone'}
          </button>

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
    </main>
  );
}
