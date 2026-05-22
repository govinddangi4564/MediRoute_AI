"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ImageIcon, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { analyzeReports } from '@/lib/api';

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      })),
    [files]
  );

  const onFiles = (nextFiles: FileList | null) => {
    if (!nextFiles) return;
    setFiles(Array.from(nextFiles).slice(0, 6));
  };

  const onDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    onFiles(e.dataTransfer.files);
  };

  const submitReports = async () => {
    if (!files.length) {
      setError('Please upload at least one file.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const base64 = await toBase64(file);
        payload.push({ name: file.name, type: file.type, base64 });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const result = await analyzeReports({ files: payload });
      localStorage.setItem('lifelineReportAnalysis', JSON.stringify(result));
      router.push('/analysis');
    } catch {
      setError('Report analysis failed. Please retry.');
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
        <p className="ll-eyebrow">Step 2 of 3</p>
        <h1 className="ll-title text-2xl md:text-3xl">Upload Medical Reports</h1>
        <p className="ll-subtitle">
          Drag and drop reports, scans, prescriptions, or blood test PDFs. We will explain them in simple language.
        </p>

        <label
          className={`mt-6 block rounded-2xl border-2 border-dashed p-8 text-center transition ${
            dragActive
              ? 'border-[#287be5] bg-[#eaf2ff]'
              : 'border-[#cde0f7] bg-[linear-gradient(180deg,#f6faff_0%,#f0f7ff_100%)]'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1a65cb] shadow-sm">
            <UploadCloud size={22} />
          </span>
          <p className="mt-3 text-base font-semibold text-slate-900">Tap to choose or drag files here</p>
          <p className="mt-1 text-sm text-slate-500">Accepted: PDF, JPG, PNG (up to 6 files)</p>
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf,image/*"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>

        <div className="mt-5 space-y-3">
          {previews.map((file) => {
            const isImage = file.type.startsWith('image/');
            return (
              <div key={file.name} className="flex items-start justify-between gap-3 rounded-xl border border-[#d8e7f9] bg-white p-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4ff] text-[#215da8]">
                    {isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.type || 'Unknown format'}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-600">{file.size}</p>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="mt-5 rounded-xl border border-[#d8e7f9] bg-white p-3">
            <div className="h-2 overflow-hidden rounded-full bg-[#e7f1ff]">
              <div
                className="h-full bg-[linear-gradient(90deg,#0f65d5_0%,#5aa2ff_100%)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-600">Uploading and analyzing: {progress}%</p>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => router.push('/symptoms')}
            className="ll-btn-secondary"
            type="button"
          >
            Back to Symptoms
          </button>
          <button
            onClick={submitReports}
            disabled={loading}
            className="ll-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Analyzing reports...' : 'Continue to AI Analysis'}
          </button>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
      </motion.section>
    </main>
  );
}
