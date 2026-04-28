"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { label: string; href: string }[] = [];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {/* k + ascending bars mark — transparent background */}
          <svg viewBox="0 0 82 90" xmlns="http://www.w3.org/2000/svg" width={36} height={40} style={{ display: 'block' }}>
            <defs>
              <linearGradient id="hg" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
            {/* k stem */}
            <rect x="4" y="4" width="13" height="82" rx="6.5" fill="url(#hg)" />
            {/* k upper arm */}
            <path d="M17 42 L17 28 L62 4 L50 4 Z" fill="url(#hg)" />
            {/* bar 1 short */}
            <rect x="27" y="65" width="13" height="21" rx="6" fill="url(#hg)" />
            {/* bar 2 medium */}
            <rect x="44" y="52" width="13" height="34" rx="6" fill="url(#hg)" />
            {/* bar 3 tall */}
            <rect x="61" y="38" width="13" height="48" rx="6" fill="url(#hg)" />
          </svg>
          {/* kabu / dashboard stacked text */}
          <div className="flex flex-col leading-none gap-0.5">
            <span className="font-bold text-lg tracking-tight" style={{ color: '#1a202c' }}>kabu</span>
            <span className="font-medium text-xs tracking-tight" style={{ color: '#718096' }}>dashboard</span>
          </div>
        </Link>

        {/* ナビ */}
        <nav className="flex items-center gap-5 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                pathname === item.href
                  ? "text-gray-900 font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* note リンク */}
          <a
            href="https://note.com/mi_autolab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zm-7 13H8v-2h3v2zm0-4H8v-2h3v2zm0-4H8V6h3v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V6h4v2z" />
            </svg>
            note
          </a>

          {/* X フォロー */}
          <a
            href="https://twitter.com/miautolab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.737-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            @miautolab
          </a>
        </nav>
      </div>
    </header>
  );
}
