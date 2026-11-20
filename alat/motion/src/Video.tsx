// kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id · Lisensi Nonkomersial Maliki Studio 1.0 (alat/LISENSI.md): dilarang dijual ulang.
// CalClip Enhanced Motion Engine v2.1: Transisi sinematik, partikel ambient, objek vektor animasi, & kinetik tipografi
import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {TEMA, Tema} from './tema';
import {FilterIlustrasi} from './ilustrasi';

export const FPS = 30;

export type Adegan = {
  teks: string; // kalimat narasi (juga jadi subtitle)
  judul: string; // tulisan besar di layar (2–5 kata)
  kunci?: string[]; // kata yang disorot di subtitle
  ikon?: string; // emoji / simbol besar
  gambar?: string; // SVG objek buatan AI (gambar.mjs, sudah disaring svg-aman.mjs) — dipakai menggantikan emoji
  durasi?: number; // detik; diisi otomatis dari panjang suara
  suara?: string; // path di folder public/, mis. suara/01.wav
  klip?: string; // adegan video asli (path di public/, diisi buat.mjs dari file klip.py)
};

export type Props = {
  judul: string;
  gaya: string; // kunci di TEMA (14 template + 10 ilustrasi: piksel, kapur, emas, ps2, komik, flat, stickman, cgi, bata, clay)
  handle?: string;
  aksen?: string;
  adegan: Adegan[];
};

const JEDA = 0.35; // detik napas di akhir tiap adegan
export const frameAdegan = (a: Adegan) => Math.ceil(((a.durasi ?? 3) + (a.klip ? 0 : JEDA)) * FPS);
export const totalFrame = (p: Props) => p.adegan.reduce((s, a) => s + frameAdegan(a), 0);

const temaDari = (p: Props): Tema => TEMA[p.gaya] ?? TEMA.garis;
const warnaAdegan = (t: Tema, i: number, aksenProp?: string) => {
  const pn = t.panel?.[i % t.panel.length];
  return {
    bg: pn?.bg,
    teks: pn?.teks ?? t.teks,
    aksen: aksenProp ?? pn?.aksen ?? t.aksen,
    redup: pn ? (pn.teks === '#fff' || pn.teks === '#faf6ef' ? '#ffffffaa' : '#00000088') : t.redup,
  };
};
const huruf = (t: Tema, s: string) => (t.kapital ? s.toUpperCase() : s);
const kontras = (hex: string) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160 ? '#111' : '#fff';
};

