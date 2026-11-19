import React, { useState, useEffect } from 'react';
import {
  Scissors,
  PlaySquare,
  Sparkles,
  Gamepad2,
  Cpu,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  Clock,
  Play,
  Film,
} from 'lucide-react';

interface LayarBerandaProps {
  onBukaKlip: (proyekNama?: string) => void;
  onBukaMotion: () => void;
  totalKlipCount?: number;
}

interface ProyekRingkas {
  jenis: string;
  nama: string;
  judul: string;
  jumlah: number;
  gambar?: string;
  durasi?: number;
  ai?: string;
}

export const LayarBeranda: React.FC<LayarBerandaProps> = ({
  onBukaKlip,
  onBukaMotion,
  totalKlipCount = 4,
}) => {
  const [proyekList, setProyekList] = useState<ProyekRingkas[]>([]);
  const [klipCount, setKlipCount] = useState<number>(totalKlipCount || 0);
  const [motionCount, setMotionCount] = useState<number>(0);
  const [aiProvider, setAiProvider] = useState<string>('Lokal');

  useEffect(() => {
    const fetchProyek = async () => {
      try {
        const res = await fetch('/api/proyek');
        if (res.ok) {
          const list: ProyekRingkas[] = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const klips = list.filter((p) => p.jenis === 'klip');
            const motions = list.filter((p) => p.jenis === 'motion');
            setKlipCount(klips.length);
            setMotionCount(motions.length);
            if (klips.length > 0) {
              setProyekList(klips.slice(0, 4));
            }
          }
        }
      } catch {
        // Fallback
      }

      try {
        const pRes = await fetch('/api/pengaturan');
        if (pRes.ok) {
          const data = await pRes.json();
          if (data.pengaturan?.AI) {
            setAiProvider(data.pengaturan.AI.toUpperCase());
          }
        }
      } catch {
        // Fallback
      }
    };
    fetchProyek();
  }, []);

  const formatDurasi = (sec: number = 0) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#070b14] text-white select-none">
      <div className="max-w-6xl mx-auto space-y-8 py-2">
        {/* CalClip.IN Hero Banner: Animated Moving Border Beam & Full-Card Fluid Aurora */}
        <div className="hero-banner relative rounded-3xl p-[2px] overflow-hidden shadow-2xl shadow-cyan-950/40 group">
          {/* 1. Animated Continuous 360-degree Neon Border Beam across the FULL BORDER */}
          <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,#06b6d4,#3b82f6,#8b5cf6,#06b6d4,#10b981,#06b6d4)] animate-border-spin opacity-85 blur-[3px]" />

          {/* 2. Inner Card with Full-Card Random Moving Aurora & Tech Mesh */}
          <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-b from-[#091226]/95 via-[#060c1c]/95 to-[#040814]/98 text-center backdrop-blur-xl">
            {/* Full-Card Fluid Random Moving Aurora Blobs */}
            <div className="absolute -top-10 left-10 w-[500px] h-[500px] bg-cyan-500/25 rounded-full blur-[110px] pointer-events-none animate-aurora-1" />
            <div className="absolute -bottom-10 right-10 w-[520px] h-[520px] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none animate-aurora-2" />
            <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none animate-aurora-3" />

            {/* Subtle Tech Grid overlay */}
            <div className="absolute inset-0 calclip-grid-bg opacity-25 pointer-events-none" />

            {/* Floating Sparkle Particles drifting randomly */}
            <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-cyan-300 rounded-full blur-[1px] animate-particle-1 pointer-events-none" />
            <div className="absolute top-3/4 right-1/5 w-2.5 h-2.5 bg-sky-300 rounded-full blur-[1px] animate-particle-2 pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-indigo-300 rounded-full blur-[1px] animate-particle-3 pointer-events-none" />
            <div className="absolute top-1/5 right-1/3 w-1.5 h-1.5 bg-teal-300 rounded-full blur-[1px] animate-particle-1 pointer-events-none" />

            {/* Centered Content Column */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-6 max-w-4xl mx-auto">
              {/* Pill Badge Centered */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span>CalClip.IN Studio Pro • AI Video Generator 9:16</span>
              </div>

              {/* Headline & Subtitle Centered */}
              <div className="space-y-3.5 max-w-3xl mx-auto text-center">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
                  Bikin Konten Viral Lebih Cepat{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-300">
                    dengan AI Lokal.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Platform all-in-one untuk memotong video panjang jadi klip vertikal siap posting, transisi pintar podcast 1⇄2 layar, framing streamer, dan video animasi kinetik tanpa watermark.
                </p>
              </div>

              {/* Centered Action Button: Analisis Sekarang */}
              <div className="pt-3 flex justify-center items-center w-full">
                <button
                  type="button"
                  onClick={() => onBukaKlip()}
                  className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 hover:from-cyan-300 hover:via-sky-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/30 border border-cyan-300/40 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>Analisis Sekarang</span>
                  <ArrowRight className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Interactive Feature Suites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: AI Auto-Clipper 9:16 */}
          <div
            onClick={() => onBukaKlip()}
            className="feature-card group relative rounded-2xl p-6 bg-gradient-to-b from-[#0d162d]/90 to-[#090f20]/90 border border-slate-800/90 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                <Scissors className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Auto-Clipper 9:16
                </div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-200 transition-colors">
                  Potong Video Jadi Klip
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deteksi hook &amp; momen terbaik, animasi subtitle kinetik per kata, dan smart transisi otomatis podcast.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
              <span>Buka Studio Klip</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Topik Jadi Video Animasi */}
          <div
            onClick={() => onBukaMotion()}
            className="feature-card group relative rounded-2xl p-6 bg-gradient-to-b from-[#14102e]/90 to-[#0b091f]/90 border border-slate-800/90 hover:border-violet-400/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-400/30 flex items-center justify-center text-violet-300 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                <PlaySquare className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider">
                  Motion Graphics AI
                </div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-violet-200 transition-colors">
                  Topik Jadi Video Animasi
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tulis satu topik ide, AI merangkai naskah per adegan, generate suara narator natural, dan render 30fps.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs font-bold text-violet-300 group-hover:text-violet-200">
              <span>Buka Studio Motion</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Streamer & Gaming Reframing */}
          <div
            onClick={() => onBukaKlip()}
            className="feature-card group relative rounded-2xl p-6 bg-gradient-to-b from-[#1b1510]/90 to-[#100d0a]/90 border border-slate-800/90 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Kreator &amp; Gaming
                </div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-amber-200 transition-colors">
                  Layout Streamer &amp; PiP
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Facecam di atas &amp; aksi gameplay di bawah, custom sponsor divider bar, dan fokus layar interaktif.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-amber-200">
              <span>Coba Mode Streamer</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Studio Status Deck & Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Projects Card (2 cols) */}
          <div className="lg:col-span-2 bg-[#0c1326]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">Proyek Terbaru</h2>
              </div>
              <button
                type="button"
                onClick={() => onBukaKlip()}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Buka Pustaka →
              </button>
            </div>

            {proyekList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {proyekList.map((p) => (
                  <div
                    key={p.nama}
                    onClick={() => onBukaKlip(p.nama)}
                    className="p-3.5 rounded-xl bg-[#070b16] border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group flex items-center gap-3"
                  >
                    <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                      {p.gambar ? (
                        <img src={p.gambar} alt={p.judul} className="w-full h-full object-cover" />
                      ) : (
                        <Film className="w-5 h-5 text-slate-600" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {p.judul || p.nama}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{p.jumlah || 5} klip</span>
                        <span>•</span>
                        <span>{formatDurasi(p.durasi || 600)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 border border-dashed border-slate-800 rounded-xl">
                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs text-slate-400">Belum ada proyek yang dibuka.</div>
                <button
                  type="button"
                  onClick={() => onBukaKlip()}
                  className="text-xs text-cyan-400 hover:underline font-semibold"
                >
                  Mulai potong video pertamamu
                </button>
              </div>
            )}
          </div>

          {/* Engine & System Capabilities (1 col) */}
          <div className="bg-[#0c1326]/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">Status Mesin CalClip</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070b16] border border-slate-800 text-xs">
                  <span className="text-slate-400">Mesin AI Aktif</span>
                  <span className="font-mono font-bold text-cyan-300">{aiProvider}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070b16] border border-slate-800 text-xs">
                  <span className="text-slate-400">Transkripsi Audio</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Whisper Siap
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070b16] border border-slate-800 text-xs">
                  <span className="text-slate-400">Remotion Engine</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Node Siap
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total: {klipCount} klip • {motionCount} motion</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">100% Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
