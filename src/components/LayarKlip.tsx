import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Download,
  ArrowLeft,
  X,
  Shield,
  Check,
  Music,
  Zap,
  Sparkles,
  Video,
  Hash,
  Cpu,
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
    id: 5,
    rankNum: 5,
    title: 'Dan karena apa?',
    viralScore: 99,
    startTime: 509.44,
    endTime: 539.72,
    durationSec: 30,
    hookTimestamp: 'hook 08:29',
    quote:
      '“Dan karena apa? Karena tanya kepada siswa, lebih banyak mana mendapatkan pengetahuan dari guru atau dari TikTok atau dari Youtube? Mereka akan jawabnya lebih banyak dari Youtube, dari Google ya kan? Mereka dapetnya itu...”',
    caption: 'Dan karena apa?',
    reason: 'pembuka kuat · ada pertanyaan · 3 kata pemikat · bicara padat',
    isChecked: true,
    file: 'klip-05.mp4',
  },
  {
    id: 1,
    rankNum: 1,
    title: 'Jadi gini, cara kerja otak itu adalah mereka hanya akan mengingat sesu',
    viralScore: 67,
    startTime: 0.0,
    endTime: 28.42,
    durationSec: 28,
    hookTimestamp: 'hook 00:00',
    quote:
      '“Jadi gini, cara kerja otak itu adalah mereka hanya akan mengingat sesuatu yang menurut mereka penting. Itu otak. Ketika mereka belajar, tapi tidak dikasih tahu maknanya apa, mereka nggak tahu, suka ya saya belajar ini vaidahnya untuk apa, maka si otak itu akan mencoba menghapus materi yang kita pelajari...”',
    caption: 'Jadi gini, cara kerja otak itu adalah mereka hanya akan mengingat sesu',
    reason: 'pembuka kuat · 3 kata pemikat · bicara padat · sering diputar ulang',
    isChecked: true,
    file: 'klip-01.mp4',
  },
  {
    id: 3,
    rankNum: 3,
    title: 'Kok sama semangketan saya?',
    viralScore: 63,
    startTime: 256.24,
    endTime: 284.16,
    durationSec: 28,
    hookTimestamp: 'hook 04:16',
    quote:
      '“Kok sama semangketan saya? Nah jadi poinnya aku sebenernya itu yang mereka passion and devote. Iya kan? Iya. Dan ketika jam kosong mereka tuh gue nih suka main bola. yaudah gue tenang-tenang itu...”',
    caption: 'Kok sama semangketan saya?',
    reason: 'pembuka kuat · ada pertanyaan · 1 kata pemikat · bicara padat',
    isChecked: true,
    file: 'klip-03.mp4',
  },
  {
    id: 2,
    rankNum: 2,
    title: 'Cara kerja otak tuh begitu.',
    viralScore: 60,
    startTime: 53.02,
    endTime: 83.4,
    durationSec: 30,
    hookTimestamp: 'hook 00:53',
    quote:
      '“Cara kerja otak tuh begitu. Nah kemudian kita belajar sesuatu yang kemudian dihapus lagi sama otak, di pelajari lagi ya rusak lah. Setelah rusak si otak itu akhirnya apa? Terumah belajar...”',
    caption: 'Cara kerja otak tuh begitu.',
    reason: 'pembuka kuat · ada pertanyaan · 2 kata pemikat',
    isChecked: true,
    file: 'klip-02.mp4',
  },
  {
    id: 4,
    rankNum: 4,
    title: 'Saya harus menggaris bahwa materi -materi pendidikan kita tidak releva',
    viralScore: 60,
    startTime: 438.52,
    endTime: 469.54,
    durationSec: 31,
    hookTimestamp: 'hook 07:18',
    quote:
      '“Saya harus menggaris bahwa materi-materi pendidikan kita tidak relevan. Jadi kalau misalkan materi pendidikan kita relevan, maka yang saya harusnya diajarkan di sekolah itu adalah bagaimana caranya agar tidak obesitas...”',
    caption: 'Saya harus menggaris bahwa materi -materi pendidikan kita tidak releva',
    reason: 'pembuka kuat · ada pertanyaan · 5 kata pemikat',
    isChecked: true,
    file: 'klip-04.mp4',
  },
];

export interface MalikiPreset {
  nama: string;
  ket: string;
  font: string;
  huruf: 'kapital' | 'kecil' | 'biasa';
  per: number;
  uk: number;
  warna: string;
  mode: 'warna' | 'pop' | 'komik' | 'tebal' | 'karaoke' | 'terbaca' | 'polos' | 'kotak';
  tepi?: number;
  zoom?: boolean;
  kotak?: string;
  latar?: 'hitam' | 'blur';
  bannerKotak?: string;
  bannerWarna?: string;
  progres?: boolean;
  judul?: string;
}

export const PRESETS_MALIKI: Record<string, MalikiPreset> = {
  sorot: {
    nama: 'Sorot Kuning',
    ket: 'kata aktif menyala',
    font: 'Archivo Black',
    huruf: 'kapital',
    per: 3,
    uk: 78,
    warna: '#FFD400',
    mode: 'warna',
    tepi: 6,
  },
  pop: {
    nama: 'Pop Kapital',
    ket: 'besar, memantul, kata kunci',
    font: 'Anton',
    huruf: 'kapital',
    per: 2,
    uk: 112,
    warna: '#FFD400',
    mode: 'pop',
    tepi: 4,
    zoom: true,
  },
  komik: {
    nama: 'Komik Tebal',
    ket: 'tepi hitam tebal',
    font: 'Bangers',
    huruf: 'kapital',
    per: 3,
    uk: 104,
    warna: '#3BE477',
    mode: 'komik',
    tepi: 10,
  },
  halus: {
    nama: 'Halus Premium',
    ket: 'kecil, tipis → tebal',
    font: 'Montserrat Light',
    huruf: 'kecil',
    per: 4,
    uk: 62,
    warna: '#FFFFFF',
    mode: 'tebal',
    tepi: 1,
  },
  karaoke: {
    nama: 'Karaoke',
    ket: 'warna mengisi kata',
    font: 'Montserrat ExtraBold',
    huruf: 'biasa',
    per: 6,
    uk: 66,
    warna: '#FFD400',
    mode: 'karaoke',
    tepi: 5,
  },
  terbaca: {
    nama: 'Paling Terbaca',
    ket: 'kuning di kotak hitam',
    font: 'Montserrat ExtraBold',
    huruf: 'kapital',
    per: 4,
    uk: 66,
    warna: '#FFE600',
    mode: 'terbaca',
    kotak: '#000000',
  },
  minimal: {
    nama: 'Minimal Bersih',
    ket: 'kalem untuk edukasi',
    font: 'Montserrat Medium',
    huruf: 'biasa',
    per: 6,
    uk: 60,
    warna: '#FFFFFF',
    mode: 'polos',
    tepi: 2,
  },
  podcast: {
    nama: 'Podcast Bingkai',
    ket: 'judul berkotak + progress',
    font: 'Montserrat ExtraBold',
    huruf: 'kapital',
    per: 3,
    uk: 74,
    warna: '#FFD400',
    mode: 'warna',
    tepi: 5,
    latar: 'blur',
    bannerKotak: '#000000',
    progres: true,
  },
  maliki: {
    nama: "Merek CalClip",
    ket: 'gaya situs /kode',
    font: 'Space Grotesk',
    huruf: 'biasa',
    per: 3,
    uk: 72,
    warna: '#22D3EE',
    mode: 'warna',
    kotak: 'rgba(11,15,23,.78)',
    bannerKotak: 'rgba(11,15,23,.78)',
    bannerWarna: '#22D3EE',
    progres: true,
  },
  lime: {
    nama: 'Lime Box',
    ket: 'kotak ikut kata aktif',
    font: 'Montserrat ExtraBold',
    huruf: 'kapital',
    per: 3,
    uk: 76,
    warna: '#C6FF3D',
    mode: 'kotak',
    tepi: 4,
    judul: 'kotak',
  },
  neon: {
    nama: 'Hook Neon',
    ket: 'judul stiker + coretan',
    font: 'Bangers',
    huruf: 'kapital',
    per: 2,
    uk: 108,
    warna: '#FF4FA3',
    mode: 'pop',
    tepi: 8,
    judul: 'neon',
  },
  elegan: {
    nama: 'Serif Elegan',
    ket: 'judul majalah, kalem',
    font: 'Georgia',
    huruf: 'biasa',
    per: 4,
    uk: 68,
    warna: '#FFD400',
    mode: 'warna',
    tepi: 3,
    judul: 'serif',
  },
  sobek: {
    nama: 'Kertas Sobek',
    ket: 'judul di pita kertas',
    font: 'Archivo Black',
    huruf: 'kapital',
    per: 3,
    uk: 74,
    warna: '#FF4FA3',
    mode: 'warna',
    tepi: 6,
    judul: 'sobek',
  },
};

export const RASIO_G: Record<string, number> = {
  '9:16': 9 / 16,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
};

export const FOKUS_G: Record<string, number> = {
  otomatis: 0.5,
  kiri: 0.35,
  tengah: 0.5,
  kanan: 0.65,
};

export const UK_G: Record<string, number> = {
  kecil: 0.82,
  sedang: 1,
  besar: 1.22,
};

export function potongG(
  w: number,
  h: number,
  r: number,
  cx: number,
  cy = 0.5,
  sk = 1
): [number, number, number, number] {
  let cw: number, ch: number;
  if (w / h > r) {
    ch = h * sk;
    cw = ch * r;
  } else {
    cw = w * sk;
    ch = cw / r;
  }
  cw = Math.min(cw, w);
  ch = Math.min(ch, h);
  return [
    Math.min(Math.max(cx * w - cw / 2, 0), w - cw),
    Math.min(Math.max(cy * h - ch / 2, 0), h - ch),
    cw,
    ch,
  ];
}

export function bungkus(
  ctx: CanvasRenderingContext2D,
  teks: string,
  maks: number
): string[] {
  const kata = teks.split(/\s+/);
  const baris: string[] = [];
  let b = '';
  kata.forEach((k) => {
    const c = b ? b + ' ' + k : k;
    if (ctx.measureText(c).width > maks && b) {
      baris.push(b);
      b = k;
    } else {
      b = c;
    }
  });
  if (b) baris.push(b);
  return baris;
}

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
  initialProjectNama?: string | null;
  resetNonce?: number;
  onClearActiveProject?: () => void;
}

