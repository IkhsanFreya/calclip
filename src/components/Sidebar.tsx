import React from 'react';
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
  Tv,
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
}) => {
  const [showComponentStatus, setShowComponentStatus] = React.useState(true);

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none min-h-screen">
      {/* Brand & Navigation */}
      <div className="p-4 space-y-6">
        {/* App Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Tv className="w-4 h-4 fill-white" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm text-white tracking-tight">Maliki Studio</div>
            <div className="text-xs text-slate-400 font-normal">klip • motion</div>
          </div>
        </div>

        {/* Main Nav Items */}
        <nav className="space-y-1">
          <button
            onClick={() => onSelectView('beranda')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'beranda'
                ? 'bg-slate-800/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => onSelectView('klip')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'klip'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Klip</span>
          </button>

          <button
            onClick={() => onSelectView('motion')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'motion'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span>Motion</span>
          </button>
        </nav>

        {/* Pustaka Section */}
        <div className="space-y-1 pt-2">
          <div className="px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            pustaka
          </div>

          <button
            onClick={() => onSelectView('riwayat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'riwayat'
                ? 'bg-slate-800/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              currentView === 'pengaturan'
                ? 'bg-slate-800/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan AI</span>
          </button>
        </div>

        {/* Component / Analysis status widget */}
        {showComponentStatus && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-xs font-medium text-slate-200">
                  {isAnalyzing ? (statusTitle || 'Menganalisis video') : 'Memasang komponen'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (isAnalyzing && onCancelAnalysis) onCancelAnalysis();
                  else setShowComponentStatus(false);
                }}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              {isAnalyzing
                ? `${analysisTimeStr} • ${analysisStepLabel}`
                : '02:15 • siap digunakan'}
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full w-4/5 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 space-y-3 border-t border-slate-800/80">
        {/* AI Mode Info */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-200">AI: lokal</span>
          </div>
          <div className="text-[10px] text-slate-400 pl-4">
            Gratis, tanpa kunci. Ganti di Pengaturan AI.
          </div>
        </div>

        {/* Action icons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Tampilan: otomatis</span>
          </button>

          <button
            onClick={() => alert('Studio Maliki berjalan dalam mode lokal.')}
            className="w-full flex items-center gap-2.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Matikan Studio</span>
          </button>
        </div>

        {/* Template text notice */}
        <div className="pt-2 text-[10px] text-slate-500 leading-tight">
          Template oleh Maliki Saputra gratis • nonkomersial • dilarang dijual
        </div>
      </div>
    </aside>
  );
};
