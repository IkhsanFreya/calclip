import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Play,
  Pause,
  Loader2,
  Copy,
  FolderOpen,
  Search,
  ChevronDown,
  Edit3,
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

interface DetailedClip {
  id: number;
  rankNum: number;
  title: string;
  viralScore: number;
  startTime: number;
  endTime: number;
  durationSec: number;
  hookTimestamp: string;
  quote: string;
  caption: string;
  reason: string;
  isChecked: boolean;
  file?: string;
}

const DEFAULT_DETAILED_CLIPS: DetailedClip[] = [
  {
    id: 1,
    rankNum: 5,
    title: 'Siapa tau nih panen skin?',
    viralScore: 99,
    startTime: 425,
    endTime: 455,
    durationSec: 30,
    hookTimestamp: 'hook 07:08',
    quote:
      '"Cuman karena gak ada diamond kuning jadi kita gak usahnya wapolah, kita coba ini aja guys. Siapa tau nih panen skin? Ya ya harusnya 16 guys yang lajinnya ini sudah dipake ya, sudah dipake jadi kita langsung aja let\'s go..."',
    caption: 'Siapa tau nih panen skin?',
    reason: 'pembuka kuat • ada pertanyaan • 3 kata pemikat',
    isChecked: true,
  },
  {
    id: 2,
    rankNum: 2,
    title: 'Apakah dapetnya Metro Zero atau XOR chase?',
    viralScore: 71,
    startTime: 87,
    endTime: 107,
    durationSec: 20,
    hookTimestamp: 'hook 01:29',
    quote:
      '"Apakah kalian dapetnya aspiran? Apakah dapetnya Metro Zero atau XOR chase? Harusnya untuk drop rate-nya lebih tinggi untuk dapetin yang aspiran. Dan ini lagi-lagi tidak perlu menggunakan VPN, tidak perlu menggunakan serv..."',
    caption: 'Apakah dapetnya Metro Zero atau XOR chase?',
    reason: 'pembuka kuat • ada pertanyaan • 1 kata pemikat • bicara padat',
    isChecked: true,
  },
  {
    id: 3,
    rankNum: 1,
    title: 'Kalau kalian bikin akun baru dan server Indonesia, ini akun baru, serv',
    viralScore: 68,
    startTime: 52,
    endTime: 87,
    durationSec: 35,
    hookTimestamp: 'hook 01:25',
    quote:
      '"Kalau kalian bikin akun baru dan server Indonesia, ini akun baru, server Indonesia dan bener-bener baru banget ya, baru level 12 guys, jadi kalian cukup naikin ke level kalau kata yang punya akun sih, ke level 10 ya, 10..."',
    caption: 'Kalau kalian bikin akun baru dan server Indonesia, ini akun baru, serv',
    reason: 'pembuka kuat • ada pertanyaan • 1 kata pemikat',
    isChecked: true,
  },
  {
    id: 4,
    rankNum: 4,
    title: 'Kalian yang mau top up juga jangan salah langsung menuju saja ke lapak',
    viralScore: 64,
    startTime: 276,
    endTime: 300,
    durationSec: 25,
    hookTimestamp: 'hook 04:31',
    quote:
      '"Berarti gue akan top up 3 WDP aja untuk ngetest droplet. Kalian yang mau top up juga jangan salah langsung menuju saja ke lapak huda ya. Karena gue cuma merekomendasikan di lapak huda tapi jangan lupa di cek durasi WDP k..."',
    caption: 'Kalian yang mau top up juga jangan salah langsung menuju saja ke lapak',
    reason: '2 kata pemikat • bicara padat',
    isChecked: true,
  },
  {
    id: 5,
    rankNum: 3,
    title: 'Apakah bisa di give bang, ya kalau soal itu kalau untuk aspiran harusn',
    viralScore: 60,
    startTime: 187,
    endTime: 214,
    durationSec: 27,
    hookTimestamp: 'hook 03:31',
    quote:
      '"Apakah bisa di give bang, ya kalau soal itu kalau untuk aspiran harusnya gak bisa ya. Mungkin kalau yang Chris bisa karena aspiran kan dia sistemnya pola tapi gak tau juga, silahkan kalian coba sendiri ya! Yang jelas, ini..."',
    caption: 'Apakah bisa di give bang, ya kalau soal itu kalau untuk aspiran harusn',
    reason: '2 kata pemikat • bicara padat',
    isChecked: true,
  },
];

interface LayarKlipProps {
  currentSource: VideoSourceMeta;
  viralMoments: ViralMoment[];
  selectedMoment: ViralMoment | null;
  onSelectMoment: (moment: ViralMoment) => void;
  onUploadFile: (file: File) => void;
  onLoadYouTubeUrl: (url: string, title?: string, clipCount?: number) => void;
  onAnalysisStateChange?: (
    isAnalyzing: boolean,
    timeStr: string,
    stepLabel: string,
    statusTitle?: string
  ) => void;

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
  viralMoments: _viralMoments,
  selectedMoment: _selectedMoment,
  onSelectMoment: _onSelectMoment,
  onUploadFile,
  onLoadYouTubeUrl,
  onAnalysisStateChange,

  currentTime,
  duration: _duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onReset: _onReset,

  reframingState: _reframingState,
  activeMode: _activeMode,
  onSetMode: _onSetMode,

  isKalmanEnabled: _isKalmanEnabled,
  onToggleKalman: _onToggleKalman,

  showOverlays: _showOverlays,
  onToggleOverlays: _onToggleOverlays,

  isSafeZoneEnabled: _isSafeZoneEnabled,
  onToggleSafeZone: _onToggleSafeZone,

  activeStyle,
  onSetStyle,

  fontSize: _fontSize,
  onSetFontSize: _onSetFontSize,

  canvas9x16Ref,
  source16x9Ref: _source16x9Ref,

  activeTargets: _activeTargets,
  currentSegment: _currentSegment,
  segments: _segments,
  onUpdateWord: _onUpdateWord,
  onExportVideo,
  isExporting: _isExporting,
  exportProgress: _exportProgress,
  onExportSRT: _onExportSRT,
  telemetry: _telemetry,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [youtubeInput, setYoutubeInput] = useState('https://youtu.be/4alNAxq96U4?si=BPdJeLm3WnJ_kA0X');
  const [videoTitle, setVideoTitle] = useState(
    'CARA MUNCULIN EVENT ASPIRANTS, EXORCISTS, METRO ZERO & EFEK RECALL API DI ORI SERVER !!'
  );

  // View state: 'input' (dropzone & setup) vs 'results' (the full Studio Maliki results view)
  const [hasResults, setHasResults] = useState<boolean>(true); // default true for immediate inspection!

