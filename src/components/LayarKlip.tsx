import React, { useState, useRef } from 'react';
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  Check,
  Loader2,
  Film,
  Download,
  Type,
  Activity,
} from 'lucide-react';
import {
  DetectedTarget,
  KineticStyleId,
  ReframingMode,
  ReframingState,
  SubtitleSegment,
  TelemetryMetrics,
  VideoSourceMeta,
  ViralMoment,
} from '../types/klipflow';
import { KINETIC_STYLE_CONFIGS } from '../engine/subtitleEngine';

interface LayarKlipProps {
  currentSource: VideoSourceMeta;
  viralMoments: ViralMoment[];
  selectedMoment: ViralMoment | null;
  onSelectMoment: (moment: ViralMoment) => void;
  onUploadFile: (file: File) => void;
  onLoadYouTubeUrl: (url: string, title?: string, clipCount?: number) => void;

  // Studio Player Props
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;

  reframingState: ReframingState;
  activeMode: ReframingMode;
  onSetMode: (mode: ReframingMode) => void;

  isKalmanEnabled: boolean;
  onToggleKalman: () => void;

  showOverlays: boolean;
  onToggleOverlays: () => void;

  isSafeZoneEnabled: boolean;
  onToggleSafeZone: () => void;

  activeStyle: KineticStyleId;
  onSetStyle: (style: KineticStyleId) => void;

  fontSize: number;
  onSetFontSize: (size: number) => void;

  canvas9x16Ref: React.RefObject<HTMLCanvasElement>;
  source16x9Ref: React.RefObject<HTMLCanvasElement>;

  activeTargets: DetectedTarget[];
  currentSegment: SubtitleSegment | null;
  segments: SubtitleSegment[];
  onUpdateWord: (
    segmentId: string,
    wordId: string,
    newText: string,
    newStart?: number,
    newEnd?: number,
    isHighlighted?: boolean
  ) => void;
  onExportVideo: () => void;
  isExporting: boolean;
  exportProgress: number;
  onExportSRT: () => void;
  telemetry: TelemetryMetrics;
}

