"use client";

import { useMemo, useState } from 'react';
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

  const previews = useMemo(() => files.map((file) => ({
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
  })), [files]);

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
      <div className="mx-auto max-w-3xl rounded-3xl border border-blue-100 bg-white p-5 shadow-soft md:p-8">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">Upload Medical Reports</h1>
        <p className="mt-2 text-slate-600">Upload PDFs, prescriptions, blood reports, or scans.</p>

        <label
          className={`mt-6 block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
            dragActive ? 'border-primary bg-blue-100' : 'border-blue-200 bg-blue-50/40'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <p className="font-medium text-blue-800">Tap to choose files</p>
          <p className="mt-1 text-sm text-slate-500">Or drag and drop files here. PDF, JPG, PNG up to 6 files</p>
          <input type="file" className="hidden" multiple accept=".pdf,image/*" onChange={(e) => onFiles(e.target.files)} />
        </label>

        <div className="mt-5 space-y-2">
          {previews.map((file) => (
            <div key={file.name} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-medium text-slate-800">{file.name}</p>
              <p className="text-slate-500">{file.type || 'Unknown'} | {file.size}</p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-blue-100">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Uploading {progress}%</p>
          </div>
        )}

        <button onClick={submitReports} disabled={loading} className="mt-5 w-full rounded-xl bg-primary px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-70">
          {loading ? 'Analyzing Reports...' : 'Analyze Reports'}
        </button>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </main>
  );
}
