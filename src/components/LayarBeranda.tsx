import React from 'react';
import { Scissors, PlaySquare, ArrowRight } from 'lucide-react';

interface LayarBerandaProps {
  onBukaKlip: () => void;
  onBukaMotion: () => void;
  totalKlipCount: number;
}

export const LayarBeranda: React.FC<LayarBerandaProps> = ({
  onBukaKlip,
  onBukaMotion,
  totalKlipCount,
}) => {
  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#080c14] text-white">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>studio maliki • semua jalan di laptopmu</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Mau bikin apa hari ini?
        </h1>
        <p className="text-sm text-slate-400">
          Potong video panjang jadi klip, atau ubah satu topik jadi video animasi. Gratis, tanpa watermark.
        </p>
      </div>

      {/* Main Two Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Potong video jadi klip */}
        <div className="bg-[#0f172a]/70 hover:bg-[#0f172a] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-7 transition-all flex flex-col justify-between group cursor-pointer shadow-lg"
          onClick={onBukaKlip}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                Potong video jadi klip
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Tempel link YouTube atau seret video. AI memilih momen terbaik, lalu render 9:16 dengan subtitle.
              </p>
            </div>
          </div>
          <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>buka klip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Topik jadi video animasi */}
        <div className="bg-[#0f172a]/70 hover:bg-[#0f172a] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-7 transition-all flex flex-col justify-between group cursor-pointer shadow-lg"
          onClick={onBukaMotion}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PlaySquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                Topik jadi video animasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Naskah per adegan, suara narator, 24 gaya template, render MP4 1080x1920.
              </p>
            </div>
          </div>
          <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>buka motion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Grid Status & Proyek Terakhir */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proyek Terakhir */}
        <div className="md:col-span-2 bg-[#0f172a]/50 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>proyek terakhir</span>
          </div>
          <div className="text-xs text-slate-400 py-6">
            {totalKlipCount > 0 ? (
              <span className="text-slate-300">
                Tersedia {totalKlipCount} klip yang siap diedit di menu Klip.
              </span>
            ) : (
              'Belum ada proyek. Mulai dari salah satu kartu di atas.'
            )}
          </div>
        </div>

        {/* Status Sistem */}
        <div className="bg-[#0f172a]/50 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>status</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pemilih AI
              </span>
              <span className="font-semibold text-slate-200">Lokal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Suara narator
              </span>
              <span className="font-semibold text-slate-200">bawaan sistem</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Mesin Klip (uv)
              </span>
              <span className="font-semibold text-emerald-400">siap</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Mesin Motion (Node)
              </span>
              <span className="font-semibold text-emerald-400">siap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Counters & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="bg-[#0f172a]/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl font-extrabold text-white">{totalKlipCount}</div>
          <div className="text-xs text-slate-400 leading-tight">proyek klip</div>
        </div>

        <div className="bg-[#0f172a]/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl font-extrabold text-white">0</div>
          <div className="text-xs text-slate-400 leading-tight">video motion</div>
        </div>

        <div className="bg-[#0f172a]/50 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>tips</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gemini sedang sibuk? Studio otomatis pindah ke model cadangan bertier gratis.
          </p>
        </div>
      </div>
    </div>
  );
};
