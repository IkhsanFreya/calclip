import React from 'react';
import { Sparkles, Video, Layers, Type, Award, Smartphone, Globe } from 'lucide-react';

export type ActiveTab = 'clipFinder' | 'studio' | 'timeline' | 'thesis';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  fps: number;
  isKalmanActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  fps,
  isKalmanActive,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Thesis Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-400 via-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-lime-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-lime-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-lime-400 bg-clip-text text-transparent">
                Klip HP • Studio Maliki
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-lime-400/10 text-lime-400 border border-lime-400/30">
                v3.2.0 &rarr; KlipFlow AI
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                <Globe className="w-3 h-3" /> PWA + Native Bridge
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Muhammad Ikhsan Fauzi (237006115) • Skripsi TMG Informatika Univ Siliwangi
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('clipFinder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clipFinder'
                ? 'bg-lime-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Smart Clip</span> Finder
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-lime-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>9:16 Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-lime-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Word</span> Subtitles
          </button>

          <button
            onClick={() => setActiveTab('thesis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'thesis'
                ? 'bg-lime-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thesis</span> Evaluation
          </button>
        </nav>

        {/* Live FPS & Engine Telemetry Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {fps} FPS
            </span>
            <span className="text-slate-600">|</span>
            <span className={isKalmanActive ? 'text-cyan-400' : 'text-amber-400'}>
              {isKalmanActive ? 'Kalman ON' : 'Raw Ablation'}
            </span>
          </div>

          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2 py-1 rounded bg-slate-800/50">
            <Smartphone className="w-3 h-3 text-lime-400" />
            <span className="hidden sm:inline">Cross-Platform</span>
          </span>
        </div>
      </div>
    </header>
  );
};