// ── Adegan hibrid: klip asli layar penuh + label judul ──────────────────────
const AdeganKlip: React.FC<{a: Adegan; p: Props}> = ({a, p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = temaDari(p);
  const aksen = p.aksen ?? t.aksen;
  const masuk = spring({frame: f, fps, config: {damping: 15}});
  const keluar = interpolate(f, [2.6 * fps, 3 * fps], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile(a.klip!)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {a.judul ? (
        <div style={{position: 'absolute', top: 230, left: 80, right: 80, opacity: keluar, transform: `translateY(${interpolate(masuk, [0, 1], [-40, 0])}px)`}}>
          <span style={{background: aksen, color: kontras(aksen), fontFamily: t.fontJudul, fontWeight: t.bobot, fontSize: 54, padding: '14px 26px',
            lineHeight: 1.5, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
            {huruf(t, a.judul)}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── Ilustrasi Vektor Animasi Prosedural (Bila tanpa file AI gambar) ─────────
const IlustrasiVektor: React.FC<{ikon?: string; teks?: string; aksen: string; frame: number; ukuran: number}> = ({ikon, teks, aksen, frame, ukuran}) => {
  const f = frame;
  const k = (teks || '').toLowerCase();

  // 1. Lampu Bohlam / Rahasia / Ide
  if (ikon === '💡' || k.includes('rahasia') || k.includes('ide') || k.includes('tahukah')) {
    const pulse = 1 + Math.sin(f / 8) * 0.08;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        {/* Glow rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
          <line
            key={i}
            x1="100" y1="100"
            x2={100 + Math.cos((ang * Math.PI) / 180) * (85 + Math.sin((f + i * 15) / 10) * 12)}
            y2={100 + Math.sin((ang * Math.PI) / 180) * (85 + Math.sin((f + i * 15) / 10) * 12)}
            stroke={aksen}
            strokeWidth="5"
            strokeLinecap="round"
            opacity={0.35 + Math.sin((f + i * 10) / 12) * 0.3}
          />
        ))}
        {/* Bulb body */}
        <path d="M70 120 C 50 100, 50 60, 100 50 C 150 60, 150 100, 130 120 L 125 140 L 75 140 Z" fill={aksen} />
        {/* Filament glow */}
        <circle cx="100" cy="90" r={22 * pulse} fill="#ffffff" filter="drop-shadow(0 0 15px #fff)" />
        {/* Base */}
        <rect x="80" y="145" width="40" height="8" rx="4" fill="#64748b" />
        <rect x="85" y="156" width="30" height="8" rx="4" fill="#475569" />
      </svg>
    );
  }

  // 2. Petir / Energi / Krusial / Pondasi
  if (ikon === '⚡' || k.includes('krusial') || k.includes('energi') || k.includes('pondasi')) {
    const discharge = Math.sin(f / 4) * 4;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        <path
          d="M115 30 L65 105 L105 105 L85 175 L145 95 L105 95 Z"
          fill={aksen}
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinejoin="round"
          filter={`drop-shadow(0 0 ${18 + Math.abs(discharge) * 4}px ${aksen})`}
          transform={`scale(${1 + Math.sin(f / 6) * 0.05}) translate(${discharge}, 0)`}
          transformOrigin="center"
        />
      </svg>
    );
  }

  // 3. Target / Fokus / Kunci / Konsistensi
  if (ikon === '🎯' || k.includes('fokus') || k.includes('kunci') || k.includes('konsisten')) {
    const rot = (f * 1.5) % 360;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="75" stroke={aksen} strokeWidth="6" opacity="0.4" strokeDasharray="12 12" transform={`rotate(${rot} 100 100)`} />
        <circle cx="100" cy="100" r="55" fill="none" stroke="#ffffff" strokeWidth="6" opacity="0.8" />
        <circle cx="100" cy="100" r="35" fill={aksen} />
        <circle cx="100" cy="100" r="16" fill="#ffffff" filter="drop-shadow(0 0 10px #fff)" />
        <line x1="100" y1="15" x2="100" y2="40" stroke="#fff" strokeWidth="4" />
        <line x1="100" y1="160" x2="100" y2="185" stroke="#fff" strokeWidth="4" />
        <line x1="15" y1="100" x2="40" y2="100" stroke="#fff" strokeWidth="4" />
        <line x1="160" y1="100" x2="185" y2="100" stroke="#fff" strokeWidth="4" />
      </svg>
    );
  }

  // 4. Roket / Hasil / Sukses
  if (ikon === '🚀' || k.includes('hasil') || k.includes('sukses') || k.includes('perubahan') || k.includes('drastis')) {
    const thrust = 1 + Math.sin(f / 4) * 0.25;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        <path d={`M85 130 Q100 ${170 * thrust} 115 130 Z`} fill="#f59e0b" filter="drop-shadow(0 0 16px #f59e0b)" />
        <path d={`M92 130 Q100 ${155 * thrust} 108 130 Z`} fill="#ffffff" />
        <path d="M100 40 C 80 75, 75 110, 80 135 L 120 135 C 125 110, 120 75, 100 40 Z" fill="#ffffff" />
        <path d="M80 115 L60 135 L80 135 Z" fill={aksen} />
        <path d="M120 115 L140 135 L120 135 Z" fill={aksen} />
        <circle cx="100" cy="85" r="12" fill={aksen} stroke="#0f172a" strokeWidth="3" />
      </svg>
    );
  }

  // 5. Api / Viral / Simpan / Aksi
  if (ikon === '🔥' || k.includes('simpan') || k.includes('viral') || k.includes('sekarang')) {
    const f1 = Math.sin(f / 5) * 6;
    const f2 = Math.cos(f / 6) * 5;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        <path
          d={`M100 30 C125 70, ${150 + f1} 100, 140 145 C130 175, 70 175, 60 145 C50 115, ${80 + f2} 80, 100 30 Z`}
          fill={aksen}
          filter={`drop-shadow(0 0 22px ${aksen})`}
        />
        <path d="M100 85 C115 105, 125 120, 120 145 C115 162, 85 162, 80 145 C75 125, 90 105, 100 85 Z" fill="#ffffff" />
      </svg>
    );
  }

  // 6. Jam / Waktu / Pagi
  if (ikon === '⏰' || k.includes('waktu') || k.includes('pagi') || k.includes('menit') || k.includes('jam')) {
    const ring = Math.sin(f / 3) * 6;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        {/* Ring bells */}
        <circle cx="60" cy="55" r="22" fill={aksen} transform={`rotate(${-ring} 60 55)`} />
        <circle cx="140" cy="55" r="22" fill={aksen} transform={`rotate(${ring} 140 55)`} />
        {/* Clock body */}
        <circle cx="100" cy="115" r="65" fill="#ffffff" stroke={aksen} strokeWidth="8" filter="drop-shadow(0 0 16px rgba(0,0,0,0.3))" />
        <circle cx="100" cy="115" r="5" fill="#0f172a" />
        {/* Clock hands */}
        <line x1="100" y1="115" x2="100" y2="75" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
        <line x1="100" y1="115" x2="125" y2="125" stroke={aksen} strokeWidth="4" strokeLinecap="round" />
        {/* Feet */}
        <line x1="65" y1="170" x2="50" y2="185" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <line x1="135" y1="170" x2="150" y2="185" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  // 7. Gamepad Controller / Gaming / PC
  if (ikon === '🎮' || k.includes('game') || k.includes('gaming') || k.includes('kompetitif') || k.includes('mabar') || k.includes('dota') || k.includes('valorant') || k.includes('roleplay')) {
    const floatY = Math.sin(f / 8) * 8;
    const btnPulse = 1 + Math.sin(f / 4) * 0.15;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        <g transform={`translate(0, ${floatY})`}>
          {/* Controller Body */}
          <path
            d="M50 70 C 30 70, 20 100, 25 145 C 28 160, 45 165, 60 150 L 75 130 L 125 130 L 140 150 C 155 165, 172 160, 175 145 C 180 100, 170 70, 150 70 Z"
            fill={aksen}
            stroke="#ffffff"
            strokeWidth="5"
            filter={`drop-shadow(0 0 20px ${aksen}99)`}
          />
          {/* Center Touchpad / Logo */}
          <rect x="85" y="80" width="30" height="20" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <circle cx="100" cy="90" r="3" fill={aksen} />
          {/* D-Pad (Left) */}
          <rect x="52" y="92" width="22" height="7" rx="2" fill="#0f172a" />
          <rect x="59.5" y="84.5" width="7" height="22" rx="2" fill="#0f172a" />
          {/* Action Buttons (Right: A, B, X, Y) */}
          <circle cx="145" cy="85" r="4.5" fill="#38bdf8" />
          <circle cx="137" cy="93" r="4.5" fill="#f43f5e" />
          <circle cx="153" cy="93" r="4.5" fill="#22c55e" />
          <circle cx="145" cy="101" r="4.5" fill="#facc15" />
          {/* Dual Analog Thumbsticks */}
          <circle cx="78" cy="118" r={13 * btnPulse} fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
          <circle cx="122" cy="118" r={13 * btnPulse} fill="#1e293b" stroke="#ffffff" strokeWidth="2.5" />
        </g>
      </svg>
    );
  }

  // 8. Sains / Fisika / Atom / Semesta
  if (ikon === '⚛️' || ikon === '🪐' || k.includes('sains') || k.includes('cahaya') || k.includes('bumi') || k.includes('angkasa') || k.includes('relativitas') || k.includes('alam semesta')) {
    const rot = (f * 2) % 360;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        {/* Core Nucleus */}
        <circle cx="100" cy="100" r="18" fill="#ffffff" filter="drop-shadow(0 0 16px #ffffff)" />
        <circle cx="100" cy="100" r="12" fill={aksen} />
        {/* Orbit Ring 1 */}
        <ellipse cx="100" cy="100" rx="75" ry="25" stroke={aksen} strokeWidth="4" fill="none" opacity="0.8" transform={`rotate(${rot} 100 100)`} />
        {/* Orbit Ring 2 */}
        <ellipse cx="100" cy="100" rx="75" ry="25" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.7" transform={`rotate(${rot + 60} 100 100)`} />
        {/* Orbit Ring 3 */}
        <ellipse cx="100" cy="100" rx="75" ry="25" stroke={aksen} strokeWidth="4" fill="none" opacity="0.8" transform={`rotate(${rot + 120} 100 100)`} />
        {/* Traveling Electrons */}
        <circle
          cx={100 + Math.cos((rot * Math.PI) / 90) * 75}
          cy={100 + Math.sin((rot * Math.PI) / 90) * 25}
          r="6"
          fill="#38bdf8"
          filter="drop-shadow(0 0 10px #38bdf8)"
        />
      </svg>
    );
  }

  // 9. Uang / Finansial / Aset / Investasi
  if (ikon === '💰' || ikon === '📈' || k.includes('uang') || k.includes('finansial') || k.includes('aset') || k.includes('investasi') || k.includes('darurat') || k.includes('leher')) {
    const coinRot = Math.sin(f / 6) * 15;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        {/* Rising Bar Chart in Background */}
        <rect x="40" y="120" width="18" height="40" rx="3" fill={aksen} opacity="0.4" />
        <rect x="65" y="95" width="18" height="65" rx="3" fill={aksen} opacity="0.6" />
        <rect x="90" y="70" width="18" height="90" rx="3" fill={aksen} opacity="0.8" />
        <rect x="115" y="45" width="18" height="115" rx="3" fill={aksen} />
        {/* Upward Surging Arrow */}
        <path d="M40 130 L90 80 L125 50 L145 50 L145 70" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Big Golden Coin */}
        <g transform={`translate(130, 125) rotate(${coinRot})`}>
          <circle cx="0" cy="0" r="35" fill="#facc15" stroke="#ca8a04" strokeWidth="4" filter="drop-shadow(0 0 18px rgba(250,204,21,0.6))" />
          <circle cx="0" cy="0" r="27" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" strokeDasharray="4 4" />
          <text x="0" y="8" fontSize="24" fontWeight="bold" textAnchor="middle" fill="#854d0e" fontFamily="sans-serif">\$</text>
        </g>
      </svg>
    );
  }

  // 10. Smartphone / Layar / HP
  if (ikon === '📱' || k.includes('hp') || k.includes('ponsel') || k.includes('layar') || k.includes('smartphone')) {
    const pulseY = Math.sin(f / 6) * 6;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        <g transform={`translate(0, ${pulseY})`}>
          {/* Phone body */}
          <rect x="60" y="25" width="80" height="150" rx="16" fill="#0f172a" stroke="#ffffff" strokeWidth="5" filter={`drop-shadow(0 0 20px ${aksen}88)`} />
          {/* Screen area */}
          <rect x="66" y="38" width="68" height="124" rx="8" fill={aksen} opacity="0.2" />
          {/* Speaker notch */}
          <rect x="85" y="30" width="30" height="4" rx="2" fill="#64748b" />
          {/* Notification bubble pop */}
          <rect x="72" y="60" width="56" height="22" rx="6" fill="#ffffff" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.4))" />
          <circle cx="82" cy="71" r="5" fill="#ef4444" />
          <line x1="92" y1="68" x2="118" y2="68" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="92" y1="74" x2="110" y2="74" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // 11. Trofi / Ranking / Juara / Nomor 1
  if (ikon === '🏆' || k.includes('juara') || k.includes('nomor') || k.includes('terpopuler') || k.includes('terbaik') || k.includes('teratas')) {
    const starGleam = Math.sin(f / 4) * 8;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        {/* Pedestal Base */}
        <rect x="70" y="160" width="60" height="16" rx="3" fill="#1e293b" stroke="#ffffff" strokeWidth="3" />
        <path d="M85 130 L115 130 L108 160 L92 160 Z" fill="#ca8a04" />
        {/* Cup Body */}
        <path
          d="M60 45 L140 45 L130 115 C125 130, 75 130, 70 115 Z"
          fill="#facc15"
          stroke="#ffffff"
          strokeWidth="4"
          filter="drop-shadow(0 0 20px rgba(250,204,21,0.7))"
        />
        {/* Handles */}
        <path d="M60 55 C40 55, 40 95, 66 100" stroke="#facc15" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M140 55 C160 55, 160 95, 134 100" stroke="#facc15" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Star Flare */}
        <g transform={`translate(${100 + starGleam}, 75)`}>
          <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#ffffff" />
        </g>
      </svg>
    );
  }

  // 12. Otak / Komunikasi / Psikologi
  if (ikon === '🧠' || k.includes('komunikasi') || k.includes('psikologi') || k.includes('hipnotik') || k.includes('pikiran') || k.includes('otak')) {
    const pulse = 1 + Math.sin(f / 6) * 0.08;
    return (
      <svg width={ukuran} height={ukuran} viewBox="0 0 200 200" fill="none">
        <g transform={`scale(${pulse})`} transformOrigin="100 100">
          <circle cx="100" cy="100" r="55" fill={aksen} opacity="0.2" filter="blur(8px)" />
          {/* Left Hemisphere */}
          <path
            d="M95 50 C70 50, 50 70, 50 100 C50 125, 70 145, 95 145 Z"
            fill={aksen}
            stroke="#ffffff"
            strokeWidth="4"
          />
          {/* Right Hemisphere */}
          <path
            d="M105 50 C130 50, 150 70, 150 100 C150 125, 130 145, 105 145 Z"
            fill={aksen}
            stroke="#ffffff"
            strokeWidth="4"
          />
          {/* Synapses Flashes */}
          <circle cx="80" cy="80" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #fff)" />
          <circle cx="120" cy="80" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #fff)" />
          <circle cx="85" cy="115" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #fff)" />
          <circle cx="115" cy="115" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #fff)" />
          <line x1="80" y1="80" x2="85" y2="115" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
          <line x1="120" y1="80" x2="115" y2="115" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
          <line x1="80" y1="80" x2="120" y2="80" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
        </g>
      </svg>
    );
  }

  // Fallback: Rich animated emoji badge
  return (
    <div style={{
      fontSize: ukuran * 0.55,
      lineHeight: 1,
      filter: `drop-shadow(0 0 25px ${aksen}77)`,
      transform: `scale(${1 + Math.sin(f / 12) * 0.05})`,
    }}>
      {ikon || '✨'}
    </div>
  );
};

