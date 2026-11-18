import React from 'react';
import { History, Film, ArrowRight } from 'lucide-react';
import { ViralMoment } from '../types/klipflow';

interface LayarRiwayatProps {
  viralMoments: ViralMoment[];
  onSelectMoment: (moment: ViralMoment) => void;
  onNavigateKlip: () => void;
}

export const LayarRiwayat: React.FC<LayarRiwayatProps> = ({
  viralMoments,
  onSelectMoment,
  onNavigateKlip,
}) => {
  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#080c14] text-white">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>riwayat proyek • tersimpan lokal</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Riwayat Pemrosesan Video & Klip
        </h1>
        <p className="text-sm text-slate-400">
          Semua klip dan hasil ekspor 9:16 tersimpan di perangkat lokalmu tanpa watermark.
        </p>
      </div>

      {viralMoments.length === 0 ? (
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Belum Ada Riwayat Klip</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Mulai dengan memasukkan link YouTube atau seret file video di menu Klip untuk memotong video otomatis.
            </p>
          </div>
          <button
            onClick={onNavigateKlip}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-colors"
          >
            <span>Buka Menu Klip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{viralMoments.length} Klip Ditemukan</span>
              <span>Format: 9:16 Vertikal</span>
            </div>
            <div className="divide-y divide-slate-800/80">
              {viralMoments.map((m) => (
                <div
                  key={m.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      {m.hookScore}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.title}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                        <span>{m.startTime.toFixed(1)}s - {m.endTime.toFixed(1)}s</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-400 font-mono">{m.recommendedMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectMoment(m);
                        onNavigateKlip();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Buka di Studio</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
