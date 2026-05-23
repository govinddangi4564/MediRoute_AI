"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Keyboard,
  Mic,
  PhoneCall,
  Sparkles,
  Square,
  X,
  Loader2,
} from "lucide-react";
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
  const recognitionRef = useRef<any>(null);
  const committedTextRef = useRef("");
  const stoppingRef = useRef(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Please type your symptoms.",
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    stoppingRef.current = false;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "hi-IN";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onstart = () => {
      setListening(true);
      setError("");
      committedTextRef.current = symptoms.trim();
    };
    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const transcript = event.results[index][0].transcript.trim();
        if (!transcript) continue;
        if (event.results[index].isFinal) {
          finalText += ` ${transcript}`;
        } else {
          interimText += ` ${transcript}`;
        }
      }

      if (finalText.trim()) {
        committedTextRef.current =
          `${committedTextRef.current} ${finalText}`.trim();
      }

      setSymptoms(`${committedTextRef.current} ${interimText}`.trim());
    };
    recognition.onerror = (event: any) => {
      if (stoppingRef.current || event.error === "aborted") return;
      setError("Could not capture voice clearly. Please try again or type.");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      setSymptoms(committedTextRef.current.trim());
      stoppingRef.current = false;
    };
    recognition.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) {
      setListening(false);
      return;
    }

    stoppingRef.current = true;
    committedTextRef.current = symptoms.trim();
    recognitionRef.current.stop();
  };

  const submit = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await analyzeSymptoms({
        text: symptoms,
        language: "mixed",
      });
      localStorage.removeItem("lifelineReportAnalysis");
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

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <section className="clinical-page symptoms-focus-page">
      <div className="site-container">
        <div className="symptoms-focus-shell">
          <div className="symptoms-focus-card">
            <div className="symptoms-focus-topline">
              <span>
                <Sparkles size={14} /> Symptom details
              </span>
              <a href="tel:112">
                <PhoneCall size={15} /> Call 112
              </a>
            </div>

            <h1>Tell us what you are feeling</h1>
            <p className="symptoms-focus-copy">
              Speak or type in any language. Keep it simple, like you would
              explain it to a doctor.
            </p>

            <div className="symptoms-voice-row">
              <button
                type="button"
                onClick={startListening}
                disabled={listening}
                id="mic-btn"
                className={`symptoms-mic-button ${listening ? "is-listening" : ""}`}
                aria-pressed={listening}
              >
                <span className="symptoms-mic-icon">
                  <Mic size={34} />
                </span>
                <span>
                  <strong>{listening ? "Listening..." : "Tap to speak"}</strong>
                  <small>
                    {listening
                      ? "Keep speaking. Tap stop when you are done."
                      : "Hindi, English, or mixed language is fine."}
                  </small>
                </span>
                {listening && <em>LIVE</em>}
                {listening && (
                  <span className="relative flex h-3 w-3 ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>

              {listening && (
                <button
                  type="button"
                  onClick={stopListening}
                  className="symptoms-stop-button"
                  aria-label="Stop voice input"
                >
                  <Square size={16} fill="currentColor" />
                  Stop
                </button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                className="clinical-field-label symptoms-type-label"
                htmlFor="symptoms-input"
                style={{ marginBottom: 0 }}
              >
                <Keyboard size={15} /> Type symptoms
              </label>
              {symptoms.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSymptoms("");
                    setError("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--danger, #dc3545)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: 0,
                  }}
                  title="Clear symptoms"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
            <textarea
              id="symptoms-input"
              className="input-field symptoms-textarea"
              value={symptoms}
              onChange={(event) => {
                setSymptoms(event.target.value);
                if (error) setError("");
              }}
              rows={7}
              placeholder="Example: Fever since yesterday, headache, weakness, and mild cough. Breathing is normal."
            />

            <div className="symptoms-prompts">
              {quickSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  className="chip"
                  onClick={() => {
                    setSymptoms((previous) =>
                      previous ? `${previous}. ${symptom}` : symptom,
                    );
                    if (error) setError("");
                  }}
                >
                  {symptom}
                </button>
              ))}
            </div>

            {error && (
              <div className="alert alert-danger symptoms-error">{error}</div>
            )}

            <button
              onClick={submit}
              disabled={loading || !symptoms.trim()}
              className="btn btn-primary symptoms-submit"
              id="sym-submit"
              style={{
                opacity: !symptoms.trim() && !loading ? 0.6 : 1,
                cursor:
                  !symptoms.trim() && !loading ? "not-allowed" : "pointer",
              }}
            >
              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ marginRight: "8px" }}
                />
              )}
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
    <Suspense
      fallback={
        <div className="clinical-page site-container text-[var(--muted)]">
          Loading intake...
        </div>
      }
    >
      <SymptomsForm />
    </Suspense>
  );
}