// ── Subtitle mengikuti waktu bicara dengan kinetik pop & glow ──────────────
const Subtitle: React.FC<{a: Adegan; t: Tema; w: ReturnType<typeof warnaAdegan>}> = ({a, t, w}) => {
  const f = useCurrentFrame();
  const kata = a.teks.split(/\s+/).filter(Boolean);
  const total = (a.durasi ?? 3) * FPS;
  const bobot = kata.map((k) => k.length + 2);
  const jumlah = bobot.reduce((s, b) => s + b, 0);
  let acc = 0;
  const mulai = bobot.map((b) => { const m = (acc / jumlah) * total; acc += b; return m; });
  const aktif = Math.max(0, mulai.findIndex((m, i) => f >= m && (i === kata.length - 1 || f < mulai[i + 1])));
  const grup = Math.floor(aktif / 4) * 4;
  const kunci = new Set((a.kunci ?? []).map((k) => k.toLowerCase()));
  const kotak = t.sub === 'kotak';
  const pil = t.sub === 'pil';
  return (
    <div style={{position: 'absolute', left: 80, right: 80, bottom: 380, textAlign: 'center'}}>
      <span style={{
        display: 'inline-block',
        fontFamily: t.fontTeks,
        fontSize: t.ukuranSub ?? 56,
        fontWeight: 800,
        lineHeight: 1.35,
        padding: kotak || pil ? '16px 32px' : '10px 20px',
        background: kotak ? '#0b0f19ea' : pil ? '#ffffffeb' : 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: pil ? 999 : 18,
        border: '1.5px solid rgba(255,255,255,0.15)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        color: kotak ? '#fff' : w.teks,
      }}>
        {kata.slice(grup, grup + 4).map((k, i) => {
          const idx = grup + i;
          const sorot = idx === aktif;
          const penting = kunci.has(k.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''));
          const warna = sorot || penting ? (kotak ? t.aksen : w.aksen) : kotak ? '#fff' : pil ? t.teks : w.teks;
          const scaleVal = sorot ? 1.15 : 1;
          const transY = sorot ? -3 : 0;
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                margin: '0 10px',
                color: warna,
                opacity: f >= mulai[idx] ? 1 : 0.35,
                transform: `scale(${scaleVal}) translateY(${transY}px)`,
                textShadow: sorot || penting ? `0 0 20px ${w.aksen}, 0 0 35px ${w.aksen}88` : undefined,
                transition: 'transform 0.1s ease',
              }}
            >
              {k}
            </span>
          );
        })}
      </span>
    </div>
  );
};