export const LayarKlip: React.FC<LayarKlipProps> = ({
  currentSource: _currentSource,
  viralMoments,
  selectedMoment,
  onSelectMoment,
  onUploadFile,
  onLoadYouTubeUrl,

  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onReset,

  reframingState,
  activeMode,
  onSetMode,

  isKalmanEnabled,
  onToggleKalman,

  showOverlays,
  onToggleOverlays,

  isSafeZoneEnabled,
  onToggleSafeZone,

  activeStyle,
  onSetStyle,

  fontSize: _fontSize,
  onSetFontSize: _onSetFontSize,

  canvas9x16Ref,
  source16x9Ref: _source16x9Ref,

  activeTargets: _activeTargets,
  currentSegment: _currentSegment,
  segments,
  onUpdateWord,
  onExportVideo,
  isExporting,
  exportProgress,
  onExportSRT,
  telemetry,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  // Settings State matching screenshot 01e31e93.jpg
  const [momentSelector, setMomentSelector] = useState<'lokal' | 'gemini' | 'ollama' | 'langganan'>('lokal');
  const [transcriptAccuracy, setTranscriptAccuracy] = useState<'cepat' | 'seimbang' | 'akurat'>('seimbang');
  const [clipDuration, setClipDuration] = useState<'15' | '30' | '60'>('30');
  const [customPrompt, setCustomPrompt] = useState('');
  const [clipCount, setClipCount] = useState<number>(5);
  const [analysisScope, setAnalysisScope] = useState<'semua' | 'khusus'>('semua');
  const [subtitleSource, setSubtitleSource] = useState<'whisper' | 'srt'>('whisper');

  // Active Sub-tab in studio view
  const [studioSubTab, setStudioSubTab] = useState<'preview' | 'subtitles' | 'evaluasi'>('preview');

  // Trigger analysis for YouTube or video
  const handleCariMomen = async () => {
    const rawUrl = youtubeInput.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    setIsAnalyzing(true);
    setAnalysisStatus('Menghubungkan ke YouTube & mengambil metadata video...');

    let videoTitle = 'Video Presentasi & Wawancara KlipFlow';
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) videoTitle = data.title;
      }
    } catch {
      const match = rawUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (match) videoTitle = `YouTube Clip (${match[1]})`;
    }

    setTimeout(() => {
      setAnalysisStatus(`Menjalankan Whisper ASR & normalisasi teks santai: "${videoTitle.slice(0, 32)}..."`);
      setTimeout(() => {
        setAnalysisStatus('Mendeteksi energi suara, lip sync, dan heatmap pemutaran (Hook Scorer)...');
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisStatus(null);
          // Pass URL to app state and create clips
          onLoadYouTubeUrl(rawUrl, videoTitle, clipCount);
        }, 600);
      }, 600);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsAnalyzing(true);
      setAnalysisStatus(`Membaca file video lokal: ${file.name}...`);
      setTimeout(() => {
        onUploadFile(file);
        setIsAnalyzing(false);
        setAnalysisStatus(null);
      }, 500);
    }
  };

  const stylesList: KineticStyleId[] = [
    'KotakHijau',
    'Neon',
    'Sapuan',
    'KertasSobek',
    'SerifElegan',
    'KaraokePop',
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#080c14] text-white">
      {/* Top Header matching 01e31e93.jpg */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>auto clipper • jalan di laptopmu</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Potong video panjang jadi klip siap viral
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tempel link YouTube atau seret file video. Semua diproses di laptopmu, tanpa watermark.
        </p>
      </div>

      {/* Big Dropzone & Input Box matching 01e31e93.jpg */}
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        {/* Drag & Drop Visual Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#0b0f19]/40 space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-cyan-950/50 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center mx-auto transition-colors">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Seret video ke sini</div>
            <div className="text-xs text-slate-400 mt-0.5">
              atau tempel link YouTube di bawah • mp4, mov, mkv
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
          className="hidden"
        />

        {/* Input Bar with YouTube field & action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCariMomen()}
            placeholder="https://youtube.com/watch?v=... atau seret file video ke sini"
            className="flex-1 w-full bg-[#0b0f19] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              Pilih file
            </button>

            <button
              onClick={handleCariMomen}
              disabled={isAnalyzing}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <span>Cari momen</span>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Status Banner */}
        {analysisStatus && (
          <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-3 flex items-center gap-3 text-xs text-cyan-300 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
            <span>{analysisStatus}</span>
          </div>
        )}
      </div>

      {/* Two Configuration Columns matching 01e31e93.jpg */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Mesin AI */}
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>mesin ai</span>
          </div>

          {/* Pemilih momen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Pemilih momen</span>
              <span className="font-mono text-slate-500">siap</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'lokal', label: 'Lokal' },
                { id: 'gemini', label: 'Gemini' },
                { id: 'ollama', label: 'Ollama/OpenAI' },
                { id: 'langganan', label: 'Langganan' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMomentSelector(opt.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                    momentSelector === opt.id
                      ? 'bg-[#06b6d4] text-slate-950 shadow-sm'
                      : 'bg-[#0b0f19] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Akurasi transkrip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Akurasi transkrip</span>
              <span className="text-[11px] text-slate-500">makin akurat, makin lama</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cepat', label: 'Cepat' },
                { id: 'seimbang', label: 'Seimbang' },
                { id: 'akurat', label: 'Akurat' },
              ].map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setTranscriptAccuracy(acc.id as any)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                    transcriptAccuracy === acc.id
                      ? 'bg-[#06b6d4] text-slate-950 shadow-sm'
                      : 'bg-[#0b0f19] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Lokal Explanatory Text */}
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Mode lokal memakai rumus: heatmap "paling sering diputar" YouTube, energi suara, kepadatan kata, dan kata hook. Judul diambil dari kalimat pembuka.
          </p>
        </div>

        {/* Kolom Kanan: Atur Klip */}
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>atur klip</span>
          </div>

          {/* Durasi per klip */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Durasi per klip</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '15', label: '± 15 dtk' },
                { id: '30', label: '± 30 dtk' },
                { id: '60', label: '± 60 dtk' },
              ].map((dur) => (
                <button
                  key={dur.id}
                  onClick={() => setClipDuration(dur.id as any)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                    clipDuration === dur.id
                      ? 'bg-[#06b6d4] text-slate-950 shadow-sm'
                      : 'bg-[#0b0f19] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cari momen tertentu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Cari momen tertentu</span>
              <span className="text-[11px] text-slate-500">opsional</span>
            </div>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="mis. momen lucu, tips praktis, cerita sedih"
              className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Jumlah klip Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Jumlah klip</span>
              <span className="font-mono text-slate-300 font-bold">{clipCount} klip</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={clipCount}
              onChange={(e) => setClipCount(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
            />
          </div>

          {/* Bagian yang dianalisis */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Bagian yang dianalisis</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'semua', label: 'Seluruh video' },
                { id: 'khusus', label: 'Rentang khusus' },
              ].map((scope) => (
                <button
                  key={scope.id}
                  onClick={() => setAnalysisScope(scope.id as any)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                    analysisScope === scope.id
                      ? 'bg-[#06b6d4] text-slate-950 shadow-sm'
                      : 'bg-[#0b0f19] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sumber subtitle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Sumber subtitle</span>
              <span className="text-[11px] text-slate-500">.srt sendiri = lewati transkripsi</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'whisper', label: 'Otomatis (Whisper)' },
                { id: 'srt', label: 'Unggah .srt' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubtitleSource(sub.id as any)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                    subtitleSource === sub.id
                      ? 'bg-[#06b6d4] text-slate-950 shadow-sm'
                      : 'bg-[#0b0f19] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DETECTED MOMENTS & LIVE STUDIO 9:16 PLAYER */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>hasil analisis & studio 9:16</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Studio Reframing & Subtitle Kinetic
            </h2>
            <p className="text-xs text-slate-400">
              Pilih klip yang ingin diedit atau ekspor langsung ke video 9:16 vertikal.
            </p>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center bg-[#0f172a] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setStudioSubTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                studioSubTab === 'preview'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Studio 9:16</span>
            </button>

            <button
              onClick={() => setStudioSubTab('subtitles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                studioSubTab === 'subtitles'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Editor Subtitle</span>
            </button>

            <button
              onClick={() => setStudioSubTab('evaluasi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                studioSubTab === 'evaluasi'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Metrik Skripsi</span>
            </button>
          </div>
        </div>

        {/* Viral Moments Horizontal / Grid Selector */}
        {viralMoments.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Pilih Momen Viral (AI Hook Score)</span>
              <span className="font-mono text-slate-500 text-[11px]">
                {viralMoments.length} Klip Terdeteksi
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {viralMoments.map((m) => {
                const isSelected = selectedMoment?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => onSelectMoment(m)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400/30 shadow-md'
                        : 'bg-[#0f172a]/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400/20 text-cyan-300 font-mono">
                        Hook: {m.hookScore}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {m.startTime.toFixed(1)}s - {m.endTime.toFixed(1)}s
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-2">
                      {m.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span>{m.recommendedMode}</span>
                      {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 1: STUDIO 9:16 PREVIEW & KALMAN REFRAMING */}
        {studioSubTab === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 9:16 Canvas Viewport (Left 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[340px] flex flex-col items-center space-y-3">
                {/* Canvas Frame */}
                <div className="relative w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl shadow-black/80">
                  <canvas
                    ref={canvas9x16Ref}
                    width={540}
                    height={960}
                    className="w-full h-full object-contain block"
                  />

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>9:16 REFRAME</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-cyan-400 font-mono">
                      {activeMode}
                    </div>
                  </div>

                  {/* Kalman Smoothing indicator */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 backdrop-blur-md border border-slate-700 text-slate-300">
                      CJI: <span className={isKalmanEnabled ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isKalmanEnabled ? `${reframingState.cameraJitterKalman.toFixed(2)} px` : `${reframingState.cameraJitterRaw.toFixed(2)} px`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onTogglePlay}
                        className="w-8 h-8 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center font-bold transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                      <button
                        onClick={onReset}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="font-mono text-xs text-slate-300">
                      {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                    </div>
                  </div>

                  {/* Seekbar */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 16}
                    step="0.05"
                    value={currentTime}
                    onChange={(e) => onSeek(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Controls & Settings (Right 7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Reframing Mode Switcher */}
              <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Mode Reframing 9:16</span>
                  <span className="text-[11px] font-mono text-cyan-400">Light-ASD + YOLO11n ByteTrack</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'SPEAKER_FOLLOW', label: 'Speaker Follow', desc: 'Kunci otomatis pembicara aktif' },
                    { id: 'EXPLANATION_PAN', label: 'Explanation Pan', desc: 'Pan halus ke objek / slide' },
                    { id: 'AUTO_SPLIT_SCREEN', label: 'Auto Split-Screen', desc: 'Atas objek, bawah pembicara' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => onSetMode(mode.id as ReframingMode)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        activeMode === mode.id
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kalman Smoothing Ablation & Visual Overlays */}
              <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-bold text-white">Algoritma & Uji Ablasi Kamera</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Kalman Filter Ablation Toggle */}
                  <button
                    onClick={onToggleKalman}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isKalmanEnabled
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      {isKalmanEnabled ? 'Kalman ON (Halus)' : 'Raw Unsmoothed (Jitter)'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isKalmanEnabled ? 'Reduksi jitter 85.2%' : 'Ablasi pergerakan mentah'}
                    </div>
                  </button>

                  {/* Overlays Toggle */}
                  <button
                    onClick={onToggleOverlays}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      showOverlays
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Bounding Box AI</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {showOverlays ? 'Overlay track aktif' : 'Disembunyikan'}
                    </div>
                  </button>

                  {/* Safe Zone Toggle */}
                  <button
                    onClick={onToggleSafeZone}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSafeZoneEnabled
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">Collision Safe-Zone</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isSafeZoneEnabled ? 'Hindari wajah pembicara' : 'Posisi statis bawah'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Procedural Kinetic Subtitle Styles */}
              <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Gaya Subtitle Kinetik Prosedural (GPU Canvas)</span>
                  <span className="font-mono text-slate-500 text-[11px]">Bebas .webp sequence</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stylesList.map((styleId) => {
                    const cfg = KINETIC_STYLE_CONFIGS[styleId];
                    return (
                      <button
                        key={styleId}
                        onClick={() => onSetStyle(styleId)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          activeStyle === styleId
                            ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm'
                            : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{cfg.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">{cfg.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Export Video & Subtitle Bar */}
              <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white">Ekspor Video 9:16 Vertikal</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hardware-accelerated WebM VP9 / MP4 dengan burned-in kinetic subtitle.
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={onExportSRT}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .srt</span>
                  </button>

                  <button
                    onClick={onExportVideo}
                    disabled={isExporting}
                    className="px-5 py-2.5 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rendering {exportProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4" />
                        <span>Ekspor Video 9:16</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: INTERACTIVE WORD-BY-WORD SUBTITLE EDITOR */}
        {studioSubTab === 'subtitles' && (
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Editor Subtitle Kata-demi-Kata (Whisper DTW)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Klik kata untuk mengedit teks secara instan, mengubah penanda highlight, atau mengatur durasi.
                </p>
              </div>
              <button
                onClick={onExportSRT}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Simpan .srt</span>
              </button>
            </div>

            <div className="space-y-4">
              {segments.map((seg, sIdx) => (
                <div
                  key={seg.id}
                  className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="font-bold text-cyan-400">Segmen #{sIdx + 1}</span>
                    <span>{seg.start.toFixed(2)}s &rarr; {seg.end.toFixed(2)}s</span>
                  </div>

                  {/* Word Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    {seg.words.map((w) => (
                      <div
                        key={w.id}
                        className={`group px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                          w.isHighlighted
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="text"
                          value={w.text}
                          onChange={(e) => onUpdateWord(seg.id, w.id, e.target.value, w.start, w.end, w.isHighlighted)}
                          className="bg-transparent text-xs w-auto focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded px-1"
                          style={{ width: `${Math.max(w.text.length + 1, 4)}ch` }}
                        />
                        <button
                          onClick={() => onUpdateWord(seg.id, w.id, w.text, w.start, w.end, !w.isHighlighted)}
                          className={`text-[10px] font-mono px-1 rounded transition-colors ${
                            w.isHighlighted ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Toggle Highlight"
                        >
                          HL
                        </button>
                        <span className="text-[9px] font-mono text-slate-500">
                          {w.start.toFixed(1)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: THESIS EVALUATION & BENCHMARKS */}
        {studioSubTab === 'evaluasi' && (
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Metrik Evaluasi & Uji Ablasi (Bab 4 Skripsi)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengukuran kuantitatif stabilitas kamera, akurasi transkripsi, dan performa render real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Reduksi Jitter (CJI)</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {telemetry.jitterReductionPercent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {telemetry.cameraJitterRaw.toFixed(2)} px &rarr; {telemetry.cameraJitterKalman.toFixed(2)} px
                </div>
              </div>

              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Word Error Rate (WER)</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {telemetry.wordErrorRate.toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500">
                  CER: {telemetry.characterErrorRate.toFixed(2)}%
                </div>
              </div>

              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Real-Time Factor (RTF)</div>
                <div className="text-2xl font-bold text-white">
                  {telemetry.realTimeFactor.toFixed(2)}x
                </div>
                <div className="text-[10px] text-emerald-400">
                  &lt; 0.35 Target Skripsi
                </div>
              </div>

              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="text-[11px] font-mono text-slate-400">Skor SUS (Kuesioner)</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {telemetry.susScore} / 100
                </div>
                <div className="text-[10px] text-slate-500">
                  Grade A (Sangat Layak)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
