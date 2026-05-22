"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/symptoms', label: 'Symptoms' },
  { href: '/upload', label: 'Reports' },
  { href: '/analysis', label: 'Analysis' },
  { href: '/hospitals', label: 'Hospitals' },
  { href: '/dashboard', label: 'Live' }
];

export function PatientHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#d8e5f7]/90 bg-white/90 backdrop-blur">
      <div className="container flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0e67d8] text-sm font-bold text-white">
            LL
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">LifeLine AI</p>
            <p className="text-[11px] text-slate-500">Patient Emergency Assistant</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-[#e5f0ff] text-[#0c57b8]'
                    : 'text-slate-600 hover:bg-[#f1f6ff] hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <a href="tel:112" className="rounded-lg border border-[#f2c0c0] bg-[#fff5f5] px-3 py-2 text-xs font-semibold text-[#bb2e2e] md:text-sm">
          Emergency: 112
        </a>
      </div>
    </header>
  );
}
