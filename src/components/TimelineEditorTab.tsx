import React, { useState, useRef } from 'react';
import {
  Clock,
  Sparkles,
  Download,
  Upload,
  Star,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { SubtitleSegment } from '../types/klipflow';
import { INDONESIAN_SLANG_NORMALIZER } from '../engine/subtitleEngine';

interface TimelineEditorTabProps {
  segments: SubtitleSegment[];
  onUpdateWord: (
    segmentId: string,
    wordId: string,
    newText: string,
    newStart?: number,
    newEnd?: number,
    isHighlighted?: boolean
  ) => void;
  onImportSRT: (content: string) => void;
  onExportSRT: () => void;
  onExportJSON: () => void;
  onSeek: (time: number) => void;
  currentTime: number;
}

export const TimelineEditorTab: React.FC<TimelineEditorTabProps> = ({
  segments,
  onUpdateWord,
  onImportSRT,
  onExportSRT,
  onExportJSON,
  onSeek,
  currentTime,
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(segments[0]?.id || '');
  const [selectedWordId, setSelectedWordId] = useState<string>(segments[0]?.words[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSegment = segments.find((s) => s.id === selectedSegmentId) || segments[0];
  const activeWord = activeSegment?.words.find((w) => w.id === selectedWordId) || activeSegment?.words[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onImportSRT(text);
      };
      reader.readAsText(file);
    }
  };

  const handleAutoNormalizeAll = () => {
    segments.forEach((seg) => {
      seg.words.forEach((w) => {
        const clean = w.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (INDONESIAN_SLANG_NORMALIZER[clean]) {
          onUpdateWord(seg.id, w.id, INDONESIAN_SLANG_NORMALIZER[clean]);
        }
      });
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Global Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-400/10 text-lime-400 border border-lime-400/30">
              Module D: Whisper DTW Alignment
            </span>
            <span className="text-xs text-slate-400 font-mono">Word-by-Word Timeline</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Penyelarasan Kata & Editor Subtitle Interaktif
          </h2>
          <p className="text-xs text-slate-300">
            Koreksi ejaan kata, sesuaikan timing milidetik, aktifkan highlight kata kunci, dan tempelkan contextual emoji.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoNormalizeAll}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
            title="Normalisasi kata gaul/slang Indonesia secara otomatis"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Normalisasi Slang Indo</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Impor SRT</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".srt,.txt"
            className="hidden"
          />

          <button
            onClick={onExportSRT}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-lime-400" />
            <span>Ekspor .SRT</span>
          </button>

          <button
            onClick={onExportJSON}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Ekspor .JSON</span>
          </button>
        </div>
      </div>

      {/* Editor Grid: Left Segment List, Right Word Timeline & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Segments List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">Daftar Segmen ({segments.length})</span>
            <span className="text-[10px] text-slate-500 font-mono">Whisper ASR</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {segments.map((seg, idx) => {
              const isSelected = seg.id === activeSegment?.id;
              const isCurrentlyPlaying = currentTime >= seg.start && currentTime <= seg.end;

              return (
                <div
                  key={seg.id}
                  onClick={() => {
                    setSelectedSegmentId(seg.id);
                    if (seg.words[0]) setSelectedWordId(seg.words[0].id);
                    onSeek(seg.start);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-lime-400/10 border-lime-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400 font-bold">#{idx + 1}</span>
                    <span className={isCurrentlyPlaying ? 'text-lime-400 font-bold' : 'text-slate-400'}>
                      {seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2">{seg.text}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{seg.words.length} kata</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{seg.style}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Word-Level Chips & Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {activeSegment ? (
            <>
              {/* Interactive Word Chips Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      Kata-per-Kata (DTW Timestamped Chips)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Klik kata untuk mengedit detail
                  </span>
                </div>

                {/* Word Chips Wrap Container */}
                <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 min-h-[90px]">
                  {activeSegment.words.map((w) => {
                    const isWordActive = w.id === activeWord?.id;
                    const isSpokenNow = currentTime >= w.start && currentTime <= w.end;

                    return (
                      <button
                        key={w.id}
                        onClick={() => {
                          setSelectedWordId(w.id);
                          onSeek(w.start);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isWordActive
                            ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20 scale-105 ring-2 ring-lime-300'
                            : isSpokenNow
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        <span>{w.text}</span>
                        {w.isHighlighted && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        <span className="text-[10px] opacity-70 font-mono">
                          {w.start.toFixed(1)}s
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Word Detail Inspector */}
              {activeWord && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-lime-400" />
                      Inspector Kata Terpilih: "{activeWord.text}"
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      Akurasi Whisper: {(activeWord.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Word Text Input & Normalization */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Teks Kata</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={activeWord.text}
                          onChange={(e) =>
                            onUpdateWord(activeSegment.id, activeWord.id, e.target.value)
                          }
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400 font-bold"
                        />
                        {/* Quick Slang Normalizer button for this word */}
                        <button
                          onClick={() => {
                            const clean = activeWord.text.toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (INDONESIAN_SLANG_NORMALIZER[clean]) {
                              onUpdateWord(
                                activeSegment.id,
                                activeWord.id,
                                INDONESIAN_SLANG_NORMALIZER[clean]
                              );
                            }
                          }}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1"
                          title="Normalisasi slang kata ini"
                        >
                          <RefreshCw className="w-3 h-3 text-cyan-400" />
                          <span>Koreksi</span>
                        </button>
                      </div>
                    </div>

                    {/* Word Highlight Toggle */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Efek Highlight Kata Kunci</label>
                      <button
                        onClick={() =>
                          onUpdateWord(
                            activeSegment.id,
                            activeWord.id,
                            activeWord.text,
                            activeWord.start,
                            activeWord.end,
                            !activeWord.isHighlighted
                          )
                        }
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                          activeWord.isHighlighted
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Star className={`w-3.5 h-3.5 ${activeWord.isHighlighted ? 'fill-current' : ''}`} />
                          Highlight Emas / Warna Aksen
                        </span>
                        <span>{activeWord.isHighlighted ? 'AKTIF' : 'NONAKTIF'}</span>
                      </button>
                    </div>

                    {/* Timing Sliders */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Waktu Mulai (Start)</span>
                        <span className="font-mono text-lime-400 font-bold">{activeWord.start.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min={activeSegment.start}
                        max={activeWord.end - 0.05}
                        step={0.05}
                        value={activeWord.start}
                        onChange={(e) =>
                          onUpdateWord(
                            activeSegment.id,
                            activeWord.id,
                            activeWord.text,
                            Number(e.target.value),
                            activeWord.end
                          )
                        }
                        className="w-full accent-lime-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Waktu Selesai (End)</span>
                        <span className="font-mono text-cyan-400 font-bold">{activeWord.end.toFixed(2)}s</span>
                      </div>
                      <input
                        type="range"
                        min={activeWord.start + 0.05}
                        max={activeSegment.end}
                        step={0.05}
                        value={activeWord.end}
                        onChange={(e) =>
                          onUpdateWord(
                            activeSegment.id,
                            activeWord.id,
                            activeWord.text,
                            activeWord.start,
                            Number(e.target.value)
                          )
                        }
                        className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Belum ada segmen subtitle yang dimuat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
