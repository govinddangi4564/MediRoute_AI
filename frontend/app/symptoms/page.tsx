"use client";

import { useMemo, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { analyzeSymptoms } from '@/lib/api';

const languageOptions = [
  { label: 'English', value: 'en', speech: 'en-IN' },
  { label: 'Hindi', value: 'hi', speech: 'hi-IN' },
  { label: 'Hindi + English', value: 'mixed', speech: 'hi-IN' }
] as const;

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
      <div className="mx-auto max-w-3xl rounded-3xl border border-blue-100 bg-white p-5 shadow-soft md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">Describe Your Symptoms</h1>
        <p className="mt-2 text-slate-600">Type or speak naturally. Example: Mujhe chest pain ho raha hai.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLanguage(option.value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${language === option.value ? 'bg-primary text-white' : 'bg-muted text-slate-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="mt-5 min-h-44 w-full rounded-xl border border-blue-100 p-4 text-base outline-none focus:border-blue-300"
          placeholder="Write your symptoms here..."
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={startListening}
            disabled={listening}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-70"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
            {listening ? 'Listening...' : 'Use Microphone'}
          </button>
          <button
            onClick={submitSymptoms}
            disabled={loading}
            className="rounded-xl bg-primary px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? 'Analyzing...' : 'Analyze Symptoms'}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </main>
  );
}