// ── Judul: 7 cara muncul ───────────────────────────────────────────────────
const Judul: React.FC<{a: Adegan; t: Tema; w: ReturnType<typeof warnaAdegan>}> = ({a, t, w}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const teks = huruf(t, a.judul);
  const kata = teks.split(' ');
  const dasar: React.CSSProperties = {
    position: 'absolute',
    top: 760,
    left: 90,
    right: 90,
    fontFamily: t.fontJudul,
    fontWeight: t.bobot,
    fontSize: t.ukuranJudul ?? (t.fontJudul.includes('Instrument') ? 128 : 104),
    lineHeight: 1.08,
    color: w.teks,
    fontStyle: t.miring ? 'italic' : undefined,
    letterSpacing: t.kapital ? '-0.01em' : '-0.02em',
    textShadow: '0 8px 24px rgba(0,0,0,0.4)',
  };
  if (t.judul === 'ketik') {
    const n = Math.floor(f * 1.4);
    return (
      <div style={dasar}>
        {teks.split('').map((c, i) => (
          <span key={i} style={{opacity: i < n ? 1 : 0, color: i >= teks.lastIndexOf(' ') + 1 ? w.aksen : w.teks}}>
            {c}
          </span>
        ))}
        <span style={{opacity: Math.floor(f / 15) % 2 ? 1 : 0, color: w.aksen}}>▍</span>
      </div>
    );
  }
  if (t.judul === 'zoom') {
    const s = interpolate(f, [0, 22], [1.7, 1], {extrapolateRight: 'clamp'});
    const b = interpolate(f, [0, 16], [14, 0], {extrapolateRight: 'clamp'});
    return <div style={{...dasar, top: 720, textAlign: 'center', transform: `scale(${s})`, filter: `blur(${b}px)`, opacity: interpolate(f, [0, 8], [0, 1])}}>{teks}</div>;
  }
  if (t.judul === 'stiker' || t.judul === 'kotak') {
    const baris: string[] = [];
    kata.forEach((k) => { const l = baris[baris.length - 1]; if (l && (l + ' ' + k).length <= 14) baris[baris.length - 1] = l + ' ' + k; else baris.push(k); });
    return (
      <div style={{...dasar, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14}}>
        {baris.map((b, i) => {
          const s = spring({frame: f - i * 5, fps, config: {damping: 12, stiffness: 170}});
          const bg = t.judul === 'stiker' ? (i % 2 ? '#fff' : w.aksen) : i === baris.length - 1 ? w.aksen : w.teks;
          return (
            <span
              key={i}
              style={{
                background: bg,
                color: kontras(bg),
                padding: '8px 24px 14px',
                transform: `rotate(${t.judul === 'stiker' ? (i % 2 ? 2 : -3) : 0}deg) scale(${s})`,
                boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                transformOrigin: 'left center',
                borderRadius: 8,
              }}
            >
              {b}
            </span>
          );
        })}
      </div>
    );
  }
  if (t.judul === 'pil') {
    const s = spring({frame: f, fps, config: {damping: 14}});
    return (
      <div style={{...dasar, top: 800, textAlign: 'center'}}>
        <span style={{display: 'inline-block', background: '#ffffffb3', border: '1.5px solid #fff', backdropFilter: 'blur(20px)', borderRadius: 999,
          padding: '26px 50px', fontSize: 74, boxShadow: '0 24px 60px #4f8cff26', transform: `scaleX(${interpolate(s, [0, 1], [0.3, 1])})`, opacity: s}}>
          <span style={{display: 'inline-block', width: 26, height: 26, borderRadius: '50%', background: w.aksen, marginRight: 22, verticalAlign: 'middle',
            transform: `translateY(${-Math.abs(Math.sin(f / 6)) * 18}px)`}} />{teks}
        </span>
      </div>
    );
  }
  if (t.judul === 'sorot') {
    const akhir = kata.pop() ?? '';
    const s = spring({frame: f - 8, fps, config: {damping: 15}});
    return (
      <div style={dasar}>
        {kata.join(' ')}{' '}
        <span style={{position: 'relative', display: 'inline-block', fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontWeight: 600}}>
          <span style={{position: 'absolute', left: -14, right: -14, top: '12%', bottom: '4%', background: '#9fb5b2', opacity: 0.55, transform: `scaleX(${s})`, transformOrigin: 'left'}} />
          <span style={{position: 'relative', color: w.aksen}}>{akhir}</span>
        </span>
      </div>
    );
  }
  // naik (bawaan)
  return (
    <div style={dasar}>
      {kata.map((k, j) => {
        const s = spring({frame: f - j * 4, fps, config: {damping: 16}});
        return (
          <span
            key={j}
            style={{
              display: 'inline-block',
              marginRight: 26,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
              color: j === kata.length - 1 ? w.aksen : w.teks,
              textShadow: t.ikon === 'cahaya' && j === kata.length - 1 ? `0 0 35px ${w.aksen}` : undefined,
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
};

// ── Objek SVG buatan AI ─────────────────────────────────────────────────────
const SvgObjek: React.FC<{svg: string; ukuran: number}> = ({svg, ukuran}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const el = ref.current?.querySelector('svg');
    if (!el) return;
    try {
      const b = (el as SVGGraphicsElement).getBBox();
      if (b.width > 0 && b.height > 0) {
        const sisi = Math.max(b.width, b.height) * 1.06;
        el.setAttribute('viewBox', `${b.x + b.width / 2 - sisi / 2} ${b.y + b.height / 2 - sisi / 2} ${sisi} ${sisi}`);
      }
    } catch { /* biarkan */ }
  }, [svg]);
  return <div ref={ref} style={{width: ukuran, height: ukuran}} dangerouslySetInnerHTML={{__html: svg}} />;
};

// ── Ikon & Objek Visual dengan Dynamic Shockwave & Orbiting Particles ────────
const Ikon: React.FC<{a: Adegan; t: Tema; w: ReturnType<typeof warnaAdegan>; i: number}> = ({a, t, w, i}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!a.ikon && !a.gambar) return null;

  const s = spring({frame: f - 4, fps, config: {damping: 10, mass: 0.85}});
  const mengambang = Math.sin(f / 16) * 10;
  const pos: React.CSSProperties = {
    position: 'absolute',
    top: 290,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // Shockwave Ring saat objek mendarat (frame 4..24)
  const ringScale = interpolate(f, [4, 26], [0.5, 2.5], {extrapolateRight: 'clamp'});
  const ringOpacity = interpolate(f, [4, 10, 26], [0, 0.65, 0], {extrapolateRight: 'clamp'});

  const renderVisual = (ukuran: number) => {
    if (a.gambar) return <SvgObjek svg={a.gambar} ukuran={ukuran * 1.15} />;
    return <IlustrasiVektor ikon={a.ikon} teks={a.judul + ' ' + a.teks} aksen={w.aksen} frame={f} ukuran={ukuran} />;
  };

  // Particle Satellites yang mengorbit
  const satelit1X = Math.cos(f / 14) * 170;
  const satelit1Y = Math.sin(f / 14) * 170;
  const satelit2X = Math.cos(f / 14 + Math.PI) * 150;
  const satelit2Y = Math.sin(f / 14 + Math.PI) * 150;

  if (t.efek) {
    // Gaya ilustrasi shader SVG (piksel, kapur, emas, ps2, dll.)
    const miring = Math.sin(f / 14) * 4;
    return (
      <>
        {t.Hias ? <t.Hias f={f} aksen={w.aksen} /> : null}
        <div style={{...pos, top: 200, transform: `scale(${s}) translateY(${mengambang * 1.5}px) rotate(${miring}deg)`}}>
          {/* Shockwave ring */}
          <div
            style={{
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              border: `4px solid ${w.aksen}`,
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
              pointerEvents: 'none',
            }}
          />
          <div style={{padding: 30, filter: `url(#${t.efek})`}}>{renderVisual(420)}</div>
        </div>
      </>
    );
  }

  return (
    <div style={pos}>
      {/* Shockwave burst */}
      <div
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          border: `5px solid ${w.aksen}`,
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
          pointerEvents: 'none',
        }}
      />
      {/* Orbiting particle 1 */}
      <div
        style={{
          position: 'absolute',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: w.aksen,
          boxShadow: `0 0 16px ${w.aksen}`,
          transform: `translate(${satelit1X}px, ${satelit1Y}px)`,
          opacity: s,
        }}
      />
      {/* Orbiting particle 2 */}
      <div
        style={{
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 0 12px #ffffff',
          transform: `translate(${satelit2X}px, ${satelit2Y}px)`,
          opacity: s,
        }}
      />
      {/* Main object container with float */}
      <div
        style={{
          transform: `scale(${s}) translateY(${mengambang}px) rotate(${Math.sin(f / 20) * 3}deg)`,
          filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.4))`,
        }}
      >
        {t.ikon === 'kaca' ? (
          <div style={{
            width: 340, height: 340, borderRadius: 64, background: '#ffffff8c',
            border: '2px solid #ffffffcc', backdropFilter: 'blur(24px)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 80px #0f172a22',
          }}>
            {renderVisual(210)}
          </div>
        ) : t.ikon === 'lingkaran' ? (
          <div style={{
            width: 360, height: 360, borderRadius: '50%', background: w.aksen, display: 'flex',
            alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${18 + Math.sin(f / 10) * 6}px ${w.aksen}33`,
          }}>
            {renderVisual(210)}
          </div>
        ) : (
          renderVisual(260)
        )}
      </div>
    </div>
  );
};