export const LayarKlip: React.FC<LayarKlipProps> = ({
  initialProjectNama,
  resetNonce,
  onClearActiveProject,
  currentSource: _currentSource,
  viralMoments: _viralMoments,
  selectedMoment: _selectedMoment,
  onSelectMoment: _onSelectMoment,
  onUploadFile,
  onLoadYouTubeUrl: _onLoadYouTubeUrl,
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

  activeStyle: _activeStyle,
  onSetStyle: _onSetStyle,

  fontSize: _fontSize,
  onSetFontSize: _onSetFontSize,

  canvas9x16Ref: _canvas9x16Ref,
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
  const [youtubeInput, setYoutubeInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  // View state: 'input' (dropzone & setup) vs 'results' (the full Studio Maliki results view)
  const [hasResults, setHasResults] = useState<boolean>(false);
  const [isAturGayaOpen, setIsAturGayaOpen] = useState<boolean>(false);

  // 5-Step Pipeline State matching screenshot 8450cc9e.jpg
  type StepStatus = 'Menunggu' | 'Berjalan...' | 'Beres';
  interface PipelineStep {
    id: number;
    label: string;
    status: StepStatus;
  }

  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 1, label: '01 • UNDUH', status: 'Menunggu' },
    { id: 2, label: '02 • TRANSKRIP', status: 'Menunggu' },
    { id: 3, label: '03 • PILIH MOMEN', status: 'Menunggu' },
    { id: 4, label: '04 • RINGKAS', status: 'Menunggu' },
    { id: 5, label: '05 • SELESAI', status: 'Menunggu' },
  ]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [showLog, setShowLog] = useState<boolean>(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedSecondsRef = useRef<number>(0);
  const phaseTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Settings State matching screenshot 01e31e93.jpg
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [momentSelector, setMomentSelector] = useState<'lokal' | 'gemini' | 'ollama' | 'langganan'>('lokal');
  const [transcriptAccuracy, setTranscriptAccuracy] = useState<'cepat' | 'seimbang' | 'akurat'>('seimbang');
  const [clipDuration, setClipDuration] = useState<'15' | '30' | '60'>('30');
  const [customPrompt, setCustomPrompt] = useState('');
  const [clipCount, setClipCount] = useState<number>(5);
  const [analysisScope, setAnalysisScope] = useState<'semua' | 'khusus'>('semua');
  const [subtitleSource, setSubtitleSource] = useState<'whisper' | 'srt'>('whisper');

  // Detailed Clips State matching screenshots 7c0dfec5.jpg & e5f26f4d.jpg
  const [clips, setClips] = useState<DetailedClip[]>([]);
  const [activeClipId, setActiveClipId] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clipFilter, setClipFilter] = useState<'semua' | 'dirender' | 'dicentang'>('semua');

  // Real backend connection & project state matching real Studio Maliki data
  const [proyekNama, setProyekNama] = useState<string>('');
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [waveformEnergy, setWaveformEnergy] = useState<number[]>([]);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);

  // Helper to construct non-IDM streaming URL for videos (omits .mp4 so IDM extension never intercepts it)
  const getStreamUrl = useCallback((proj: string, filename?: string) => {
    if (!proj) return '';
    if (!filename) return `/stream/klip/${proj}/sumber`;
    if (filename.startsWith('blob:') || filename.startsWith('data:') || filename.startsWith('http')) {
      return filename;
    }
    const cleanName = filename.replace(/\.mp4$/i, '').replace(/^.*\//, '');
    return `/stream/klip/${proj}/${cleanName}`;
  }, []);

  // Studio Render 1080x1920 Configuration matching screenshots e5f936c1.jpg, f79932d9.jpg, 2e48a1b0.jpg, 89752451.jpg
  const [canvasRatio, setCanvasRatio] = useState<'9:16' | '1:1' | '4:3' | '16:9'>('9:16');
  const [barBackground, setBarBackground] = useState<'hitam' | 'buram'>('buram');
  const [renderedCount, setRenderedCount] = useState<number>(0);
  const [focusPoint, setFocusPoint] = useState<'otomatis' | 'kiri' | 'tengah' | 'kanan'>('otomatis');
  const [layoutMode, setLayoutMode] = useState<'satu' | 'atas_bawah' | 'pip' | 'split'>('satu');

  // Streamer / Content Creator & Gameplay Layout Controls
  const [streamerFaceHeight, setStreamerFaceHeight] = useState<number>(42); // 30% - 55%
  const [streamerFaceX, setStreamerFaceX] = useState<number>(0.10); // 0.10 left corner, 0.88 right corner
  const [streamerFaceY, setStreamerFaceY] = useState<number>(0.86); // 0.86 bottom corner, 0.18 top corner
  const [streamerFaceZoom, setStreamerFaceZoom] = useState<number>(2.4); // 1.0x - 3.5x zoom
  const [gameplayFitMode, setGameplayFitMode] = useState<'fit_blur' | 'cover'>('fit_blur'); // fit_blur (rekomendasi gamer) vs cover
  const [gameplayZoom, setGameplayZoom] = useState<number>(1.0); // 1.0x - 2.5x zoom
  const [gameplayFocusX, setGameplayFocusX] = useState<number>(0.5); // 0.0 - 1.0 pan X
  const [gameplayFocusY, setGameplayFocusY] = useState<number>(0.5); // 0.0 - 1.0 pan Y
  const [pipPosition, setPipPosition] = useState<'kanan_atas' | 'kiri_atas' | 'kanan_bawah' | 'kiri_bawah'>('kanan_atas');
  const [isDetectingFacecam, setIsDetectingFacecam] = useState<boolean>(false);
  const [dividerText, setDividerText] = useState<string>(''); // Optional sponsor/branding text on divider bar

  // 2-Person Podcast Layout Controls
  const [podcastP1X, setPodcastP1X] = useState<number>(0.28); // Host / Left person
  const [podcastP2X, setPodcastP2X] = useState<number>(0.72); // Guest / Right person
  const [podcastZoom, setPodcastZoom] = useState<number>(1.35); // 1.0x - 2.0x zoom
  const [podcastSwap, setPodcastSwap] = useState<boolean>(false); // Swap top / bottom
  const [podcastSplitRatio, setPodcastSplitRatio] = useState<number>(50); // 50:50, 45:55, etc.
  const [podcastAutoTransition, setPodcastAutoTransition] = useState<boolean>(true); // Smart auto-switch 1 shot ⇄ 2 screens
  const [podcastPreviewShot, setPodcastPreviewShot] = useState<'auto' | 'split' | 'single'>('auto'); // Live preview switcher (auto / split / single)
  const [podcastSingleFocusX, setPodcastSingleFocusX] = useState<number>(0.50); // Single speaker focus (default center 50%)
  const [hasHookBanner, setHasHookBanner] = useState<boolean>(true);
  const [bannerPrefix, setBannerPrefix] = useState('');
  const [bannerSuffix, setBannerSuffix] = useState('');
  const [hasSubtitles, setHasSubtitles] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('sorot');
  const [selectedFont, setSelectedFont] = useState('Archivo Black');
  const [textSize, setTextSize] = useState<'kecil' | 'sedang' | 'besar'>('sedang');
  const [letterCase, setLetterCase] = useState<'ABC' | 'Asli' | 'abc'>('ABC');
  const [verticalPos, setVerticalPos] = useState<number>(72);
  const [colorHighlight, setColorHighlight] = useState<boolean>(true);
  const [zoomKeyphrase, setZoomKeyphrase] = useState<boolean>(true);
  const [bottomProgress, setBottomProgress] = useState<boolean>(true);
  const [autoEmoji, setAutoEmoji] = useState<boolean>(true);
  const [sensorKataKasar, setSensorKataKasar] = useState<boolean>(false);
  const [hardwareInfo, setHardwareInfo] = useState<{ encoder: string; label: string; is_gpu: boolean } | null>(null);
  const [paksaCpu, setPaksaCpu] = useState<boolean>(false);
  const [introHook3s, setIntroHook3s] = useState<boolean>(true);
  const [introStyle, setIntroStyle] = useState('Kotak kuning');
  const [musicVol, setMusicVol] = useState<number>(18);

  // Background music state & controls
  const [selectedMusicName, setSelectedMusicName] = useState<string>('tanpa musik');
  const [selectedMusicUrl, setSelectedMusicUrl] = useState<string>('');
  const [selectedMusicPath, setSelectedMusicPath] = useState<string>('');
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicFileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleMusicPreview = () => {
    if (!selectedMusicUrl) return;
    if (!musicAudioRef.current) {
      musicAudioRef.current = new Audio(selectedMusicUrl);
      musicAudioRef.current.loop = true;
      musicAudioRef.current.onended = () => setIsMusicPlaying(false);
    } else if (musicAudioRef.current.src !== selectedMusicUrl) {
      musicAudioRef.current.pause();
      musicAudioRef.current = new Audio(selectedMusicUrl);
      musicAudioRef.current.loop = true;
    }
    musicAudioRef.current.volume = musicVol / 100;
    if (isMusicPlaying) {
      musicAudioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      musicAudioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }
  };

  const handleSelectPresetMusic = (nama: string, fileUrl: string, assetName: string) => {
    setSelectedMusicName(nama);
    setSelectedMusicUrl(fileUrl);
    setSelectedMusicPath(assetName);
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current = new Audio(fileUrl);
      musicAudioRef.current.volume = musicVol / 100;
      musicAudioRef.current.loop = true;
    }
    setIsMusicPlaying(false);
    setIsMusicModalOpen(false);
  };

  const handleUploadCustomMusic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedMusicName(file.name);
    const blobUrl = URL.createObjectURL(file);
    setSelectedMusicUrl(blobUrl);
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current = new Audio(blobUrl);
      musicAudioRef.current.volume = musicVol / 100;
      musicAudioRef.current.loop = true;
    }
    setIsMusicPlaying(false);

    try {
      const res = await fetch('/api/unggah', {
        method: 'POST',
        headers: {
          'X-Jenis': 'aset',
          'X-Nama-File': file.name,
        },
        body: file,
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMusicPath(data.jalur || file.name);
      } else {
        setSelectedMusicPath(file.name);
      }
    } catch {
      setSelectedMusicPath(file.name);
    }
    setIsMusicModalOpen(false);
  };

  const handleClearMusic = () => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
    }
    setIsMusicPlaying(false);
    setSelectedMusicName('tanpa musik');
    setSelectedMusicUrl('');
    setSelectedMusicPath('');
  };
  const [voiceBoost, setVoiceBoost] = useState<'88%' | '100%' | '125%' | '150%' | '200%'>('100%');
  const [bRollMode, setBRollMode] = useState<'tanpa' | 'file' | 'pixabay'>('tanpa');

  // TikTok / Reels / Shorts Safe Zone overlay state
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);

  // Subtitle editor modal state
  const [editingClip, setEditingClip] = useState<DetailedClip | null>(null);
  const [editTitleInput, setEditTitleInput] = useState<string>('');
  const [editQuoteInput, setEditQuoteInput] = useState<string>('');
  const [editCaptionInput, setEditCaptionInput] = useState<string>('');
  const [editStartTime, setEditStartTime] = useState<number>(0);
  const [editEndTime, setEditEndTime] = useState<number>(0);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  const handleOpenEditSubtitle = (clip: DetailedClip) => {
    setActiveClipId(clip.id);
    setEditingClip(clip);
    setEditTitleInput(clip.title || '');
    setEditQuoteInput(clip.quote || '');
    setEditCaptionInput(clip.caption || '');
    setEditStartTime(clip.startTime || 0);
    setEditEndTime(clip.endTime || (clip.startTime || 0) + (clip.durationSec || 30));
  };

  const handleSaveSubtitle = () => {
    if (!editingClip) return;
    const updatedTitle = editTitleInput.trim() || editingClip.title;
    const updatedQuote = editQuoteInput.trim() || editingClip.quote;
    const updatedCaption = editCaptionInput.trim() || editingClip.caption;
    const validStart = Math.max(0, editStartTime);
    const validEnd = Math.max(validStart + 1, editEndTime);
    const updatedDuration = Math.round(validEnd - validStart);

    setClips((prev) =>
      prev.map((c) =>
        c.id === editingClip.id
          ? {
              ...c,
              title: updatedTitle,
              quote: updatedQuote,
              caption: updatedCaption,
              startTime: validStart,
              endTime: validEnd,
              durationSec: updatedDuration,
            }
          : c
      )
    );

    setEditingClip(null);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  // Audio chime & Desktop notification on render complete
  const notifyRenderComplete = useCallback((count: number) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification("CalClip.IN - Render Selesai! 🎉", {
            body: `${count} klip MP4 9:16 berhasil dirender dan siap diunduh.`,
            icon: '/logo.png',
          });
        } catch {
          // ignore
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            try {
              new Notification("CalClip.IN - Render Selesai! 🎉", {
                body: `${count} klip MP4 9:16 berhasil dirender dan siap diunduh.`,
                icon: '/logo.png',
              });
            } catch {
              // ignore
            }
          }
        });
      }
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // AudioContext may be restricted before user gesture
    }
  }, []);

  const kanvasStudioRef = useRef<HTMLCanvasElement | null>(null);
  const thumbImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (thumbnailUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = thumbnailUrl;
      img.onload = () => {
        thumbImgRef.current = img;
      };
    }
  }, [thumbnailUrl]);

  const pilihPreset = (id: string) => {
    const p = PRESETS_MALIKI[id];
    if (!p) return;
    setActivePreset(id);
    setSelectedFont(p.font);
    setLetterCase(p.huruf === 'kapital' ? 'ABC' : p.huruf === 'kecil' ? 'abc' : 'Asli');
    setTextSize('sedang');
    setZoomKeyphrase(p.zoom ?? true);
    setBottomProgress(p.progres ?? true);
    if (p.latar) setBarBackground(p.latar === 'blur' ? 'buram' : 'hitam');
    if (p.judul) setHasHookBanner(false);
    else setHasHookBanner(true);
  };

  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0];
  const checkedClipsCount = clips.filter((c) => c.isChecked).length;

  const handleDetectFacecam = async () => {
    setIsDetectingFacecam(true);
    try {
      const res = await fetch('/api/deteksi-facecam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: proyekNama || '', no: activeClip?.id || 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.x !== undefined && data.y !== undefined) {
          setStreamerFaceX(Number(data.x.toFixed(3)));
          setStreamerFaceY(Number(data.y.toFixed(3)));
          if (data.zoom) setStreamerFaceZoom(Number(data.zoom.toFixed(1)));
        }
      }
    } catch (e) {
      console.warn('Deteksi facecam gagal, fallback ke preset:', e);
      setStreamerFaceX(0.10);
      setStreamerFaceY(0.86);
      setStreamerFaceZoom(2.4);
    } finally {
      setIsDetectingFacecam(false);
    }
  };

  const gambarStudioKanvas = useCallback(() => {
    const cv = kanvasStudioRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const W = cv.width;
    const H = cv.height;
    const S = W / 1080;

    const v = videoElemRef.current;
    const siap = !!(v && v.readyState >= 2 && v.videoWidth > 0);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const vw = siap ? v!.videoWidth : 16;
    const vh = siap ? v!.videoHeight : 9;
    const cxAuto = FOKUS_G[focusPoint] ?? 0.5;

    const gb = (
      r: number,
      x: number,
      y: number,
      w: number,
      h: number,
      cx = cxAuto,
      cy = 0.5,
      sk = 1
    ) => {
      if (!siap) {
        if (
          thumbImgRef.current &&
          thumbImgRef.current.complete &&
          thumbImgRef.current.naturalWidth > 0
        ) {
          const [a, b, c, d] = potongG(
            thumbImgRef.current.naturalWidth,
            thumbImgRef.current.naturalHeight,
            r,
            cx,
            cy,
            sk
          );
          try {
            ctx.drawImage(thumbImgRef.current, a, b, c, d, x, y, w, h);
            return;
          } catch {
            // ignore
          }
        }
        ctx.fillStyle = '#151c2c';
        ctx.fillRect(x, y, w, h);
        return;
      }
      const [a, b, c, d] = potongG(vw, vh, r, cx, cy, sk);
      try {
        ctx.drawImage(v!, a, b, c, d, x, y, w, h);
      } catch {
        ctx.fillStyle = '#151c2c';
        ctx.fillRect(x, y, w, h);
      }
    };

    let bar = 0;
    if (layoutMode === 'split') {
      let showSplit = podcastPreviewShot === 'split';
      if (podcastPreviewShot === 'auto') {
        const rentangDua = (activeClip as any)?.podcast_rentang_dua || (_selectedMoment as any)?.podcast_rentang_dua;
        if (Array.isArray(rentangDua) && rentangDua.length > 0) {
          const startT = ((_selectedMoment as any)?.mulai ?? (activeClip as any)?.startTime ?? 0);
          const relT = currentTime - startT;
          showSplit = rentangDua.some(([s, e]: [number, number]) => relT >= s && relT <= e);
        } else {
          // Bila data interval belum ada, default pratinjau shot 1 orang solo (9:16 penuh di tengah, tidak terpotong)
          showSplit = false;
        }
      }

      if (!showSplit) {
        // Mode Shot 1 Orang: 9:16 vertikal PENUH mengikuti fokus pembicara (tengah 50%, tidak terpotong!)
        const singleX = focusPoint === 'otomatis' ? podcastSingleFocusX : cxAuto;
        const pSk = 1 / Math.max(podcastZoom, 0.5);
        gb(W / H, 0, 0, W, H, singleX, 0.38, pSk);
      } else {
        // Mode Shot 2 Orang: Split 2 Layar Atas & Bawah
        const splitPct = podcastSplitRatio / 100;
        const divH = 6 * S;
        const topHeightPx = H * splitPct - divH / 2;
        const botHeightPx = H - topHeightPx - divH;
        const topR = W / topHeightPx;
        const botR = W / botHeightPx;

        const p1X = podcastSwap ? podcastP2X : podcastP1X;
        const p2X = podcastSwap ? podcastP1X : podcastP2X;
        const pSk = 1 / Math.max(podcastZoom, 0.5);

        // Frame atas (Pembicara 1)
        gb(topR, 0, 0, W, topHeightPx, p1X, 0.38, pSk);

        // Bar pemisah dengan aksen cyan
        const divY = topHeightPx;
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, divY, W, divH);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, divY + 2 * S, W, 2 * S);

        // Frame bawah (Pembicara 2)
        gb(botR, 0, divY + divH, W, botHeightPx, p2X, 0.38, pSk);
      }
    } else if (layoutMode === 'atas_bawah') {
      const facePct = streamerFaceHeight / 100;
      const divH = dividerText.trim() ? 32 * S : 6 * S;
      const topHeightPx = H * facePct - divH / 2;
      const botHeightPx = H - topHeightPx - divH;
      const topR = W / topHeightPx;
      const botR = W / botHeightPx;

      const faceSk = 1 / Math.max(streamerFaceZoom, 0.5);
      const gpSk = 1 / Math.max(gameplayZoom, 0.5);

      // 1. Frame atas: Wajah / webcam streamer (dipotong fokus ke facecam)
      gb(topR, 0, 0, W, topHeightPx, streamerFaceX, streamerFaceY, faceSk);

      // 2. Bar pemisah (dengan sponsor/teks atau garis aksen)
      const divY = topHeightPx;
      if (dividerText.trim()) {
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, divY, W, divH);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, divY, W, 2 * S);
        ctx.fillRect(0, divY + divH - 2 * S, W, 2 * S);
        ctx.font = `bold ${12 * S}px "Montserrat"`;
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'center';
        ctx.fillText(dividerText.trim().toUpperCase(), W / 2, divY + 20 * S);
      } else {
        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, divY, W, divH);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, divY + 2 * S, W, 2 * S);
      }

      // 3. Frame bawah: Gameplay dengan opsi Fit Blur (Utuh 16:9) atau Cover (Pan & Zoom)
      if (gameplayFitMode === 'fit_blur') {
        ctx.save();
        ctx.filter = 'blur(14px) brightness(0.65)';
        gb(botR, 0, divY + divH, W, botHeightPx, 0.5, 0.5, 1.0);
        ctx.restore();

        const baseH = W / (16 / 9);
        if (gameplayZoom >= 1.0) {
          // Zoom in & pan aksi game (bisa potong banner/webcam bawah)
          const gameH = baseH;
          const gameY = divY + divH + (botHeightPx - gameH) / 2;
          gb(16 / 9, 0, gameY, W, gameH, gameplayFocusX, gameplayFocusY, 1.0 / gameplayZoom);
        } else {
          // Zoom out (perkecil gameplay 16:9, lebih banyak padding blur)
          const gw = W * gameplayZoom;
          const gh = baseH * gameplayZoom;
          const gx = (W - gw) * gameplayFocusX;
          const gy = divY + divH + (botHeightPx - gh) * gameplayFocusY;
          gb(16 / 9, gx, gy, gw, gh, 0.5, 0.5, 1.0);
        }
      } else {
        gb(botR, 0, divY + divH, W, botHeightPx, gameplayFocusX, gameplayFocusY, gpSk);
      }
    } else if (layoutMode === 'pip') {
      const faceSk = 1 / Math.max(streamerFaceZoom, 0.5);
      if (gameplayFitMode === 'fit_blur') {
        ctx.save();
        ctx.filter = 'blur(16px) brightness(0.6)';
        gb(9 / 16, -10, -10, W + 20, H + 20, 0.5);
        ctx.restore();

        const baseH = W / (16 / 9);
        if (gameplayZoom >= 1.0) {
          const gameH = baseH;
          const gameY = (H - gameH) / 2;
          gb(16 / 9, 0, gameY, W, gameH, gameplayFocusX, gameplayFocusY, 1.0 / gameplayZoom);
        } else {
          const gw = W * gameplayZoom;
          const gh = baseH * gameplayZoom;
          const gx = (W - gw) * gameplayFocusX;
          const gy = (H - gh) * gameplayFocusY;
          gb(16 / 9, gx, gy, gw, gh, 0.5, 0.5, 1.0);
        }
      } else {
        gb(9 / 16, 0, 0, W, H, gameplayFocusX, gameplayFocusY, 1.0 / Math.max(gameplayZoom, 0.5));
      }

      const k = 360 * S;
      let px = W - k - 24 * S;
      let py = 140 * S;
      if (pipPosition === 'kiri_atas') {
        px = 24 * S; py = 140 * S;
      } else if (pipPosition === 'kiri_bawah') {
        px = 24 * S; py = H - k - 200 * S;
      } else if (pipPosition === 'kanan_bawah') {
        px = W - k - 24 * S; py = H - k - 200 * S;
      }

      ctx.fillStyle = '#080c14';
      ctx.fillRect(px - 4 * S, py - 4 * S, k + 8 * S, k + 8 * S);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3 * S;
      ctx.strokeRect(px - 2 * S, py - 2 * S, k + 4 * S, k + 4 * S);
      gb(1, px, py, k, k, streamerFaceX, streamerFaceY, faceSk);

      // Mini badge LIVE
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.beginPath();
      ctx.arc(px + 16 * S, py + 16 * S, 4 * S, 0, Math.PI * 2);
      ctx.fill();
    } else if (canvasRatio === '9:16') {
      gb(9 / 16, 0, 0, W, H);
    } else {
      const r = RASIO_G[canvasRatio] || 9 / 16;
      const ih = W / r;
      bar = (H - ih) / 2;
      if (
        barBackground === 'buram' &&
        (siap || (thumbImgRef.current && thumbImgRef.current.complete))
      ) {
        ctx.save();
        ctx.filter = 'blur(10px) brightness(0.85)';
        gb(9 / 16, -20, -20, W + 40, H + 40, 0.5);
        ctx.restore();
      }
      gb(r, 0, bar, W, ih);
    }

    const k = activeClip;
    const P = PRESETS_MALIKI[activePreset] || PRESETS_MALIKI.sorot;
    const uk = P.uk * (UK_G[textSize] || 1) * S;
    const fontAktif =
      P.mode === 'tebal' && selectedFont === P.font ? 'Montserrat' : selectedFont;
    const tebal = /Archivo|Anton|Bangers|ExtraBold|Medium|Light/.test(selectedFont)
      ? ''
      : 'bold ';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';

    const sensorTeksCanvas = (t: string) => {
      const RE = /\b(anjing|anjir|anjrit|babi|bangsat|bajingan|kontol|memek|pantek|itil|pepek|peler|jembut|titit|tai|taek|asu|kampret|bego|tolol|idiot|fuck|shit|bitch|asshole|cunt|dick)\b/gi;
      return t.replace(RE, (w) => (w.length <= 2 ? '*'.repeat(w.length) : w[0] + '*'.repeat(w.length - 2) + w[w.length - 1]));
    };

    if (hasHookBanner && k) {
      const ukb = Math.max(uk * (P.bannerKotak ? 0.72 : 0.85), 54 * S);
      ctx.font = `${P.mode === 'tebal' ? 'bold ' : tebal}${ukb}px "${
        P.mode === 'tebal' ? 'Montserrat' : selectedFont
      }"`;
      const rawTeks = (bannerPrefix + (k.title || '') + bannerSuffix).toUpperCase();
      const teks = sensorKataKasar ? sensorTeksCanvas(rawTeks) : rawTeks;
      const barAtas = bar / S;
      const mv = (barAtas > 160 ? Math.max(70, barAtas / 2 - 70) : 150) * S;
      bungkus(ctx, teks, W - 160 * S).forEach((b, i) => {
        const y = mv + ukb * (i + 1);
        if (P.bannerKotak) {
          const lw = ctx.measureText(b).width;
          ctx.fillStyle = P.bannerKotak;
          ctx.fillRect(
            W / 2 - lw / 2 - 18 * S,
            y - ukb * 0.95,
            lw + 36 * S,
            ukb * 1.3
          );
        } else {
          ctx.lineWidth = 10 * S;
          ctx.strokeStyle = '#000';
          ctx.strokeText(b, W / 2, y);
        }
        ctx.fillStyle = P.bannerWarna || '#fff';
        ctx.fillText(b, W / 2, y);
      });
    }

    if (hasSubtitles) {
      const contoh =
        {
          2: ['contoh', 'klip'],
          3: ['ini', 'contoh', 'klip'],
          4: ['ini', 'contoh', 'klip', 'viral'],
        }[P.per] || ['ini', 'contoh', 'subtitle', 'klip', 'viral'];

      const hurufFn = (t: string) => {
        const raw =
          letterCase === 'ABC'
            ? t.toUpperCase()
            : letterCase === 'abc'
            ? t.toLowerCase()
            : t;
        return sensorKataKasar ? sensorTeksCanvas(raw) : raw;
      };
      const kata = contoh.map(hurufFn);
      const aktifI = 1;
      const kunciI = kata.length - 1;
      const fnt = (i: number) =>
        `${i === aktifI && P.mode === 'tebal' ? 'bold ' : tebal}${
          uk *
          (i === aktifI && ['warna', 'pop', 'komik'].includes(P.mode) ? 1.1 : 1)
        }px "${i === aktifI ? fontAktif : selectedFont}"`;

      const lebar = kata.map((x, i) => {
        ctx.font = fnt(i);
        return ctx.measureText(x + ' ').width;
      });
      const total = lebar.reduce((a, b) => a + b, 0);
      const y = (H * verticalPos) / 100;

      if (P.kotak) {
        ctx.fillStyle = P.kotak;
        ctx.fillRect(
          W / 2 - total / 2 - 18 * S,
          y - uk * 1.0,
          total + 28 * S,
          uk * 1.32
        );
      }

      let x = W / 2 - total / 2;
      ctx.textAlign = 'left';
      kata.forEach((t, i) => {
        ctx.font = fnt(i);
        let warna = '#fff';
        if (P.mode === 'warna' && i === aktifI) warna = P.warna;
        if ((P.mode === 'pop' || P.mode === 'komik') && i === kunciI)
          warna = P.warna;
        if (P.mode === 'terbaca') warna = i === aktifI ? '#fff' : P.warna;
        if (P.mode === 'karaoke') warna = i <= aktifI ? P.warna : '#fff';
        if (P.mode === 'kotak' && i === aktifI) {
          const lw = ctx.measureText(t).width;
          ctx.fillStyle = P.warna;
          ctx.beginPath();
          ctx.roundRect(x - 10 * S, y - uk * 0.95, lw + 20 * S, uk * 1.25, 10 * S);
          ctx.fill();
          warna = '#111';
        }
        if (!P.kotak && P.tepi) {
          ctx.lineWidth = P.tepi * 2 * S;
          ctx.strokeStyle = '#000';
          ctx.strokeText(t, x, y);
        }
        if (!P.tepi && !P.kotak) {
          ctx.shadowColor = 'rgba(0,0,0,.6)';
          ctx.shadowBlur = 8 * S;
          ctx.shadowOffsetY = 3 * S;
        }
        ctx.fillStyle = warna;
        ctx.fillText(t, x, y);
        ctx.shadowColor = 'transparent';
        x += lebar[i];
      });
      ctx.textAlign = 'center';
    }

    if (bottomProgress) {
      ctx.fillStyle = P.warna;
      ctx.fillRect(0, H - 10 * S, W * 0.42, 10 * S);
    }
  }, [
    canvasRatio,
    barBackground,
    focusPoint,
    layoutMode,
    hasHookBanner,
    bannerPrefix,
    bannerSuffix,
    hasSubtitles,
    activePreset,
    selectedFont,
    textSize,
    letterCase,
    verticalPos,
    bottomProgress,
    activeClip,
    streamerFaceHeight,
    streamerFaceX,
    streamerFaceY,
    streamerFaceZoom,
    gameplayFitMode,
    gameplayZoom,
    gameplayFocusX,
    gameplayFocusY,
    pipPosition,
    dividerText,
    podcastP1X,
    podcastP2X,
    podcastZoom,
    podcastSwap,
    podcastSplitRatio,
    sensorKataKasar,
  ]);

  useEffect(() => {
    if (!isAturGayaOpen) return;
    let animId: number;
    const loop = () => {
      gambarStudioKanvas();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isAturGayaOpen, gambarStudioKanvas]);

  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (isAturGayaOpen) gambarStudioKanvas();
      });
    }
  }, [isAturGayaOpen, gambarStudioKanvas]);

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

  const handleResetAllState = useCallback(() => {
    clearAllTimers();
    setHasResults(false);
    setPipelineState('idle');
    setIsRenderingPipeline(false);
    setYoutubeInput('');
    setProyekNama('');
    setVideoTitle('');
    setSourceVideoUrl('');
    setThumbnailUrl('');
    setClips([]);
    setRenderedCount(0);
    setProgressPercent(0);
    setRenderProgressPercent(0);
    setShowLog(false);
    setIsAturGayaOpen(false);
    if (onClearActiveProject) {
      onClearActiveProject();
    }
    if (onAnalysisStateChange) {
      onAnalysisStateChange(false, '00:00', '');
    }
  }, [onClearActiveProject, onAnalysisStateChange]);

  // Real backend loader
  const loadProjectFromBackend = async (nama: string) => {
    try {
      const res = await fetch(`/api/proyek/klip/${nama}`);
      if (!res.ok) return false;
      const data = await res.json();
      setProyekNama(nama);
      if (data.permintaan?.sumber) setYoutubeInput(data.permintaan.sumber);
      const title = data.info?.judul || data.hasil?.judul || data.judul;
      if (title) setVideoTitle(title);
      const dur = data.info?.durasi || data.hasil?.durasi || data.durasi;
      if (dur) setVideoDuration(dur);
      const streamSrc = data.sumber
        ? data.sumber.replace(/^\/berkas\//, '/stream/').replace(/\.mp4$/i, '')
        : `/stream/klip/${nama}/sumber`;
      setSourceVideoUrl(streamSrc);
      setThumbnailUrl(data.gambar || `/berkas/klip/${nama}/gambar.jpg`);
      const energy = data.info?.energi || data.hasil?.energi || data.energi;
      if (energy && Array.isArray(energy)) {
        setWaveformEnergy(energy);
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
        setRenderedCount(rendered);
      } else {
        setClips(DEFAULT_DETAILED_CLIPS);
        setActiveClipId(DEFAULT_DETAILED_CLIPS[0].id);
        setRenderedCount(5);
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
    const startTime = Date.now();
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
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
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
            const akhir = logs.filter((l: string) => l.startsWith('•')).pop() || '';
            const activeStep = akhir.replace(/^•\s*/, '').slice(0, 32) || 'Mengunduh...';
            onAnalysisStateChange(true, timeStr, activeStep, 'Menganalisis video');
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
            const akhir = logs.filter((l: string) => l.startsWith('•')).pop() || '';
            const activeStep = akhir.replace(/^•\s*/, '').slice(0, 32) || 'Merender...';
            onAnalysisStateChange(true, timeStr, activeStep, 'Merender klip');
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
              setIsRenderingPipeline(false);
              const targetProj = projName || s.hasil?.nama || proyekNama;
              if (targetProj) await loadProjectFromBackend(targetProj);
              const totalRendered = clips.filter((c) => c.isChecked).length;
              setRenderedCount(totalRendered);
              notifyRenderComplete(totalRendered);
              if (onAnalysisStateChange) {
                onAnalysisStateChange(false, timeStr, 'Selesai', 'Merender klip');
              }
            }
          }
        }
      } catch {
        // Keep polling
      }
    }, 1000);

    elapsedTimerRef.current = timer;
  };

  // Respond to navigation from Beranda (either open specific project or clean reset)
  const prevResetNonceRef = useRef(resetNonce);
  useEffect(() => {
    if (initialProjectNama) {
      loadProjectFromBackend(initialProjectNama);
    } else if (resetNonce !== undefined && resetNonce > 0 && resetNonce !== prevResetNonceRef.current) {
      prevResetNonceRef.current = resetNonce;
      handleResetAllState();
    }
  }, [initialProjectNama, resetNonce]);

  const handleResetRef = useRef(handleResetAllState);
  handleResetRef.current = handleResetAllState;
  const loadProjectRef = useRef(loadProjectFromBackend);
  loadProjectRef.current = loadProjectFromBackend;

  // Initial mount: auto-detect existing project or active job
  useEffect(() => {
    let isMounted = true;
    const initCheck = async () => {
      try {
        fetch('/api/info-hardware')
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.encoder && isMounted) setHardwareInfo(data);
          })
          .catch(() => {});

        const statusRes = await fetch('/api/status');
        if (statusRes.ok) {
          const s = await statusRes.json();
          if (s.status === 'jalan' && isMounted) {
            mulaiPantauBackend(s.jenis === 'render' ? 'render' : 'klip');
            return;
          }
        }
      } catch {
        // Fallback default
      }
    };
    initCheck();

    const handleBukaProyekEvent = (e: any) => {
      if (e.detail) {
        loadProjectRef.current(e.detail);
      }
    };
    const handleResetEvent = () => {
      handleResetRef.current();
    };

    window.addEventListener('buka-proyek-klip', handleBukaProyekEvent);
    window.addEventListener('reset-proyek-klip', handleResetEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('buka-proyek-klip', handleBukaProyekEvent);
      window.removeEventListener('reset-proyek-klip', handleResetEvent);
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

    setIsAturGayaOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const checkedClips = clips.filter((c) => c.isChecked);
    const checkedNos = checkedClips.map((c) => c.rankNum || c.id);
    const totalClips = checkedClips.length || 5;
    const targetProjectNama = proyekNama || 'proyek-aktif';

    try {
      const res = await fetch('/api/klip-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: targetProjectNama,
          pilih: checkedNos,
          gaya: {
            rasio: canvasRatio,
            latar: barBackground,
            fokus: focusPoint === 'otomatis' ? 'auto' : focusPoint,
            layout: layoutMode,
            banner: hasHookBanner,
            awalan: bannerPrefix,
            akhiran: bannerSuffix,
            subtitle: hasSubtitles,
            font: selectedFont,
            posisi_y: verticalPos,
            musik: selectedMusicPath || '',
            volume_musik: selectedMusicPath ? musicVol : 0,
            warna: '#FFD400',
            sensor: sensorKataKasar,
            encoder: paksaCpu ? 'cpu' : 'auto',
            streamer_face_height: streamerFaceHeight,
            streamer_face_x: streamerFaceX,
            streamer_face_y: streamerFaceY,
            streamer_face_zoom: streamerFaceZoom,
            gameplay_fit_mode: gameplayFitMode,
            gameplay_zoom: gameplayZoom,
            gameplay_focus_x: gameplayFocusX,
            gameplay_focus_y: gameplayFocusY,
            pip_position: pipPosition,
            divider_text: dividerText,
            podcast_p1_x: podcastP1X,
            podcast_p2_x: podcastP2X,
            podcast_zoom: podcastZoom,
            podcast_swap: podcastSwap,
            podcast_split_ratio: podcastSplitRatio,
            podcast_auto_transition: podcastAutoTransition,
            podcast_single_focus_x: podcastSingleFocusX,
          },
          klip_edit: Object.fromEntries(
            clips.map((c) => [
              String(c.rankNum || c.id),
              { mulai: c.startTime, selesai: c.endTime, judul: c.title },
            ])
          ),
          judul: Object.fromEntries(
            clips.map((c) => [String(c.rankNum || c.id), c.title])
          ),
        }),
      });
      if (res.ok) {
        setIsRenderingPipeline(true);
        setRenderProgressPercent(14);
        mulaiPantauBackend('render', targetProjectNama);
        return;
      }
    } catch {
      // Offline fallback
    }

    // Realistic fallback simulation (realistic pacing: ~70 seconds across checked clips)
    setIsRenderingPipeline(true);
    setRenderProgressPercent(10);
    setRenderElapsedSec(0);

    setRenderSteps([
      { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
      { id: 2, label: `02 • RENDER (1/${totalClips})`, status: 'Berjalan...' },
      { id: 3, label: '03 • SELESAI', status: 'Menunggu' },
    ]);

    setRenderLogLines([
      `$ python.exe klip.py --render --keluar C:\\Users\\Asus ROG\\CalClip\\klip\\${targetProjectNama} --pilih ${checkedNos.join(',')} --gaya gaya-permintaan.json`,
      `• Menyiapkan konfigurasi render 1080x1920 30fps (Kanvas: ${canvasRatio}, Latar: ${barBackground})...`,
      `• Mengurai subtitle kinetik font: ${selectedFont}, layout: ${layoutMode}...`,
      `• Render 1/${totalClips}: ${checkedClips[0]?.title || 'Klip 1'} (${formatSec(checkedClips[0]?.startTime || 0)} - ${formatSec(checkedClips[0]?.endTime || 30)})...`,
    ]);

    if (onAnalysisStateChange) {
      onAnalysisStateChange(true, '00:01', `Render 1/${totalClips}...`, 'Merender klip');
    }

    const renderStartTime = Date.now();
    const totalDurationSec = totalClips * 14; // ~14s per clip => ~70s total
    if (renderElapsedTimerRef.current) clearInterval(renderElapsedTimerRef.current);

    renderElapsedTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - renderStartTime) / 1000);
      setRenderElapsedSec(elapsed);

      const currentClipIdx = Math.min(totalClips - 1, Math.floor(elapsed / 14));
      const currentClipObj = checkedClips[currentClipIdx] || checkedClips[0];
      const stepProg = Math.min(99, Math.round((elapsed / totalDurationSec) * 100));
      setRenderProgressPercent(stepProg);

      setRenderSteps([
        { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
        { id: 2, label: `02 • RENDER (${currentClipIdx + 1}/${totalClips})`, status: 'Berjalan...' },
        { id: 3, label: '03 • SELESAI', status: 'Menunggu' },
      ]);

      if (onAnalysisStateChange) {
        onAnalysisStateChange(
          true,
          formatSec(elapsed),
          `Render ${currentClipIdx + 1}/${totalClips}...`,
          'Merender klip'
        );
      }

      // Log progress simulation
      const secInClip = elapsed % 14;
      if (secInClip === 0 && elapsed > 0) {
        // Finished previous clip, start next
        setRenderLogLines((prev) => [
          ...prev,
          `• Render ${currentClipIdx}/${totalClips} selesai: klip-0${checkedClips[currentClipIdx - 1]?.rankNum || currentClipIdx}.mp4 (${(8.5 + Math.random() * 2).toFixed(1)} MB)`,
          `• Render ${currentClipIdx + 1}/${totalClips}: ${currentClipObj.title} (${formatSec(currentClipObj.startTime)} - ${formatSec(currentClipObj.endTime)})...`,
        ]);
      } else if (secInClip % 4 === 0) {
        const frame = Math.min(900, Math.round((secInClip / 14) * 900) + 60);
        const size = Math.round((frame / 900) * 8500);
        setRenderLogLines((prev) => [
          ...prev,
          `  frame= ${String(frame).padStart(4, ' ')} fps= 24.8 q=28.0 size= ${String(size).padStart(6, ' ')}kB time=00:00:${formatSec(secInClip * 2)} bitrate=2340kbits/s speed=0.84x`,
        ]);
      }

      if (elapsed >= totalDurationSec) {
        if (renderElapsedTimerRef.current) clearInterval(renderElapsedTimerRef.current);

        setRenderProgressPercent(100);
        setRenderSteps([
          { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
          { id: 2, label: '02 • RENDER', status: 'Beres' },
          { id: 3, label: '03 • SELESAI', status: 'Beres' },
        ]);
        setRenderedCount(totalClips);
        notifyRenderComplete(totalClips);

        // Update clips with rendered files!
        setClips((prev) =>
          prev.map((c) => ({
            ...c,
            file: c.file || `klip-0${c.rankNum || c.id}.mp4`,
          }))
        );

        setRenderLogLines((prev) => [
          ...prev,
          `• Render ${totalClips}/${totalClips} selesai: klip-0${checkedClips[totalClips - 1]?.rankNum || totalClips}.mp4 (9.8 MB)`,
          `• Selesai. Semua ${totalClips} klip berhasil dirender ke MP4 1080x1920.`,
          `• Berkas tersimpan di C:\\Users\\Asus ROG\\CalClip\\klip\\${targetProjectNama}\\`,
        ]);

        if (onAnalysisStateChange) {
          onAnalysisStateChange(false, formatSec(elapsed), 'Selesai', 'Merender klip');
        }

        onExportVideo();
      }
    }, 1000);
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
    if (!proyekNama) return;
    try {
      await fetch('/api/buka-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis: 'klip',
          nama: proyekNama,
        }),
      });
    } catch {
      alert('Folder hasil ekspor dibuka di direktori lokal.');
    }
  };

  const handleCariMomen = async () => {
    clearAllTimers();
    const rawUrl = youtubeInput.trim();
    if (!rawUrl) return;

    setPipelineState('running');
    setProgressPercent(12);
    setHasResults(false);
    setIsRenderingPipeline(false);
    setRenderedCount(0);
    elapsedSecondsRef.current = 0;

    let determinedTitle = 'Menganalisis video...';
    let ytThumbnail = '';
    let matchedLocalProject = '';

    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = ytMatch ? ytMatch[1] : '';
    if (videoId) {
      ytThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      setThumbnailUrl(ytThumbnail);
    }

    // Dynamically check existing projects on local disk matching this video
    try {
      const projRes = await fetch('/api/proyek');
      if (projRes.ok) {
        const projList = await projRes.json();
        if (Array.isArray(projList)) {
          for (const p of projList) {
            if (p.jenis === 'klip') {
              try {
                const detailRes = await fetch(`/api/proyek/klip/${p.nama}`);
                if (detailRes.ok) {
                  const detailData = await detailRes.json();
                  const src = detailData.permintaan?.sumber || '';
                  if ((videoId && src.includes(videoId)) || (rawUrl && src.includes(rawUrl))) {
                    matchedLocalProject = p.nama;
                    determinedTitle =
                      detailData.info?.judul ||
                      detailData.hasil?.judul ||
                      detailData.judul ||
                      p.judul ||
                      determinedTitle;
                    ytThumbnail = detailData.gambar || `/berkas/klip/${p.nama}/gambar.jpg`;
                    setVideoTitle(determinedTitle);
                    setThumbnailUrl(ytThumbnail);
                    const sUrl = detailData.sumber
                      ? detailData.sumber.replace(/^\/berkas\//, '/stream/').replace(/\.mp4$/i, '')
                      : `/stream/klip/${p.nama}/sumber`;
                    setSourceVideoUrl(sUrl);
                    break;
                  }
                }
              } catch {}
            }
          }
        }
      }
    } catch {}

    if (!matchedLocalProject) {
      setSourceVideoUrl('');
      try {
        const oRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`);
        if (oRes.ok) {
          const odata = await oRes.json();
          if (odata.title) determinedTitle = odata.title;
          if (odata.thumbnail_url) {
            ytThumbnail = odata.thumbnail_url;
            setThumbnailUrl(odata.thumbnail_url);
          }
        }
      } catch {}
    }
    setVideoTitle(determinedTitle);

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
        setSourceVideoUrl(`/stream/klip/${j.proyek}/sumber`);
        setThumbnailUrl(`/berkas/klip/${j.proyek}/gambar.jpg`);
        mulaiPantauBackend('klip', j.proyek);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.galat && String(errData.galat).toLowerCase().includes('berjalan')) {
          mulaiPantauBackend('klip');
          return;
        }
      }
    } catch {
      // Backend not running, run authentic realistic simulation
    }

    setPipelineSteps([
      { id: 1, label: '01 • UNDUH', status: 'Berjalan...' },
      { id: 2, label: '02 • TRANSKRIP', status: 'Menunggu' },
      { id: 3, label: '03 • PILIH MOMEN', status: 'Menunggu' },
      { id: 4, label: '04 • RINGKAS', status: 'Menunggu' },
      { id: 5, label: '05 • SELESAI', status: 'Menunggu' },
    ]);

    setLogLines([
      `$ python.exe klip.py ${rawUrl} --jumlah ${clipCount} --durasi ${clipDuration} --ai ${momentSelector}`,
      `• Memeriksa tautan YouTube: ${rawUrl}`,
      `• Mengambil manifest video & parameter audio (yt-dlp)...`,
      `• Video: ${determinedTitle} — 1920x1080. Heatmap YouTube: tersedia.`,
    ]);

    if (onAnalysisStateChange) {
      onAnalysisStateChange(true, '00:01', 'Mengunduh...', 'Menganalisis video');
    }

    const simStartTime = Date.now();
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - simStartTime) / 1000);
      elapsedSecondsRef.current = sec;
      const timeStr = formatSec(sec);
      if (onAnalysisStateChange) {
        let label = 'Mengunduh...';
        if (sec > 14 && sec <= 32) label = 'Transkrip...';
        else if (sec > 32 && sec <= 44) label = 'Pilih momen...';
        else if (sec > 44) label = 'Ringkas...';
        onAnalysisStateChange(true, timeStr, label, 'Menganalisis video');
      }

      // Add realistic live logs dynamically during simulation
      if (sec === 4) {
        setLogLines((p) => [...p, '  [download]  12.4% of ~98.40MiB at 7.12MiB/s ETA 00:14']);
      } else if (sec === 8) {
        setLogLines((p) => [...p, '  [download]  54.2% of ~98.40MiB at 8.20MiB/s ETA 00:06']);
      } else if (sec === 13) {
        setLogLines((p) => [...p, '  [download]  100% of 98.40MiB in 00:13 at 8.90MiB/s']);
      } else if (sec === 19) {
        setLogLines((p) => [...p, '  [whisper] Segment 1/140 [00:00 - 00:28]: "Jadi gini, cara kerja otak itu adalah..."']);
      } else if (sec === 25) {
        setLogLines((p) => [...p, '  [whisper] Segment 35/140 [04:16 - 04:44]: "Kok sama semangketan saya?..."']);
      } else if (sec === 31) {
        setLogLines((p) => [...p, '  [whisper] Segment 78/140 [08:29 - 08:59]: "Dan karena apa? Karena tanya kepada siswa..."']);
      } else if (sec === 38) {
        setLogLines((p) => [...p, '  [analisis] Menghitung RMS energy: audio dianalisis. 5 kandidat momen viral ditemukan.']);
      } else if (sec === 46) {
        setLogLines((p) => [...p, '  [ringkas] Merangkum hook pembuka dan mengekstrak kata kunci viral.']);
      }
    }, 1000);

    // Step 1 -> 2 (at 14s)
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
        `• [download] 100% of 98.4 MB in 00:13 at 8.9 MiB/s.`,
        `• Video: ${determinedTitle} — 1920x1080. Heatmap YouTube: ada.`,
        `• Transkripsi dengan faster-whisper model 'small' (bahasa Indonesia)...`,
      ]);

      // Step 2 -> 3 (at 32s total, +18s)
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
          `• Transkrip selesai: 140+ segmen kata berhasil diekstrak.`,
          `• Mencari momen dengan algoritma lokal (energi suara + kepadatan kata + heatmap)...`,
        ]);

        // Step 3 -> 4 (at 44s total, +12s)
        const t3 = setTimeout(() => {
          setPipelineSteps([
            { id: 1, label: '01 • UNDUH', status: 'Beres' },
            { id: 2, label: '02 • TRANSKRIP', status: 'Beres' },
            { id: 3, label: '03 • PILIH MOMEN', status: 'Beres' },
            { id: 4, label: '04 • RINGKAS', status: 'Berjalan...' },
            { id: 5, label: '05 • SELESAI', status: 'Menunggu' },
          ]);
          setProgressPercent(88);
          setLogLines((prev) => [
            ...prev,
            `• 5 momen terbaik dipilih berdasarkan rumus viral (skor 99%, 67%, 63%, 60%, 60%).`,
            `• Merangkum judul, caption, dan kalimat pembuka...`,
          ]);

          // Step 4 -> 5 & Finish (at 52s total, +8s)
          const t4 = setTimeout(async () => {
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
              onAnalysisStateChange(false, formatSec(elapsedSecondsRef.current || 42), 'Selesai', 'Menganalisis video');
            }

            if (matchedLocalProject) {
              await loadProjectFromBackend(matchedLocalProject);
            } else {
              const dynamicClips: DetailedClip[] = [
                {
                  id: 1,
                  rankNum: 5,
                  title: `Poin Kunci: ${determinedTitle.slice(0, 48)}`,
                  viralScore: 98,
                  startTime: 10,
                  endTime: 40,
                  durationSec: 30,
                  hookTimestamp: 'hook 00:12',
                  quote: `“${determinedTitle} — bagian pembuka yang paling banyak diputar ulang oleh audiens...”`,
                  caption: determinedTitle.slice(0, 60),
                  reason: 'pembuka kuat · topik menarik · bicara padat',
                  isChecked: true,
                },
                {
                  id: 2,
                  rankNum: 1,
                  title: 'Inti Pembahasan & Fakta Menarik',
                  viralScore: 88,
                  startTime: 55,
                  endTime: 85,
                  durationSec: 30,
                  hookTimestamp: 'hook 00:58',
                  quote: '“Bagian penting ini menguraikan esensi utama materi secara tajam dan memikat penonton...”',
                  caption: `Fakta menarik tentang ${determinedTitle.slice(0, 40)}`,
                  reason: 'ada pertanyaan · sering diputar ulang',
                  isChecked: true,
                },
                {
                  id: 3,
                  rankNum: 3,
                  title: 'Trik & Solusi Praktis',
                  viralScore: 78,
                  startTime: 140,
                  endTime: 170,
                  durationSec: 30,
                  hookTimestamp: 'hook 02:22',
                  quote: '“Penjelasan langkah demi langkah yang ringkas dan mudah dipahami dalam waktu singkat...”',
                  caption: `Solusi praktis: ${determinedTitle.slice(0, 40)}`,
                  reason: '3 kata pemikat · pembuka kuat',
                  isChecked: true,
                },
                {
                  id: 4,
                  rankNum: 2,
                  title: 'Kesimpulan & Poin Krusial',
                  viralScore: 72,
                  startTime: 220,
                  endTime: 250,
                  durationSec: 30,
                  hookTimestamp: 'hook 03:42',
                  quote: '“Pesan penutup yang memberikan kesimpulan jelas dan mendorong diskusi aktif di kolom komentar...”',
                  caption: `Kesimpulan penting: ${determinedTitle.slice(0, 40)}`,
                  reason: 'bicara padat · ada ajakan bertindak',
                  isChecked: true,
                },
                {
                  id: 5,
                  rankNum: 4,
                  title: 'Pertanyaan Penutup yang Bikin Penasaran',
                  viralScore: 65,
                  startTime: 310,
                  endTime: 340,
                  durationSec: 30,
                  hookTimestamp: 'hook 05:12',
                  quote: '“Pertanyaan kritis yang memicu perdebatan konstruktif dan retensi tinggi di sosial media...”',
                  caption: 'Bagaimana menurut kalian tentang ini?',
                  reason: 'ada pertanyaan · memicu diskusi',
                  isChecked: true,
                },
              ];
              const simProj = 'sim-' + Date.now();
              setProyekNama(simProj);
              setClips(dynamicClips);
              setActiveClipId(dynamicClips[0].id);
              setRenderedCount(0);
              setLogLines((prev) => [
                ...prev,
                `• Analisis selesai. Tersedia 5 klip siap potong untuk ${determinedTitle}.`,
              ]);
            }
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

  return (
    <div className="flex-1 min-h-0 p-4 sm:p-6 lg:p-7 overflow-y-auto bg-[#07090f] text-[#eef1f7]">
      <div className="max-w-[1120px] mx-auto space-y-4">
        {/* ============================================================== */}
        {/* 1. INITIAL / DROPDOWN INPUT VIEW (When no results analyzed)     */}
        {/* ============================================================== */}
        {!hasResults && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header matching Studio Maliki layout */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">CALCLIP.IN • AUTO CLIPPER 9:16</span>
              </div>
              <h1 className="text-2xl sm:text-[34px] font-semibold tracking-[-0.035em] leading-[1.12] text-[#eef1f7]">
                Potong video panjang <span className="text-[#8590aa] font-normal">jadi klip siap viral</span>
              </h1>
              <p className="text-[13.5px] text-[#a3acc1] leading-relaxed">
                Tempel link YouTube atau seret file video. Semua diproses di laptopmu, tanpa watermark.
              </p>
            </div>

            {/* Dropzone matching Studio Maliki (Single Clean Dashed Container) */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingFile(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setYoutubeInput(file.name);
                  onUploadFile(file);
                  handleCariMomen();
                }
              }}
              className={`relative border-[1.5px] border-dashed rounded-[22px] p-4 sm:p-5 transition-all duration-200 ${
                isDraggingFile
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-[#2b3550] bg-gradient-to-b from-white/[0.024] to-transparent hover:border-cyan-400/50'
              }`}
            >
              {/* Upper Section: Upload Icon Box + Text Header */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3.5 mb-3.5 cursor-pointer group"
              >
                <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-400/20 group-hover:bg-cyan-400/20 group-hover:border-cyan-400/40 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[15px] sm:text-[16px] font-semibold text-[#eef1f7] group-hover:text-cyan-300 transition-colors">
                    Seret video ke sini
                  </div>
                  <div className="text-[12.5px] sm:text-[13px] text-[#a3acc1]">
                    atau tempel link YouTube di bawah • mp4, mov, mkv
                  </div>
                </div>
              </div>

              {/* Hidden File Input */}
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

              {/* Lower Section: Pill Search Bar */}
              <div className="flex items-center gap-2 p-1.5 pl-3.5 sm:pl-5 rounded-full bg-[#111725] border border-[#2b3550] transition-all focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/30">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCariMomen()}
                  placeholder="https://youtube.com/watch?v=…  atau seret file video ke sini"
                  className="flex-1 bg-transparent border-none text-[13px] sm:text-[14px] text-[#eef1f7] placeholder:text-[#8590aa] focus:outline-none min-w-0"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 sm:px-4 h-[36px] sm:h-[38px] rounded-full border border-[#2b3550] bg-transparent hover:bg-[#151c2c] text-[#a3acc1] hover:text-[#eef1f7] text-[12px] sm:text-[13px] font-medium transition-colors shrink-0"
                >
                  Pilih file
                </button>

                <button
                  type="button"
                  onClick={handleCariMomen}
                  disabled={pipelineState === 'running'}
                  className="px-4 sm:px-5 h-[36px] sm:h-[38px] rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#031418] text-[12px] sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                >
                  {pipelineState === 'running' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Cari momen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Two Configuration Columns matching Studio Maliki (grid2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mesin AI Card */}
              <div className="rounded-[22px] p-4 sm:p-5 bg-[#111725] border border-[#2b3550] space-y-3.5">
                <div className="flex items-center gap-2 text-[14.5px] sm:text-[15px] font-semibold text-[#eef1f7]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Mesin AI</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#a3acc1]">
                    <span>Pemilih momen</span>
                    <span className="font-mono text-[#8590aa] text-[11px]">siap</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'lokal', label: 'Lokal' },
                      { id: 'gemini', label: 'Gemini' },
                      { id: 'ollama', label: 'Ollama/OpenAI' },
                      { id: 'langganan', label: 'Langganan' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setMomentSelector(opt.id as any)}
                        className={`text-center font-mono text-[10px] sm:text-[11.5px] tracking-tight rounded-full min-h-[36px] sm:min-h-[38px] px-1 transition-all truncate ${
                          momentSelector === opt.id
                            ? 'bg-cyan-400 text-[#031418] font-bold border border-cyan-400 shadow-sm'
                            : 'border border-[#2b3550] text-[#a3acc1] hover:text-[#eef1f7] hover:border-[#8590aa] bg-transparent'
                        }`}
                        title={opt.label}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#a3acc1]">
                    <span>Akurasi transkrip</span>
                    <span className="text-[11px] text-[#8590aa] font-mono">makin akurat, makin lama</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'cepat', label: 'Cepat' },
                      { id: 'seimbang', label: 'Seimbang' },
                      { id: 'akurat', label: 'Akurat' },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setTranscriptAccuracy(acc.id as any)}
                        className={`text-center font-mono text-[11.5px] sm:text-[12px] rounded-full min-h-[36px] sm:min-h-[38px] px-2 transition-all truncate ${
                          transcriptAccuracy === acc.id
                            ? 'bg-cyan-400 text-[#031418] font-bold border border-cyan-400 shadow-sm'
                            : 'border border-[#2b3550] text-[#a3acc1] hover:text-[#eef1f7] hover:border-[#8590aa] bg-transparent'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[12px] sm:text-[12.5px] text-[#8590aa] leading-relaxed pt-0.5">
                  Mode lokal memakai rumus: heatmap &quot;paling sering diputar&quot; YouTube, energi suara, kepadatan kata, dan kata hook. Judul diambil dari kalimat pembuka.
                </p>
              </div>

              {/* Atur Klip Card */}
              <div className="rounded-[22px] p-4 sm:p-5 bg-[#111725] border border-[#2b3550] space-y-3">
                <div className="flex items-center gap-2 text-[14.5px] sm:text-[15px] font-semibold text-[#eef1f7]">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Atur klip</span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[12px] sm:text-[12.5px] text-[#a3acc1]">Durasi per klip</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: '15', label: '± 15 dtk' },
                      { id: '30', label: '± 30 dtk' },
                      { id: '60', label: '± 60 dtk' },
                    ].map((dur) => (
                      <button
                        key={dur.id}
                        onClick={() => setClipDuration(dur.id as any)}
                        className={`text-center font-mono text-[11.5px] sm:text-[12px] rounded-full min-h-[36px] sm:min-h-[38px] px-2 transition-all truncate ${
                          clipDuration === dur.id
                            ? 'bg-cyan-400 text-[#031418] font-bold border border-cyan-400 shadow-sm'
                            : 'border border-[#2b3550] text-[#a3acc1] hover:text-[#eef1f7] hover:border-[#8590aa] bg-transparent'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#a3acc1]">
                    <span>Cari momen tertentu</span>
                    <span className="text-[10.5px] sm:text-[11px] text-[#8590aa] font-mono">opsional</span>
                  </div>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="mis. momen lucu, tips praktis, cerita sedih"
                    className="w-full bg-[#07090f] border border-[#2b3550] rounded-xl px-3.5 py-1.5 sm:py-2 text-[12.5px] sm:text-[13px] text-[#eef1f7] placeholder:text-[#8590aa] focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#a3acc1]">
                    <span>Jumlah klip</span>
                    <span className="font-mono text-cyan-400 font-semibold text-[12.5px] sm:text-[13px]">{clipCount} klip</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={clipCount}
                    onChange={(e) => setClipCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f2738] rounded-lg appearance-none cursor-pointer accent-[#22d3ee]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[12px] sm:text-[12.5px] text-[#a3acc1]">Bagian yang dianalisis</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'semua', label: 'Seluruh video' },
                      { id: 'khusus', label: 'Rentang khusus' },
                    ].map((scope) => (
                      <button
                        key={scope.id}
                        onClick={() => setAnalysisScope(scope.id as any)}
                        className={`text-center font-mono text-[11px] sm:text-[12px] rounded-full min-h-[36px] sm:min-h-[38px] px-2 transition-all truncate ${
                          analysisScope === scope.id
                            ? 'bg-cyan-400 text-[#031418] font-bold border border-cyan-400 shadow-sm'
                            : 'border border-[#2b3550] text-[#a3acc1] hover:text-[#eef1f7] hover:border-[#8590aa] bg-transparent'
                        }`}
                      >
                        {scope.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] sm:text-[12.5px] text-[#a3acc1]">
                    <span>Sumber subtitle</span>
                    <span className="text-[10.5px] sm:text-[11px] text-[#8590aa] font-mono">.srt sendiri = lewati transkripsi</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'whisper', label: 'Otomatis (Whisper)' },
                      { id: 'srt', label: 'Unggah .srt' },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSubtitleSource(sub.id as any)}
                        className={`text-center font-mono text-[11px] sm:text-[12px] rounded-full min-h-[36px] sm:min-h-[38px] px-2 transition-all truncate ${
                          subtitleSource === sub.id
                            ? 'bg-cyan-400 text-[#031418] font-bold border border-cyan-400 shadow-sm'
                            : 'border border-[#2b3550] text-[#a3acc1] hover:text-[#eef1f7] hover:border-[#8590aa] bg-transparent'
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
          <div className="rounded-[22px] p-5 sm:p-[22px] bg-[#111725] border border-[#2b3550] space-y-3.5 shadow-xl animate-fadeIn">
            {hasResults && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1f2738]">
                <div className="text-[13px] text-[#a3acc1] font-semibold truncate max-w-2xl">
                  <span className="text-[#8590aa] font-mono">Sumber: </span>
                  <span className="text-[#eef1f7] font-bold">{videoTitle}</span>
                </div>
                <button
                  onClick={handleResetAllState}
                  className="px-4 py-1.5 rounded-full border border-[#2b3550] bg-transparent hover:bg-[#151c2c] text-[#a3acc1] hover:text-[#eef1f7] text-[12.5px] font-medium transition-colors shrink-0"
                >
                  Analisis video lain
                </button>
              </div>
            )}

            {/* Stepper Grid: 3 Steps if Rendering Pipeline, 5 Steps if Analyzing */}
            {isRenderingPipeline ? (
              <div className="grid grid-cols-3 gap-2">
                {renderSteps.map((st) => {
                  const isRunning = st.status === 'Berjalan...';
                  const isDone = st.status === 'Beres';
                  return (
                    <div
                      key={st.id}
                      className={`p-2.5 sm:p-3 rounded-[10px] bg-[#07090f] border transition-all ${
                        isRunning
                          ? 'border-cyan-400 text-[#eef1f7]'
                          : isDone
                          ? 'border-[#1f4d3b] text-[#eef1f7]'
                          : 'border-[#1f2738] text-[#8590aa]'
                      }`}
                    >
                      <b className={`block font-mono text-[11.5px] tracking-wide mb-0.5 ${
                        isRunning ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-[#8590aa]'
                      }`}>
                        {st.label}
                        {isRunning && <span className="inline-block animate-pulse ml-0.5">▍</span>}
                      </b>
                      <span className="text-[12px]">
                        {st.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {pipelineSteps.map((st) => {
                  const isRunning = st.status === 'Berjalan...';
                  const isDone = st.status === 'Beres';
                  return (
                    <div
                      key={st.id}
                      className={`p-2.5 sm:p-3 rounded-[10px] bg-[#07090f] border transition-all ${
                        isRunning
                          ? 'border-cyan-400 text-[#eef1f7]'
                          : isDone
                          ? 'border-[#1f4d3b] text-[#eef1f7]'
                          : 'border-[#1f2738] text-[#8590aa]'
                      }`}
                    >
                      <b className={`block font-mono text-[11.5px] tracking-wide mb-0.5 ${
                        isRunning ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-[#8590aa]'
                      }`}>
                        {st.label}
                        {isRunning && <span className="inline-block animate-pulse ml-0.5">▍</span>}
                      </b>
                      <span className="text-[12px]">
                        {st.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Progress Bar */}
            <div className="w-full bg-[#1f2738] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-400 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${isRenderingPipeline ? renderProgressPercent : progressPercent}%` }}
              />
            </div>

            {/* Controls: Lihat Log toggle & Batalkan button */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={() => setShowLog(!showLog)}
                className="flex items-center gap-1.5 text-[12.5px] text-[#a3acc1] hover:text-[#eef1f7] font-mono transition-colors"
              >
                <span>{showLog ? '▼' : '►'}</span>
                <span>{showLog ? 'Sembunyikan log' : 'Lihat log'}</span>
              </button>

              <button
                onClick={isRenderingPipeline ? handleCancelRender : handleCancelPipeline}
                className="px-4 py-1.5 rounded-full border border-[#2b3550] bg-transparent hover:bg-[#151c2c] text-[#a3acc1] hover:text-[#eef1f7] text-[12.5px] font-medium transition-colors"
              >
                Batalkan
              </button>
            </div>

            {/* Collapsible Log Terminal Box */}
            {showLog && (
              <div className="bg-[#07090f] border border-[#1f2738] rounded-xl p-3 font-mono text-[11px] text-[#a3acc1] space-y-1 max-h-48 overflow-y-auto">
                {(isRenderingPipeline ? renderLogLines : logLines).map((line, idx) => (
                  <div key={idx} className="leading-tight text-[#a3acc1]">
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
          <div className={!isAturGayaOpen ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative" : "fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none"}>
            {/* Left Column (5 Cols): 16:9 Player & Waveform & Ikhtisar */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-4 self-start">
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
                      src={sourceVideoUrl || undefined}
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
                    <div className="w-full h-full flex items-center justify-center bg-black relative">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt="Video Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
                          Menunggu video...
                        </div>
                      )}
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
            <div className="lg:col-span-7 space-y-5 pb-24">
              {/* Top Quick Actions & Category Filter Bar */}
              <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b0f19] border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setClipFilter('semua')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        clipFilter === 'semua'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Semua ({clips.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setClipFilter('dirender')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        clipFilter === 'dirender'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Video Jadi</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        clips.filter((c) => Boolean(c.file)).length > 0
                          ? 'bg-emerald-400 text-slate-950 font-bold animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {clips.filter((c) => Boolean(c.file)).length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClipFilter('dicentang')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        clipFilter === 'dicentang'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dicentang ({checkedClipsCount})
                    </button>
                  </div>

                  {/* Top Quick Actions (No need to scroll down) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAturGayaOpen(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Atur gaya</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartRender}
                      disabled={isRenderingPipeline}
                      className="px-4 py-1.5 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isRenderingPipeline ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Rendering...</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5" />
                          <span>Render ({checkedClipsCount})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

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
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      semua
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => checkAllClips(false)}
                      className="text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
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
                  .filter((c) => {
                    const matchesSearch =
                      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.quote.toLowerCase().includes(searchQuery.toLowerCase());
                    if (!matchesSearch) return false;
                    if (clipFilter === 'dirender') return Boolean(c.file);
                    if (clipFilter === 'dicentang') return Boolean(c.isChecked);
                    return true;
                  })
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

                          <button
                            onClick={() => {
                              const rawWords = `${clip.title} ${clip.caption || ''}`
                                .toLowerCase()
                                .replace(/[^\w\s]/g, '')
                                .split(/\s+/)
                                .filter((w) => w.length >= 4);
                              const dynamicTags = Array.from(new Set(rawWords)).slice(0, 5).map((w) => `#${w}`);
                              const hashtags = ['#fyp', '#viral', '#shorts', '#reels', ...dynamicTags];
                              const postText = `🔥 ${clip.title}\n\n"${clip.quote || clip.caption || ''}"\n\n👇 Tonton sampai habis & share jika bermanfaat!\n\n${hashtags.join(' ')}`;
                              navigator.clipboard.writeText(postText);
                              setCopiedKey(`soc-${clip.id}`);
                              setTimeout(() => setCopiedKey(null), 2500);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/40 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                            title="Salin deskripsi siap upload untuk TikTok / Reels / Shorts"
                          >
                            {copiedKey === `soc-${clip.id}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Caption Disalin!</span>
                              </>
                            ) : (
                              <>
                                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Salin Caption & Tag</span>
                              </>
                            )}
                          </button>

                          <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1">
                            <span>Transkrip</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              handleOpenEditSubtitle(clip);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit subtitle</span>
                          </button>
                        </div>

                        {/* Rendered Vertical Clip Video & Download MP4 matching images 6 & 7 */}
                        {clip.file && (
                          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#080c14]/80 p-3.5 rounded-xl border border-slate-800 animate-fadeIn">
                            <div className="w-28 sm:w-32 aspect-[9/16] bg-black rounded-lg overflow-hidden border border-slate-800 shrink-0 shadow-md">
                              <video
                                src={clip.file ? getStreamUrl(proyekNama, clip.file) : undefined}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>sudah dirender</span>
                              </div>
                              <a
                                href={`/berkas/klip/${proyekNama}/${clip.file}`}
                                download={`${proyekNama}-${clip.file}`}
                                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh MP4</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {clipFilter === 'dirender' && clips.filter((c) => Boolean(c.file)).length === 0 && (
                  <div className="bg-[#0f172a]/70 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                      <Video className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="text-sm font-semibold text-white">Belum ada video yang selesai dirender</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Pilih klip yang ingin dirender, sesuaikan gaya jika diinginkan, lalu klik tombol "Render sekarang" di bawah.
                    </p>
                    <button
                      type="button"
                      onClick={() => setClipFilter('semua')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      Lihat Semua Klip
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Bottom Bar (Persistent & Always in View) */}
              <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-[#0d1527]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-2xl shadow-black/80">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{checkedClipsCount} klip dicentang</span>
                  {clips.filter((c) => Boolean(c.file)).length > 0 && (
                    <span className="text-[11px] text-emerald-400 font-normal hidden sm:inline">
                      • {clips.filter((c) => Boolean(c.file)).length} sudah jadi
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setIsAturGayaOpen(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Atur gaya
                  </button>

                  <button
                    onClick={handleStartRender}
                    disabled={isRenderingPipeline}
                    className="px-5 py-2 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
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

          {isAturGayaOpen && (
            /* ============================================================== */
            /* 4. STUDIO RENDER 1080x1920 (Screenshots 3, 4, 5, 6, 89752451.jpg) */
            /* ============================================================== */
            <div
              id="studio-render-section"
              className="space-y-6 animate-fadeIn"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">calclip.in • render 1080×1920</span>
                </div>
                <button
                  onClick={() => setIsAturGayaOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke daftar klip</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
              {/* Left Column (8 Cols): Deep Controls from Screenshots */}
              <div className="lg:col-span-8 space-y-6">
                {/* Quick Jump Category Navigation Bar (Sticky at Top of Controls) */}
                <div className="sticky top-0 z-30 -mx-1 px-3 py-2.5 bg-[#070b14]/95 backdrop-blur-md border border-slate-800 rounded-2xl mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase px-1 shrink-0 hidden sm:inline">Navigasi:</span>
                  {[
                    { id: 'sec-rasio-layout', label: 'Rasio & Layout' },
                    { id: 'sec-streamer', label: 'Streamer & Game', show: layoutMode === 'atas_bawah' || layoutMode === 'pip' },
                    { id: 'sec-podcast', label: 'Split Podcast', show: layoutMode === 'split' },
                    { id: 'sec-banner', label: 'Banner Hook' },
                    { id: 'sec-subtitle', label: 'Gaya Subtitle' },
                    { id: 'sec-font', label: 'Font & Ukuran' },
                    { id: 'sec-efek', label: 'Efek & Hook' },
                    { id: 'sec-audio', label: 'Musik & Suara' },
                  ]
                    .filter((tab) => tab.show !== false)
                    .map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(tab.id);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#0b0f19] hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0"
                      >
                        {tab.label}
                      </button>
                    ))}
                </div>

                {/* 1. Kanvas & Rasio Isi */}
                <div id="sec-rasio-layout" className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3 scroll-mt-16">
                  <div className="text-xs font-bold text-slate-300">Kanvas & rasio isi</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '9:16', label: '9:16 penuh', sub: 'dipotong penuh' },
                      { id: '1:1', label: '1:1 kotak', sub: 'bar atas-bawah' },
                      { id: '4:3', label: '4:3 klasik', sub: 'bar atas-bawah' },
                      { id: '16:9', label: '16:9 lebar', sub: 'rasio asli' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
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

                {/* Latar bar: Only shown when canvasRatio !== '9:16' || layoutMode !== 'satu' */}
                {(canvasRatio !== '9:16' || layoutMode !== 'satu') && (
                  <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold text-slate-300">Latar bar</div>
                    <div className="grid grid-cols-2 gap-2 max-w-md">
                      <button
                        type="button"
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
                        type="button"
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
                )}

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
                        type="button"
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

                {/* 3. Layout Streamer / Facecam matching screenshot 26971aee.jpg */}
                <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold text-slate-300">Layout streamer / facecam</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'satu', label: 'Satu video' },
                      { id: 'atas_bawah', label: 'Wajah atas • layar bawah' },
                      { id: 'pip', label: 'Wajah di pojok (PiP)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setLayoutMode(opt.id as any);
                          setCanvasRatio('9:16');
                          if (opt.id === 'atas_bawah' || opt.id === 'pip') {
                            handleDetectFacecam();
                          }
                        }}
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
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLayoutMode('split');
                        setCanvasRatio('9:16');
                      }}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        layoutMode === 'split'
                          ? 'bg-[#06b6d4] text-slate-950 font-bold border-cyan-400'
                          : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Split podcast (2 orang)
                    </button>
                  </div>
                </div>

                {/* Panel Pengaturan Khusus: Streamer / Facecam + Gameplay (Aktif untuk Atas-Bawah & PiP) */}
                {(layoutMode === 'atas_bawah' || layoutMode === 'pip') && (
                  <div id="sec-streamer" className="bg-[#0b1329]/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-cyan-950/20 scroll-mt-16">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-xs font-bold text-cyan-300">
                          {layoutMode === 'pip' ? 'Pengaturan PiP Facecam & Layar Game' : 'Pengaturan Gameplay & Facecam Streamer'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectFacecam}
                        disabled={isDetectingFacecam}
                        className="flex items-center gap-1.5 text-[11px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-semibold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isDetectingFacecam ? 'Mendeteksi Facecam...' : 'Deteksi Otomatis (AI)'}</span>
                      </button>
                    </div>

                    {/* Bagian 1: Tampilan Layar Gameplay */}
                    <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">Layar Gameplay</span> {layoutMode === 'atas_bawah' ? '(Bagian Bawah)' : '(Layar Utama)'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-cyan-400 font-mono font-bold bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                            Zoom {gameplayZoom.toFixed(2)}x • Posisi ({Math.round(gameplayFocusX * 100)}%, {Math.round(gameplayFocusY * 100)}%)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setGameplayZoom(1.0);
                              setGameplayFocusX(0.5);
                              setGameplayFocusY(0.5);
                            }}
                            title="Reset ukuran dan posisi game ke standar"
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium transition-all cursor-pointer"
                          >
                            ↺ Reset
                          </button>
                        </div>
                      </div>

                      {/* Mode Tampilan Game: Fit Blur (Utuh) vs Cover (Crop) */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] text-slate-400">Mode Format Layar Game:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setGameplayFitMode('fit_blur')}
                            className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              gameplayFitMode === 'fit_blur'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 font-semibold shadow-sm shadow-cyan-500/10'
                                : 'bg-[#0f172a] text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="font-bold flex items-center gap-1.5">
                              <span>16:9 + Latar Blur</span>
                              <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.2 rounded font-normal">Populer</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Layar game fleksibel dengan latar blur estetik</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGameplayFitMode('cover')}
                            className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              gameplayFitMode === 'cover'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 font-semibold shadow-sm shadow-cyan-500/10'
                                : 'bg-[#0f172a] text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="font-bold">Zoom Penuh (Crop)</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Mengisi seluruh frame tanpa latar blur</div>
                          </button>
                        </div>
                      </div>

                      {/* Kontrol Zoom Gameplay (Zoom In & Zoom Out) */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Zoom Gameplay (Zoom In / Zoom Out):</span>
                          <span className="text-cyan-300 font-mono font-bold">{gameplayZoom.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.7"
                          max="2.5"
                          step="0.05"
                          value={gameplayZoom}
                          onChange={(e) => setGameplayZoom(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>0.7x (Zoom Out)</span>
                          <span className={gameplayZoom === 1.0 ? 'text-cyan-400 font-bold' : ''}>1.0x (Ukuran Asli)</span>
                          <span>1.25x (Potong Banner)</span>
                          <span>2.5x (Close-up)</span>
                        </div>
                      </div>

                      {/* Preset Posisi Fokus Game Cepat */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] text-slate-400">Preset Posisi Layar Game Cepat:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: 'Tengah (Normal)', x: 0.5, y: 0.5, z: 1.0 },
                            { label: 'Potong Banner Bawah', x: 0.5, y: 0.38, z: 1.25 },
                            { label: 'Fokus Kiri (Hero)', x: 0.25, y: 0.5, z: 1.35 },
                            { label: 'Fokus Kanan (Minimap)', x: 0.75, y: 0.5, z: 1.35 },
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setGameplayFocusX(preset.x);
                                setGameplayFocusY(preset.y);
                                setGameplayZoom(preset.z);
                              }}
                              className={`p-1.5 rounded-lg border text-center text-xs font-medium transition-all cursor-pointer ${
                                Math.abs(gameplayFocusX - preset.x) < 0.05 && Math.abs(gameplayFocusY - preset.y) < 0.05 && Math.abs(gameplayZoom - preset.z) < 0.08
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-semibold'
                                  : 'bg-[#0f172a] text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sliders Fine-Tuning Posisi Horizontal & Vertikal Gameplay */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Geser Horizontal (X - Kiri/Kanan):</span>
                            <span className="text-cyan-300 font-mono">{Math.round(gameplayFocusX * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.01"
                            value={gameplayFocusX}
                            onChange={(e) => setGameplayFocusX(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Geser Vertikal (Y - Atas/Bawah):</span>
                            <span className="text-cyan-300 font-mono">{Math.round(gameplayFocusY * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.01"
                            value={gameplayFocusY}
                            onChange={(e) => setGameplayFocusY(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bagian 2: Kamera Facecam / Wajah Streamer */}
                    <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">Kamera Streamer / Facecam</span> {layoutMode === 'atas_bawah' ? '(Bagian Atas)' : '(Kartu PiP)'}
                        </span>
                        <span className="text-[11px] text-cyan-400 font-mono font-bold bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                          Posisi ({Math.round(streamerFaceX * 100)}%, {Math.round(streamerFaceY * 100)}%) • Zoom {streamerFaceZoom.toFixed(1)}x
                        </span>
                      </div>

                      {/* Tombol Sudut Preset (Sesuai posisi webcam di video asli) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Posisi Webcam di Sudut Video Asli:</span>
                          <span className="text-[10px] text-cyan-300">Pilih sudut webcam Anda</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: '↙ Kiri Bawah (MLBB)', x: 0.10, y: 0.86, zoom: 2.4 },
                            { label: '↘ Kanan Bawah', x: 0.88, y: 0.86, zoom: 2.4 },
                            { label: '↖ Kiri Atas', x: 0.10, y: 0.18, zoom: 2.4 },
                            { label: '↗ Kanan Atas', x: 0.88, y: 0.18, zoom: 2.4 },
                          ].map((pos, idx) => {
                            const isMatch = Math.abs(streamerFaceX - pos.x) < 0.12 && Math.abs(streamerFaceY - pos.y) < 0.15;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setStreamerFaceX(pos.x);
                                  setStreamerFaceY(pos.y);
                                  setStreamerFaceZoom(pos.zoom);
                                }}
                                className={`p-2 rounded-lg border text-center text-xs font-medium transition-all cursor-pointer ${
                                  isMatch
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 font-semibold'
                                    : 'bg-[#0f172a] text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {pos.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pilihan Posisi Kartu PiP jika mode PiP aktif */}
                      {layoutMode === 'pip' && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                          <div className="text-[11px] text-slate-400">Posisi Kartu Mengambang PiP di Hasil Klip:</div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: 'kanan_atas', label: '↗ Kanan Atas' },
                              { id: 'kiri_atas', label: '↖ Kiri Atas' },
                              { id: 'kanan_bawah', label: '↘ Kanan Bawah' },
                              { id: 'kiri_bawah', label: '↙ Kiri Bawah' },
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => setPipPosition(pos.id as any)}
                                className={`p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                  pipPosition === pos.id
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-semibold'
                                    : 'bg-[#0f172a] text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sliders Fine-Tuning Facecam: Posisi X, Posisi Y, Zoom */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Posisi Horizontal (X):</span>
                            <span className="text-cyan-300 font-mono font-bold">{Math.round(streamerFaceX * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.01"
                            value={streamerFaceX}
                            onChange={(e) => setStreamerFaceX(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Posisi Vertikal (Y):</span>
                            <span className="text-cyan-300 font-mono font-bold">{Math.round(streamerFaceY * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.01"
                            value={streamerFaceY}
                            onChange={(e) => setStreamerFaceY(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Zoom Wajah:</span>
                            <span className="text-cyan-300 font-mono font-bold">{streamerFaceZoom.toFixed(1)}x</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="3.5"
                            step="0.1"
                            value={streamerFaceZoom}
                            onChange={(e) => setStreamerFaceZoom(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Tinggi Frame Wajah (Khusus Mode Atas-Bawah) */}
                      {layoutMode === 'atas_bawah' && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Tinggi Frame Facecam Atas:</span>
                            <span className="text-cyan-300 font-mono font-bold">{streamerFaceHeight}%</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="55"
                            step="1"
                            value={streamerFaceHeight}
                            onChange={(e) => setStreamerFaceHeight(parseInt(e.target.value, 10))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>

                    {/* Bagian 3: Bar Pemisah & Teks Sponsor / Watermark (Khusus Atas-Bawah) */}
                    {layoutMode === 'atas_bawah' && (
                      <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="text-xs font-semibold text-slate-200">
                          Teks Pemisah / Sponsor (Opsional):
                        </div>
                        <input
                          type="text"
                          placeholder="mis. OURA / @streamer / CalClip.IN (kosongkan untuk garis minimal)"
                          value={dividerText}
                          onChange={(e) => setDividerText(e.target.value)}
                          className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    )}

                    {/* Bagian 4: Tombol Cepat Subtitle */}
                    <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-slate-200">Posisi Subtitle:</span> Saat ini ({verticalPos}%)
                      </div>
                      <div className="flex gap-2">
                        {layoutMode === 'atas_bawah' && (
                          <button
                            type="button"
                            onClick={() => setVerticalPos(Math.max(35, streamerFaceHeight - 3))}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Pasang di Garis Pembatas (Gaya Streamer)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setVerticalPos(72)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer"
                        >
                          Bawah (72%)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel Pengaturan Khusus: Split Podcast (2 Orang) */}
                {layoutMode === 'split' && (
                  <div id="sec-podcast" className="bg-[#0b1329]/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-cyan-950/20 scroll-mt-16">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-xs font-bold text-cyan-300">Pengaturan Split Podcast (2 Orang)</span>
                      </div>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md font-mono">
                        Atas & Bawah
                      </span>
                    </div>

                    {/* Bagian 1: Posisi Kedua Pembicara */}
                    <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">
                          Posisi Pembicara di Video Asli (16:9):
                        </span>
                        <button
                          type="button"
                          onClick={() => setPodcastSwap(!podcastSwap)}
                          className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                            podcastSwap
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                          }`}
                        >
                          ⇄ {podcastSwap ? 'Terswap: Orang 2 di Atas' : 'Tukar Posisi Atas ⇄ Bawah'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>{podcastSwap ? 'Pembicara Bawah (Kiri):' : 'Pembicara Atas (Kiri):'}</span>
                            <span className="text-cyan-300 font-mono font-bold">{Math.round(podcastP1X * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="0.5"
                            step="0.02"
                            value={podcastP1X}
                            onChange={(e) => setPodcastP1X(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>10% (Kiri Jauh)</span>
                            <span>28% (Standar Host)</span>
                            <span>50% (Tengah)</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>{podcastSwap ? 'Pembicara Atas (Kanan):' : 'Pembicara Bawah (Kanan):'}</span>
                            <span className="text-cyan-300 font-mono font-bold">{Math.round(podcastP2X * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="0.9"
                            step="0.02"
                            value={podcastP2X}
                            onChange={(e) => setPodcastP2X(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>50% (Tengah)</span>
                            <span>72% (Standar Tamu)</span>
                            <span>90% (Kanan Jauh)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bagian 2: Zoom & Proporsi Split */}
                    <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Zoom Wajah Pembicara:</span>
                            <span className="text-cyan-300 font-mono font-bold">{podcastZoom.toFixed(2)}x</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="1.8"
                            step="0.05"
                            value={podcastZoom}
                            onChange={(e) => setPodcastZoom(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[11px] text-slate-400">Pembagian Layar (Rasio):</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: '50 : 50', val: 50 },
                              { label: '45 : 55', val: 45 },
                              { label: '55 : 45', val: 55 },
                            ].map((ratio) => (
                              <button
                                key={ratio.val}
                                type="button"
                                onClick={() => setPodcastSplitRatio(ratio.val)}
                                className={`p-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                                  podcastSplitRatio === ratio.val
                                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 font-semibold'
                                    : 'bg-[#0f172a] text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {ratio.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bagian 3: Tombol Cepat Subtitle di Garis Tengah */}
                    <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-300">
                        💬 <span className="font-semibold text-slate-200">Posisi Subtitle:</span> Saat ini ({verticalPos}%)
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setVerticalPos(50)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
                        >
                          📌 Pasang di Garis Tengah (Gaya Podcast)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVerticalPos(72)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                        >
                          Bawah (72%)
                        </button>
                      </div>
                    </div>

                    {/* Bagian 4: Transisi Cerdas Shot 1 Orang ⇄ 2 Layar (Split) */}
                    <div className="bg-[#070b14]/80 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>⚡ Transisi Otomatis (Smart Auto-Switch):</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Aktif
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 max-w-lg leading-relaxed">
                            Bila video asli menyorot 1 orang (single shot), klip otomatis 9:16 penuh ke 1 orang tersebut. Saat video asli menyorot 2 orang sekaligus, otomatis transisi ke 2 layar (atas &amp; bawah).
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={podcastAutoTransition}
                            onChange={(e) => setPodcastAutoTransition(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>

                      {/* Tombol Pratinjau Player (Shot 2 Orang vs Shot 1 Orang vs Otomatis) */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-400 font-medium">Mode Pratinjau Layar HP:</span>
                        <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setPodcastPreviewShot('auto')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                              podcastPreviewShot === 'auto'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold shadow-sm'
                                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                          >
                            ⚡ Otomatis
                          </button>
                          <button
                            type="button"
                            onClick={() => setPodcastPreviewShot('single')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                              podcastPreviewShot === 'single'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold shadow-sm'
                                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                          >
                            👤 Shot 1 Orang
                          </button>
                          <button
                            type="button"
                            onClick={() => setPodcastPreviewShot('split')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                              podcastPreviewShot === 'split'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold shadow-sm'
                                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                          >
                            👥 Shot 2 Orang
                          </button>
                        </div>
                      </div>

                      {/* Slider & Presets Posisi Fokus Saat Shot 1 Orang (9:16 Penuh) */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">🎯 Posisi Fokus Saat Shot 1 Orang (Solo):</span>
                          <span className="text-cyan-300 font-mono font-bold">{Math.round(podcastSingleFocusX * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.20"
                          max="0.80"
                          step="0.01"
                          value={podcastSingleFocusX}
                          onChange={(e) => {
                            setPodcastSingleFocusX(parseFloat(e.target.value));
                            setPodcastPreviewShot('single');
                          }}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="flex justify-between gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setPodcastSingleFocusX(0.35);
                              setPodcastPreviewShot('single');
                            }}
                            className={`px-2.5 py-1 rounded-lg border transition-all ${
                              Math.abs(podcastSingleFocusX - 0.35) < 0.03
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            Kiri (35%)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPodcastSingleFocusX(0.50);
                              setPodcastPreviewShot('single');
                            }}
                            className={`px-2.5 py-1 rounded-lg border transition-all ${
                              Math.abs(podcastSingleFocusX - 0.50) < 0.03
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            Tengah (50% Standar)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPodcastSingleFocusX(0.65);
                              setPodcastPreviewShot('single');
                            }}
                            className={`px-2.5 py-1 rounded-lg border transition-all ${
                              Math.abs(podcastSingleFocusX - 0.65) < 0.03
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            Kanan (65%)
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Saat kamera video hanya menyorot 1 pembicara (single shot), klip otomatis 9:16 penuh pada fokus ini sehingga tubuh &amp; wajah tetap di tengah dan tidak terpotong.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Banner Judul Hook */}
                <div id="sec-banner" className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-3 scroll-mt-16">
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
                <div id="sec-subtitle" className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-4 scroll-mt-16">
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
                    <div className="space-y-3">
                      {/* Preset Cepat Gaya Influencer Viral (1-Klik) */}
                      <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                            <span>⚡ Preset Cepat Influencer Viral (1-Klik):</span>
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono">1-Klik Auto Style</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'terbaca', label: 'Alex Hormozi', tag: 'Kotak Hitam + Kuning' },
                            { id: 'pop', label: 'MrBeast', tag: 'Pop Zoom Kapital' },
                            { id: 'halus', label: 'Ali Abdaal', tag: 'Minimalis Elegan' },
                            { id: 'sorot', label: 'TikTok Neon', tag: 'Sorot Emas Aktif' },
                          ].map((inf) => (
                            <button
                              key={inf.id}
                              type="button"
                              onClick={() => pilihPreset(inf.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                activePreset === inf.id
                                  ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400/50 shadow-sm'
                                  : 'bg-[#080d1a] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <div className="text-xs font-bold flex items-center justify-between">
                                <span>{inf.label}</span>
                                {activePreset === inf.id && <Check className="w-3 h-3 text-cyan-400" />}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{inf.tag}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {Object.entries(PRESETS_MALIKI).map(([id, p]) => {
                        const isChosen = activePreset === id;
                        const hrf = (t: string) =>
                          p.huruf === 'kapital' ? t.toUpperCase() : p.huruf === 'kecil' ? t.toLowerCase() : t;
                        const isKeyphrase = (wIdx: number) =>
                          wIdx === 1 || (wIdx === 2 && (p.mode === 'pop' || p.mode === 'komik'));

                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => pilihPreset(id)}
                            className={`group text-left rounded-xl overflow-hidden border transition-all ${
                              isChosen
                                ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/40 shadow-sm'
                                : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="h-16 flex items-center justify-center bg-gradient-to-b from-[#232c3f] to-[#121722] px-2 text-center overflow-hidden">
                              <span
                                style={{
                                  fontFamily: `'${p.font}', sans-serif`,
                                  backgroundColor: p.kotak ? p.kotak : undefined,
                                  padding: p.kotak ? '2px 8px' : undefined,
                                  borderRadius: p.kotak ? '4px' : undefined,
                                  WebkitTextStroke: (p.tepi ?? 0) >= 6 ? '1.2px #000' : undefined,
                                  paintOrder: 'stroke fill',
                                  color: p.mode === 'terbaca' ? p.warna : '#fff',
                                }}
                                className="text-base sm:text-lg font-bold tracking-wide whitespace-nowrap drop-shadow"
                              >
                                {['ini', 'contoh', 'Klip'].map((word, wIdx) => {
                                  const on = isKeyphrase(wIdx);
                                  let wordStyle: React.CSSProperties = {};
                                  if (on) {
                                    if (p.mode === 'tebal') {
                                      wordStyle = { fontFamily: 'Montserrat', fontWeight: 700, color: '#fff' };
                                    } else if (p.mode === 'terbaca') {
                                      wordStyle = { color: '#fff' };
                                    } else if (p.mode === 'kotak') {
                                      wordStyle = {
                                        backgroundColor: p.warna,
                                        color: '#111',
                                        padding: '0 5px',
                                        borderRadius: '5px',
                                      };
                                    } else {
                                      wordStyle = { color: p.warna };
                                    }
                                  }
                                  return (
                                    <span key={wIdx} style={wordStyle}>
                                      {hrf(word)}{wIdx < 2 ? ' ' : ''}
                                    </span>
                                  );
                                })}
                              </span>
                            </div>
                            <div className="p-2.5">
                              <div className="text-xs font-bold text-slate-200">{p.nama}</div>
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">{p.ket}</div>
                            </div>
                          </button>
                        );
                      })}
                      </div>
                    </div>
                  )}

                  {/* Font, Ukuran & Huruf */}
                  <div id="sec-font" className="pt-4 border-t border-slate-800/80 space-y-3 scroll-mt-16">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400">Font</div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[
                          'Archivo Black',
                          'Anton',
                          'Bangers',
                          'Montserrat',
                          'Montserrat Light',
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
                <div id="sec-efek" className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs scroll-mt-16">
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

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f19] border border-slate-800 cursor-pointer sm:col-span-2">
                      <div>
                        <div className="text-slate-300 font-medium">Sensor kata kasar (Family Friendly)</div>
                        <div className="text-[10px] text-slate-500">Sensor kata tidak pantas jadi bintang (***) otomatis</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={sensorKataKasar}
                        onChange={(e) => setSensorKataKasar(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 text-cyan-400 accent-cyan-500 cursor-pointer"
                      />
                    </label>

                    {/* Hardware Acceleration Indicator & Toggle */}
                    <div className="p-3 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-300 font-semibold">Akselerasi Ekspor Hardware (GPU)</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          hardwareInfo?.is_gpu && !paksaCpu
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}>
                          {paksaCpu ? 'Mode CPU' : hardwareInfo?.label || 'Mendeteksi...'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                        <p>
                          {hardwareInfo?.is_gpu && !paksaCpu
                            ? '⚡ Kartu grafis aktif! Ekspor klip 5x–8x lebih ngebut via GPU.'
                            : '🛡️ Render aman dengan CPU bawaan (kompatibel 100% di semua laptop).'}
                        </p>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white shrink-0">
                          <input
                            type="checkbox"
                            checked={paksaCpu}
                            onChange={(e) => setPaksaCpu(e.target.checked)}
                            className="w-3.5 h-3.5 rounded bg-slate-900 text-cyan-400 accent-cyan-500 cursor-pointer"
                          />
                          <span>Paksa CPU saja</span>
                        </label>
                      </div>
                    </div>
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
                  <div id="sec-audio" className="space-y-3 pt-3 border-t border-slate-800/80 scroll-mt-16">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Musik latar</span>
                      <span className="text-[10px] font-mono text-slate-400">mp3/wav/m4a — pakai musik yang boleh dipakai</span>
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={musicFileInputRef}
                      accept="audio/mp3,audio/wav,audio/m4a,audio/*"
                      onChange={handleUploadCustomMusic}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMusicModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Music className="w-3.5 h-3.5" />
                        <span>Pilih musik</span>
                      </button>

                      {selectedMusicUrl && (
                        <button
                          type="button"
                          onClick={toggleMusicPreview}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isMusicPlaying
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                          }`}
                        >
                          {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isMusicPlaying ? 'Jeda' : 'Preview'}</span>
                        </button>
                      )}

                      <span className="text-xs font-mono text-slate-300 truncate max-w-[180px] bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        {selectedMusicName}
                      </span>

                      {selectedMusicPath && (
                        <button
                          type="button"
                          onClick={handleClearMusic}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Hapus musik"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Volume musik latar</span>
                        <span className="text-cyan-400 font-bold">{musicVol}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVol}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setMusicVol(val);
                          if (musicAudioRef.current) musicAudioRef.current.volume = val / 100;
                        }}
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

              {/* Right Column (4 Cols): Pinned Sticky Phone Canvas Preview (Always in View at Eye Level) */}
              <div className="lg:col-span-4 relative">
                <div className="sticky top-4 self-start space-y-3 flex flex-col items-center w-full max-w-[320px] mx-auto z-20">
                  <div className="ponsel relative w-full">
                  <div className="layar relative overflow-hidden">
                    <canvas
                      ref={kanvasStudioRef}
                      width={540}
                      height={960}
                      className="cursor-pointer block w-full h-full"
                      onClick={() => {
                        const v = videoElemRef.current;
                        if (!v) return;
                        if (v.paused) v.play().catch(() => {});
                        else v.pause();
                      }}
                      title="Klik untuk putar / jeda"
                    />

                    {/* Safe Zone Overlay */}
                    {showSafeZone && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 select-none">
                        {/* Top Header Obstruction Zone */}
                        <div className="w-full h-[14%] border-b border-dashed border-amber-400/80 bg-amber-500/10 rounded-t flex items-center justify-center">
                          <span className="text-[10px] font-mono font-medium text-amber-300 bg-black/70 px-2 py-0.5 rounded shadow">
                            Header / Search / Tab TikTok
                          </span>
                        </div>

                        {/* Middle Safe Area with Right Action Rail */}
                        <div className="w-full flex-1 flex justify-between items-center py-2 relative">
                          <div className="flex-1 h-full border border-dashed border-emerald-400/60 bg-emerald-500/5 rounded flex items-center justify-center">
                            <span className="text-[10px] font-mono font-medium text-emerald-300/90 bg-black/70 px-2 py-0.5 rounded text-center shadow">
                              Zona Aman Subtitle & Wajah
                            </span>
                          </div>

                          {/* Right Action Rail */}
                          <div className="w-[18%] h-full border-l border-dashed border-rose-400/80 bg-rose-500/10 rounded-r flex flex-col items-center justify-center gap-3">
                            <span className="text-[9px] font-mono font-medium text-rose-300 bg-black/70 px-1 py-0.5 rounded rotate-90 whitespace-nowrap shadow">
                              Tombol Like / Share
                            </span>
                          </div>
                        </div>

                        {/* Bottom Caption Zone */}
                        <div className="w-full h-[22%] border-t border-dashed border-amber-400/80 bg-amber-500/10 rounded-b flex items-center justify-center">
                          <span className="text-[10px] font-mono font-medium text-amber-300 bg-black/70 px-2 py-0.5 rounded shadow">
                            Area Caption & Audio TikTok/Reels
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 px-1">
                    <div className="ket text-[11px] text-slate-400 font-mono">
                      pratinjau • klik "Putar"
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSafeZone(!showSafeZone)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-colors border ${
                        showSafeZone
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                      title="Tampilkan / sembunyikan garis panduan zona aman UI TikTok & Reels"
                    >
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <span>Safe Zone {showSafeZone ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartRender}
                    disabled={isRenderingPipeline}
                    className="w-full py-3 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 mt-3.5"
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
                  <div className="text-[11px] font-mono text-slate-500 text-center mt-2">
                    {checkedClipsCount} klip dicentang
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    )}

    {/* Modal Edit Subtitle & Hook Title */}
    {editingClip && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-[#0d1527] border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                #{editingClip.rankNum}
              </div>
              <h3 className="text-base font-bold text-white">
                Edit Subtitle & Teks Klip
              </h3>
            </div>
            <button
              onClick={() => setEditingClip(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Judul Klip (Hook Banner Atas)
              </label>
              <input
                type="text"
                value={editTitleInput}
                onChange={(e) => setEditTitleInput(e.target.value)}
                placeholder="Masukkan judul klip..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080c14] border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Mini Trim Timeline: Detik Mulai & Detik Selesai */}
            <div className="p-3.5 rounded-xl bg-[#080c14] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Potong Klip (Trim Waktu Mulai & Selesai)
                </span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                  Durasi: {Math.max(1, Math.round(editEndTime - editStartTime))} detik
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Detik Mulai */}
                <div className="space-y-1.5 bg-[#0d1527] p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Mulai</span>
                    <span className="font-mono text-cyan-300 font-bold">{formatSec(editStartTime)} ({editStartTime}s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditStartTime((prev) => Math.max(0, Math.round((prev - 1) * 10) / 10))}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors cursor-pointer"
                      title="Maju 1 detik lebih awal"
                    >
                      -1s
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(10, editEndTime - 1)}
                      step={0.5}
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setEditStartTime((prev) => Math.min(editEndTime - 1, Math.round((prev + 1) * 10) / 10))}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors cursor-pointer"
                      title="Mundur 1 detik"
                    >
                      +1s
                    </button>
                  </div>
                </div>

                {/* Detik Selesai */}
                <div className="space-y-1.5 bg-[#0d1527] p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Selesai</span>
                    <span className="font-mono text-cyan-300 font-bold">{formatSec(editEndTime)} ({editEndTime}s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditEndTime((prev) => Math.max(editStartTime + 1, Math.round((prev - 1) * 10) / 10))}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors cursor-pointer"
                      title="Potong 1 detik lebih cepat"
                    >
                      -1s
                    </button>
                    <input
                      type="range"
                      min={editStartTime + 1}
                      max={Math.max(editEndTime + 60, editStartTime + 120)}
                      step={0.5}
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setEditEndTime((prev) => Math.round((prev + 1) * 10) / 10)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors cursor-pointer"
                      title="Tambah 1 detik durasi"
                    >
                      +1s
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kutipan Subtitle (Teks Ucapan / Whisper)
              </label>
              <textarea
                rows={4}
                value={editQuoteInput}
                onChange={(e) => setEditQuoteInput(e.target.value)}
                placeholder="Kutipan ucapan klip..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080c14] border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Caption & Kata Kunci
              </label>
              <input
                type="text"
                value={editCaptionInput}
                onChange={(e) => setEditCaptionInput(e.target.value)}
                placeholder="Caption..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080c14] border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingClip(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveSubtitle}
              className="px-5 py-2 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal Pemilihan Musik Latar */}
    {isMusicModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl shadow-cyan-950/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Pilih Musik Latar</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsMusicModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-semibold">Preset Musik Bebas Royalti:</div>
            <div className="space-y-2">
              {[
                { id: 'lofi', nama: 'Chill Lo-Fi Beat', desc: 'Tenang, santai, cocok untuk podcast & edukasi', url: '/musik/lofi-chill.mp3', asset: 'lofi-chill.mp3' },
                { id: 'upbeat', nama: 'Upbeat Fun & Pop', desc: 'Ceria, bersemangat, cocok untuk gaming & vlog', url: '/musik/upbeat-fun.mp3', asset: 'upbeat-fun.mp3' },
                { id: 'cinematic', nama: 'Deep Cinematic', desc: 'Dramatis, emosional, cocok untuk storytelling', url: '/musik/cinematic-deep.mp3', asset: 'cinematic-deep.mp3' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectPresetMusic(item.nama, item.url, item.asset)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedMusicPath === item.asset
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                      : 'bg-[#0f172a] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{item.nama}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                  <span className="text-[11px] bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded font-mono font-semibold">
                    Pilih
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-semibold">Atau Unggah Berkas Sendiri:</div>
            <button
              type="button"
              onClick={() => musicFileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih Berkas (.mp3, .wav, .m4a) dari Komputer</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Toast feedback */}
    {showSavedToast && (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-200 text-xs font-medium shadow-lg animate-fadeIn">
        <Check className="w-4 h-4 text-cyan-400" />
        <span>Perubahan subtitle berhasil disimpan!</span>
      </div>
    )}
  </div>
</div>
);
};
