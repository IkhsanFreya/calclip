import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Scissors,
  PlaySquare,
  History,
  Settings,
  Loader2,
  X,
  Moon,
  Power,
  Sun,
} from 'lucide-react';

export type MainView = 'beranda' | 'klip' | 'motion' | 'riwayat' | 'pengaturan';

interface SidebarProps {
  currentView: MainView;
  onSelectView: (view: MainView) => void;
  onOpenSettings: () => void;
  isAnalyzing?: boolean;
  analysisTimeStr?: string;
  analysisStepLabel?: string;
  statusTitle?: string;
  onCancelAnalysis?: () => void;
  tema?: 'otomatis' | 'gelap' | 'terang';
  onGantiTema?: (tema: 'otomatis' | 'gelap' | 'terang') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenSettings,
  isAnalyzing = false,
  analysisTimeStr = '00:00',
  analysisStepLabel = '',
  statusTitle,
  onCancelAnalysis,
  tema = 'otomatis',
  onGantiTema,
}) => {
  const [activeAi, setActiveAi] = useState<{ label: string; desc: string }>({
    label: 'AI: lokal',
    desc: 'Gratis, tanpa kunci. Ganti di Pengaturan AI.',
  });

  useEffect(() => {
    const muatAi = async () => {
      try {
        const res = await fetch('/api/pengaturan');
        if (res.ok) {
          const data = await res.json();
          const p = data.pengaturan || {};
          const aiMode = (p.AI || 'lokal').toLowerCase();
          if (aiMode === 'gemini') {
            setActiveAi({
              label: 'AI: Google Gemini',
              desc: p.GEMINI_MODEL ? `Model: ${p.GEMINI_MODEL}` : 'Terhubung via AI Studio.',
            });
          } else if (aiMode === 'langganan') {
            const cli = (p.LANGGANAN || 'claude-code').toUpperCase();
            setActiveAi({
              label: `AI: Langganan (${cli})`,
              desc: 'Memotong kuota langganan akunmu.',
            });
          } else if (aiMode === 'openai') {
            setActiveAi({
              label: 'AI: Ollama / OpenAI',
              desc: p.OPENAI_MODEL ? `Model: ${p.OPENAI_MODEL}` : 'Model lokal / API endpoint.',
            });
          } else {
            setActiveAi({
              label: 'AI: lokal',
              desc: 'Gratis, tanpa kunci. Ganti di Pengaturan AI.',
            });
          }
        }
      } catch {}
    };

    muatAi();
    window.addEventListener('pengaturan-berubah', muatAi);
    return () => window.removeEventListener('pengaturan-berubah', muatAi);
  }, []);
  return (
    <aside className="w-[232px] bg-[#07090f] border-r border-[#1f2738] flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Brand & Navigation */}
      <div className="p-3.5 space-y-5">
        {/* App Brand Header */}
        <div
          className="flex flex-col items-center justify-center text-center px-2 py-2 group cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => onSelectView('beranda')}
        >
          <img
            src="/logo.png"
            alt="CalClip.IN"
            className="dark-logo h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
          />
          <img
            src="/logo-light.png"
            alt="CalClip.IN"
            className="light-logo h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
          />
          <div className="mt-2 text-center leading-tight">
            <div className="font-extrabold text-base text-white tracking-tight flex items-center justify-center gap-1 brand-text">
              <span>CalClip<span className="text-cyan-400">.IN</span></span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono font-medium flex items-center justify-center gap-1 mt-0.5">
              <span>klip</span>
              <span className="text-slate-600">•</span>
              <span>motion AI</span>
            </div>
          </div>
        </div>

        {/* Main Nav Items */}
        <nav className="space-y-1">
          <button
            onClick={() => onSelectView('beranda')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
              currentView === 'beranda'
                ? 'bg-[#0d1f33] border border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => onSelectView('klip')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
              currentView === 'klip'
                ? 'bg-[#0d1f33] border border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Klip</span>
          </button>

          <button
            onClick={() => onSelectView('motion')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
              currentView === 'motion'
                ? 'bg-[#0d1f33] border border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span>Motion</span>
          </button>
        </nav>

        {/* Pustaka Section */}
        <div className="space-y-1 pt-2">
          <div className="px-3.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            pustaka
          </div>

          <button
            onClick={() => onSelectView('riwayat')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
              currentView === 'riwayat'
                ? 'bg-[#0d1f33] border border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat</span>
          </button>

          <button
            onClick={() => onSelectView('pengaturan')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
              currentView === 'pengaturan'
                ? 'bg-[#0d1f33] border border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan AI</span>
          </button>
        </div>

        {/* Active Analysis or Render Task Widget matching Studio Maliki (screenshots 2 & 4) */}
        {isAnalyzing && (
          <div
            onClick={() => {
              if (statusTitle?.toLowerCase().includes('motion')) onSelectView('motion');
              else if (statusTitle?.toLowerCase().includes('komponen') || statusTitle?.toLowerCase().includes('suara')) onSelectView('pengaturan');
              else onSelectView('klip');
            }}
            className="bg-[#0f172a]/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5 mt-4 animate-fadeIn cursor-pointer hover:border-cyan-400 transition-all shadow-lg shadow-cyan-950/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-xs font-semibold text-slate-100">
                  {statusTitle || 'Menganalisis video'}
                </span>
              </div>
              {onCancelAnalysis && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelAnalysis();
                  }}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded hover:bg-slate-800/60 transition-colors"
                  title="Batalkan proses"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-[11px] font-mono text-cyan-300/90 truncate">
              {analysisTimeStr} • {analysisStepLabel}
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full w-4/5 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 space-y-3.5 border-t border-slate-800/80">
        {/* AI Mode Info */}
        <div
          onClick={onOpenSettings}
          className="space-y-0.5 cursor-pointer hover:opacity-80 transition-opacity"
          title="Buka Wizard Pemasangan AI"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-200">{activeAi.label}</span>
          </div>
          <div className="text-[10px] text-slate-400 pl-4 leading-relaxed">
            {activeAi.desc}
          </div>
        </div>

        {/* Action icons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => {
              const next = tema === 'otomatis' ? 'gelap' : tema === 'gelap' ? 'terang' : 'otomatis';
              onGantiTema?.(next);
            }}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-800/40"
          >
            <div className="flex items-center gap-2">
              {tema === 'terang' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="capitalize">Tampilan: {tema || 'otomatis'}</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">Ganti</span>
          </button>

          <button
            onClick={() => alert('CalClip.IN berjalan dalam mode lokal.')}
            className="w-full flex items-center gap-2.5 text-xs text-slate-400 hover:text-rose-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-800/40"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Matikan CalClip</span>
          </button>
        </div>

        {/* Template text notice */}
        <div className="pt-2 text-[10px] text-slate-500 leading-tight">
          CalClip.IN • Studio Kreatif Berlisensi
        </div>
      </div>
    </aside>
  );
};
