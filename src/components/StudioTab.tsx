import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import {
  DetectedTarget,
  KineticStyleId,
  ReframingMode,
  ReframingState,
  SubtitleSegment,
} from '../types/klipflow';
import { KINETIC_STYLE_CONFIGS } from '../engine/subtitleEngine';

interface StudioTabProps {
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
}

export const StudioTab: React.FC<StudioTabProps> = ({
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
  fontSize,
  onSetFontSize,
  canvas9x16Ref,
  source16x9Ref,
  activeTargets,
  currentSegment,
}) => {
  const stylesList: KineticStyleId[] = [
    'KotakHijau',
    'Neon',
    'Sapuan',
    'KertasSobek',
    'SerifElegan',
    'KaraokePop',
  ];

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const getSafeZoneLabel = (offset: number) => {
    if (offset === -1) return { text: 'Top Safe-Zone', color: 'text-amber-400 bg-amber-400/10' };
    if (offset === 0) return { text: 'Center Safe-Zone', color: 'text-cyan-400 bg-cyan-400/10' };
    return { text: 'Bottom Normal', color: 'text-lime-400 bg-lime-400/10' };
  };

  const safeZoneBadge = getSafeZoneLabel(reframingState.safeZoneOffset);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Main Studio Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 9:16 Vertical Video Preview (60 FPS Procedural Output) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center">
            {/* 9:16 Canvas Frame with iPhone/TikTok Aspect Ratio & Notch */}
            <div className="relative w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl shadow-black/80 ring-1 ring-slate-600/30">
              <canvas
                ref={canvas9x16Ref}
                width={540}
                height={960}
                className="w-full h-full object-contain block"
              />

              {/* Status Header Overlay inside 9:16 canvas */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                  <span>9:16 REFRAME</span>
                </div>

                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${safeZoneBadge.color}`}>
                  {safeZoneBadge.text}
                </div>
              </div>

              {/* Mode indicator badge */}
              <div className="absolute bottom-3 left-3 pointer-events-none">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-200">
                  {reframingState.mode}
                </span>
              </div>

              {/* Kalman Jitter Real-time Badge */}
              <div className="absolute bottom-3 right-3 pointer-events-none font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-slate-300">
                CJI: <span className={isKalmanEnabled ? 'text-lime-400' : 'text-amber-400 font-bold'}>
                  {isKalmanEnabled ? reframingState.cameraJitterKalman.toFixed(2) : reframingState.cameraJitterRaw.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Sub-label & Live Subtitle Preview under vertical preview */}
            <div className="w-full mt-2 text-center space-y-1">
              <p className="text-[11px] text-slate-400 font-mono">
                60 FPS Procedural Canvas2D Output • Native Zero-Python
              </p>
              {currentSegment && (
                <div className="text-xs text-lime-400 bg-slate-900/90 border border-slate-800 rounded-lg py-1 px-2.5 truncate font-semibold">
                  "{currentSegment.text}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Source 16:9 Vision Track Monitor & Algorithmic Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Source 16:9 Monitor with Multi-Target Bounding Boxes & Crop Window Overlay */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Source 16:9 Multimodal Vision Tracker (Input Frame)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {activeTargets.length} Targets Tracked
              </span>
            </div>

            <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <canvas
                ref={source16x9Ref}
                width={960}
                height={540}
                className="w-full h-full object-contain block"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono text-cyan-300 border border-cyan-800/50">
                YOLO11n + ByteTrack + Light-ASD
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Cyan/Yellow Box: Target Bounding Box</span>
              <span className="text-lime-400 font-medium">Lime Border: 9:16 Kalman Viewport</span>
            </div>
          </div>

          {/* Master Transport Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={onTogglePlay}
                className="w-10 h-10 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-lime-400/20 transition-all active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={onReset}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-all"
                title="Reset to 0s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Timeline Scrubber */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-lime-400 font-bold">{formatSec(currentTime)}</span>
                  <span>{formatSec(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.05}
                  value={currentTime}
                  onChange={(e) => onSeek(Number(e.target.value))}
                  className="w-full accent-lime-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Algorithmic Reframing Modes (The Core Thesis Triad) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-lime-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Reframing Mode Selection (Dynamic Decision Triad)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">3 Skripsi Modes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onSetMode('SPEAKER_FOLLOW')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeMode === 'SPEAKER_FOLLOW'
                    ? 'bg-lime-400/10 border-lime-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                  <span>Speaker Follow</span>
                  {activeMode === 'SPEAKER_FOLLOW' && <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Locks smoothly onto primary active speaker via Light-ASD score.
                </p>
              </button>

              <button
                onClick={() => onSetMode('EXPLANATION_PAN')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeMode === 'EXPLANATION_PAN'
                    ? 'bg-purple-400/10 border-purple-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                  <span>Explanation Pan</span>
                  {activeMode === 'EXPLANATION_PAN' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pans toward whiteboard/slide/product when gestured, then returns.
                </p>
              </button>

              <button
                onClick={() => onSetMode('AUTO_SPLIT_SCREEN')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeMode === 'AUTO_SPLIT_SCREEN'
                    ? 'bg-cyan-400/10 border-cyan-400 text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                  <span>Auto Split-Screen</span>
                  {activeMode === 'AUTO_SPLIT_SCREEN' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Splits into Top (Object 58%) and Bottom (Speaker 42%) when distance &gt; 42%.
                </p>
              </button>
            </div>
          </div>

          {/* Ablation Toggles & Safe-Zone Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Thesis Ablation Study & Collision Controls
              </span>
              <span className="text-[10px] font-mono text-slate-400">Interactive Toggles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Kalman Toggle */}
              <button
                onClick={onToggleKalman}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  isKalmanEnabled
                    ? 'bg-emerald-400/10 border-emerald-400/50 text-emerald-300'
                    : 'bg-amber-400/10 border-amber-400/50 text-amber-300'
                }`}
              >
                <span>Kalman Smoothing:</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-950 border border-current">
                  {isKalmanEnabled ? 'FILTER ON' : 'RAW ABLATION'}
                </span>
              </button>

              {/* Overlays Toggle */}
              <button
                onClick={onToggleOverlays}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  showOverlays
                    ? 'bg-cyan-400/10 border-cyan-400/50 text-cyan-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <span>Vision Bounding Boxes:</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-950 border border-current">
                  {showOverlays ? 'SHOW' : 'HIDE'}
                </span>
              </button>

              {/* Collision-Aware Safe Zone Toggle */}
              <button
                onClick={onToggleSafeZone}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  isSafeZoneEnabled
                    ? 'bg-lime-400/10 border-lime-400/50 text-lime-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <span>Collision Safe-Zone:</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-950 border border-current">
                  {isSafeZoneEnabled ? 'ACTIVE' : 'FIXED BOTTOM'}
                </span>
              </button>
            </div>
          </div>

          {/* Kinetic Typography Styles (6 Procedural Styles) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  6 Procedural Kinetic Typography Styles (Zero-WebP)
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Size: {fontSize}px</span>
                <input
                  type="range"
                  min={20}
                  max={46}
                  value={fontSize}
                  onChange={(e) => onSetFontSize(Number(e.target.value))}
                  className="w-20 accent-lime-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stylesList.map((stId) => {
                const conf = KINETIC_STYLE_CONFIGS[stId];
                const isSelected = activeStyle === stId;
                return (
                  <button
                    key={stId}
                    onClick={() => onSetStyle(stId)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-lime-400/10 border-lime-400 text-white shadow-md shadow-lime-400/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{conf.name}</span>
                      </span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{conf.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
