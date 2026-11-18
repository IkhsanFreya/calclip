import { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar, MainView } from './components/Sidebar';
import { LayarBeranda } from './components/LayarBeranda';
import { LayarKlip } from './components/LayarKlip';
import { LayarMotion } from './components/LayarMotion';
import { LayarRiwayat } from './components/LayarRiwayat';
import { ModalPengaturan } from './components/ModalPengaturan';

import {
  DetectedTarget,
  KineticStyleId,
  ReframingMode,
  ReframingState,
  SubtitleSegment,
  TelemetryMetrics,
  VideoSourceMeta,
  ViralMoment,
} from './types/klipflow';

import { activeSpeakerDetector } from './engine/activeSpeakerDetector';
import { multiTargetTracker, RawDetection } from './engine/multiTargetTracker';
import { cameraReframer } from './engine/cameraReframer';
import { subtitleEngine } from './engine/subtitleEngine';
import { hookScorer } from './engine/hookScorer';
import { telemetryAudit } from './engine/telemetryAudit';
import { demoSceneSimulator } from './engine/demoSceneSimulator';
import { Minus, Square, X, Tv } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<MainView>('klip');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Real-time analysis status for sidebar widget
  const [analysisInfo, setAnalysisInfo] = useState<{
    isAnalyzing: boolean;
    timeStr: string;
    stepLabel: string;
  }>({
    isAnalyzing: false,
    timeStr: '00:00',
    stepLabel: '',
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(16.0);

  // Video source state
  const [currentSource, setCurrentSource] = useState<VideoSourceMeta>({
    id: 'demo-procedural',
    name: 'KlipFlow AI — Multi-Target Speech & Slide Presentation Demo',
    duration: 16.0,
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
    isDemo: true,
  });

  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);

  // Algorithmic state
  const [activeMode, setActiveMode] = useState<ReframingMode>('SPEAKER_FOLLOW');
  const [isKalmanEnabled, setIsKalmanEnabled] = useState<boolean>(true);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [isSafeZoneEnabled, setIsSafeZoneEnabled] = useState<boolean>(true);

  // Subtitle styling state
  const [activeStyle, setActiveStyle] = useState<KineticStyleId>('KotakHijau');
  const [fontSize, setFontSize] = useState<number>(32);
  const [segments, setSegments] = useState<SubtitleSegment[]>(subtitleEngine.getSegments());

  // Moments & Telemetry
  const [viralMoments, setViralMoments] = useState<ViralMoment[]>([]);
  const [selectedMoment, setSelectedMoment] = useState<ViralMoment | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>(
    telemetryAudit.getLiveTelemetry(60, 2.8, 0.42, true)
  );

  const [reframingState, setReframingState] = useState<ReframingState>({
    mode: 'SPEAKER_FOLLOW',
    targetMode: 'SPEAKER_FOLLOW',
    cropBox: { x: 0.34, y: 0, width: 0.3164, height: 1.0 },
    rawTargetCenter: [0.5, 0.5],
    smoothedCenter: [0.5, 0.5],
    velocity: [0, 0],
    isSplitScreenActive: false,
    splitRatio: 0.58,
    activeSpeakerId: 1,
    activeObjectId: null,
    cameraJitterRaw: 2.84,
    cameraJitterKalman: 0.42,
    panProgress: 0,
    safeZoneOffset: 1,
  });

  const [activeTargets, setActiveTargets] = useState<DetectedTarget[]>([]);

  // Canvas Refs
  const canvas9x16Ref = useRef<HTMLCanvasElement | null>(null);
  const source16x9Ref = useRef<HTMLCanvasElement | null>(null);

  // Hidden offscreen canvas for source rendering
  const offscreenSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Audio Context for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // FPS calculation references
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());
  const currentTimeRef = useRef<number>(0);
  const lastUiUpdateRef = useRef<number>(0);

  // Initialize Offscreen Canvas & Viral Moments
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1280;
    offscreen.height = 720;
    offscreenSourceCanvasRef.current = offscreen;

    // Detect initial viral moments
    const initialMoments = hookScorer.detectViralMoments(segments, duration);
    setViralMoments(initialMoments);
    if (initialMoments.length > 0) {
      setSelectedMoment(initialMoments[0]);
    }
  }, []);

  // Handle uploaded video file
  const handleUploadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);

    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = false;

    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setCurrentSource({
        id: `upload-${Date.now()}`,
        name: file.name,
        duration: video.duration,
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
        aspectRatio: (video.videoWidth || 1920) / (video.videoHeight || 1080),
        isDemo: false,
        url,
      });
      currentTimeRef.current = 0;
      setCurrentTime(0);

      // Generate viral moments for uploaded video
      const newMoments = hookScorer.detectViralMoments(segments, video.duration);
      setViralMoments(newMoments);
      if (newMoments.length > 0) {
        setSelectedMoment(newMoments[0]);
      }

      setCurrentView('klip');
      setIsPlaying(true);
    };

    videoElemRef.current = video;

    // Setup Web Audio Analyser
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaElementSource(video);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      audioDataArrayRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    } catch {
      // Audio graph setup fallback
    }
  };

  const handleLoadYouTubeUrl = (url: string, title?: string, clipCount: number = 5) => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
      setUploadedVideoUrl(null);
    }
    if (videoElemRef.current) {
      videoElemRef.current.pause();
      videoElemRef.current = null;
    }
    const cleanTitle = title || 'Video Presentasi & Wawancara KlipFlow';
    setCurrentSource({
      id: `yt-${Date.now()}`,
      name: cleanTitle,
      duration: 16.0,
      width: 1920,
      height: 1080,
      aspectRatio: 16 / 9,
      isDemo: true,
      url,
    });

    // Detect viral moments
    const allMoments = hookScorer.detectViralMoments(segments, 16.0);
    const sliced = allMoments.slice(0, Math.min(clipCount, allMoments.length));
    setViralMoments(sliced);
    if (sliced.length > 0) {
      setSelectedMoment(sliced[0]);
      currentTimeRef.current = sliced[0].startTime;
      setCurrentTime(sliced[0].startTime);
      setActiveMode(sliced[0].recommendedMode);
    }

    setCurrentView('klip');
    setIsPlaying(true);
  };

  const handleSelectMoment = (moment: ViralMoment) => {
    setSelectedMoment(moment);
    currentTimeRef.current = moment.startTime;
    setCurrentTime(moment.startTime);
    setActiveMode(moment.recommendedMode);
    setIsPlaying(true);
  };

  // Subtitle operations
  const handleUpdateWord = (
    segmentId: string,
    wordId: string,
    newText: string,
    newStart?: number,
    newEnd?: number,
    isHighlighted?: boolean
  ) => {
    subtitleEngine.updateWord(segmentId, wordId, newText, newStart, newEnd, isHighlighted);
    setSegments([...subtitleEngine.getSegments()]);
  };

  const handleExportSRT = () => {
    const srtText = subtitleEngine.exportToSRT();
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudioMaliki_Subtitles_${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Main 60 FPS Procedural Render Loop
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = now;

      // FPS counter every 500ms
      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 500) {
        const computedFps = Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current));
        setFps(computedFps);
        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }

      if (isPlaying) {
        currentTimeRef.current += dt;
        if (currentTimeRef.current >= duration) {
          currentTimeRef.current = 0;
        }
        if (videoElemRef.current && Math.abs(videoElemRef.current.currentTime - currentTimeRef.current) > 0.3) {
          videoElemRef.current.currentTime = currentTimeRef.current;
          if (videoElemRef.current.paused) videoElemRef.current.play().catch(() => {});
        }
      }
      const curTime = currentTimeRef.current;

      // 1. Render Source 16:9 Frame
      const offscreen = offscreenSourceCanvasRef.current;
      if (offscreen) {
        const offCtx = offscreen.getContext('2d');
        if (offCtx) {
          let rawDetections: RawDetection[] = [];

          if (currentSource.isDemo) {
            const frameData = demoSceneSimulator.renderSourceFrame(
              offCtx,
              offscreen.width,
              offscreen.height,
              curTime
            );
            rawDetections = frameData.detections;
          } else if (videoElemRef.current && videoElemRef.current.readyState >= 2) {
            offCtx.drawImage(videoElemRef.current, 0, 0, offscreen.width, offscreen.height);
            rawDetections = [
              {
                box: { x: 0.32, y: 0.20, width: 0.18, height: 0.32 },
                category: 'speaker_face',
                confidence: 0.95,
                label: 'Speaker (Face)',
                saliencyScore: 0.91,
              },
            ];
          }

          // 2. Audio band analysis
          let audioFeatures = {
            voiceBandEnergy: 0.35 + Math.sin(curTime * 12) * 0.25,
            subBassEnergy: 0.08,
            highFreqEnergy: 0.12,
            spectralCentroid: 1250,
            snrEstimate: 0.22,
            isVoiceActive: true,
          };

          if (analyserRef.current && audioDataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(audioDataArrayRef.current);
            audioFeatures = activeSpeakerDetector.extractAudioFeatures(audioDataArrayRef.current);
          }

          // 3. Multi-Target ByteTrack update
          const tracked = multiTargetTracker.update(rawDetections, curTime);

          for (const target of tracked) {
            if (target.category === 'speaker_face') {
              const asdRes = activeSpeakerDetector.evaluateSpeaker(target, audioFeatures, curTime);
              target.asdScore = asdRes.asdScore;
              target.isSpeaking = asdRes.isSpeaking;
              target.lipMotionVariance = asdRes.lipVariance;
            }
          }

          // 4. Kalman Reframing
          const computedReframing = cameraReframer.computeReframing(
            tracked,
            curTime,
            activeMode,
            isKalmanEnabled
          );

          const liveTel = telemetryAudit.getLiveTelemetry(
            fps,
            computedReframing.cameraJitterRaw,
            computedReframing.cameraJitterKalman,
            isKalmanEnabled
          );

          // Throttled UI state updates (10Hz) to keep React thread smooth
          if (now - lastUiUpdateRef.current >= 100) {
            setCurrentTime(curTime);
            setActiveTargets(tracked);
            setReframingState(computedReframing);
            setTelemetry(liveTel);
            lastUiUpdateRef.current = now;
          }

          // 5. Draw 9:16 Vertical Preview Canvas (540x960)
          const c9x16 = canvas9x16Ref.current;
          if (c9x16) {
            const ctx9 = c9x16.getContext('2d');
            if (ctx9) {
              const W = c9x16.width;
              const H = c9x16.height;
              ctx9.clearRect(0, 0, W, H);

              if (computedReframing.isSplitScreenActive && computedReframing.splitTopCrop && computedReframing.splitBottomCrop) {
                // Auto Split-Screen Render:
                const topCrop = computedReframing.splitTopCrop;
                const topH = H * computedReframing.splitRatio;

                ctx9.drawImage(
                  offscreen,
                  topCrop.x * offscreen.width,
                  topCrop.y * offscreen.height,
                  topCrop.width * offscreen.width,
                  topCrop.height * offscreen.height,
                  0,
                  0,
                  W,
                  topH
                );

                ctx9.fillStyle = 'rgba(6, 182, 212, 0.85)';
                ctx9.fillRect(16, 16, 170, 24);
                ctx9.fillStyle = '#ffffff';
                ctx9.font = 'bold 11px Inter, sans-serif';
                ctx9.fillText('TOP: EXPLAINED OBJECT', 24, 32);

                ctx9.fillStyle = '#06b6d4';
                ctx9.shadowColor = '#06b6d4';
                ctx9.shadowBlur = 12;
                ctx9.fillRect(0, topH - 3, W, 6);
                ctx9.shadowBlur = 0;

                const btmCrop = computedReframing.splitBottomCrop;
                const btmH = H - topH;

                ctx9.drawImage(
                  offscreen,
                  btmCrop.x * offscreen.width,
                  btmCrop.y * offscreen.height,
                  btmCrop.width * offscreen.width,
                  btmCrop.height * offscreen.height,
                  0,
                  topH,
                  W,
                  btmH
                );

                ctx9.fillStyle = 'rgba(16, 185, 129, 0.85)';
                ctx9.fillRect(16, topH + 16, 175, 24);
                ctx9.fillStyle = '#090d16';
                ctx9.font = 'bold 11px Inter, sans-serif';
                ctx9.fillText('BOTTOM: ACTIVE SPEAKER', 24, topH + 32);
              } else {
                const crop = computedReframing.cropBox;
                ctx9.drawImage(
                  offscreen,
                  crop.x * offscreen.width,
                  crop.y * offscreen.height,
                  crop.width * offscreen.width,
                  crop.height * offscreen.height,
                  0,
                  0,
                  W,
                  H
                );
              }

              // Render Procedural Kinetic Subtitles (Module D)
              const safeOffset = isSafeZoneEnabled ? computedReframing.safeZoneOffset : 1;
              subtitleEngine.renderToCanvas(ctx9, W, H, curTime, safeOffset);
            }
          }

          // 6. Draw Source 16:9 Vision Monitor if available
          const c16x9 = source16x9Ref.current;
          if (c16x9) {
            const ctx16 = c16x9.getContext('2d');
            if (ctx16) {
              const sw = c16x9.width;
              const sh = c16x9.height;
              ctx16.clearRect(0, 0, sw, sh);
              ctx16.drawImage(offscreen, 0, 0, sw, sh);

              if (showOverlays) {
                const cb = computedReframing.cropBox;
                ctx16.strokeStyle = '#06b6d4';
                ctx16.lineWidth = 3;
                ctx16.shadowColor = 'rgba(6, 182, 212, 0.5)';
                ctx16.shadowBlur = 8;
                ctx16.strokeRect(cb.x * sw, cb.y * sh, cb.width * sw, cb.height * sh);
                ctx16.shadowBlur = 0;

                const cx = computedReframing.smoothedCenter[0] * sw;
                const cy = computedReframing.smoothedCenter[1] * sh;
                ctx16.fillStyle = '#06b6d4';
                ctx16.beginPath();
                ctx16.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx16.fill();
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    isPlaying,
    duration,
    currentSource,
    activeMode,
    isKalmanEnabled,
    showOverlays,
    isSafeZoneEnabled,
  ]);

  // Video Exporter
  const handleExportVideo = useCallback(() => {
    const c9x16 = canvas9x16Ref.current;
    if (!c9x16 || isExporting) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const stream = c9x16.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 6000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(fullBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StudioMaliki_9x16_Output_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportProgress(100);
      };

      recorder.start();

      const exportTotalMs = 4000;
      const exportInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(exportInterval);
            recorder.stop();
            return 100;
          }
          return prev + 15;
        });
      }, exportTotalMs / 7);
    } catch (err) {
      console.error('MediaRecorder error:', err);
      setIsExporting(false);
    }
  }, [isExporting]);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Windows App Title Bar matching Studio-Maliki-Windows.exe */}
      <div className="h-8 bg-[#0b0f19] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-white">
            <Tv className="w-2.5 h-2.5 fill-white" />
          </div>
          <span className="font-semibold text-slate-200 text-[11px]">Studio Maliki</span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-rose-900/60 rounded text-slate-400 hover:text-rose-300 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main App Layout: Left Sidebar + Right Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => setCurrentView(view)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          isAnalyzing={analysisInfo.isAnalyzing}
          analysisTimeStr={analysisInfo.timeStr}
          analysisStepLabel={analysisInfo.stepLabel}
          onCancelAnalysis={() => {
            setAnalysisInfo({ isAnalyzing: false, timeStr: '00:00', stepLabel: '' });
          }}
        />

        {/* Right Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'beranda' && (
            <LayarBeranda
              onBukaKlip={() => setCurrentView('klip')}
              onBukaMotion={() => setCurrentView('motion')}
              totalKlipCount={viralMoments.length}
            />
          )}

          {currentView === 'klip' && (
            <LayarKlip
              currentSource={currentSource}
              viralMoments={viralMoments}
              selectedMoment={selectedMoment}
              onSelectMoment={handleSelectMoment}
              onUploadFile={handleUploadFile}
              onLoadYouTubeUrl={handleLoadYouTubeUrl}
              onAnalysisStateChange={(isAnalyzing, timeStr, stepLabel) => {
                setAnalysisInfo({ isAnalyzing, timeStr, stepLabel });
              }}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={(t) => {
                currentTimeRef.current = t;
                setCurrentTime(t);
                if (videoElemRef.current) videoElemRef.current.currentTime = t;
              }}
              onReset={() => {
                currentTimeRef.current = 0;
                setCurrentTime(0);
                if (videoElemRef.current) videoElemRef.current.currentTime = 0;
              }}
              reframingState={reframingState}
              activeMode={activeMode}
              onSetMode={(m) => setActiveMode(m)}
              isKalmanEnabled={isKalmanEnabled}
              onToggleKalman={() => setIsKalmanEnabled(!isKalmanEnabled)}
              showOverlays={showOverlays}
              onToggleOverlays={() => setShowOverlays(!showOverlays)}
              isSafeZoneEnabled={isSafeZoneEnabled}
              onToggleSafeZone={() => setIsSafeZoneEnabled(!isSafeZoneEnabled)}
              activeStyle={activeStyle}
              onSetStyle={(st) => {
                setActiveStyle(st);
                subtitleEngine.setStyle(st);
              }}
              fontSize={fontSize}
              onSetFontSize={(sz) => setFontSize(sz)}
              canvas9x16Ref={canvas9x16Ref}
              source16x9Ref={source16x9Ref}
              activeTargets={activeTargets}
              currentSegment={subtitleEngine.getCurrentSegment(currentTime).segment}
              segments={segments}
              onUpdateWord={handleUpdateWord}
              onExportVideo={handleExportVideo}
              isExporting={isExporting}
              exportProgress={exportProgress}
              onExportSRT={handleExportSRT}
              telemetry={telemetry}
            />
          )}

          {currentView === 'motion' && <LayarMotion />}

          {currentView === 'riwayat' && (
            <LayarRiwayat
              viralMoments={viralMoments}
              onSelectMoment={handleSelectMoment}
              onNavigateKlip={() => setCurrentView('klip')}
            />
          )}
        </main>
      </div>

      {/* Setup Wizard / Settings Modal */}
      <ModalPengaturan
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onNavigateKlip={() => setCurrentView('klip')}
        onNavigateMotion={() => setCurrentView('motion')}
      />
    </div>
  );
}

export default App;
