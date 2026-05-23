"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Keyboard, Mic, PhoneCall, Sparkles } from "lucide-react";
import { analyzeSymptoms } from "@/lib/api";

const quickSymptoms = [
  "Fever and body ache",
  "Chest pain",
  "Difficulty breathing",
  "Vomiting and nausea",
  "Severe headache",
  "Stomach pain",
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function SymptomsForm() {
  const [symptoms, setSymptoms] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const voiceStarted = useRef(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Please type your symptoms.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => {
      setListening(true);
      setError("");
    };
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setSymptoms((previous) => `${previous} ${transcript}`.trim());
    };
    recognition.onerror = () => {
      setError("Could not capture voice clearly. Please try again or type.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const submit = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await analyzeSymptoms({ text: symptoms, language: "mixed" });
      localStorage.setItem("lifelineSymptoms", symptoms);
      localStorage.setItem("lifelineAnalysis", JSON.stringify(result));
      router.push("/analysis");
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("voice") === "1" && !voiceStarted.current) {
      voiceStarted.current = true;
      window.setTimeout(startListening, 300);
    }
  }, [searchParams]);

  return (
    <section className="clinical-page symptoms-focus-page">
      <div className="site-container">
        <div className="symptoms-focus-shell">
          <div className="symptoms-focus-card">
            <div className="symptoms-focus-topline">
              <span><Sparkles size={14} /> Symptom details</span>
              <a href="tel:112"><PhoneCall size={15} /> Call 112</a>
            </div>

            <h1>Tell us what you are feeling</h1>
            <p className="symptoms-focus-copy">
              Speak or type in any language. Keep it simple, like you would explain it to a doctor.
            </p>

            <button
              onClick={startListening}
              disabled={listening}
              id="mic-btn"
              className={`symptoms-mic-button ${listening ? "is-listening" : ""}`}
            >
              <span className="symptoms-mic-icon">
                <Mic size={34} />
              </span>
              <span>
                <strong>{listening ? "Listening..." : "Tap to speak"}</strong>
                <small>{listening ? "Keep speaking. Your words will appear below." : "Hindi, English, or mixed language is fine."}</small>
              </span>
              {listening && <em>LIVE</em>}
            </button>

            <label className="clinical-field-label symptoms-type-label" htmlFor="symptoms-input">
              <Keyboard size={15} /> Type symptoms
            </label>
            <textarea
              id="symptoms-input"
              className="input-field symptoms-textarea"
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              rows={7}
              placeholder="Example: Fever since yesterday, headache, weakness, and mild cough. Breathing is normal."
            />

            <div className="symptoms-prompts">
              {quickSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  className="chip"
                  onClick={() => setSymptoms((previous) => (previous ? `${previous}. ${symptom}` : symptom))}
                >
                  {symptom}
                </button>
              ))}
            </div>

            {error && <div className="alert alert-danger symptoms-error">{error}</div>}

            <button onClick={submit} disabled={loading} className="btn btn-primary symptoms-submit" id="sym-submit">
              {loading ? "Analyzing..." : "Continue to analysis"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SymptomsPage() {
  return (
    <Suspense fallback={<div className="clinical-page site-container text-[var(--muted)]">Loading intake...</div>}>
      <SymptomsForm />
    </Suspense>
  );
}