// ── Label adegan ────────────────────────────────────────────────────────────
const Label: React.FC<{t: Tema; w: ReturnType<typeof warnaAdegan>; i: number; n: number}> = ({t, w, i, n}) => {
  const no = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  if (t.label === 'nomor') return <div style={{position: 'absolute', top: 170, left: 90, fontFamily: t.fontLabel, fontSize: 30, letterSpacing: 6, color: w.redup}}>{no}</div>;
  if (t.label === 'stiker') return <div style={{position: 'absolute', top: 160, left: 90, fontFamily: t.fontLabel, fontSize: 30, background: '#141414', color: '#e2b33c', padding: '8px 18px', transform: 'rotate(-2deg)'}}>{no}</div>;
  return null;
};

// ── Satu Adegan dengan Transisi Sinematik & Partikel Latar Ambient ────────────
const SatuAdegan: React.FC<{a: Adegan; i: number; n: number; p: Props; durasiFrame: number}> = ({a, i, n, p, durasiFrame}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = temaDari(p);
  const w = warnaAdegan(t, i, p.aksen);
  const garis = spring({frame: f - 10, fps, config: {damping: 14}});

  // Transisi Kamera Sinematik (Masuk & Keluar)
  const transisiMasuk = spring({frame: f, fps, config: {damping: 14, mass: 0.85}});
  const skalaKamera = interpolate(transisiMasuk, [0, 1], [1.06, 1]);
  const opacityMasuk = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});

  // Transisi Keluar (Dissolve ke adegan berikutnya)
  const sisa = durasiFrame - f;
  const opacityKeluar = interpolate(sisa, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacityAdegan = Math.min(opacityMasuk, opacityKeluar);

  // Parallax subtle camera breathing
  const driftY = Math.sin(f / 35) * 5;

  return (
    <AbsoluteFill
      style={{
        opacity: opacityAdegan,
        transform: `scale(${skalaKamera}) translateY(${driftY}px)`,
        transformOrigin: 'center center',
      }}
    >
      {w.bg ? <AbsoluteFill style={{background: w.bg}} /> : null}
      {w.bg ? <t.Latar f={f} i={i} n={n} aksen={w.aksen} judul={a.judul} /> : null}

      {/* Partikel Ambient Melayang di Latar Belakang */}
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden'}}>
        {Array.from({length: 8}).map((_, pIdx) => {
          const seed = (i * 19 + pIdx * 31) % 100;
          const posX = 100 + (seed * 8.5) % 880;
          const posY = 150 + ((seed * 18.2 + f * (1.2 + (pIdx % 3) * 0.5)) % 1600);
          const size = 6 + (pIdx % 4) * 4;
          const pOpacity = 0.2 + Math.sin((f + seed) / 20) * 0.12;
          return (
            <div
              key={pIdx}
              style={{
                position: 'absolute',
                left: posX,
                top: posY,
                width: size,
                height: size,
                borderRadius: '50%',
                background: w.aksen,
                opacity: pOpacity,
                filter: `blur(${size > 10 ? 8 : 2}px)`,
                transform: `translate(${Math.sin((f + pIdx * 15) / 20) * 15}px, ${Math.cos((f + pIdx * 12) / 25) * 15}px)`,
              }}
            />
          );
        })}
      </div>

      {a.suara ? <Audio src={staticFile(a.suara)} /> : null}
      <Label t={t} w={w} i={i} n={n} />
      <Ikon a={a} t={t} w={w} i={i} />
      <Judul a={a} t={t} w={w} />
      {t.judul === 'naik' ? (
        <div style={{
          position: 'absolute',
          top: 1080,
          left: 90,
          height: 10,
          width: 320 * garis,
          background: `linear-gradient(90deg, ${w.aksen}, #ffffff)`,
          boxShadow: `0 0 16px ${w.aksen}`,
          borderRadius: 5,
        }} />
      ) : null}
      <Subtitle a={a} t={t} w={w} />
    </AbsoluteFill>
  );
};