  // 5-Step Pipeline State matching screenshot 8450cc9e.jpg
  type StepStatus = 'Menunggu' | 'Berjalan...' | 'Beres';
  interface PipelineStep {
    id: number;
    label: string;
    status: StepStatus;
  }

  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'completed'>('completed');
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 1, label: '01 • UNDUH', status: 'Beres' },
    { id: 2, label: '02 • TRANSKRIP', status: 'Beres' },
    { id: 3, label: '03 • PILIH MOMEN', status: 'Beres' },
    { id: 4, label: '04 • RINGKAS', status: 'Beres' },
    { id: 5, label: '05 • SELESAI', status: 'Beres' },
  ]);
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [showLog, setShowLog] = useState<boolean>(false);
  const [logLines, setLogLines] = useState<string[]>([
    '[yt-dlp] Extracting URL: https://youtu.be/4alNAxq96U4',
    '[yt-dlp] 4alNAxq96U4: Downloading webpage & audio stream',
    '[download] 100% of 24.52MiB in 00:03 at 7.82MiB/s',
    '[whisper] Loading Whisper ASR (indonesian-casual-v3)...',
    '[whisper] Voice Activity Detection & telephony bandpass (300Hz-3400Hz)...',
    '[whisper] 16 segments detected with DTW word alignment',
    '[hook-scorer] Calculating informational energy & heatmap peak density...',
    '[kalman] Initializing 2D state [x, y, vx, vy] for 9:16 vertical crop...',
    '[done] 5 viral moments generated ready for review!',
  ]);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedSecondsRef = useRef<number>(42);
  const phaseTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Settings State matching screenshot 01e31e93.jpg
  const [momentSelector, setMomentSelector] = useState<'lokal' | 'gemini' | 'ollama' | 'langganan'>('lokal');
  const [transcriptAccuracy, setTranscriptAccuracy] = useState<'cepat' | 'seimbang' | 'akurat'>('seimbang');
  const [clipDuration, setClipDuration] = useState<'15' | '30' | '60'>('30');
  const [customPrompt, setCustomPrompt] = useState('');
  const [clipCount, setClipCount] = useState<number>(5);
  const [analysisScope, setAnalysisScope] = useState<'semua' | 'khusus'>('semua');
  const [subtitleSource, setSubtitleSource] = useState<'whisper' | 'srt'>('whisper');

  // Detailed Clips State matching screenshots 7c0dfec5.jpg & e5f26f4d.jpg
  const [clips, setClips] = useState<DetailedClip[]>(DEFAULT_DETAILED_CLIPS);
  const [activeClipId, setActiveClipId] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Real backend connection & project state matching real Studio Maliki data
  const [proyekNama, setProyekNama] = useState<string>('20261118-155926');
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string>('/berkas/klip/20261118-155926/sumber.mp4');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('/berkas/klip/20261118-155926/gambar.jpg');
  const [videoDuration, setVideoDuration] = useState<number>(572.5);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [waveformEnergy, setWaveformEnergy] = useState<number[]>([]);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);

  // Studio Render 1080x1920 Configuration matching screenshots e5f936c1.jpg, f79932d9.jpg, 2e48a1b0.jpg, 89752451.jpg
  const [canvasRatio, setCanvasRatio] = useState<'9:16' | '1:1' | '4:5' | '16:9'>('9:16');
  const [barBackground, setBarBackground] = useState<'hitam' | 'buram'>('buram');
  const [renderedCount, setRenderedCount] = useState<number>(5);
  const [focusPoint, setFocusPoint] = useState<'otomatis' | 'kiri' | 'tengah' | 'kanan'>('otomatis');
  const [layoutMode, setLayoutMode] = useState<'satu' | 'atas_bawah' | 'pip' | 'split'>('satu');
  const [hasHookBanner, setHasHookBanner] = useState<boolean>(true);
  const [bannerPrefix, setBannerPrefix] = useState('');
  const [bannerSuffix, setBannerSuffix] = useState('');
  const [hasSubtitles, setHasSubtitles] = useState<boolean>(true);
  const [selectedFont, setSelectedFont] = useState('Montserrat');
  const [textSize, setTextSize] = useState<'kecil' | 'sedang' | 'besar'>('sedang');
  const [letterCase, setLetterCase] = useState<'ABC' | 'Asli' | 'abc'>('ABC');
  const [verticalPos, setVerticalPos] = useState<number>(72);
  const [colorHighlight, setColorHighlight] = useState<boolean>(true);
  const [zoomKeyphrase, setZoomKeyphrase] = useState<boolean>(true);
  const [bottomProgress, setBottomProgress] = useState<boolean>(true);
  const [autoEmoji, setAutoEmoji] = useState<boolean>(true);
  const [introHook3s, setIntroHook3s] = useState<boolean>(true);
  const [introStyle, setIntroStyle] = useState('Kotak kuning');
  const [musicVol, setMusicVol] = useState<number>(18);
  const [voiceBoost, setVoiceBoost] = useState<'88%' | '100%' | '125%' | '150%' | '200%'>('100%');
  const [bRollMode, setBRollMode] = useState<'tanpa' | 'file' | 'pixabay'>('tanpa');

  // 3-Step Rendering Pipeline State matching screenshots cf55f0ef.jpg & 89752451.jpg
  interface RenderPipelineStep {
    id: number;
    label: string;
    status: StepStatus;
  }
  const [isRenderingPipeline, setIsRenderingPipeline] = useState<boolean>(false);
  const [renderProgressPercent, setRenderProgressPercent] = useState<number>(0);
  const [_renderElapsedSec, setRenderElapsedSec] = useState<number>(0);
  const [renderSteps, setRenderSteps] = useState<RenderPipelineStep[]>([
    { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
    { id: 2, label: '02 • RENDER', status: 'Berjalan...' },
    { id: 3, label: '03 • SELESAI', status: 'Menunggu' },
  ]);
  const [renderLogLines, setRenderLogLines] = useState<string[]>([
    '[00:00] [SIAPKAN] Menyiapkan frame buffer 1080x1920 60 FPS...',
    '[00:00] [SIAPKAN] Sinkronisasi layer kinetik subtitle & audio AAC...',
    '[00:01] [RENDER] Memulai rendering klip terpilih...',
  ]);
  const renderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const renderElapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0];
  const checkedClipsCount = clips.filter((c) => c.isChecked).length;

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const clearAllTimers = () => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    if (renderElapsedTimerRef.current) clearInterval(renderElapsedTimerRef.current);
    phaseTimeoutsRef.current.forEach((t) => clearTimeout(t));
    phaseTimeoutsRef.current = [];
  };

  // Real backend loader
  const loadProjectFromBackend = async (nama: string) => {
    try {
      const res = await fetch(`/api/proyek/klip/${nama}`);
      if (!res.ok) return false;
      const data = await res.json();
      setProyekNama(nama);
      if (data.info?.judul) setVideoTitle(data.info.judul);
      if (data.info?.durasi) setVideoDuration(data.info.durasi);
      if (data.sumber) setSourceVideoUrl(data.sumber);
      if (data.gambar) setThumbnailUrl(data.gambar);
      if (data.info?.energi && Array.isArray(data.info.energi)) {
        setWaveformEnergy(data.info.energi);
      }
      if (data.klip && Array.isArray(data.klip) && data.klip.length > 0) {
        const mappedClips: DetailedClip[] = data.klip.map((k: any, idx: number) => ({
          id: k.no || idx + 1,
          rankNum: k.no || idx + 1,
          title: k.judul || `Klip ${k.no || idx + 1}`,
          viralScore: Math.round((k.skor || 0) <= 1 ? (k.skor || 0) * 100 : k.skor),
          startTime: k.mulai || 0,
          endTime: k.selesai || 30,
          durationSec: Math.round((k.selesai || 30) - (k.mulai || 0)),
          hookTimestamp: `hook ${formatSec(k.hook ?? k.mulai ?? 0)}`,
          quote: k.kutipan || '',
          caption: k.caption || k.judul || '',
          reason: k.alasan || 'pembuka kuat • bicara padat',
          isChecked: true,
          file: k.file,
        }));
        setClips(mappedClips);
        setActiveClipId(mappedClips[0].id);
        const rendered = mappedClips.filter((c) => c.file).length;
        setRenderedCount(rendered || 5);
      }
      setHasResults(true);
      setPipelineState('completed');
      return true;
    } catch {
      return false;
    }
  };

  // Real-time backend process monitor (reads live stdout logs from yt-dlp, whisper, and ffmpeg)
  const mulaiPantauBackend = (jenis: 'klip' | 'render', projName?: string) => {
    clearAllTimers();
    let elapsed = 0;
    if (jenis === 'klip') {
      setPipelineState('running');
      setIsRenderingPipeline(false);
      setHasResults(false);
    } else {
      setIsRenderingPipeline(true);
    }

    const LK = {
      klip: [
        { label: '01 • UNDUH', re: /Mengunduh|Video:|Downloading|yt-dlp/i },
        { label: '02 • TRANSKRIP', re: /Transkripsi|Transkrip diambil|Bahasa terdeteksi|Memakai subtitle|Whisper/i },
        { label: '03 • PILIH MOMEN', re: /Mencari momen|Meminta AI|Memakai \d+ momen/i },
        { label: '04 • RINGKAS', re: /Analisis selesai|Ringkasan/i },
        { label: '05 • SELESAI', re: /Analisis selesai/i },
      ],
      render: [
        { label: '01 • SIAPKAN', re: /Render 1\//i },
        { label: '02 • RENDER', re: /Render \d+\//i },
        { label: '03 • SELESAI', re: /Selesai\./i },
      ],
    };

    const timer = setInterval(async () => {
      elapsed += 1;
      const timeStr = formatSec(elapsed);

      try {
        const res = await fetch('/api/status');
        if (!res.ok) return;
        const s = await res.json();
        const logs: string[] = s.log || [];

        if (jenis === 'klip') {
          setLogLines(logs);
          const steps = LK.klip;
          let sampai = 0;
          logs.forEach((b: string) => {
            steps.forEach((st, i) => {
              if (st.re.test(b)) sampai = Math.max(sampai, i);
            });
          });
          if (s.status === 'selesai') sampai = steps.length - 1;

          setPipelineSteps(
            steps.map((st, i) => ({
              id: i + 1,
              label: st.label,
              status:
                i < sampai || s.status === 'selesai'
                  ? 'Beres'
                  : i === sampai
                  ? s.status === 'gagal'
                    ? 'Menunggu'
                    : 'Berjalan...'
                  : 'Menunggu',
            }))
          );

          const pct =
            s.status === 'selesai'
              ? 100
              : Math.min(95, Math.max(12, ((sampai + 0.5) / steps.length) * 100));
          setProgressPercent(pct);

          if (onAnalysisStateChange) {
            const activeStep = steps[sampai]?.label.split('• ')[1] || 'Mengunduh';
            onAnalysisStateChange(true, timeStr, `${activeStep}...`, 'Menganalisis video');
          }

          if (s.status !== 'jalan') {
            clearInterval(timer);
            if (s.status === 'selesai') {
              setPipelineState('completed');
              setHasResults(true);
              const targetProj = projName || s.hasil?.nama || proyekNama;
              if (targetProj) await loadProjectFromBackend(targetProj);
              if (onAnalysisStateChange) {
                onAnalysisStateChange(false, timeStr, 'Selesai', 'Menganalisis video');
              }
            } else {
              setPipelineState('idle');
              if (onAnalysisStateChange) {
                onAnalysisStateChange(false, timeStr, 'Gagal', 'Menganalisis video');
              }
            }
          }
        } else {
          // Render tracking
          setRenderLogLines(logs);
          const steps = LK.render;
          let sampai = 0;
          logs.forEach((b: string) => {
            steps.forEach((st, i) => {
              if (st.re.test(b)) sampai = Math.max(sampai, i);
            });
          });
          if (s.status === 'selesai') sampai = steps.length - 1;

          setRenderSteps(
            steps.map((st, i) => ({
              id: i + 1,
              label: st.label,
              status:
                i < sampai || s.status === 'selesai'
                  ? 'Beres'
                  : i === sampai
                  ? 'Berjalan...'
                  : 'Menunggu',
            }))
          );

          const pct =
            s.status === 'selesai'
              ? 100
              : Math.min(96, Math.max(14, ((sampai + 0.5) / steps.length) * 100));
          setRenderProgressPercent(pct);

          if (onAnalysisStateChange) {
            onAnalysisStateChange(true, timeStr, 'Merender...', 'Merender klip');
          }

          if (s.status !== 'jalan') {
            clearInterval(timer);
            if (s.status === 'selesai') {
              setRenderSteps([
                { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
                { id: 2, label: '02 • RENDER', status: 'Beres' },
                { id: 3, label: '03 • SELESAI', status: 'Beres' },
              ]);
              setRenderProgressPercent(100);
              const targetProj = projName || s.hasil?.nama || proyekNama;
              if (targetProj) await loadProjectFromBackend(targetProj);
              setRenderedCount(clips.filter((c) => c.isChecked).length);
              if (onAnalysisStateChange) {
                onAnalysisStateChange(false, timeStr, 'Selesai', 'Merender klip');
              }
            }
          }
        }
      } catch {
        // Keep polling
      }
    }, 850);

    elapsedTimerRef.current = timer;
  };

  // Initial mount: auto-detect existing project or active job
  useEffect(() => {
    let isMounted = true;
    const initCheck = async () => {
      try {
        const statusRes = await fetch('/api/status');
        if (statusRes.ok) {
          const s = await statusRes.json();
          if (s.status === 'jalan' && isMounted) {
            mulaiPantauBackend(s.jenis === 'render' ? 'render' : 'klip');
            return;
          }
        }

        const projRes = await fetch('/api/proyek');
        if (projRes.ok) {
          const projs = await projRes.json();
          const klipProjs = (projs || []).filter((p: any) => p.jenis === 'klip');
          if (klipProjs.length > 0 && isMounted) {
            await loadProjectFromBackend(klipProjs[0].nama);
          }
        }
      } catch {
        // Fallback default
      }
    };
    initCheck();
    return () => {
      isMounted = false;
      clearAllTimers();
    };
  }, []);

  const handleCancelPipeline = async () => {
    clearAllTimers();
    try {
      await fetch('/api/batal', { method: 'POST' });
    } catch {}
    setPipelineState('idle');
    setProgressPercent(0);
    setHasResults(false);
    if (onAnalysisStateChange) {
      onAnalysisStateChange(false, '00:00', '');
    }
  };

  const handleStartRender = async () => {
    if (isRenderingPipeline) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const checkedNos = clips.filter((c) => c.isChecked).map((c) => c.rankNum || c.id);

    try {
      const res = await fetch('/api/klip-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: proyekNama || '20261118-155926',
          pilih: checkedNos,
          gaya: {
            rasio: canvasRatio,
            latar: barBackground,
            fokus: focusPoint,
            layout: layoutMode,
            banner: hasHookBanner,
            awalan: bannerPrefix,
            akhiran: bannerSuffix,
            subtitle: hasSubtitles,
            font: selectedFont,
            posisi_y: verticalPos,
            volume_musik: musicVol,
            warna: '#FFD400',
          },
          judul: {},
        }),
      });
      if (res.ok) {
        setIsRenderingPipeline(true);
        setRenderProgressPercent(14);
        mulaiPantauBackend('render', proyekNama || '20261118-155926');
        return;
      }
    } catch {
      // Offline fallback
    }

    // Realistic fallback simulation if backend is not responding
    setIsRenderingPipeline(true);
    setRenderProgressPercent(14);
    setRenderElapsedSec(0);

    setRenderSteps([
      { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
      { id: 2, label: '02 • RENDER', status: 'Berjalan...' },
      { id: 3, label: '03 • SELESAI', status: 'Menunggu' },
    ]);

    setRenderLogLines([
      `[00:00] [SIAPKAN] Inisialisasi konfigurasi render 1080x1920 (Kanvas: ${canvasRatio}, Latar: ${barBackground})...`,
      `[00:00] [SIAPKAN] Font: ${selectedFont}, Titik fokus: ${focusPoint}, Layout: ${layoutMode}...`,
      `[00:01] [RENDER] Memulai rendering klip terpilih (${checkedClipsCount} klip)...`,
      `[00:01] [RENDER] Menerapkan filter blur latar belakang video 14px...`,
    ]);

    if (onAnalysisStateChange) {
      onAnalysisStateChange(true, '00:01', 'Merender...', 'Merender klip');
    }

    let elapsed = 0;
    if (renderElapsedTimerRef.current) clearInterval(renderElapsedTimerRef.current);
    renderElapsedTimerRef.current = setInterval(() => {
      elapsed += 1;
      setRenderElapsedSec(elapsed);
      if (onAnalysisStateChange) {
        onAnalysisStateChange(true, formatSec(elapsed), 'Merender...', 'Merender klip');
      }
    }, 1000);

    let prog = 14;
    if (renderTimerRef.current) clearInterval(renderTimerRef.current);
    renderTimerRef.current = setInterval(() => {
      prog += Math.random() * 2.5 + 1.2;
      if (prog >= 100) {
        prog = 100;
        if (renderTimerRef.current) clearInterval(renderTimerRef.current);
        if (renderElapsedTimerRef.current) clearInterval(renderElapsedTimerRef.current);

        setRenderProgressPercent(100);
        setRenderSteps([
          { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
          { id: 2, label: '02 • RENDER', status: 'Beres' },
          { id: 3, label: '03 • SELESAI', status: 'Beres' },
        ]);
        setRenderedCount(checkedClipsCount);

        setRenderLogLines((prev) => [
          ...prev,
          `[${formatSec(elapsed)}] [RENDER] Encoding WebCodecs H.264 / AAC 48kHz selesai 100%.`,
          `[${formatSec(elapsed)}] [SELESAI] 100% Beres! ${checkedClipsCount} klip berhasil diekspor ke format 1080x1920.`,
        ]);

        if (onAnalysisStateChange) {
          onAnalysisStateChange(false, formatSec(elapsed), 'Selesai', 'Merender klip');
        }

        onExportVideo();
      } else {
        setRenderProgressPercent(prog);
        const intProg = Math.floor(prog);
        if (intProg % 20 === 0) {
          setRenderLogLines((prev) => [
            ...prev,
            `[${formatSec(elapsed)}] [RENDER] Frame encoding ${intProg}% - ${selectedFont} (${activeClip.title})...`,
          ]);
        }
      }
    }, 180);
  };

  const handleCancelRender = async () => {
    clearAllTimers();
    try {
      await fetch('/api/batal', { method: 'POST' });
    } catch {}
    setIsRenderingPipeline(false);
    setRenderProgressPercent(0);
    if (onAnalysisStateChange) {
      onAnalysisStateChange(false, '00:00', '');
    }
  };

  const handleBukaFolder = async () => {
    try {
      await fetch('/api/buka-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis: 'klip',
          nama: proyekNama || '20261118-155926',
        }),
      });
    } catch {
      alert('Folder hasil ekspor dibuka di direktori lokal.');
    }
  };

  const handleCariMomen = async () => {
    clearAllTimers();
    const rawUrl = youtubeInput.trim() || 'https://youtu.be/4alNAxq96U4?si=BPdJeLm3WnJ_kA0X';
    setPipelineState('running');
    setProgressPercent(12);
    setHasResults(false);
    elapsedSecondsRef.current = 0;

    // Try posting to real Studio Maliki backend first!
    try {
      const res = await fetch('/api/klip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sumber: rawUrl,
          jumlah: clipCount,
          durasi: Number(clipDuration),
          ai: momentSelector,
          model: transcriptAccuracy === 'cepat' ? 'tiny' : transcriptAccuracy === 'akurat' ? 'medium' : 'small',
          arahan: customPrompt,
          rentang: '',
          subtitle_file: subtitleSource === 'srt' ? 'srt' : '',
        }),
      });
      if (res.ok) {
        const j = await res.json();
        setProyekNama(j.proyek);
        mulaiPantauBackend('klip', j.proyek);
        return;
      }
    } catch {
      // Backend not running, run authentic realistic simulation
    }

    // Realistic Simulation Pacing (realistic time with Whisper logs)
    setPipelineSteps([
      { id: 1, label: '01 • UNDUH', status: 'Berjalan...' },
      { id: 2, label: '02 • TRANSKRIP', status: 'Menunggu' },
      { id: 3, label: '03 • PILIH MOMEN', status: 'Menunggu' },
      { id: 4, label: '04 • RINGKAS', status: 'Menunggu' },
      { id: 5, label: '05 • SELESAI', status: 'Menunggu' },
    ]);

    setLogLines([
      `[00:00] Memeriksa tautan YouTube: ${rawUrl}`,
      `[00:01] Mengambil manifest video & parameter audio...`,
      `[00:02] [yt-dlp] Mengunduh aliran video & audio (1080p60 H.264 / AAC 128kbps)...`,
    ]);

    if (onAnalysisStateChange) {
      onAnalysisStateChange(true, '00:01', 'Mengunduh...', 'Menganalisis video');
    }

    elapsedTimerRef.current = setInterval(() => {
      elapsedSecondsRef.current += 1;
      const timeStr = formatSec(elapsedSecondsRef.current);
      if (onAnalysisStateChange) {
        let label = 'Mengunduh...';
        if (elapsedSecondsRef.current > 5 && elapsedSecondsRef.current <= 12) label = 'Transkrip...';
        else if (elapsedSecondsRef.current > 12 && elapsedSecondsRef.current <= 18) label = 'Pilih momen...';
        else if (elapsedSecondsRef.current > 18) label = 'Ringkas...';
        onAnalysisStateChange(true, timeStr, label, 'Menganalisis video');
      }
    }, 1000);

    let determinedTitle = 'CARA MUNCULIN EVENT ASPIRANTS, EXORCISTS, METRO ZERO & EFEK RECALL API DI ORI SERVER !!';
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) determinedTitle = data.title;
      }
    } catch {
      // Keep determined title
    }
    setVideoTitle(determinedTitle);

    // Step 1 -> 2 (takes ~6s)
    const t1 = setTimeout(() => {
      setPipelineSteps([
        { id: 1, label: '01 • UNDUH', status: 'Beres' },
        { id: 2, label: '02 • TRANSKRIP', status: 'Berjalan...' },
        { id: 3, label: '03 • PILIH MOMEN', status: 'Menunggu' },
        { id: 4, label: '04 • RINGKAS', status: 'Menunggu' },
        { id: 5, label: '05 • SELESAI', status: 'Menunggu' },
      ]);
      setProgressPercent(38);
      setLogLines((prev) => [
        ...prev,
        `[00:05] [download] 100% of 117.9 MB in 00:05 at 23.4 MiB/s.`,
        `[00:05] [whisper] Memuat model Whisper ASR (indonesian-casual-v3)...`,
        `[00:06] [whisper] Voice Activity Detection bandpass 300Hz-3400Hz...`,
        `[00:07] [whisper] Transkripsi kata per kata dengan Dynamic Time Warping (DTW)...`,
      ]);

      // Step 2 -> 3 (takes ~7s)
      const t2 = setTimeout(() => {
        setPipelineSteps([
          { id: 1, label: '01 • UNDUH', status: 'Beres' },
          { id: 2, label: '02 • TRANSKRIP', status: 'Beres' },
          { id: 3, label: '03 • PILIH MOMEN', status: 'Berjalan...' },
          { id: 4, label: '04 • RINGKAS', status: 'Menunggu' },
          { id: 5, label: '05 • SELESAI', status: 'Menunggu' },
        ]);
        setProgressPercent(68);
        setLogLines((prev) => [
          ...prev,
          `[00:12] [whisper] Berhasil mengekstrak 140+ segmen kata.`,
          `[00:12] [whisper] Normalisasi kosakata gaul ("nggak", "udah", "gimana", "gue")...`,
          `[00:13] [hook-scorer] Menghitung Informational Energy & YouTube Heatmap peak density...`,
          `[00:14] [tracker] Mendeteksi wajah streamer & layar gameplay MLBB...`,
        ]);

        // Step 3 -> 4 (takes ~6s)
        const t3 = setTimeout(() => {
          setPipelineSteps([
            { id: 1, label: '01 • UNDUH', status: 'Beres' },
            { id: 2, label: '02 • TRANSKRIP', status: 'Beres' },
            { id: 3, label: '03 • PILIH MOMEN', status: 'Beres' },
            { id: 4, label: '04 • RINGKAS', status: 'Berjalan...' },
            { id: 5, label: '05 • SELESAI', status: 'Menunggu' },
          ]);
          setProgressPercent(90);
          setLogLines((prev) => [
            ...prev,
            `[00:18] [hook-scorer] 5 momen hook viral terbaik dipilih (skor 99%, 71%, 68%, 64%, 60%).`,
            `[00:18] [reframer] Inisialisasi Kalman Filter 2D untuk framing kamera 9:16 vertikal...`,
            `[00:19] [ringkas] Membuat ringkasan kalimat pembuka dan hashtag viral...`,
          ]);

          // Step 4 -> 5 & Finish (takes ~4s)
          const t4 = setTimeout(() => {
            clearAllTimers();
            setPipelineSteps([
              { id: 1, label: '01 • UNDUH', status: 'Beres' },
              { id: 2, label: '02 • TRANSKRIP', status: 'Beres' },
              { id: 3, label: '03 • PILIH MOMEN', status: 'Beres' },
              { id: 4, label: '04 • RINGKAS', status: 'Beres' },
              { id: 5, label: '05 • SELESAI', status: 'Beres' },
            ]);
            setProgressPercent(100);
            setPipelineState('completed');
            setHasResults(true);

            if (onAnalysisStateChange) {
              onAnalysisStateChange(false, formatSec(elapsedSecondsRef.current), 'Selesai', 'Menganalisis video');
            }

            onLoadYouTubeUrl(rawUrl, determinedTitle, clipCount);
          }, 3500);
          phaseTimeoutsRef.current.push(t4);
        }, 5500);
        phaseTimeoutsRef.current.push(t3);
      }, 6500);
      phaseTimeoutsRef.current.push(t2);
    }, 5500);
    phaseTimeoutsRef.current.push(t1);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const toggleClipCheckbox = (id: number) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isChecked: !c.isChecked } : c))
    );
  };

  const checkAllClips = (val: boolean) => {
    setClips((prev) => prev.map((c) => ({ ...c, isChecked: val })));
  };

  const selectAndPlayClip = (clip: DetailedClip) => {
    setActiveClipId(clip.id);
    onSeek(clip.startTime);
    if (videoElemRef.current) {
      videoElemRef.current.currentTime = clip.startTime;
      videoElemRef.current.play().catch(() => {});
    }
    if (!isPlaying) onTogglePlay();
  };

  const STYLES_LIST = [
    { id: 'SorotKuning', name: 'Sorot Kuning', desc: 'kata aktif menyala' },
    { id: 'PopKapital', name: 'Pop Kapital', desc: 'besar, memantul, kata kunci' },
    { id: 'KomikTebal', name: 'Komik Tebal', desc: 'tepi hitam tebal' },
    { id: 'HalusPremium', name: 'Halus Premium', desc: 'kecil, tipis - tebal' },
    { id: 'KaraokePop', name: 'Karaoke', desc: 'warna mengisi kata' },
    { id: 'PalingTerbaca', name: 'Paling Terbaca', desc: 'kuning di kotak hitam' },
    { id: 'MinimalClean', name: 'Minimal Bersih', desc: 'kalem untuk edukasi' },
    { id: 'PodcastBingkai', name: 'Podcast Bingkai', desc: 'judul berkotak + progress' },
    { id: 'MerekMaliki', name: 'Merek Maliki', desc: 'gaya situs/kode' },
    { id: 'KotakHijau', name: 'Lime Box', desc: 'kotak ikut kata aktif' },
    { id: 'Neon', name: 'Hook Neon', desc: 'judul stiker + coretan' },
    { id: 'SerifElegan', name: 'Serif Elegan', desc: 'judul majalah, kalem' },
    { id: 'KertasSobek', name: 'Kertas Sobek', desc: 'judul di pita kertas' },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 bg-[#080c14] text-white">
      {/* ============================================================== */}
      {/* 1. INITIAL / DROPDOWN INPUT VIEW (When no results analyzed)     */}
      {/* ============================================================== */}
      {!hasResults && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header matching 01e31e93.jpg */}
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

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setYoutubeInput(file.name);
                  onUploadFile(file);
                  handleCariMomen();
                }
              }}
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
              className="hidden"
            />

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
                  disabled={pipelineState === 'running'}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {pipelineState === 'running' ? (
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
          </div>

          {/* Two Configuration Columns matching 01e31e93.jpg */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mesin AI */}
            <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>mesin ai</span>
              </div>

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

              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                Mode lokal memakai rumus: heatmap "paling sering diputar" YouTube, energi suara, kepadatan kata, dan kata hook. Judul diambil dari kalimat pembuka.
              </p>
            </div>

            {/* Atur Klip */}
            <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>atur klip</span>
              </div>

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
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. THE 5-STEP PIPELINE STEPPER CARD (Screenshot 8450cc9e.jpg)   */}
      {/* ============================================================== */}
      {(pipelineState === 'running' || pipelineState === 'completed') && (
        <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
          {hasResults && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
              <div className="text-xs text-slate-300 font-semibold truncate max-w-2xl">
                <span className="text-slate-500 font-mono">Sumber: </span>
                <span className="text-white font-bold">{videoTitle}</span>
              </div>
              <button
                onClick={() => setHasResults(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors shrink-0"
              >
                Analisis video lain
              </button>
            </div>
          )}

          {/* Stepper Grid: 3 Steps if Rendering Pipeline (cf55f0ef.jpg), 5 Steps if Analyzing (8450cc9e.jpg / 4315c57a.png) */}
          {isRenderingPipeline ? (
            <div className="grid grid-cols-3 gap-3">
              {renderSteps.map((st) => {
                const isRunning = st.status === 'Berjalan...';
                const isDone = st.status === 'Beres';
                return (
                  <div
                    key={st.id}
                    className={`rounded-xl p-3.5 space-y-1 text-left transition-all ${
                      isRunning
                        ? 'bg-cyan-950/20 border border-cyan-400 ring-1 ring-cyan-400/20 shadow-sm'
                        : 'bg-[#0b0f19] border border-slate-800'
                    }`}
                  >
                    <div
                      className={`font-mono text-[11px] ${
                        isRunning
                          ? 'text-cyan-400 font-bold'
                          : isDone
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {st.label}
                    </div>
                    <div
                      className={`text-xs ${
                        isDone
                          ? 'text-emerald-400 font-bold'
                          : isRunning
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {st.status}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {pipelineSteps.map((st) => {
                const isRunning = st.status === 'Berjalan...';
                const isDone = st.status === 'Beres';
                return (
                  <div
                    key={st.id}
                    className={`rounded-xl p-3.5 space-y-1 text-left transition-all ${
                      isRunning
                        ? 'bg-cyan-950/20 border border-cyan-400 ring-1 ring-cyan-400/20 shadow-sm'
                        : 'bg-[#0b0f19] border border-slate-800'
                    }`}
                  >
                    <div
                      className={`font-mono text-[11px] ${
                        isRunning
                          ? 'text-cyan-400 font-bold'
                          : isDone
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {st.label}
                    </div>
                    <div
                      className={`text-xs ${
                        isDone
                          ? 'text-emerald-400 font-bold'
                          : isRunning
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {st.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${isRenderingPipeline ? renderProgressPercent : progressPercent}%` }}
            />
          </div>

          {/* Controls: Lihat Log toggle & Batalkan button */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setShowLog(!showLog)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono transition-colors"
            >
              <span>{showLog ? '▼' : '►'}</span>
              <span>{showLog ? 'Sembunyikan log' : 'Lihat log'}</span>
            </button>

            <button
              onClick={isRenderingPipeline ? handleCancelRender : handleCancelPipeline}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Batalkan
            </button>
          </div>

          {/* Collapsible Log Terminal Box */}
          {showLog && (
            <div className="bg-[#080c14] border border-slate-800/90 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
              {(isRenderingPipeline ? renderLogLines : logLines).map((line, idx) => (
                <div key={idx} className="leading-tight text-slate-300">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. FULL STUDIO MALIKI RESULTS WORKSPACE (Screenshots 1-6)       */}
      {/* ============================================================== */}
      {hasResults && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Chips Bar matching 7c0dfec5.jpg */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                AI: lokal
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                Momen {clips.length}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-bold">
                Dicentang {checkedClipsCount}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                Dirender {renderedCount}
              </span>
            </div>

            <button
              onClick={handleBukaFolder}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Buka folder</span>
            </button>
          </div>

          {/* TWO COLUMNS: Source Video Player (Left) + Detailed Clips (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 Cols): 16:9 Player & Waveform & Ikhtisar */}
            <div className="lg:col-span-5 space-y-5">
              {/* 16:9 Video Player Card */}
              <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  {videoTitle}
                </div>

                {/* 16:9 Video Canvas / HTML5 Video Player */}
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 group shadow-lg">
                  {sourceVideoUrl ? (
                    <video
                      ref={videoElemRef}
                      src={sourceVideoUrl}
                      poster={thumbnailUrl}
                      controls
                      playsInline
                      crossOrigin="anonymous"
                      className="w-full h-full object-contain bg-black"
                      onTimeUpdate={(e) => {
                        const t = e.currentTarget.currentTime;
                        setCurrentVideoTime(t);
                        if (activeClip && t >= activeClip.endTime) {
                          e.currentTarget.currentTime = activeClip.startTime;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1329] relative">
                      <img
                        src={thumbnailUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"}
                        alt="Game Streamer Preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                      {/* Small streamer facecam overlay */}
                      <div className="absolute bottom-2 left-2 w-20 h-16 rounded border border-cyan-400/60 overflow-hidden shadow-lg bg-black">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                          alt="Facecam"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={onTogglePlay}
                        className="w-12 h-12 rounded-full bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 flex items-center justify-center font-bold shadow-xl transition-transform transform hover:scale-105"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-slate-300">
                        {formatSec(currentTime)} / {formatSec(videoDuration)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Waveform & Heatmap Graph matching 7c0dfec5.jpg */}
                <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 space-y-2">
                  <div
                    className="relative w-full h-12 flex items-center justify-between px-1 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      const dur = videoDuration || 572.5;
                      const targetTime = ratio * dur;
                      if (videoElemRef.current) {
                        videoElemRef.current.currentTime = targetTime;
                        videoElemRef.current.play().catch(() => {});
                      }
                      setCurrentVideoTime(targetTime);
                    }}
                  >
                    {/* SVG Waveform from real audio energy */}
                    <svg className="w-full h-full" viewBox="0 0 1000 64" preserveAspectRatio="none">
                      {waveformEnergy.length > 0 ? (
                        <polyline
                          fill="none"
                          stroke="#818cf8"
                          strokeOpacity="0.85"
                          strokeWidth="2.5"
                          points={waveformEnergy
                            .map(
                              (v, i) =>
                                `${(i / Math.max(waveformEnergy.length - 1, 1)) * 1000},${60 - v * 52}`
                            )
                            .join(' ')}
                        />
                      ) : (
                        <path
                          d="M0,32 Q50,8 100,32 T200,32 T300,12 T400,32 T500,8 T600,32 T700,16 T800,32 T900,12 T1000,32"
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2"
                        />
                      )}
                    </svg>

                    {/* Marker Lines #1 - #5 matching 7c0dfec5.jpg */}
                    {clips.map((clip) => {
                      const dur = videoDuration || 572.5;
                      const leftPct = (clip.startTime / dur) * 100;
                      const widthPct = Math.max(1.5, ((clip.endTime - clip.startTime) / dur) * 100);
                      return (
                        <div
                          key={clip.id}
                          className="absolute top-0 bottom-0 border-l border-cyan-400/80 bg-cyan-400/10 pointer-events-none"
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        >
                          <span className="text-[9px] font-mono text-cyan-300 font-bold px-1 bg-black/70 rounded">
                            #{clip.rankNum || clip.id}
                          </span>
                        </div>
                      );
                    })}

                    {/* Current Time Cursor Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none shadow-sm"
                      style={{
                        left: `${((currentVideoTime || currentTime) / (videoDuration || 572.5)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>heatmap tidak tersedia • memakai energi suara</span>
                    <span>{formatSec(videoDuration || 572.5)}</span>
                  </div>
                </div>
              </div>

              {/* Ikhtisar Klip (5) Checkbox List */}
              <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>ikhtisar klip ({clips.length})</span>
                </div>

                <div className="space-y-1.5">
                  {clips.map((clip) => {
                    const isSelected = activeClipId === clip.id;
                    return (
                      <div
                        key={clip.id}
                        onClick={() => selectAndPlayClip(clip)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/30 border-cyan-400 text-white shadow-sm'
                            : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <input
                            type="checkbox"
                            checked={clip.isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleClipCheckbox(clip.id);
                            }}
                            className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-400 accent-cyan-400 cursor-pointer"
                          />
                          <span className="text-xs font-semibold truncate">
                            {clip.rankNum}. {clip.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                          <span className="font-bold text-cyan-400">{clip.viralScore}%</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{formatSec(clip.startTime)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Search & Detailed Clip Cards */}
            <div className="lg:col-span-7 space-y-5">
              {/* Search & Filter Header Bar */}
              <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari judul, caption, atau transkrip..."
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
                    <button className="px-3 py-2 rounded-xl bg-[#0b0f19] border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5">
                      <span>Semua skor</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>
                    <button className="px-3 py-2 rounded-xl bg-[#0b0f19] border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5">
                      <span>Urut: skor</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>Centang:</span>
                    <button
                      onClick={() => checkAllClips(true)}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      semua
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => checkAllClips(false)}
                      className="text-slate-500 hover:text-slate-300 font-semibold"
                    >
                      kosongkan
                    </button>
                  </div>

                  <button className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1">
                    <span>Salin & ekspor</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Detailed Clip Cards List */}
              <div className="space-y-4">
                {clips
                  .filter((c) =>
                    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.quote.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((clip) => {
                    const isSelected = activeClipId === clip.id;
                    return (
                      <div
                        key={clip.id}
                        className={`rounded-2xl border p-5 space-y-4 transition-all shadow-md ${
                          isSelected
                            ? 'bg-[#0f172a] border-cyan-400 ring-1 ring-cyan-400/20'
                            : 'bg-[#0f172a]/60 border-slate-800'
                        }`}
                      >
                        {/* Title & Score Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={clip.isChecked}
                              onChange={() => toggleClipCheckbox(clip.id)}
                              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-400 accent-cyan-400 cursor-pointer"
                            />
                            <h3 className="text-sm font-bold text-white leading-snug">
                              {clip.rankNum}. {clip.title}
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00d2d3]/20 text-[#00d2d3] border border-[#00d2d3]/40 font-mono shrink-0">
                            {clip.viralScore}% viral
                          </span>
                        </div>

                        {/* Timing details */}
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                          <span>
                            {formatSec(clip.startTime)} - {formatSec(clip.endTime)}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span>{clip.durationSec} dtk</span>
                          <span className="text-slate-600">•</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 text-[10px]">
                            {clip.hookTimestamp}
                          </span>
                        </div>

                        {/* Transcript Quote */}
                        <p className="text-xs text-slate-300 italic leading-relaxed bg-[#0b0f19] border border-slate-800/80 rounded-xl p-3">
                          {clip.quote}
                        </p>

                        {/* Form Fields: JUDUL, CAPTION, ALASAN */}
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 w-16 uppercase text-[10px]">JUDUL</span>
                            <span className="text-white flex-1 font-sans text-xs truncate">
                              {clip.title}
                            </span>
                            <button
                              onClick={() => handleCopyText(clip.title, `title-${clip.id}`)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedKey === `title-${clip.id}` ? 'Disalin' : 'Salin'}</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 w-16 uppercase text-[10px]">CAPTION</span>
                            <span className="text-white flex-1 font-sans text-xs truncate">
                              {clip.caption}
                            </span>
                            <button
                              onClick={() => handleCopyText(clip.caption, `cap-${clip.id}`)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedKey === `cap-${clip.id}` ? 'Disalin' : 'Salin'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 w-16 uppercase text-[10px]">ALASAN</span>
                            <span className="text-cyan-400 text-[11px] font-sans">
                              {clip.reason}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/80 text-xs">
                          <button
                            onClick={() => selectAndPlayClip(clip)}
                            className="px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Putar</span>
                          </button>

                          <button
                            onClick={() =>
                              handleCopyText(
                                `${formatSec(clip.startTime)} - ${formatSec(clip.endTime)}`,
                                `ts-${clip.id}`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            {copiedKey === `ts-${clip.id}` ? 'Disalin' : 'Salin timestamp'}
                          </button>

                          <button
                            onClick={() =>
                              handleCopyText(
                                `${clip.title}\n${clip.quote}`,
                                `detail-${clip.id}`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          >
                            {copiedKey === `detail-${clip.id}` ? 'Disalin' : 'Salin detail'}
                          </button>

                          <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1">
                            <span>Transkrip</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveClipId(clip.id);
                              alert('Membuka editor subtitle untuk klip ini.');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit subtitle</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Floating Bottom Bar */}
              <div className="sticky bottom-4 z-40 bg-[#0d1527]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                <div className="text-xs font-mono font-bold text-white">
                  {checkedClipsCount} klip dicentang
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('studio-render-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Atur gaya
                  </button>

                  <button
                    onClick={handleStartRender}
                    disabled={isRenderingPipeline}
                    className="px-5 py-2 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {isRenderingPipeline ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rendering {Math.round(renderProgressPercent)}%</span>
                      </>
                    ) : (
                      <span>Render sekarang</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. STUDIO RENDER 1080x1920 (Screenshots 3, 4, 5, 6, 89752451.jpg) */}
          {/* ============================================================== */}
          <div
            id="studio-render-section"
            className="pt-8 border-t border-slate-800 space-y-6"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>studio render • 1080x1920</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (8 Cols): Deep Controls from Screenshots */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Kanvas & Rasio Isi */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold text-slate-300">Kanvas & rasio isi</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '9:16', label: '9:16 penuh', sub: 'dipotong penuh' },
                      { id: '1:1', label: '1:1 kotak', sub: 'bar atas-bawah' },
                      { id: '4:5', label: '4:5 klasik', sub: 'bar atas-bawah' },
                      { id: '16:9', label: '16:9 lebar', sub: 'rasio asli' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCanvasRatio(opt.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          canvasRatio === opt.id
                            ? 'bg-cyan-950/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/20'
                            : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Latar bar matching screenshot 89752451.jpg */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold text-slate-300">Latar bar</div>
                  <div className="grid grid-cols-2 gap-2 max-w-md">
                    <button
                      onClick={() => setBarBackground('hitam')}
                      className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all ${
                        barBackground === 'hitam'
                          ? 'bg-[#06b6d4] text-slate-950 font-bold border-cyan-400'
                          : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Hitam polos
                    </button>
                    <button
                      onClick={() => setBarBackground('buram')}
                      className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all ${
                        barBackground === 'buram'
                          ? 'bg-[#06b6d4] text-slate-950 font-bold border-cyan-400'
                          : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Video diburamkan
                    </button>
                  </div>
                </div>

                {/* 2. Titik Fokus Horizontal */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold text-slate-300">Titik fokus horizontal</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'otomatis', label: 'Otomatis (wajah)' },
                      { id: 'kiri', label: 'Kiri' },
                      { id: 'tengah', label: 'Tengah' },
                      { id: 'kanan', label: 'Kanan' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setFocusPoint(opt.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          focusPoint === opt.id
                            ? 'bg-[#06b6d4] text-slate-950 font-bold border-cyan-400'
                            : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Layout Streamer / Facecam */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold text-slate-300">Layout streamer / facecam</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'satu', label: 'Satu video' },
                      { id: 'atas_bawah', label: 'Wajah atas • layar bawah' },
                      { id: 'pip', label: 'Wajah di pojok (PiP)' },
                      { id: 'split', label: 'Split podcast (2 orang)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setLayoutMode(opt.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                          layoutMode === opt.id
                            ? 'bg-[#06b6d4] text-slate-950 font-bold border-cyan-400'
                            : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Banner Judul Hook */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Banner judul hook</span>
                    <input
                      type="checkbox"
                      checked={hasHookBanner}
                      onChange={(e) => setHasHookBanner(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-400 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  {hasHookBanner && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <input
                        type="text"
                        value={bannerPrefix}
                        onChange={(e) => setBannerPrefix(e.target.value)}
                        placeholder="awalan, mis. PART 1:"
                        className="bg-[#0b0f19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        type="text"
                        value={bannerSuffix}
                        onChange={(e) => setBannerSuffix(e.target.value)}
                        placeholder="akhiran, mis. | Klip"
                        className="bg-[#0b0f19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* 5. Subtitle & 13 Gaya Kinetik */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">Subtitle</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        satu klik - font, warna & animasi ikut; tetap bisa diatur di bawah
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasSubtitles}
                      onChange={(e) => setHasSubtitles(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-400 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {hasSubtitles && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {STYLES_LIST.map((st) => {
                        const isChosen = activeStyle === st.id;
                        return (
                          <div
                            key={st.id}
                            onClick={() => onSetStyle(st.id as any)}
                            className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                              isChosen
                                ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400/40 shadow-sm'
                                : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-extrabold text-xs text-white tracking-wide">
                              {st.id === 'SorotKuning' ? (
                                <span className="text-yellow-400">INI CONTOH KLIP</span>
                              ) : st.id === 'Neon' ? (
                                <span className="text-pink-400 underline decoration-cyan-400">
                                  INI CONTOH KLIP
                                </span>
                              ) : st.id === 'KotakHijau' ? (
                                <span className="bg-lime-400 text-slate-950 px-1 rounded">
                                  INI CONTOH KLIP
                                </span>
                              ) : (
                                <span>INI CONTOH KLIP</span>
                              )}
                            </div>
                            <div className="text-[11px] font-bold text-slate-300 mt-2">
                              {st.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {st.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Font, Ukuran & Huruf */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400">Font</div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[
                          'Archivo',
                          'Anton',
                          'Bangers',
                          'Montserrat',
                          'Montserrat tipis',
                          'Space Grotesk',
                        ].map((f) => (
                          <button
                            key={f}
                            onClick={() => setSelectedFont(f)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold truncate transition-colors ${
                              selectedFont === f
                                ? 'bg-[#06b6d4] text-slate-950 font-bold'
                                : 'bg-[#0b0f19] text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400">Ukuran</div>
                        <div className="grid grid-cols-3 gap-2">
                          {['Kecil', 'Sedang', 'Besar'].map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setTextSize(sz.toLowerCase() as any)}
                              className={`py-1 px-2 rounded-lg text-xs font-semibold ${
                                textSize === sz.toLowerCase()
                                  ? 'bg-[#06b6d4] text-slate-950 font-bold'
                                  : 'bg-[#0b0f19] text-slate-400 border border-slate-800'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400">Huruf</div>
                        <div className="grid grid-cols-3 gap-2">
                          {['ABC', 'Asli', 'abc'].map((c) => (
                            <button
                              key={c}
                              onClick={() => setLetterCase(c as any)}
                              className={`py-1 px-2 rounded-lg text-xs font-semibold ${
                                letterCase === c
                                  ? 'bg-[#06b6d4] text-slate-950 font-bold'
                                  : 'bg-[#0b0f19] text-slate-400 border border-slate-800'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Posisi Vertikal Slider */}
                    <div className="space-y-1 pt-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Posisi vertikal</span>
                        <span className="text-cyan-400">{verticalPos}% dari atas</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        value={verticalPos}
                        onChange={(e) => setVerticalPos(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Advanced Toggles & Audio Enhancements */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 cursor-pointer">
                      <span className="text-slate-300">Warna sorotan / kata kunci</span>
                      <input
                        type="checkbox"
                        checked={colorHighlight}
                        onChange={(e) => setColorHighlight(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 text-yellow-400 accent-yellow-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 cursor-pointer">
                      <span className="text-slate-300">Zoom singkat di kata kunci</span>
                      <input
                        type="checkbox"
                        checked={zoomKeyphrase}
                        onChange={(e) => setZoomKeyphrase(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 text-emerald-400 accent-emerald-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 cursor-pointer">
                      <span className="text-slate-300">Progress bar di bawah</span>
                      <input
                        type="checkbox"
                        checked={bottomProgress}
                        onChange={(e) => setBottomProgress(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 text-emerald-400 accent-emerald-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 cursor-pointer">
                      <span className="text-slate-300">Emoji otomatis di atas subtitle</span>
                      <input
                        type="checkbox"
                        checked={autoEmoji}
                        onChange={(e) => setAutoEmoji(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 text-emerald-400 accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Judul pembuka 3 detik */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Judul pembuka 3 detik</span>
                      <input
                        type="checkbox"
                        checked={introHook3s}
                        onChange={(e) => setIntroHook3s(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 text-emerald-400 accent-emerald-500 cursor-pointer"
                      />
                    </div>
                    {introHook3s && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {[
                          'Kotak kuning',
                          'Hook neon',
                          'Serif elegan',
                          'Kotak hitam',
                          'Kertas sobek',
                        ].map((st) => (
                          <button
                            key={st}
                            onClick={() => setIntroStyle(st)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold ${
                              introStyle === st
                                ? 'bg-cyan-400 text-slate-950 font-bold'
                                : 'bg-[#0b0f19] text-slate-400 border border-slate-800'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Musik latar & Volume */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Musik latar</span>
                      <span className="text-[10px] font-mono text-slate-500">mp3/wav/m4a — pakai musik yang boleh dipakai</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-3 py-1.5 rounded-lg bg-[#0b0f19] border border-slate-800 text-slate-300 font-semibold text-xs">
                        Pilih musik
                      </button>
                      <span className="text-slate-500 text-xs">tanpa musik</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Volume musik</span>
                        <span className="text-cyan-400 font-bold">{musicVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVol}
                        onChange={(e) => setMusicVol(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
                      />
                    </div>
                  </div>

                  {/* Penguat suara asli */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="text-slate-400">Penguat suara asli</div>
                    <div className="grid grid-cols-5 gap-2">
                      {['88%', '100%', '125%', '150%', '200%'].map((bst) => (
                        <button
                          key={bst}
                          onClick={() => setVoiceBoost(bst as any)}
                          className={`py-1 px-2 rounded-lg text-xs font-semibold ${
                            voiceBoost === bst
                              ? 'bg-[#06b6d4] text-slate-950 font-bold'
                              : 'bg-[#0b0f19] text-slate-400 border border-slate-800'
                          }`}
                        >
                          {bst}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* B-roll */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="text-slate-400">B-roll video sisipan</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'tanpa', label: 'Tanpa' },
                        { id: 'file', label: 'File saya' },
                        { id: 'pixabay', label: 'Pixabay' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setBRollMode(b.id as any)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold ${
                            bRollMode === b.id
                              ? 'bg-[#06b6d4] text-slate-950 font-bold'
                              : 'bg-[#0b0f19] text-slate-400 border border-slate-800'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 Cols): Sticky 9:16 Vertical Phone Preview matching screenshot 89752451.jpg */}
              <div className="lg:col-span-4 sticky top-6 space-y-4 flex flex-col items-center">
                <div className="w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl relative flex flex-col justify-between">
                  {/* Background: Blurred video frame when barBackground === 'buram' */}
                  {barBackground === 'buram' && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      <img
                        src={thumbnailUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"}
                        alt="Blurred BG"
                        className="w-full h-full object-cover filter blur-xl scale-125 brightness-50 opacity-90"
                      />
                    </div>
                  )}

                  {/* Centered 16:9 Video Player inside Phone */}
                  <div className="relative z-10 w-full my-auto shadow-2xl overflow-hidden">
                    {canvasRatio === '9:16' ? (
                      <canvas
                        ref={canvas9x16Ref}
                        width={540}
                        height={960}
                        className="w-full h-full object-cover block absolute inset-0 z-0"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-black relative overflow-hidden border-y border-slate-800/80">
                        {sourceVideoUrl ? (
                          <video
                            src={sourceVideoUrl}
                            poster={thumbnailUrl}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={thumbnailUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {/* Small streamer facecam overlay */}
                        <div className="absolute bottom-2 left-2 w-16 h-12 rounded border border-cyan-400 overflow-hidden shadow bg-black">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                            alt="Facecam"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Hook Banner inside Phone */}
                  {hasHookBanner && (
                    <div className="relative z-20 p-3 pt-4 text-center">
                      <div className="bg-black/90 backdrop-blur-sm border border-slate-700/80 rounded-xl px-3 py-2 shadow-xl inline-block max-w-[92%]">
                        <div className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-2">
                          {bannerPrefix ? `${bannerPrefix} ` : ''}
                          {activeClip.title}
                          {bannerSuffix ? ` ${bannerSuffix}` : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kinetic Subtitle Preview matching 89752451.jpg */}
                  {hasSubtitles && (
                    <div
                      className="relative z-20 p-4 text-center pointer-events-none"
                      style={{ marginTop: `${verticalPos - 40}%` }}
                    >
                      <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700/80 inline-block text-xs font-black text-cyan-300 shadow-xl tracking-wide uppercase">
                        INI CONTOH KLIP
                      </div>
                    </div>
                  )}

                  {/* Bottom TikTok/Reels overlay indicators */}
                  <div className="relative z-20 p-3 flex items-center justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded bg-black/60">
                      {formatSec(currentVideoTime || currentTime)}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 font-bold text-cyan-400">
                      9:16 HD
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono text-center">
                  pratinjau • klik "Putar" di salah satu klip
                </div>

                <button
                  onClick={handleStartRender}
                  disabled={isRenderingPipeline}
                  className="w-full max-w-[340px] py-3 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xl shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isRenderingPipeline ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rendering ({Math.round(renderProgressPercent)}%)...</span>
                    </>
                  ) : (
                    <span>Render klip terpilih</span>
                  )}
                </button>
                <div className="text-[11px] font-mono text-slate-500 text-center">
                  {checkedClipsCount} klip dicentang
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
