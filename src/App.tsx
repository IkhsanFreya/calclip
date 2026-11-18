import { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ClipFinderTab } from './components/ClipFinderTab';
import { StudioTab } from './components/StudioTab';
import { TimelineEditorTab } from './components/TimelineEditorTab';
import { ThesisEvaluationTab } from './components/ThesisEvaluationTab';

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

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');
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
  const [activeStyle, setActiveStyle] = useState<KineticStyleId>('LimeBox');
  const [fontSize, setFontSize] = useState<number>(32);
  const [segments, setSegments] = useState<SubtitleSegment[]>(subtitleEngine.getSegments());

  // Moments & Telemetry
  const [viralMoments, setViralMoments] = useState<ViralMoment[]>([]);
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

  // Audio Context for real audio analysis (Web Audio API)
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // FPS calculation references
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());

  // Initialize Offscreen Canvas & Viral Moments
  useEffect(() => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1280;
    offscreen.height = 720;
    offscreenSourceCanvasRef.current = offscreen;

    // Detect initial viral moments
    const initialMoments = hookScorer.detectViralMoments(segments, duration);
    setViralMoments(initialMoments);
  }, []);

  // Update moments when segments or duration change
  useEffect(() => {
    const moments = hookScorer.detectViralMoments(segments, duration);
    setViralMoments(moments);
  }, [segments, duration]);

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
      setCurrentTime(0);
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

  const handleSelectDemo = () => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
      setUploadedVideoUrl(null);
    }
    if (videoElemRef.current) {
      videoElemRef.current.pause();
      videoElemRef.current = null;
    }
    setDuration(16.0);
    setCurrentSource({
      id: 'demo-procedural',
      name: 'KlipFlow AI — Multi-Target Speech & Slide Presentation Demo',
      duration: 16.0,
      width: 1920,
      height: 1080,
      aspectRatio: 16 / 9,
      isDemo: true,
    });
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSelectMoment = (moment: ViralMoment) => {
    setCurrentTime(moment.startTime);
    setActiveMode(moment.recommendedMode);
    setActiveTab('studio');
    setIsPlaying(true);
  };

  // Subtitle operations
  const handleUpdateWord = (
    segmentId: string,
    wordId: string,
    newText: string,
    newStart?: number,
    newEnd?: number,
    isHighlighted?: boolean,
    emoji?: string
  ) => {
    subtitleEngine.updateWord(segmentId, wordId, newText, newStart, newEnd, isHighlighted, emoji);
    setSegments([...subtitleEngine.getSegments()]);
  };

  const handleImportSRT = (content: string) => {
    subtitleEngine.importFromSRT(content);
    setSegments([...subtitleEngine.getSegments()]);
  };

  const handleExportSRT = () => {
    const srtText = subtitleEngine.exportToSRT();
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KlipFlow_Subtitles_${Date.now()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonText = subtitleEngine.exportToJSON();
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KlipFlow_Words_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Main 60 FPS Procedural Render Loop
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      // Advance playback time
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = now;

      // Update FPS counter every 500ms
      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 500) {
        const computedFps = Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current));
        setFps(computedFps);
        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }

      if (isPlaying) {
        setCurrentTime((prevTime) => {
          let nextTime = prevTime + dt;
          if (nextTime >= duration) {
            nextTime = 0; // Loop seamlessly
          }
          if (videoElemRef.current && Math.abs(videoElemRef.current.currentTime - nextTime) > 0.3) {
            videoElemRef.current.currentTime = nextTime;
            if (videoElemRef.current.paused) videoElemRef.current.play().catch(() => {});
          }
          return nextTime;
        });
      }

      // 1. Render Source 16:9 Frame
      const offscreen = offscreenSourceCanvasRef.current;
      if (offscreen) {
        const offCtx = offscreen.getContext('2d');
        if (offCtx) {
          let rawDetections: RawDetection[] = [];

          if (currentSource.isDemo) {
            // Render demo procedural scene
            const frameData = demoSceneSimulator.renderSourceFrame(
              offCtx,
              offscreen.width,
              offscreen.height,
              currentTime
            );
            rawDetections = frameData.detections;
          } else if (videoElemRef.current && videoElemRef.current.readyState >= 2) {
            // Draw uploaded video
            offCtx.drawImage(videoElemRef.current, 0, 0, offscreen.width, offscreen.height);
            // Simulated AI detections on uploaded video
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
            voiceBandEnergy: 0.35 + Math.sin(currentTime * 12) * 0.25,
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
          const tracked = multiTargetTracker.update(rawDetections, currentTime);

          // Evaluate Active Speaker Detector (Light-ASD)
          for (const target of tracked) {
            if (target.category === 'speaker_face') {
              const asdRes = activeSpeakerDetector.evaluateSpeaker(target, audioFeatures, currentTime);
              target.asdScore = asdRes.asdScore;
              target.isSpeaking = asdRes.isSpeaking;
              target.lipMotionVariance = asdRes.lipVariance;
            }
          }
          setActiveTargets(tracked);

          // 4. Kalman Reframing & Auto Split-Screen Decision
          const computedReframing = cameraReframer.computeReframing(
            tracked,
            currentTime,
            activeMode,
            isKalmanEnabled
          );
          setReframingState(computedReframing);

          // Update live telemetry metrics
          const liveTel = telemetryAudit.getLiveTelemetry(
            fps,
            computedReframing.cameraJitterRaw,
            computedReframing.cameraJitterKalman,
            isKalmanEnabled
          );
          setTelemetry(liveTel);

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
                // Top (58%): Explained Object / Wide Context
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

                // Top label overlay
                ctx9.fillStyle = 'rgba(6, 182, 212, 0.85)';
                ctx9.fillRect(16, 16, 170, 24);
                ctx9.fillStyle = '#ffffff';
                ctx9.font = 'bold 11px Inter, sans-serif';
                ctx9.fillText('TOP: EXPLAINED OBJECT', 24, 32);

                // Split divider bar with neon glow
                ctx9.fillStyle = '#06b6d4';
                ctx9.shadowColor = '#06b6d4';
                ctx9.shadowBlur = 12;
                ctx9.fillRect(0, topH - 3, W, 6);
                ctx9.shadowBlur = 0;

                // Bottom (42%): Active Speaker Close-up
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

                // Bottom label overlay
                ctx9.fillStyle = 'rgba(163, 230, 53, 0.85)';
                ctx9.fillRect(16, topH + 16, 175, 24);
                ctx9.fillStyle = '#090d16';
                ctx9.font = 'bold 11px Inter, sans-serif';
                ctx9.fillText('BOTTOM: ACTIVE SPEAKER', 24, topH + 32);
              } else {
                // Single 9:16 Crop Render
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
              subtitleEngine.renderToCanvas(ctx9, W, H, currentTime, safeOffset);
            }
          }

          // 6. Draw Source 16:9 Vision Monitor with Overlays
          const c16x9 = source16x9Ref.current;
          if (c16x9) {
            const ctx16 = c16x9.getContext('2d');
            if (ctx16) {
              const sw = c16x9.width;
              const sh = c16x9.height;
              ctx16.clearRect(0, 0, sw, sh);

              // Draw base video frame
              ctx16.drawImage(offscreen, 0, 0, sw, sh);

              if (showOverlays) {
                // Draw 9:16 Crop Window Viewport Box (Lime outline)
                const cb = computedReframing.cropBox;
                ctx16.strokeStyle = '#a3e635';
                ctx16.lineWidth = 3;
                ctx16.shadowColor = 'rgba(163, 230, 53, 0.5)';
                ctx16.shadowBlur = 8;
                ctx16.strokeRect(cb.x * sw, cb.y * sh, cb.width * sw, cb.height * sh);
                ctx16.shadowBlur = 0;

                // Viewport center target point
                const cx = computedReframing.smoothedCenter[0] * sw;
                const cy = computedReframing.smoothedCenter[1] * sh;
                ctx16.fillStyle = '#a3e635';
                ctx16.beginPath();
                ctx16.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx16.fill();

                // Draw Tracked Bounding Boxes
                for (const t of tracked) {
                  const bx = t.box.x * sw;
                  const by = t.box.y * sh;
                  const bw = t.box.width * sw;
                  const bh = t.box.height * sh;

                  let boxColor = '#38bdf8'; // Cyan for objects
                  if (t.category === 'speaker_face') {
                    boxColor = t.isSpeaking ? '#a3e635' : '#f59e0b'; // Lime if speaking, Amber if silent
                  } else if (t.category === 'speaker_hand_gesture') {
                    boxColor = '#ec4899'; // Pink for gesture
                  }

                  ctx16.strokeStyle = boxColor;
                  ctx16.lineWidth = 2;
                  ctx16.strokeRect(bx, by, bw, bh);

                  // Label tag badge
                  ctx16.fillStyle = 'rgba(15, 23, 42, 0.85)';
                  ctx16.fillRect(bx, by - 22, 140, 20);
                  ctx16.fillStyle = boxColor;
                  ctx16.font = 'bold 11px Inter, sans-serif';
                  ctx16.fillText(
                    `ID#${t.id} ${t.category === 'speaker_face' ? (t.isSpeaking ? '🗣️ TALK' : 'SILENT') : 'OBJ'}`,
                    bx + 6,
                    by - 8
                  );
                }
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
    currentTime,
    duration,
    currentSource,
    activeMode,
    isKalmanEnabled,
    showOverlays,
    isSafeZoneEnabled,
    fps,
  ]);

  // Hardware-Accelerated Video Exporter (WebM via Canvas MediaRecorder)
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
        a.download = `KlipFlow_9x16_Output_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setExportProgress(100);
      };

      recorder.start();

      // Record for 6 seconds as a high-quality demonstration clip
      const exportTotalMs = 6000;
      const exportInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(exportInterval);
            recorder.stop();
            return 100;
          }
          return prev + 10;
        });
      }, exportTotalMs / 10);
    } catch (err) {
      console.error('MediaRecorder error:', err);
      setIsExporting(false);
    }
  }, [isExporting]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Universal Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fps={fps}
        isKalmanActive={isKalmanEnabled}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6">
        {activeTab === 'clipFinder' && (
          <ClipFinderTab
            currentSource={currentSource}
            onSelectDemo={handleSelectDemo}
            onUploadFile={handleUploadFile}
            viralMoments={viralMoments}
            onSelectMoment={handleSelectMoment}
          />
        )}

        {activeTab === 'studio' && (
          <StudioTab
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onSeek={(t) => setCurrentTime(t)}
            onReset={() => setCurrentTime(0)}
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
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineEditorTab
            segments={segments}
            onUpdateWord={handleUpdateWord}
            onImportSRT={handleImportSRT}
            onExportSRT={handleExportSRT}
            onExportJSON={handleExportJSON}
            onSeek={(t) => setCurrentTime(t)}
            currentTime={currentTime}
          />
        )}

        {activeTab === 'thesis' && (
          <ThesisEvaluationTab
            telemetry={telemetry}
            isKalmanActive={isKalmanEnabled}
            onExportVideo={handleExportVideo}
            isExporting={isExporting}
            exportProgress={exportProgress}
          />
        )}
      </main>
    </div>
  );
}

export default App;