// ── Root Video Component ────────────────────────────────────────────────────
export const Video: React.FC<Props> = (p) => {
  const f = useCurrentFrame();
  const t = temaDari(p);
  const aksen = p.aksen ?? t.aksen;
  const total = totalFrame(p);

  // Adegan yang sedang aktif
  let dari = 0;
  let iAktif = 0;
  p.adegan.forEach((a, i) => {
    if (f >= dari) iAktif = i;
    dari += frameAdegan(a);
  });
  dari = 0;

  return (
    <AbsoluteFill style={{fontFamily: t.fontTeks, background: '#000'}}>
      {t.efek ? <FilterIlustrasi /> : null}
      {!t.panel ? <t.Latar f={f} i={iAktif} n={p.adegan.length} aksen={aksen} judul={p.adegan[iAktif]?.judul ?? ''} /> : null}

      {p.adegan.map((a, i) => {
        const d = frameAdegan(a);
        const el = (
          <Sequence key={i} from={dari} durationInFrames={d}>
            {a.klip ? <AdeganKlip a={a} p={p} /> : <SatuAdegan a={a} i={i} n={p.adegan.length} p={p} durasiFrame={d} />}
          </Sequence>
        );
        dari += d;
        return el;
      })}

      {/* Segmented Top Progress Indicator (TikTok / Shorts style) */}
      <div style={{position: 'absolute', top: 120, left: 90, right: 90, display: 'flex', gap: 10, zIndex: 50}}>
        {p.adegan.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 8,
              background: i < iAktif ? aksen : i === iAktif ? `linear-gradient(90deg, ${aksen}, #ffffff)` : 'rgba(255,255,255,0.2)',
              boxShadow: i === iAktif ? `0 0 12px ${aksen}` : undefined,
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Brand Handle & Watermark */}
      <div style={{
        position: 'absolute',
        top: 155,
        right: 90,
        fontSize: 30,
        color: warnaAdegan(t, iAktif, p.aksen).redup,
        fontFamily: t.fontLabel,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 50,
      }}>
        <span style={{width: 10, height: 10, borderRadius: '50%', background: aksen, boxShadow: `0 0 10px ${aksen}`}} />
        <span>{p.handle || '@calclip.in'}</span>
      </div>

      {/* Global Bottom Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 8,
        width: `${(f / total) * 100}%`,
        background: `linear-gradient(90deg, ${aksen}, #ffffff)`,
        boxShadow: `0 -2px 14px ${aksen}`,
        zIndex: 60,
      }} />
    </AbsoluteFill>
  );
};
