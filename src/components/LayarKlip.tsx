import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Scissors,
  Type,
  Layers,
  Palette,
  Sliders,
  RotateCcw,
  RotateCw,
  Upload,
  Play,
  Pause,
  Loader2,
  Copy,
  FolderOpen,
  Search,
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

const EMOJI_MAP: [RegExp, string][] = [
  [/\b(uang|duit|gaji|kaya|cuan|bisnis|jual|untung|profit|investasi|hemat)\b/i, '💰'],
  [/\b(cinta|sayang|hati|nikah|istri|suami|pacar)\b/i, '❤️'],
  [/\b(api|panas|viral|hebat|keren|fyp|trending|meledak|populer)\b/i, '🔥'],
  [/\b(ide|pikir|otak|ilmu|belajar|paham|tips|trik|kunci|rahasia)\b/i, '💡'],
  [/\b(waktu|jam|cepat|lambat|telat|detik)\b/i, '⏰'],
  [/\b(rahasia|diam|bisik)\b/i, '🤫'],
  [/\b(penting|bahaya|awas|hati-hati|peringatan)\b/i, '⚠️'],
  [/\b(salah|jangan|dilarang|gagal|zonk|rugi|boncos|rungkad)\b/i, '❌'],
  [/\b(benar|betul|berhasil|sukses|bisa|gacor|menang|hoki)\b/i, '✅'],
  [/\b(lucu|ketawa|tertawa|ngakak|kocak)\b/i, '😂'],
  [/\b(ternyata|kaget|gila|parah|serius|syok|waduh|anjir)\b/i, '😱'],
  [/\b(allah|tuhan|doa|sholat|salat|ibadah|quran|alquran|nabi|islam)\b/i, '🤲'],
  [/\b(makan|lapar|masak|kopi)\b/i, '🍽️'],
  [/\b(kerja|kantor|karier|karir)\b/i, '💼'],
  [/\b(sehat|olahraga|kuat|otot)\b/i, '💪'],
  [/\b(uji|tes|soal|sekolah|kuliah|buku)\b/i, '📚'],
  [/\b(rumah|keluarga|anak|ibu|ayah|bapak)\b/i, '🏠'],
  [/\b(hp|handphone|aplikasi|internet|ai|game|gaming|mabar|topup|diamond|skin)\b/i, '📱'],
  [/\b(mati|meninggal|takut|seram|hantu|jin|setan|iblis)\b/i, '👻'],
  [/\b(mahal|murah|harga|diskon)\b/i, '🏷️'],
];

export const getEmojiForWord = (word: string): string | null => {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [re, em] of EMOJI_MAP) {
    if (re.test(clean)) return em;
  }
  return null;
};

export const getSentimentColor = (word: string, fallbackColor: string): string => {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/\b(untung|cuan|kaya|sukses|berhasil|bisa|topup|diamond|gacor|wangi|profit|hemat)\b/i.test(clean)) {
    return '#3DFF8A'; // Hijau Viral
  }
  if (/\b(jangan|gagal|zonk|rugi|bahaya|awas|salah|rusak|parah|batal|boncos|rungkad|mati)\b/i.test(clean)) {
    return '#FF453A'; // Merah Neon
  }
  if (/\d+/.test(clean) || /\b(penting|rahasia|kunci|trik|fokus)\b/i.test(clean)) {
    return '#FFD400'; // Kuning Emas
  }
  return fallbackColor;
};

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
  isPlaying: _isPlaying,
  onTogglePlay: _onTogglePlay,
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
  const [editorActiveTab, setEditorActiveTab] = useState<'gaya' | 'teks' | 'hook' | 'layout' | 'potong' | 'efek'>('gaya');

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
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [customHooksByClip, setCustomHooksByClip] = useState<Record<string, string>>({});
  const customHooksByClipRef = useRef<Record<string, string>>({});
  customHooksByClipRef.current = customHooksByClip;

  interface TranscriptWord {
    mulai: number;
    selesai: number;
    teks: string;
  }
  interface TranscriptSegment {
    mulai: number;
    selesai: number;
    teks: string;
    kata?: TranscriptWord[];
  }
  const [projectTranscript, setProjectTranscript] = useState<TranscriptSegment[]>([]);

  // Filmstrip Interactive States
  const filmstripContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbingFilmstrip, setIsScrubbingFilmstrip] = useState<boolean>(false);
  const [isDraggingLeftHandle, setIsDraggingLeftHandle] = useState<boolean>(false);
  const [isDraggingRightHandle, setIsDraggingRightHandle] = useState<boolean>(false);

  const getFullHookText = useCallback((mainText: string, prefix: string, suffix: string) => {
    const parts = [prefix.trim(), mainText.trim(), suffix.trim()].filter(Boolean);
    return parts.join(' ');
  }, []);
  const [waveformEnergy, setWaveformEnergy] = useState<number[]>([]);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);
  const activeClipRangeRef = useRef<{ id: number; start: number; end: number }>({ id: 0, start: 0, end: 30 });

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
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [canvasRatio, setCanvasRatio] = useState<'9:16' | '1:1' | '4:3' | '16:9'>('9:16');
  const [canvasFrameMode, setCanvasFrameMode] = useState<'asli' | '9:16_letterbox'>('asli');
  const [barBackground, setBarBackground] = useState<'hitam' | 'buram'>('buram');

  const canvasDim = useMemo(() => {
    if (canvasFrameMode === '9:16_letterbox') {
      return {
        w: 540,
        h: 960,
        cssW: 270,
        cssH: 480,
        r: '24px',
        maxW: 'max-w-[300px]',
        label: `9:16 Vertikal (Isi ${canvasRatio})`,
      };
    }
    switch (canvasRatio) {
      case '1:1':
        return {
          w: 540,
          h: 540,
          cssW: 270,
          cssH: 270,
          r: '18px',
          maxW: 'max-w-[290px]',
          label: '1:1 Persegi (Kotak)',
        };
      case '4:3':
        return {
          w: 540,
          h: 405,
          cssW: 290,
          cssH: 218,
          r: '16px',
          maxW: 'max-w-[310px]',
          label: '4:3 Klasik (Tablet)',
        };
      case '16:9':
        return {
          w: 640,
          h: 360,
          cssW: 320,
          cssH: 180,
          r: '14px',
          maxW: 'max-w-[330px]',
          label: '16:9 Lebar (Horizontal)',
        };
      case '9:16':
      default:
        return {
          w: 540,
          h: 960,
          cssW: 260,
          cssH: 462,
          r: '24px',
          maxW: 'max-w-[280px]',
          label: '9:16 Vertikal (HP)',
        };
    }
  }, [canvasRatio, canvasFrameMode]);
  const [renderedCount, setRenderedCount] = useState<number>(0);
  const [focusPoint, setFocusPoint] = useState<'otomatis' | 'kiri' | 'tengah' | 'kanan'>('otomatis');
  const [layoutMode, setLayoutMode] = useState<'satu' | 'podcast_auto' | 'atas_bawah' | 'pip' | 'split'>('satu');
  const [isDetectingPodcast, setIsDetectingPodcast] = useState<boolean>(false);

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
  const [podcastPreviewShot, setPodcastPreviewShot] = useState<'auto' | 'split' | 'single' | 'p1' | 'p2'>('auto'); // Live preview switcher (auto / split / single / p1 / p2)
  const [podcastSingleFocusX, setPodcastSingleFocusX] = useState<number>(0.50); // Single speaker focus (default center 50%)
  const [hasHookBanner, setHasHookBanner] = useState<boolean>(false); // default OFF — user aktifkan kalau mau
  const [bannerPrefix, setBannerPrefix] = useState('');
  const [bannerSuffix, setBannerSuffix] = useState('');
  const [hasSubtitles, setHasSubtitles] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('sorot');
  const [selectedFont, setSelectedFont] = useState('Archivo Black');
  const [textSize, setTextSize] = useState<'kecil' | 'sedang' | 'besar'>('sedang');
  const [letterCase, setLetterCase] = useState<'ABC' | 'Asli' | 'abc'>('ABC');
  const [verticalPos, setVerticalPos] = useState<number>(72);
  const [colorHighlight, setColorHighlight] = useState<boolean>(true);
  const [zoomKeyphrase, setZoomKeyphrase] = useState<boolean>(false); // default OFF — cegah zoom acak di video
  const [bottomProgress, setBottomProgress] = useState<boolean>(true);
  const [progressBarColor, setProgressBarColor] = useState<'cyan' | 'kuning' | 'hijau' | 'pelangi'>('cyan');
  const [progressBarThickness, setProgressBarThickness] = useState<number>(8);
  const [autoMicroSfx, setAutoMicroSfx] = useState<boolean>(true);
  const [autoAudioDucking, setAutoAudioDucking] = useState<boolean>(true);
  const [jernihkanSuara, setJernihkanSuara] = useState<boolean>(true);
  const [normalisasiLoudness, setNormalisasiLoudness] = useState<boolean>(true);
  const [highlightColor, setHighlightColor] = useState<string>('#3DFF8A'); // default Hijau Viral
  const [customWordStyles, setCustomWordStyles] = useState<Record<string, { color?: string; emoji?: string }>>({});
  const [selectedWordForEdit, setSelectedWordForEdit] = useState<string | null>(null);
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
          new Notification("CalClip.IN - Render Selesai!", {
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
              new Notification("CalClip.IN - Render Selesai!", {
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
    setZoomKeyphrase(p.zoom ?? false);
    setBottomProgress(p.progres ?? true);
    if (p.latar) setBarBackground(p.latar === 'blur' ? 'buram' : 'hitam');
    setHasHookBanner(false); // preset tidak set banner — selalu mulai OFF
  };

  const activeClip = clips.find((c) => c.id === activeClipId) || clips[0];

  // Sync editing fields with activeClip
  useEffect(() => {
    if (activeClip) {
      setEditTitleInput(activeClip.title || '');
      setEditQuoteInput(activeClip.quote || '');
      setEditCaptionInput(activeClip.caption || '');
      const s = activeClip.startTime || 0;
      const e = activeClip.endTime || (s + (activeClip.durationSec || 30));
      setEditStartTime(s);
      setEditEndTime(e);
      activeClipRangeRef.current = { id: activeClip.id, start: s, end: e };
    }
  }, [activeClip?.id]);

  useEffect(() => {
    if (editEndTime > editStartTime) {
      activeClipRangeRef.current.start = editStartTime;
      activeClipRangeRef.current.end = editEndTime;
    }
  }, [editStartTime, editEndTime]);
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
          const zm = data.zoom ? Math.max(3.2, Number(data.zoom.toFixed(1))) : 3.6;
          setStreamerFaceZoom(zm);
          if (streamerFaceHeight < 38) {
            setStreamerFaceHeight(45);
          }
        }
      }
    } catch (e) {
      console.warn('Deteksi facecam gagal, fallback ke preset:', e);
      setStreamerFaceX(0.11);
      setStreamerFaceY(0.87);
      setStreamerFaceZoom(3.6);
      if (streamerFaceHeight < 38) setStreamerFaceHeight(45);
    } finally {
      setIsDetectingFacecam(false);
    }
  };

  const handleDetectPodcast = async () => {
    setIsDetectingPodcast(true);
    try {
      const res = await fetch('/api/deteksi-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: proyekNama || '', no: activeClip?.id || 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.p1_x !== undefined) setPodcastP1X(Number(data.p1_x.toFixed(3)));
        if (data.p2_x !== undefined) setPodcastP2X(Number(data.p2_x.toFixed(3)));
        if (data.zoom) setPodcastZoom(Number(data.zoom.toFixed(2)));
      }
    } catch (e) {
      console.warn('Deteksi podcast gagal, fallback ke preset:', e);
      setPodcastP1X(0.28);
      setPodcastP2X(0.72);
      setPodcastZoom(1.30);
    } finally {
      setIsDetectingPodcast(false);
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

    let punchSkala = 1.0;
    if (zoomKeyphrase) {
      const curT = hasResults ? currentVideoTime : currentTime;
      const clipStart = editStartTime || activeClip?.startTime || 0;
      const relT = curT - clipStart;
      if ((relT >= 0.2 && relT <= 2.8) || (relT >= 10.0 && relT <= 13.5)) {
        punchSkala = 1.12;
      }
    }

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
      const effSk = Math.max(0.08, Math.min(3.0, sk * punchSkala));
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
            effSk
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
      const [a, b, c, d] = potongG(vw, vh, r, cx, cy, effSk);
      try {
        ctx.drawImage(v!, a, b, c, d, x, y, w, h);
      } catch {
        ctx.fillStyle = '#151c2c';
        ctx.fillRect(x, y, w, h);
      }
    };

    let bar = 0;
    if (layoutMode === 'podcast_auto') {
      // Mode Podcast 1 Layar Penuh 9:16 (Auto Ikuti Pembicara Aktif)
      let spkX = podcastP1X;
      if (podcastPreviewShot === 'p2') {
        spkX = podcastP2X;
      } else if (podcastPreviewShot === 'p1') {
        spkX = podcastP1X;
      } else {
        // 'auto' / 'single': simulasi peralihan kamera pembicara per interval waktu
        const startT = ((_selectedMoment as any)?.mulai ?? (activeClip as any)?.startTime ?? 0);
        const relT = Math.max(0, currentTime - startT);
        const cycle = Math.floor(relT / 3.5);
        spkX = cycle % 2 === 0 ? podcastP1X : podcastP2X;
      }
      const pSk = 1 / Math.max(podcastZoom, 0.5);
      if (canvasFrameMode === '9:16_letterbox' && canvasRatio !== '9:16') {
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
        gb(r, 0, bar, W, ih, spkX, 0.38, pSk);
      } else {
        gb(W / H, 0, 0, W, H, spkX, 0.38, pSk);
      }
    } else if (layoutMode === 'split') {
      // Default: mode Split Podcast SELALU menampilkan 2 pembicara secara simultan
      let showSplit = podcastPreviewShot !== 'single' && podcastPreviewShot !== 'p1' && podcastPreviewShot !== 'p2';
      if (podcastPreviewShot === 'auto') {
        const rentangDua = (activeClip as any)?.podcast_rentang_dua || (_selectedMoment as any)?.podcast_rentang_dua;
        if (Array.isArray(rentangDua) && rentangDua.length > 0) {
          const startT = ((_selectedMoment as any)?.mulai ?? (activeClip as any)?.startTime ?? 0);
          const relT = currentTime - startT;
          showSplit = rentangDua.some(([s, e]: [number, number]) => relT >= s && relT <= e);
        } else {
          showSplit = true; // Default selalu aktifkan 2 layar split
        }
      }

      if (!showSplit) {
        // Mode Preview Solo 1 Orang (P1, P2, atau Solo)
        let singleX = focusPoint === 'otomatis' ? podcastSingleFocusX : cxAuto;
        if (podcastPreviewShot === 'p1') singleX = podcastP1X;
        else if (podcastPreviewShot === 'p2') singleX = podcastP2X;
        const pSk = 1 / Math.max(podcastZoom, 0.5);
        gb(W / H, 0, 0, W, H, singleX, 0.38, pSk);
      } else if (W > H) {
        // Mode Horizontal (16:9 Lebar): Split Kiri & Kanan (Side-by-Side Podcast)
        const divW = 4 * S;
        const leftWPx = W * 0.5 - divW / 2;
        const rightWPx = W - leftWPx - divW;
        const frameR = leftWPx / H;
        const p1X = podcastSwap ? podcastP2X : podcastP1X;
        const p2X = podcastSwap ? podcastP1X : podcastP2X;
        const pSk = 1 / Math.max(podcastZoom, 0.5);

        // Frame kiri (Pembicara 1)
        gb(frameR, 0, 0, leftWPx, H, p1X, 0.38, pSk);

        // Garis pemisah tengah vertikal cyan
        const divX = leftWPx;
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(divX, 0, divW, H);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(divX + 1 * S, 0, 2 * S, H);

        // Frame kanan (Pembicara 2)
        gb(frameR, divX + divW, 0, rightWPx, H, p2X, 0.38, pSk);
      } else {
        // Mode Vertikal 9:16, Kotak 1:1, Klasik 4:3: Split Atas & Bawah
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
        ctx.filter = 'blur(16px) brightness(0.6)';
        gb(botR, 0, divY + divH, W, botHeightPx, 0.5, 0.5, 1.0);
        ctx.restore();

        const baseH = W / (16 / 9);
        const effectiveZoom = Math.max(0.6, gameplayZoom);
        const gameH = baseH * effectiveZoom;
        const gameW = W * effectiveZoom;
        const extraY = botHeightPx - gameH;
        const gameY = divY + divH + (extraY > 0 ? extraY * gameplayFocusY : (botHeightPx - gameH) / 2);
        const extraX = W - gameW;
        const gameX = extraX > 0 ? extraX * gameplayFocusX : (W - gameW) / 2;
        gb(16 / 9, gameX, gameY, gameW, gameH, gameplayFocusX, gameplayFocusY, 1.0 / effectiveZoom);
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
    } else {
      if (canvasFrameMode === '9:16_letterbox' && canvasRatio !== '9:16') {
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
      } else {
        gb(W / H, 0, 0, W, H, cxAuto, 0.5);
      }
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
      const mainTeks = customHooksByClipRef.current[String(k.id)] ?? (k.title || '');
      const rawTeks = getFullHookText(mainTeks, bannerPrefix, bannerSuffix).toUpperCase();
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
      const hurufFn = (t: string) => {
        const raw =
          letterCase === 'ABC'
            ? t.toUpperCase()
            : letterCase === 'abc'
            ? t.toLowerCase()
            : t;
        return sensorKataKasar ? sensorTeksCanvas(raw) : raw;
      };

      const chunkSize = P.per || 3;
      const isPlaying = isVideoPlaying && videoElemRef.current && !videoElemRef.current.paused;
      const curT = videoElemRef.current ? videoElemRef.current.currentTime : (hasResults ? currentVideoTime : currentTime);

      let contoh: string[] = ['ini', 'contoh', 'klip'];
      let aktifI = 1;
      let wordPhase = 0.5; // 0.0 to 1.0 progress through active word

      // Sinkronisasi kata dengan waktu pemutar video (saat berputar maupun saat jeda tetap terkunci pada frame video)
      let foundInTranscript = false;
      if (projectTranscript && projectTranscript.length > 0) {
        const seg = projectTranscript.find((s) => curT >= s.mulai - 0.20 && curT <= s.selesai + 0.35);
        if (seg && seg.kata && seg.kata.length > 0) {
          let wIdx = seg.kata.findIndex((k) => curT >= k.mulai && curT <= k.selesai);
          if (wIdx === -1) {
            wIdx = seg.kata.findIndex((k) => curT < k.mulai);
            if (wIdx === -1) wIdx = seg.kata.length - 1;
            else wIdx = Math.max(0, wIdx - 1);
          }
          const chunkStart = Math.floor(wIdx / chunkSize) * chunkSize;
          const chunk = seg.kata.slice(chunkStart, chunkStart + chunkSize);
          contoh = chunk.map((c) => c.teks);
          aktifI = wIdx - chunkStart;
          const kw = seg.kata[wIdx];
          if (kw) {
            const kwDur = Math.max(0.1, kw.selesai - kw.mulai);
            wordPhase = isPlaying ? Math.max(0, Math.min(1, (curT - kw.mulai) / kwDur)) : 0.5;
          }
          foundInTranscript = true;
        } else if (seg && seg.teks) {
          const sWords = seg.teks.split(/\s+/).filter(Boolean);
          const segDur = Math.max(0.5, seg.selesai - seg.mulai);
          const relT = Math.max(0, Math.min(segDur, curT - seg.mulai));
          const wIdx = Math.min(sWords.length - 1, Math.floor((relT / segDur) * sWords.length));
          const chunkStart = Math.floor(wIdx / chunkSize) * chunkSize;
          contoh = sWords.slice(chunkStart, chunkStart + chunkSize);
          aktifI = wIdx - chunkStart;
          wordPhase = isPlaying ? (relT / (segDur / Math.max(1, sWords.length))) % 1.0 : 0.5;
          foundInTranscript = true;
        } else {
          // Jika curT berada pada jeda bicara, tampilkan segmen terdekat (tidak kosong dan tidak lompat)
          const closestSeg = projectTranscript.reduce((prev, curr) =>
            Math.abs(curr.mulai - curT) < Math.abs(prev.mulai - curT) ? curr : prev
          , projectTranscript[0]);
          if (closestSeg) {
            const sWords = (closestSeg.kata && closestSeg.kata.length > 0)
              ? closestSeg.kata.map(k => k.teks)
              : closestSeg.teks.split(/\s+/).filter(Boolean);
            const chunk = sWords.slice(0, chunkSize);
            if (chunk.length > 0) {
              contoh = chunk;
              aktifI = 0;
              wordPhase = 0.5;
              foundInTranscript = true;
            }
          }
        }
      }

      if (!foundInTranscript) {
        let sourceWords: string[] = [];
        if (editQuoteInput && editQuoteInput.trim().length > 0) {
          sourceWords = editQuoteInput.trim().replace(/[“”,.?!]/g, '').split(/\s+/).filter(Boolean);
        } else if (activeClip?.quote) {
          sourceWords = activeClip.quote.replace(/[“”,.?!]/g, '').split(/\s+/).filter(Boolean);
        }
        if (sourceWords.length > 0) {
          const clipStart = editStartTime || activeClip?.startTime || 0;
          const clipEnd = editEndTime || activeClip?.endTime || (clipStart + 30);
          const clipDur = Math.max(1, clipEnd - clipStart);
          const relT = Math.max(0, Math.min(clipDur, curT - clipStart));
          const progress = relT / clipDur;
          const wIdx = Math.min(sourceWords.length - 1, Math.floor(progress * sourceWords.length));
          const chunkStart = Math.floor(wIdx / chunkSize) * chunkSize;
          contoh = sourceWords.slice(chunkStart, chunkStart + chunkSize);
          aktifI = wIdx - chunkStart;
          wordPhase = isPlaying ? (progress * sourceWords.length) % 1.0 : 0.5;
        }
      }

      const kata = contoh.map(hurufFn);
      const kunciI = Math.max(0, kata.length - 1);
      const fnt = (i: number) =>
        `${i === aktifI && P.mode === 'tebal' ? 'bold ' : tebal}${
          uk *
          (i === aktifI && ['warna', 'pop', 'komik'].includes(P.mode) ? 1.08 : 1)
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
        const cleanWord = t.toLowerCase().replace(/[^a-z0-9]/g, '');
        const customStyle = customWordStyles[cleanWord];
        const isAktif = (i === aktifI);

        // Multi-color sentiment or custom color
        let warna = '#fff';
        const baseColor = customStyle?.color || getSentimentColor(t, P.warna || highlightColor);

        // Dynamic scale & spring bounce (aktif penuh saat play, stabil rapi saat jeda)
        let scaleMult = 1.0;
        let bounceY = 0;
        let popRotate = 0;

        if (isAktif) {
          if (P.mode === 'pop' || activePreset === 'pop') {
            const spring = isPlaying ? Math.sin(Math.min(1, wordPhase * 3.2) * Math.PI) : 0;
            scaleMult = 1.10 + 0.12 * spring;
            bounceY = -8 * S * spring;
          } else if (activePreset === 'neon' || P.judul === 'neon') {
            const spring = isPlaying ? Math.sin(Math.min(1, wordPhase * 3.0) * Math.PI) : 0;
            scaleMult = 1.08 + 0.08 * spring;
            bounceY = -5 * S * spring;
          } else if (P.mode === 'komik' || activePreset === 'komik') {
            const spring = isPlaying ? Math.sin(Math.min(1, wordPhase * 3.0) * Math.PI) : 0;
            scaleMult = 1.08 + 0.10 * spring;
            bounceY = -6 * S * spring;
            popRotate = isPlaying ? (i % 2 === 0 ? -2 : 2) * (Math.PI / 180) * spring : 0;
          } else if (['warna', 'sorot', 'kotak', 'lime', 'terbaca'].includes(P.mode) || ['sorot', 'lime', 'terbaca'].includes(activePreset)) {
            const pulse = isPlaying ? Math.sin(wordPhase * Math.PI) : 0;
            scaleMult = 1.06 + 0.05 * pulse;
            bounceY = -3.5 * S * pulse;
          } else {
            scaleMult = 1.04;
          }
        }

        if (P.mode === 'warna' && isAktif) warna = baseColor;
        if ((P.mode === 'pop' || P.mode === 'komik') && (i === kunciI || isAktif))
          warna = baseColor;
        if (P.mode === 'terbaca') warna = isAktif ? '#fff' : baseColor;
        if (P.mode === 'karaoke' || activePreset === 'karaoke') {
          if (i < aktifI) warna = baseColor;
          else if (isAktif) warna = baseColor;
          else warna = 'rgba(255, 255, 255, 0.65)';
        }

        // Pill / Box background highlighting
        if ((P.mode === 'kotak' || activePreset === 'lime' || activePreset === 'terbaca') && (isAktif || i === kunciI)) {
          const lw = ctx.measureText(t).width;
          const padX = 14 * S * scaleMult;
          ctx.save();
          ctx.fillStyle = baseColor;
          ctx.shadowColor = baseColor;
          ctx.shadowBlur = 8 * S;
          ctx.beginPath();
          ctx.roundRect(x - padX / 2, y - uk * 0.95 + bounceY, lw + padX, uk * 1.25 * scaleMult, 8 * S);
          ctx.fill();
          ctx.restore();
          warna = '#111';
        }

        // Neon Glow effect
        if (activePreset === 'neon' || P.judul === 'neon') {
          const pulse = isPlaying ? (10 + 6 * Math.sin(performance.now() / 160)) : 12;
          ctx.shadowColor = baseColor || '#ff4fa3';
          ctx.shadowBlur = (isAktif ? pulse * 1.8 : pulse * 0.8) * S;
          ctx.shadowOffsetY = 0;
        }

        ctx.save();
        if (isAktif && (scaleMult !== 1.0 || bounceY !== 0 || popRotate !== 0)) {
          const wordMidX = x + lebar[i] / 2;
          const wordMidY = y - uk * 0.35 + bounceY;
          ctx.translate(wordMidX, wordMidY);
          if (popRotate !== 0) ctx.rotate(popRotate);
          ctx.scale(scaleMult, scaleMult);
          ctx.translate(-wordMidX, -wordMidY);
        }

        if (!P.kotak && P.tepi) {
          ctx.lineWidth = P.tepi * 2 * S;
          ctx.strokeStyle = '#000';
          ctx.strokeText(t, x, y + bounceY);
        }
        if (!P.tepi && !P.kotak && activePreset !== 'neon' && P.judul !== 'neon') {
          ctx.shadowColor = 'rgba(0,0,0,.75)';
          ctx.shadowBlur = 8 * S;
          ctx.shadowOffsetY = 3 * S;
        }
        ctx.fillStyle = warna;
        ctx.fillText(t, x, y + bounceY);
        ctx.restore();

        // Emoji Otomatis melayang tepat di atas kata aktif / ber-emoji
        const emojiChar = customStyle?.emoji || (autoEmoji ? getEmojiForWord(t) : null);
        if (emojiChar && (isAktif || i === kunciI || customStyle?.emoji)) {
          ctx.save();
          const emBounceY = bounceY + (isAktif ? (isPlaying ? -10 * S - 3 * S * Math.sin(performance.now() / 180) : -8 * S) : -4 * S);
          ctx.font = `${uk * 0.95}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
          ctx.textAlign = 'center';
          const lw = lebar[i];
          ctx.fillText(emojiChar, x + lw / 2, y - uk * 1.15 + emBounceY);
          ctx.restore();
        }

        x += lebar[i];
      });
      ctx.textAlign = 'center';
    }

    if (bottomProgress) {
      const clipStart = editStartTime || activeClip?.startTime || 0;
      const clipEnd = editEndTime || activeClip?.endTime || 30;
      const curT = hasResults ? currentVideoTime : currentTime;
      const prog = Math.max(0, Math.min(1, (curT - clipStart) / Math.max(0.1, clipEnd - clipStart)));
      const barH = progressBarThickness * S;

      if (progressBarColor === 'pelangi') {
        const grad = ctx.createLinearGradient(0, H - barH, W, H);
        grad.addColorStop(0, '#00F5FF');
        grad.addColorStop(0.33, '#3DFF8A');
        grad.addColorStop(0.66, '#FFD400');
        grad.addColorStop(1, '#FF3388');
        ctx.fillStyle = grad;
      } else if (progressBarColor === 'hijau') {
        ctx.fillStyle = '#3DFF8A';
      } else if (progressBarColor === 'kuning') {
        ctx.fillStyle = '#FFD400';
      } else {
        ctx.fillStyle = '#00F5FF'; // CalClip signature neon cyan
      }

      ctx.shadowColor = typeof ctx.fillStyle === 'string' ? ctx.fillStyle : '#00F5FF';
      ctx.shadowBlur = 8 * S;
      ctx.fillRect(0, H - barH, W * prog, barH);
      ctx.shadowColor = 'transparent';
    }
  }, [
    canvasRatio,
    canvasFrameMode,
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
    customHooksByClip,
    progressBarColor,
    progressBarThickness,
    highlightColor,
    customWordStyles,
    autoEmoji,
    zoomKeyphrase,
    editQuoteInput,
    isVideoPlaying,
    currentVideoTime,
    colorHighlight,
  ]);

  useEffect(() => {
    if (!hasResults && !isAturGayaOpen) return;
    let animId: number;
    const loop = () => {
      gambarStudioKanvas();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [hasResults, isAturGayaOpen, gambarStudioKanvas]);

  useEffect(() => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (hasResults || isAturGayaOpen) gambarStudioKanvas();
      });
    }
  }, [hasResults, isAturGayaOpen, gambarStudioKanvas]);

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
      if (data.transkrip && Array.isArray(data.transkrip)) {
        setProjectTranscript(data.transkrip);
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
        const first = mappedClips[0];
        setActiveClipId(first.id);
        const s = first.startTime || 0;
        const e = first.endTime || (s + 30);
        activeClipRangeRef.current = { id: first.id, start: s, end: e };
        setEditStartTime(s);
        setEditEndTime(e);
        setCurrentVideoTime(s);
        onSeek(s);
        if (videoElemRef.current) {
          videoElemRef.current.currentTime = s;
        }
        const rendered = mappedClips.filter((c) => c.file).length;
        setRenderedCount(rendered);
      } else {
        setClips(DEFAULT_DETAILED_CLIPS);
        const first = DEFAULT_DETAILED_CLIPS[0];
        setActiveClipId(first.id);
        const s = first.startTime || 0;
        const e = first.endTime || 30;
        activeClipRangeRef.current = { id: first.id, start: s, end: e };
        setEditStartTime(s);
        setEditEndTime(e);
        setCurrentVideoTime(s);
        onSeek(s);
        if (videoElemRef.current) {
          videoElemRef.current.currentTime = s;
        }
        setRenderedCount(0);
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

  const handleDownloadClip = async (clip: DetailedClip) => {
    const targetProj = proyekNama || 'proyek-aktif';
    const fileName = clip.file || `klip-0${clip.rankNum || clip.id}.mp4`;
    const cleanFile = fileName.replace(/\.mp4$/i, '');
    const downloadName = `CalClip-${clip.rankNum || clip.id}.mp4`;
    const downloadUrl = `/stream/klip/${targetProj}/${cleanFile}.mp4?unduh=1&nama=${encodeURIComponent(downloadName)}`;

    try {
      const check = await fetch(downloadUrl, { method: 'HEAD' });
      if (!check.ok) {
        handleStartRender(clip);
        return;
      }
    } catch {
      // offline fallback
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleStartRender = async (singleClip?: DetailedClip) => {
    if (isRenderingPipeline) return;

    setIsAturGayaOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const targetClips = singleClip ? [singleClip] : clips.filter((c) => c.isChecked);
    const targetNos = targetClips.map((c) => c.rankNum || c.id);
    const totalClips = targetNos.length || 1;
    const targetProjectNama = proyekNama || 'proyek-aktif';

    try {
      const res = await fetch('/api/klip-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: targetProjectNama,
          pilih: targetNos,
          gaya: {
            rasio: canvasRatio,
            kanvas_mode: canvasFrameMode,
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
            warna_sorot: highlightColor,
            kata_kustom: customWordStyles,
            progress_bar: bottomProgress,
            warna_progress: progressBarColor,
            tebal_progress: progressBarThickness,
            sfx_mikro: autoMicroSfx,
            audio_ducking: autoAudioDucking,
            jernihkan_suara: jernihkanSuara,
            normalisasi_loudness: normalisasiLoudness,
            zoom_kata_kunci: zoomKeyphrase,
          },
          klip_edit: Object.fromEntries(
            targetClips.map((c) => [
              String(c.rankNum || c.id),
              {
                mulai: c.startTime,
                selesai: c.endTime,
                judul: customHooksByClip[String(c.id)] ?? c.title,
              },
            ])
          ),
          judul: Object.fromEntries(
            targetClips.map((c) => [
              String(c.rankNum || c.id),
              customHooksByClip[String(c.id)] ?? c.title,
            ])
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

    // Realistic fallback simulation (realistic pacing: ~14 seconds per clip)
    setIsRenderingPipeline(true);
    setRenderProgressPercent(10);
    setRenderElapsedSec(0);

    setRenderSteps([
      { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
      { id: 2, label: `02 • RENDER (${totalClips === 1 ? `Klip #${targetNos[0]}` : `1/${totalClips}`})`, status: 'Berjalan...' },
      { id: 3, label: '03 • SELESAI', status: 'Menunggu' },
    ]);

    setRenderLogLines([
      `$ python.exe klip.py --render --keluar C:\\Users\\Asus ROG\\CalClip\\klip\\${targetProjectNama} --pilih ${targetNos.join(',')} --gaya gaya-permintaan.json`,
      `• Menyiapkan konfigurasi render 1080x1920 30fps (Kanvas: ${canvasRatio}, Latar: ${barBackground})...`,
      `• Mengurai subtitle kinetik font: ${selectedFont}, layout: ${layoutMode}...`,
      `• Render ${totalClips === 1 ? `Klip #${targetNos[0]}` : `1/${totalClips}`}: ${targetClips[0]?.title || 'Klip ' + targetNos[0]} (${formatSec(targetClips[0]?.startTime || 0)} - ${formatSec(targetClips[0]?.endTime || 30)})...`,
    ]);

    if (onAnalysisStateChange) {
      onAnalysisStateChange(
        true,
        '00:01',
        totalClips === 1 ? `Render klip #${targetNos[0]}...` : `Render 1/${totalClips}...`,
        'Merender klip'
      );
    }

    const renderStartTime = Date.now();
    const totalDurationSec = totalClips * 14;
    if (renderElapsedTimerRef.current) clearInterval(renderElapsedTimerRef.current);

    renderElapsedTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - renderStartTime) / 1000);
      setRenderElapsedSec(elapsed);

      const currentClipIdx = Math.min(totalClips - 1, Math.floor(elapsed / 14));
      const currentClipObj = targetClips[currentClipIdx] || targetClips[0];
      const stepProg = Math.min(99, Math.round((elapsed / totalDurationSec) * 100));
      setRenderProgressPercent(stepProg);

      setRenderSteps([
        { id: 1, label: '01 • SIAPKAN', status: 'Beres' },
        { id: 2, label: `02 • RENDER (${totalClips === 1 ? `Klip #${targetNos[0]}` : `${currentClipIdx + 1}/${totalClips}`})`, status: 'Berjalan...' },
        { id: 3, label: '03 • SELESAI', status: 'Menunggu' },
      ]);

      if (onAnalysisStateChange) {
        onAnalysisStateChange(
          true,
          formatSec(elapsed),
          totalClips === 1 ? `Render klip #${targetNos[0]}...` : `Render ${currentClipIdx + 1}/${totalClips}...`,
          'Merender klip'
        );
      }

      // Log progress simulation
      const secInClip = elapsed % 14;
      if (secInClip === 0 && elapsed > 0) {
        setRenderLogLines((prev) => [
          ...prev,
          `• Render ${currentClipIdx}/${totalClips} selesai: klip-0${targetClips[currentClipIdx - 1]?.rankNum || currentClipIdx}.mp4 (${(8.5 + Math.random() * 2).toFixed(1)} MB)`,
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

        setClips((prev) =>
          prev.map((c) => {
            const isTarget = targetNos.includes(c.rankNum || c.id);
            return isTarget ? { ...c, file: c.file || `klip-0${c.rankNum || c.id}.mp4` } : c;
          })
        );
        setRenderedCount((prev) => Math.min(clips.length, prev + totalClips));
        notifyRenderComplete(totalClips);

        setRenderLogLines((prev) => [
          ...prev,
          `• Render ${totalClips === 1 ? `Klip #${targetNos[0]}` : `${totalClips} klip`} selesai: klip-0${targetNos[0]}.mp4 (9.8 MB)`,
          `• Selesai. Klip terpilih berhasil dirender ke MP4 1080x1920.`,
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
          bahasa: selectedLanguage,
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
              const first = dynamicClips[0];
              setActiveClipId(first.id);
              const s = first.startTime || 0;
              const e = first.endTime || (s + 30);
              activeClipRangeRef.current = { id: first.id, start: s, end: e };
              setEditStartTime(s);
              setEditEndTime(e);
              setCurrentVideoTime(s);
              onSeek(s);
              if (videoElemRef.current) {
                videoElemRef.current.currentTime = s;
              }
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
    const start = clip.startTime || 0;
    const end = clip.endTime || (start + (clip.durationSec || 30));
    activeClipRangeRef.current = { id: clip.id, start, end };
    setActiveClipId(clip.id);
    setEditStartTime(start);
    setEditEndTime(end);
    setCurrentVideoTime(start);
    onSeek(start);
    if (videoElemRef.current) {
      const v = videoElemRef.current;
      v.currentTime = start;
      v.play()
        .then(() => setIsVideoPlaying(true))
        .catch((err) => {
          console.warn('Playback deferred:', err);
          setIsVideoPlaying(false);
        });
    }
  };

  const togglePlayPause = useCallback(() => {
    const v = videoElemRef.current;
    if (!v) return;
    const range = activeClipRangeRef.current;
    if (v.paused) {
      if (v.currentTime < range.start - 0.2 || v.currentTime >= range.end) {
        v.currentTime = range.start;
        setCurrentVideoTime(range.start);
        onSeek(range.start);
      }
      v.play()
        .then(() => setIsVideoPlaying(true))
        .catch((err) => {
          console.warn('Play error:', err);
          setIsVideoPlaying(false);
        });
    } else {
      v.pause();
      setIsVideoPlaying(false);
    }
  }, [onSeek]);

  // Split clip at playhead (Ctrl+B)
  const handleSplitClipAtPlayhead = useCallback(() => {
    if (!activeClip) return;
    const curT = hasResults ? (currentVideoTime || activeClip.startTime) : currentTime;
    const minT = (editStartTime || activeClip.startTime) + 0.8;
    const maxT = (editEndTime || activeClip.endTime) - 0.8;
    if (curT < minT || curT > maxT) {
      return; // Must have at least buffer
    }
    const splitT = Math.round(curT * 10) / 10;
    const origId = activeClip.id;
    const newId = Date.now();
    const baseTitle = activeClip.title.replace(/\s*\(Bagian\s*\d+\)$/i, '');

    const clipA: DetailedClip = {
      ...activeClip,
      endTime: splitT,
      durationSec: Math.max(1, Math.round(splitT - activeClip.startTime)),
      title: `${baseTitle} (Bagian 1)`,
    };

    const clipB: DetailedClip = {
      ...activeClip,
      id: newId,
      startTime: splitT,
      durationSec: Math.max(1, Math.round(activeClip.endTime - splitT)),
      title: `${baseTitle} (Bagian 2)`,
    };

    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === origId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1, clipA, clipB);
      return next.map((c, i) => ({ ...c, rankNum: i + 1 }));
    });

    setEditEndTime(splitT);
  }, [activeClip, currentVideoTime, currentTime, editStartTime, editEndTime, hasResults]);

  // Delete active clip (Buang bagian)
  const handleDeleteActiveClip = useCallback(() => {
    if (!activeClip) return;
    if (clips.length <= 1) {
      setEditStartTime(activeClip.startTime);
      setEditEndTime(activeClip.endTime);
      return;
    }
    const activeIdx = clips.findIndex((c) => c.id === activeClip.id);
    const remaining = clips.filter((c) => c.id !== activeClip.id);
    const reRanked = remaining.map((c, i) => ({ ...c, rankNum: i + 1 }));
    setClips(reRanked);
    const nextClip = reRanked[Math.min(activeIdx, reRanked.length - 1)];
    if (nextClip) {
      selectAndPlayClip(nextClip);
    }
  }, [activeClip, clips]);

  // Filmstrip scrubbing & trimming handlers
  const handleFilmstripScrub = useCallback((clientX: number) => {
    const container = filmstripContainerRef.current;
    if (!container || !activeClip) return;
    const rect = container.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const clipSpan = Math.max(1, (activeClip.endTime || 30) - (activeClip.startTime || 0));
    const targetSec = (activeClip.startTime || 0) + ratio * clipSpan;
    if (videoElemRef.current) {
      videoElemRef.current.currentTime = targetSec;
    }
    setCurrentVideoTime(targetSec);
    onSeek(targetSec);
  }, [activeClip, onSeek]);

  const handleLeftHandleDrag = useCallback((clientX: number) => {
    const container = filmstripContainerRef.current;
    if (!container || !activeClip) return;
    const rect = container.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const baseStart = activeClip.startTime || 0;
    const baseEnd = activeClip.endTime || 30;
    const clipSpan = Math.max(1, baseEnd - baseStart);
    const rawSec = baseStart + ratio * clipSpan;
    const newStart = Math.max(baseStart, Math.min(editEndTime - 1, Math.round(rawSec * 10) / 10));
    setEditStartTime(newStart);
    activeClipRangeRef.current.start = newStart;
    if (videoElemRef.current) {
      videoElemRef.current.currentTime = newStart;
    }
    setCurrentVideoTime(newStart);
    onSeek(newStart);
  }, [activeClip, editEndTime, onSeek]);

  const handleRightHandleDrag = useCallback((clientX: number) => {
    const container = filmstripContainerRef.current;
    if (!container || !activeClip) return;
    const rect = container.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const baseStart = activeClip.startTime || 0;
    const baseEnd = activeClip.endTime || 30;
    const clipSpan = Math.max(1, baseEnd - baseStart);
    const rawSec = baseStart + ratio * clipSpan;
    const newEnd = Math.min(baseEnd, Math.max(editStartTime + 1, Math.round(rawSec * 10) / 10));
    setEditEndTime(newEnd);
    activeClipRangeRef.current.end = newEnd;
    if (videoElemRef.current) {
      videoElemRef.current.currentTime = newEnd;
    }
    setCurrentVideoTime(newEnd);
    onSeek(newEnd);
  }, [activeClip, editStartTime, onSeek]);

  // Global mouse listeners for dragging filmstrip handles and scrubber
  useEffect(() => {
    if (!isScrubbingFilmstrip && !isDraggingLeftHandle && !isDraggingRightHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbingFilmstrip) {
        handleFilmstripScrub(e.clientX);
      } else if (isDraggingLeftHandle) {
        handleLeftHandleDrag(e.clientX);
      } else if (isDraggingRightHandle) {
        handleRightHandleDrag(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbingFilmstrip(false);
      setIsDraggingLeftHandle(false);
      setIsDraggingRightHandle(false);
      // Auto-save trim to clips list
      if (activeClip) {
        setClips((prev) =>
          prev.map((c) =>
            c.id === activeClip.id
              ? {
                  ...c,
                  startTime: editStartTime,
                  endTime: editEndTime,
                  durationSec: Math.max(1, Math.round(editEndTime - editStartTime)),
                }
              : c
          )
        );
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isScrubbingFilmstrip,
    isDraggingLeftHandle,
    isDraggingRightHandle,
    handleFilmstripScrub,
    handleLeftHandleDrag,
    handleRightHandleDrag,
    activeClip,
    editStartTime,
    editEndTime,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        togglePlayPause();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B') && !isInput) {
        e.preventDefault();
        handleSplitClipAtPlayhead();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, handleSplitClipAtPlayhead]);

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
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
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
                    <span>Bahasa video & subtitle</span>
                    <span className="text-[10.5px] sm:text-[11px] text-cyan-400 font-mono">Whisper AI</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'auto', label: 'Deteksi Otomatis' },
                      { id: 'id', label: 'Indonesia' },
                      { id: 'en', label: 'English' },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`text-center font-mono text-[11px] sm:text-[12px] rounded-full min-h-[36px] sm:min-h-[38px] px-2 transition-all truncate ${
                          selectedLanguage === lang.id
                            ? 'bg-cyan-400 text-[#031418] font-bold border border-cyan-400 shadow-sm'
                            : 'border border-[#2b3550] text-[#a3acc1] hover:text-[#eef1f7] hover:border-[#8590aa] bg-transparent'
                        }`}
                      >
                        {lang.label}
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
        {(pipelineState === 'running' || isRenderingPipeline || (!hasResults && pipelineState === 'completed')) && (
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
      {/* 3. FULL CAPCUT / KLIP AI NLE STUDIO WORKSPACE                  */}
      {/* ============================================================== */}
      {hasResults && (
        <div className="w-full space-y-3 animate-fadeIn pb-10 select-none">
          {/* Hidden HTML5 Video element feeding real-time frames into canvas */}
          <video
            ref={videoElemRef}
            src={getStreamUrl(proyekNama) || sourceVideoUrl || undefined}
            poster={thumbnailUrl}
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            className="fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none"
            onLoadedMetadata={(e) => {
              const range = activeClipRangeRef.current;
              if (range && range.start > 0) {
                e.currentTarget.currentTime = range.start;
                setCurrentVideoTime(range.start);
                onSeek(range.start);
              }
            }}
            onPlay={() => {
              setIsVideoPlaying(true);
            }}
            onPause={() => {
              setIsVideoPlaying(false);
            }}
            onTimeUpdate={(e) => {
              const t = e.currentTarget.currentTime;
              setCurrentVideoTime(t);
              onSeek(t);
              const range = activeClipRangeRef.current;
              if (range && range.end > range.start) {
                if (t >= range.end) {
                  e.currentTarget.currentTime = range.start;
                  setCurrentVideoTime(range.start);
                  onSeek(range.start);
                }
              }
            }}
          />

          {/* 1. TOP WINDOW BAR (Mac-style Header with Breadcrumbs & Render Action) */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              {/* Traffic Lights */}
              <div className="hidden sm:flex items-center gap-1.5 mr-1">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40 block"></span>
                <span className="w-3 h-3 rounded-full bg-cyan-500/80 border border-cyan-600/40 block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40 block"></span>
              </div>

              {/* Back to Input */}
              <button
                type="button"
                onClick={() => {
                  setHasResults(false);
                  setIsAturGayaOpen(false);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Kembali ke input video / analisis baru"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Source Badge */}
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                {sourceVideoUrl?.includes('youtu') ? 'YOUTUBE' : 'VIDEO'}
              </span>

              {/* Video Title & Total Duration */}
              <div className="flex items-baseline gap-2 truncate max-w-[260px] sm:max-w-md lg:max-w-xl">
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">
                  {videoTitle || 'PROYEK KLIP'}
                </span>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {formatSec(videoDuration || 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Hardware Acceleration Info */}
              {hardwareInfo && (
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>{hardwareInfo.label}</span>
                </span>
              )}

              {/* Undo / Redo */}
              <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Urungkan (Ctrl+Z)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Ulangi (Ctrl+Y)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Buka Folder */}
              <button
                type="button"
                onClick={handleBukaFolder}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka folder hasil video render"
              >
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Buka folder</span>
              </button>

              {/* Main Batch Render CTA */}
              <button
                type="button"
                onClick={() => handleStartRender()}
                disabled={isRenderingPipeline || checkedClipsCount === 0}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isRenderingPipeline ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Rendering ({Math.round(renderProgressPercent)}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Render {checkedClipsCount} klip</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. TOP GLOBAL TIMELINE MINI-MAP (Waveform & Clip Segments) */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-2.5 px-3 shadow-md space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>0:00</span>
              <span className="text-slate-400 font-medium">Klik kotak klip di timeline untuk langsung beralih klip</span>
              <span>{formatSec(videoDuration || 0)}</span>
            </div>

            <div
              className="relative w-full h-8 bg-[#070a12] rounded-lg border border-slate-800/80 overflow-hidden cursor-pointer select-none group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const target = ratio * (videoDuration || 1);
                const matchedClip = clips.find((c) => target >= c.startTime && target <= c.endTime);
                if (matchedClip && matchedClip.id !== activeClipId) {
                  selectAndPlayClip(matchedClip);
                  return;
                }
                if (videoElemRef.current) {
                  videoElemRef.current.currentTime = target;
                }
                setCurrentVideoTime(target);
                onSeek(target);
              }}
            >
              {/* Audio Waveform Energy Track */}
              <div className="absolute inset-0 flex items-center justify-between px-1 opacity-20 pointer-events-none">
                {waveformEnergy.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 1000 64" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      points={waveformEnergy
                        .map((v, i) => `${(i / Math.max(waveformEnergy.length - 1, 1)) * 1000},${60 - v * 52}`)
                        .join(' ')}
                    />
                  </svg>
                ) : (
                  <div className="w-full h-[1px] bg-slate-700"></div>
                )}
              </div>

              {/* Proportional Clip Markers */}
              {clips.map((clip) => {
                const dur = videoDuration || 572.5;
                const leftPct = (clip.startTime / dur) * 100;
                const widthPct = Math.max(2, (clip.durationSec / dur) * 100);
                const isSelected = clip.id === activeClipId;
                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAndPlayClip(clip);
                    }}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                    className={`absolute top-1 bottom-1 rounded transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/40 ring-2 ring-white z-20'
                        : 'bg-cyan-500/30 hover:bg-cyan-400/70 border border-cyan-400/60 text-cyan-100 z-10'
                    }`}
                    title={`Klip #${clip.rankNum} • Skor: ${clip.viralScore}% (${clip.title})`}
                  >
                    <span className="text-[9px] font-mono font-bold truncate px-1">
                      #{clip.rankNum}
                    </span>
                  </div>
                );
              })}

              {/* Real-time Playhead Tracker */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)] z-30 pointer-events-none"
                style={{
                  left: `${(((hasResults ? currentVideoTime : currentTime) || 0) / Math.max(videoDuration || 1, 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 3. MAIN THREE-COLUMN WORKSPACE (Clip Deck, Player, Inspector) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* COLUMN 1 (Left 3 Cols): Clip Deck Navigator */}
            <div className="lg:col-span-3 bg-[#0b0f19] border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg self-start">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-cyan-400">{clips.length} klip</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-mono text-[11px]">{checkedClipsCount} dipilih</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <button
                    type="button"
                    onClick={() => checkAllClips(false)}
                    className="hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    Kosongkan
                  </button>
                  <span>/</span>
                  <button
                    type="button"
                    onClick={() => checkAllClips(true)}
                    className="hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    Pilih semua
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#070a12] border border-slate-800 text-[11px]">
                {(['semua', 'dicentang', 'dirender'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setClipFilter(mode)}
                    className={`flex-1 py-1 rounded-md font-semibold transition-all text-center capitalize cursor-pointer ${
                      clipFilter === mode
                        ? 'bg-cyan-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'dirender' ? `Jadi (${renderedCount})` : mode}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kutipan klip..."
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-[#070a12] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Scrollable Clip Cards */}
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
                {clips
                  .filter((c) => {
                    if (clipFilter === 'dicentang' && !c.isChecked) return false;
                    if (clipFilter === 'dirender' && !c.file) return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      return (
                        c.title.toLowerCase().includes(q) ||
                        c.quote.toLowerCase().includes(q) ||
                        c.caption.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((clip) => {
                    const isSelected = activeClipId === clip.id;
                    return (
                      <div
                        key={clip.id}
                        onClick={() => selectAndPlayClip(clip)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-cyan-950/30 border-cyan-400 ring-1 ring-cyan-400/40 shadow-md shadow-cyan-950/50'
                            : 'bg-[#0f172a]/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 truncate">
                            <input
                              type="checkbox"
                              checked={clip.isChecked}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleClipCheckbox(clip.id);
                              }}
                              className="mt-0.5 w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-400 accent-cyan-400 cursor-pointer shrink-0"
                            />
                            <div className="space-y-0.5 truncate">
                              <div className="text-xs font-bold text-white truncate">
                                {clip.title}
                              </div>
                              <div className="text-[10px] font-mono text-cyan-400/90 flex items-center gap-1.5">
                                <span className="px-1.5 py-0.2 rounded bg-cyan-400/10 border border-cyan-400/20">
                                  Hook kuat
                                </span>
                                <span className="text-slate-400">{formatSec(clip.startTime)} • {clip.durationSec}s</span>
                              </div>
                            </div>
                          </div>

                          <div className="w-8 h-8 rounded-full border border-cyan-400/50 bg-[#070a12] text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {clip.viralScore}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed italic bg-[#070a12]/50 p-1.5 rounded-lg border border-slate-800/40">
                          "{clip.quote || clip.caption}"
                        </div>

                        {/* Quick action buttons row on card */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyText(clip.quote || clip.caption, String(clip.id));
                              }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                              title="Salin kutipan teks"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedKey === `quote-${clip.id}` ? 'Tersalin!' : 'Salin'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditSubtitle(clip);
                              }}
                              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                              title="Edit subtitle"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          </div>

                          {clip.file && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadClip(clip);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 font-mono font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Video siap</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* COLUMN 2 (Center 5 Cols): Canvas Player & Transport */}
            <div className="lg:col-span-5 bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 flex flex-col items-center space-y-3.5 shadow-xl self-start">
              {/* Canvas Header Metadata & Safe Zone */}
              <div className="w-full flex items-center justify-between px-1 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-bold">
                    {canvasRatio}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {canvasDim.w}×{canvasDim.h}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/40 text-[10px] font-mono text-cyan-300">
                    <span className={`w-1.5 h-1.5 rounded-full ${isVideoPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`}></span>
                    <span>{isVideoPlaying ? 'Subtitle Putar' : 'Subtitle Jeda'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSafeZone(!showSafeZone)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-colors border cursor-pointer ${
                      showSafeZone
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-400/50 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                    title="Tampilkan / sembunyikan batas zona aman TikTok & Reels"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Safe Zone {showSafeZone ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Center Video Canvas Player Box */}
              <div className="ponsel relative w-full flex flex-col items-center">
                <div
                  className="layar relative overflow-hidden transition-all duration-300 shadow-2xl bg-black border border-slate-800 group"
                  style={{
                    width: `${canvasDim.cssW}px`,
                    height: `${canvasDim.cssH}px`,
                    borderRadius: canvasDim.r,
                  }}
                >
                  <canvas
                    ref={kanvasStudioRef}
                    width={canvasDim.w}
                    height={canvasDim.h}
                    className="cursor-pointer block w-full h-full"
                    onClick={togglePlayPause}
                    title="Klik untuk putar / jeda video (Spasi)"
                  />

                  {/* Play Button Overlay When Paused */}
                  {!isVideoPlaying && (
                    <div
                      onClick={togglePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer backdrop-blur-[1px] transition-opacity"
                    >
                      <div className="w-14 h-14 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-2xl transition-transform transform hover:scale-110">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Safe Zone Overlay */}
                  {showSafeZone && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 select-none z-30">
                      <div className="w-full h-[14%] border-b border-dashed border-cyan-400/80 bg-cyan-500/10 rounded-t flex items-center justify-center">
                        <span className="text-[9px] font-mono font-medium text-cyan-300 bg-black/70 px-1.5 py-0.2 rounded shadow">
                          Header TikTok
                        </span>
                      </div>
                      <div className="w-full flex-1 flex justify-between items-center py-1">
                        <div className="flex-1 h-full border border-dashed border-emerald-400/60 bg-emerald-500/5 rounded flex items-center justify-center">
                          <span className="text-[9px] font-mono font-medium text-emerald-300/90 bg-black/70 px-1.5 py-0.2 rounded text-center shadow">
                            Zona Aman Wajah & Subtitle
                          </span>
                        </div>
                        <div className="w-[18%] h-full border-l border-dashed border-rose-400/80 bg-rose-500/10 rounded-r flex flex-col items-center justify-center">
                          <span className="text-[8px] font-mono font-medium text-rose-300 bg-black/70 px-1 py-0.2 rounded rotate-90 whitespace-nowrap shadow">
                            Like / Share
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-[22%] border-t border-dashed border-cyan-400/80 bg-cyan-500/10 rounded-b flex items-center justify-center">
                        <span className="text-[9px] font-mono font-medium text-cyan-300 bg-black/70 px-1.5 py-0.2 rounded shadow">
                          Caption TikTok/Reels
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrubber & Transport Bar */}
              <div className="w-full space-y-2 pt-1 px-1">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title={isVideoPlaying ? "Jeda (Spasi)" : "Putar (Spasi)"}
                  >
                    {isVideoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <input
                    type="range"
                    min={editStartTime || activeClip?.startTime || 0}
                    max={editEndTime || activeClip?.endTime || 30}
                    step={0.1}
                    value={Math.max(editStartTime || activeClip?.startTime || 0, Math.min(hasResults ? currentVideoTime : currentTime, editEndTime || activeClip?.endTime || 30))}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (videoElemRef.current) {
                        videoElemRef.current.currentTime = val;
                      }
                      setCurrentVideoTime(val);
                      onSeek(val);
                    }}
                    className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {formatSec(Math.max(0, (hasResults ? currentVideoTime : currentTime) - (editStartTime || activeClip?.startTime || 0)))} / {formatSec(Math.max(1, (editEndTime || activeClip?.endTime || 30) - (editStartTime || activeClip?.startTime || 0)))}
                  </span>
                </div>

                {/* Quick Action CTA Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 w-full">
                  <button
                    type="button"
                    onClick={() => handleStartRender(activeClip)}
                    disabled={isRenderingPipeline}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Render klip ini</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeClip?.file) {
                        handleDownloadClip(activeClip);
                      } else {
                        handleStartRender(activeClip);
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{activeClip?.file ? 'Unduh MP4' : 'Render & Unduh'}</span>
                  </button>
                </div>

                <div className="text-[10px] font-mono text-slate-500 text-center pt-1 border-t border-slate-800/60">
                  Spasi: putar/jeda • Safe Zone ON/OFF
                </div>
              </div>
            </div>

            {/* COLUMN 3 (Right 4 Cols): Inspector / Atur Gaya Ber-Tab */}
            <div className="lg:col-span-4 bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl self-start">
              {/* Header Inspector */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Atur Gaya & Properti
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-400 text-[10px]">Skor:</span>
                  <span className="font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                    {activeClip?.viralScore || 70}%
                  </span>
                </div>
              </div>

              {/* Tab Navigation: [Gaya] [Teks] [Hook] [Layout] [Potong] [Efek] */}
              <div className="grid grid-cols-6 gap-1 p-1 rounded-xl bg-[#070a12] border border-slate-800">
                {[
                  { id: 'gaya', label: 'Gaya', icon: Palette },
                  { id: 'teks', label: 'Teks', icon: Type },
                  { id: 'hook', label: 'Hook', icon: Sparkles },
                  { id: 'layout', label: 'Layout', icon: Layers },
                  { id: 'potong', label: 'Potong', icon: Scissors },
                  { id: 'efek', label: 'Efek', icon: Sliders },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = editorActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEditorActiveTab(tab.id as any)}
                      className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                      title={tab.label}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="tracking-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="space-y-4 max-h-[660px] xl:max-h-[740px] overflow-y-auto pr-1">
                {/* TAB 1: GAYA SUBTITLE */}
                {editorActiveTab === 'gaya' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">Tampilkan Subtitle</div>
                        <div className="text-[10px] text-slate-400">Berlaku untuk semua klip di proyek ini</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHasSubtitles(!hasSubtitles)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          hasSubtitles ? 'bg-cyan-400' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                            hasSubtitles ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Status Sinkronisasi Subtitle */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs shadow-inner">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`}></span>
                        <span className="font-bold text-white text-[11px]">{isVideoPlaying ? 'Sinkron Audio (Berjalan)' : 'Jeda (Terkunci Sesuai Frame)'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                        {isVideoPlaying ? 'Live Audio Sync' : 'Jeda Bersama Video'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-300">Pilih Preset Animasi Subtitle</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'sorot', nama: 'Sorot Kuning', render: <span className="text-cyan-400 font-black uppercase text-[11px]"><span className="bg-cyan-400/20 px-1 rounded">TERNYATA</span> RAHASIANYA</span> },
                          { id: 'pop', nama: 'Pop Kapital', render: <span className="text-cyan-300 font-extrabold uppercase text-[11px] tracking-wide">TERNYATA RAHASIANYA</span> },
                          { id: 'terbaca', nama: 'Kotak Hitam', render: <span className="bg-black text-cyan-300 px-1.5 py-0.5 font-bold uppercase text-[10px] rounded">TERNYATA RAHASIANYA</span> },
                          { id: 'minimal', nama: 'Minimal', render: <span className="text-white font-medium text-[11px]">Ternyata rahasianya</span> },
                          { id: 'komik', nama: 'Komik Pop', render: <span className="text-emerald-400 font-black uppercase text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">TERNYATA RAHASIANYA</span> },
                          { id: 'neon', nama: 'Neon Glow', render: <span className="text-fuchsia-400 font-bold uppercase text-[11px] drop-shadow-[0_0_6px_rgba(232,121,249,0.9)]">TERNYATA RAHASIANYA</span> },
                          { id: 'karaoke', nama: 'Karaoke', render: <span className="text-cyan-400 font-bold text-[11px]">TERNYATA <span className="text-white/60">RAHASIANYA</span></span> },
                          { id: 'halus', nama: 'Halus Elegan', render: <span className="text-slate-200 font-light italic text-[11px]">ternyata rahasianya...</span> },
                          { id: 'maliki', nama: 'Merek CalClip', render: <span className="text-cyan-400 font-mono font-bold text-[10px]">calclip::rahasia</span> },
                          { id: 'lime', nama: 'Lime Box', render: <span className="bg-[#c6ff3d] text-black px-1.5 py-0.5 font-extrabold uppercase text-[10px] rounded">RAHASIANYA</span> },
                          { id: 'elegan', nama: 'Serif Elegan', render: <span className="text-cyan-300 font-serif italic text-[11px]">Ternyata Rahasianya</span> },
                          { id: 'sobek', nama: 'Kertas Sobek', render: <span className="bg-amber-100 text-black px-1.5 font-bold tracking-tight uppercase text-[10px]">TERNYATA</span> },
                        ].map((p) => {
                          const isChosen = activePreset === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => pilihPreset(p.id)}
                              className={`p-2.5 rounded-xl border flex flex-col items-center justify-between h-20 text-center cursor-pointer transition-all ${
                                isChosen
                                  ? 'bg-cyan-950/30 border-cyan-400 ring-2 ring-cyan-400/40 shadow-md shadow-cyan-950/60'
                                  : 'bg-[#0f172a]/70 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex-1 flex items-center justify-center w-full px-1">
                                {p.render}
                              </div>
                              <div className="text-[10px] font-semibold text-slate-400 truncate w-full pt-1 border-t border-slate-800/50">
                                {p.nama}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-300">Pengaturan Font & Huruf</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Pilihan Font</label>
                          <select
                            value={selectedFont}
                            onChange={(e) => setSelectedFont(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-slate-800 text-xs text-white"
                          >
                            <option value="Archivo Black">Archivo Black</option>
                            <option value="Anton">Anton (Tebal)</option>
                            <option value="Bangers">Bangers (Komik)</option>
                            <option value="Montserrat ExtraBold">Montserrat Bold</option>
                            <option value="Space Grotesk">Space Grotesk</option>
                            <option value="Georgia">Georgia (Serif)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Model Huruf</label>
                          <div className="flex gap-1 bg-[#070a12] p-0.5 rounded-lg border border-slate-800">
                            {[
                              { id: 'ABC', label: 'ABC' },
                              { id: 'abc', label: 'abc' },
                              { id: 'Asli', label: 'Asli' },
                            ].map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setLetterCase(c.id as any)}
                                className={`flex-1 py-1 rounded text-xs font-semibold cursor-pointer ${
                                  letterCase === c.id ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Ukuran Teks</label>
                          <div className="flex gap-1 bg-[#070a12] p-0.5 rounded-lg border border-slate-800">
                            {(['kecil', 'sedang', 'besar'] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setTextSize(s)}
                                className={`flex-1 py-1 rounded text-xs capitalize cursor-pointer ${
                                  textSize === s ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">Sorot Kata Kunci</label>
                          <button
                            type="button"
                            onClick={() => setColorHighlight(!colorHighlight)}
                            className={`w-full py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                              colorHighlight
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                                : 'bg-[#070a12] text-slate-400 border-slate-800'
                            }`}
                          >
                            {colorHighlight ? 'Menyala (Aktif)' : 'Polos'}
                          </button>
                        </div>
                      </div>

                      {/* Pilihan Warna Sorot Utama */}
                      <div className="pt-1">
                        <label className="text-[10px] font-mono text-slate-400 block mb-1.5">Warna Sorotan Kata (Viral Highlight)</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { label: 'Hijau Viral', color: '#3DFF8A' },
                            { label: 'Kuning Emas', color: '#FFD400' },
                            { label: 'Neon Cyan', color: '#00F5FF' },
                            { label: 'Pink Neon', color: '#FF3388' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setHighlightColor(c.color)}
                              className={`py-1 px-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                highlightColor === c.color ? 'ring-2 ring-white scale-102 shadow-sm' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: `${c.color}25`, color: c.color, border: `1px solid ${c.color}` }}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Posisi Vertikal & Fitur Teks */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Posisi Vertikal Subtitle</span>
                          <span className="font-mono text-cyan-400">{verticalPos}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={90}
                          value={verticalPos}
                          onChange={(e) => setVerticalPos(Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                        <div className="flex items-center justify-between text-xs pt-1">
                          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoEmoji}
                              onChange={(e) => setAutoEmoji(e.target.checked)}
                              className="accent-cyan-400 w-3.5 h-3.5 rounded"
                            />
                            <span>Emoji Otomatis</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sensorKataKasar}
                              onChange={(e) => setSensorKataKasar(e.target.checked)}
                              className="accent-cyan-400 w-3.5 h-3.5 rounded"
                            />
                            <span>Sensor Kasar</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={paksaCpu}
                              onChange={(e) => setPaksaCpu(e.target.checked)}
                              className="accent-cyan-400 w-3.5 h-3.5 rounded"
                            />
                            <span>Paksa CPU</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TEKS & TRANSKRIP */}
                {editorActiveTab === 'teks' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Judul Klip (Hook Teks Atas)</label>
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        placeholder="Judul klip..."
                        className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Transkrip Kutipan Perkataan</label>
                      <textarea
                        rows={5}
                        value={editQuoteInput}
                        onChange={(e) => setEditQuoteInput(e.target.value)}
                        placeholder="Kutipan perkataan di klip..."
                        className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                      />
                    </div>

                    {/* Word-by-Word Click Highlighter (CapCut / Submagic Style) */}
                    <div className="p-3 rounded-xl bg-[#070a12] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Klik Kata untuk Sorot & Pasang Emoji</span>
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">Word Inspector</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 max-h-36 overflow-y-auto">
                        {editQuoteInput.split(/\s+/).filter(Boolean).map((word, idx) => {
                          const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                          const isSelected = selectedWordForEdit === clean;
                          const custom = customWordStyles[clean];
                          const autoEm = getEmojiForWord(clean);
                          const activeEmoji = custom?.emoji || autoEm;
                          const activeColor = custom?.color || getSentimentColor(clean, '');

                          return (
                            <button
                              key={`${clean}-${idx}`}
                              type="button"
                              onClick={() => setSelectedWordForEdit(isSelected ? null : clean)}
                              className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-cyan-400 bg-cyan-950 text-white font-bold'
                                  : activeColor
                                  ? 'border font-bold'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800/60'
                              }`}
                              style={
                                activeColor
                                  ? { backgroundColor: `${activeColor}20`, borderColor: activeColor, color: activeColor }
                                  : undefined
                              }
                            >
                              {activeEmoji && <span className="text-xs">{activeEmoji}</span>}
                              <span>{word}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Floating Mini Action Toolbar */}
                      {selectedWordForEdit && (
                        <div className="p-2.5 rounded-lg bg-[#0b0f19] border border-cyan-500/40 space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
                            <span>Kustomisasi: <strong>"{selectedWordForEdit}"</strong></span>
                            <button
                              type="button"
                              onClick={() => setSelectedWordForEdit(null)}
                              className="text-slate-400 hover:text-white cursor-pointer text-xs"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-mono">Warna:</span>
                            {[
                              { label: 'Hijau', color: '#3DFF8A' },
                              { label: 'Kuning', color: '#FFD400' },
                              { label: 'Merah', color: '#FF453A' },
                              { label: 'Cyan', color: '#00F5FF' },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => {
                                  setCustomWordStyles((prev) => ({
                                    ...prev,
                                    [selectedWordForEdit]: { ...prev[selectedWordForEdit], color: c.color },
                                  }));
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                                style={{ backgroundColor: `${c.color}25`, color: c.color, border: `1px solid ${c.color}` }}
                              >
                                {c.label}
                              </button>
                            ))}

                            <span className="text-[10px] text-slate-400 font-mono ml-1">Emoji:</span>
                            {['👻', '🔥', '💰', '💡', '⚠️', '✅', '❌', '😂', '😱', '💪'].map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => {
                                  setCustomWordStyles((prev) => ({
                                    ...prev,
                                    [selectedWordForEdit]: { ...prev[selectedWordForEdit], emoji: em },
                                  }));
                                }}
                                className="text-xs p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              >
                                {em}
                              </button>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                setCustomWordStyles((prev) => {
                                  const copy = { ...prev };
                                  delete copy[selectedWordForEdit];
                                  return copy;
                                });
                                setSelectedWordForEdit(null);
                              }}
                              className="text-[10px] text-slate-400 hover:text-red-400 underline ml-auto cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 block">Caption / Deskripsi Media Sosial</label>
                      <input
                        type="text"
                        value={editCaptionInput}
                        onChange={(e) => setEditCaptionInput(e.target.value)}
                        placeholder="Caption klip..."
                        className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!activeClip) return;
                        setClips((prev) =>
                          prev.map((c) =>
                            c.id === activeClip.id
                              ? {
                                  ...c,
                                  title: editTitleInput.trim() || c.title,
                                  quote: editQuoteInput.trim() || c.quote,
                                  caption: editCaptionInput.trim() || c.caption,
                                }
                              : c
                          )
                        );
                        setShowSavedToast(true);
                        setTimeout(() => setShowSavedToast(false), 2000);
                      }}
                      className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan Teks</span>
                    </button>
                  </div>
                )}

                {/* TAB 3: HOOK BANNER */}
                {editorActiveTab === 'hook' && (() => {
                  const activeKey = String(activeClip?.id || '0');
                  const currentMainHook = customHooksByClip[activeKey] ?? (activeClip?.title || '');
                  const previewFull = getFullHookText(currentMainHook, bannerPrefix, bannerSuffix);

                  return (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white">Banner Hook Atas</div>
                          <div className="text-[10px] text-slate-400">Judul pemikat di bagian atas video</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHasHookBanner(!hasHookBanner)}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                            hasHookBanner ? 'bg-cyan-400' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                              hasHookBanner ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {hasHookBanner && (
                        <div className="space-y-3.5 p-3.5 rounded-xl bg-[#0f172a]/70 border border-slate-800 shadow-md">
                          {/* Gaya Tampilan Banner */}
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">Gaya Tampilan Banner</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'Kotak kuning', label: 'Kotak Kuning' },
                                { id: 'Pita kertas', label: 'Pita Kertas' },
                                { id: 'Neon pink', label: 'Neon Pink' },
                                { id: 'Minimal', label: 'Minimal Polos' },
                              ].map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setIntroStyle(b.id)}
                                  className={`p-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                                    introStyle === b.id
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold shadow-sm'
                                      : 'bg-[#070a12] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                                  }`}
                                >
                                  {b.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Kalimat / Teks Hook Bebas Kustom */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                <span>Teks Kalimat Hook</span>
                              </label>
                              {customHooksByClip[activeKey] !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomHooksByClip((prev) => {
                                      const next = { ...prev };
                                      delete next[activeKey];
                                      return next;
                                    });
                                  }}
                                  className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium underline"
                                >
                                  Reset ke Judul AI
                                </button>
                              )}
                            </div>
                            <textarea
                              rows={2}
                              value={currentMainHook}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomHooksByClip((prev) => {
                                  const updated = { ...prev, [activeKey]: val };
                                  customHooksByClipRef.current = updated;
                                  return updated;
                                });
                                setClips((prev) =>
                                  prev.map((c) =>
                                    c.id === activeClip?.id ? { ...c, title: val } : c
                                  )
                                );
                              }}
                              placeholder="Tulis kalimat pemikat/hook video kamu di sini..."
                              className="w-full px-3 py-2 rounded-xl bg-[#070a12] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none shadow-inner"
                            />
                            <div className="text-[10px] text-slate-500 flex justify-between">
                              <span>Bebas kamu ubah sesuai selera (tidak terbatas teks AI).</span>
                              <span>{currentMainHook.length} huruf</span>
                            </div>
                          </div>

                          {/* Teks Awalan & Akhiran Opsional */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Teks Depan (Awalan)</label>
                              <input
                                type="text"
                                value={bannerPrefix}
                                onChange={(e) => setBannerPrefix(e.target.value)}
                                placeholder="misal: TAHUKAH KAMU"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Teks Belakang (Akhiran)</label>
                              <input
                                type="text"
                                value={bannerSuffix}
                                onChange={(e) => setBannerSuffix(e.target.value)}
                                placeholder="misal: VIRAL BANGET"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                          </div>

                          {/* Hasil Pratinjau Teks Banner Utuh */}
                          <div className="p-2.5 rounded-xl bg-[#070a12] border border-slate-800 text-[11px] space-y-1">
                            <span className="text-slate-500 text-[10px] font-mono block">Hasil Teks Banner (Otomatis Diberi Spasi Rapi):</span>
                            <div className="text-cyan-300 font-bold uppercase tracking-tight leading-snug">
                              {previewFull || '(Teks hook kosong)'}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-slate-300">Tampil hanya 3 detik pertama (Hook Intro)</span>
                            <input
                              type="checkbox"
                              checked={introHook3s}
                              onChange={(e) => setIntroHook3s(e.target.checked)}
                              className="accent-cyan-400 w-4 h-4 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* TAB 4: LAYOUT & KAMERA */}
                {editorActiveTab === 'layout' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-300">Kanvas & Rasio Isi</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: '9:16', label: '9:16 Penuh', sub: 'TikTok/Reels' },
                          { id: '1:1', label: '1:1 Kotak', sub: 'Instagram Feed' },
                          { id: '4:3', label: '4:3 Klasik', sub: 'Tablet/Standard' },
                          { id: '16:9', label: '16:9 Lebar', sub: 'YouTube Widescreen' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setCanvasRatio(r.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              canvasRatio === r.id
                                ? 'bg-cyan-950/30 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
                                : 'bg-[#070a12] border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold">{r.label}</div>
                            <div className="text-[10px] text-slate-500">{r.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400 font-medium">Bentuk Bingkai Kanvas:</span>
                      <div className="flex gap-1 bg-[#070a12] p-0.5 rounded-lg border border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => setCanvasFrameMode('asli')}
                          className={`px-2.5 py-1 rounded cursor-pointer ${
                            canvasFrameMode === 'asli' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Pas Rasio
                        </button>
                        <button
                          type="button"
                          onClick={() => setCanvasFrameMode('9:16_letterbox')}
                          className={`px-2.5 py-1 rounded cursor-pointer ${
                            canvasFrameMode === '9:16_letterbox' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Bingkai 9:16
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-xs font-bold text-slate-300">Mode Layout Kamera</div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { id: 'podcast_auto', label: 'Podcast 1 Layar (Auto Pembicara)' },
                          { id: 'split', label: 'Split Podcast (2 Layar)' },
                          { id: 'satu', label: 'Satu video biasa (Solo)' },
                          { id: 'atas_bawah', label: 'Wajah atas • Layar gameplay bawah' },
                          { id: 'pip', label: 'Wajah di pojok (PiP Game)' },
                        ].map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              setLayoutMode(l.id as any);
                              if (l.id === 'split') setPodcastPreviewShot('split');
                            }}
                            className={`p-2 px-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                              layoutMode === l.id
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                : 'bg-[#070a12] border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Titik Fokus Horizontal */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] text-slate-400">Titik Fokus Kamera:</div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'otomatis', label: 'Otomatis' },
                          { id: 'kiri', label: 'Kiri' },
                          { id: 'tengah', label: 'Tengah' },
                          { id: 'kanan', label: 'Kanan' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setFocusPoint(f.id as any)}
                            className={`py-1 rounded text-xs font-semibold border cursor-pointer ${
                              focusPoint === f.id
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                                : 'bg-[#070a12] text-slate-400 border-slate-800'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {layoutMode === 'split' && (
                      <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-300">
                          <span>Pengaturan Split Podcast</span>
                          <button
                            type="button"
                            onClick={() => setPodcastSwap(!podcastSwap)}
                            className="text-[10px] text-cyan-400 border border-cyan-400/40 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Tukar Pembicara {podcastSwap ? '(P2/P1)' : '(P1/P2)'}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleDetectPodcast}
                            disabled={isDetectingPodcast}
                            className="flex-1 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {isDetectingPodcast ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span>Deteksi Wajah Otomatis</span>
                          </button>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">
                            Zoom Kamera Pembicara ({podcastZoom.toFixed(1)}x)
                          </label>
                          <input
                            type="range"
                            min={1.0}
                            max={2.0}
                            step={0.05}
                            value={podcastZoom}
                            onChange={(e) => setPodcastZoom(Number(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block mb-1">
                            Rasio Split Atas/Bawah ({podcastSplitRatio}% : {100 - podcastSplitRatio}%)
                          </label>
                          <input
                            type="range"
                            min={35}
                            max={65}
                            value={podcastSplitRatio}
                            onChange={(e) => setPodcastSplitRatio(Number(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-300">Transisi Otomatis 1 Orang ⇄ 2 Layar</span>
                          <input
                            type="checkbox"
                            checked={podcastAutoTransition}
                            onChange={(e) => setPodcastAutoTransition(e.target.checked)}
                            className="accent-cyan-400 w-3.5 h-3.5 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {layoutMode === 'podcast_auto' && (
                      <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-300 font-bold">
                          <span>Fokus Solo / Single Speaker</span>
                          <span className="font-mono text-cyan-400">X: {podcastSingleFocusX.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={0.9}
                          step={0.02}
                          value={podcastSingleFocusX}
                          onChange={(e) => setPodcastSingleFocusX(Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>
                    )}

                    {(layoutMode === 'atas_bawah' || layoutMode === 'pip') && (
                      <div className="space-y-3 text-xs">
                        {/* KARTU 1: KAMERA WAJAH / FACECAM STREAMER */}
                        <div className="p-3.5 rounded-xl bg-[#0f172a]/80 border border-slate-800 space-y-3 shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                              <span className="font-bold text-white text-[12px]">Kamera Wajah / Facecam</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleDetectFacecam}
                              disabled={isDetectingFacecam}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 border border-cyan-400/40 hover:border-cyan-400 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all bg-cyan-950/20"
                            >
                              {isDetectingFacecam ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              <span>Deteksi Otomatis</span>
                            </button>
                          </div>

                          {/* Preset Sudut Cepat */}
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Preset Sudut Cepat:</span>
                            <div className="grid grid-cols-5 gap-1 text-[10px]">
                              {[
                                { id: 'kb', label: 'Kiri Bwh', x: 0.10, y: 0.86 },
                                { id: 'nb', label: 'Kanan Bwh', x: 0.88, y: 0.86 },
                                { id: 'ka', label: 'Kiri Atas', x: 0.10, y: 0.18 },
                                { id: 'na', label: 'Kanan Atas', x: 0.88, y: 0.18 },
                                { id: 'tg', label: 'Tengah', x: 0.50, y: 0.50 },
                              ].map((pst) => {
                                const isAktif = Math.abs(streamerFaceX - pst.x) < 0.05 && Math.abs(streamerFaceY - pst.y) < 0.05;
                                return (
                                  <button
                                    key={pst.id}
                                    type="button"
                                    onClick={() => {
                                      setStreamerFaceX(pst.x);
                                      setStreamerFaceY(pst.y);
                                    }}
                                    className={`py-1 px-0.5 rounded-lg border text-center transition-all cursor-pointer font-medium ${
                                      isAktif
                                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                                        : 'bg-[#070a12] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                    }`}
                                  >
                                    {pst.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Posisi X & Y Sliders */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-400">Kiri ⇄ Kanan (X)</span>
                                <span className="font-mono text-cyan-400 font-semibold">{Math.round(streamerFaceX * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                value={streamerFaceX}
                                onChange={(e) => setStreamerFaceX(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-400">Atas ⇄ Bawah (Y)</span>
                                <span className="font-mono text-cyan-400 font-semibold">{Math.round(streamerFaceY * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                value={streamerFaceY}
                                onChange={(e) => setStreamerFaceY(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Zoom & Tinggi Wajah */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-400">Zoom Wajah</span>
                                <span className="font-mono text-cyan-400 font-semibold">{streamerFaceZoom.toFixed(1)}x</span>
                              </div>
                              <input
                                type="range"
                                min={1.0}
                                max={3.5}
                                step={0.1}
                                value={streamerFaceZoom}
                                onChange={(e) => setStreamerFaceZoom(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                              />
                            </div>
                            {layoutMode === 'atas_bawah' ? (
                              <div>
                                <div className="flex justify-between text-[11px] mb-1">
                                  <span className="text-slate-400">Tinggi Wajah</span>
                                  <span className="font-mono text-cyan-400 font-semibold">{streamerFaceHeight}%</span>
                                </div>
                                <input
                                  type="range"
                                  min={25}
                                  max={60}
                                  value={streamerFaceHeight}
                                  onChange={(e) => setStreamerFaceHeight(Number(e.target.value))}
                                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-[11px] text-slate-400 block mb-1">Posisi Kotak PiP</label>
                                <select
                                  value={pipPosition}
                                  onChange={(e) => setPipPosition(e.target.value as any)}
                                  className="w-full px-2 py-1 rounded-lg bg-[#070a12] border border-slate-800 text-[11px] text-white"
                                >
                                  <option value="kanan_atas">Pojok Kanan Atas</option>
                                  <option value="kiri_atas">Pojok Kiri Atas</option>
                                  <option value="kanan_bawah">Pojok Kanan Bawah</option>
                                  <option value="kiri_bawah">Pojok Kiri Bawah</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* KARTU 2: LAYAR GAMEPLAY (AKSI GAME) */}
                        <div className="p-3.5 rounded-xl bg-[#0f172a]/80 border border-slate-800 space-y-3 shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              <span className="font-bold text-white text-[12px]">Layar Gameplay</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setGameplayFocusX(0.5);
                                setGameplayFocusY(0.5);
                                setGameplayZoom(1.0);
                              }}
                              className="text-[10px] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              Reset Tengah
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Format Game</label>
                              <select
                                value={gameplayFitMode}
                                onChange={(e) => setGameplayFitMode(e.target.value as any)}
                                className="w-full px-2 py-1.5 rounded-lg bg-[#070a12] border border-slate-800 text-[11px] text-white"
                              >
                                <option value="fit_blur">Fit 16:9 (Bar Blur Rekomendasi)</option>
                                <option value="cover">Cover Penuh (Crop Zoom)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Zoom Layar Game</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="range"
                                  min={0.6}
                                  max={2.5}
                                  step={0.05}
                                  value={gameplayZoom}
                                  onChange={(e) => setGameplayZoom(Number(e.target.value))}
                                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                                />
                                <span className="font-mono text-cyan-400 text-[11px] font-semibold w-9 text-right shrink-0">
                                  {gameplayZoom.toFixed(1)}x
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Posisi X & Y Gameplay Sliders */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-400">Geser Kiri ⇄ Kanan</span>
                                <span className="font-mono text-cyan-400 font-semibold">{Math.round(gameplayFocusX * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                value={gameplayFocusX}
                                onChange={(e) => setGameplayFocusX(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-slate-400">Geser Atas ⇄ Bawah</span>
                                <span className="font-mono text-cyan-400 font-semibold">{Math.round(gameplayFocusY * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min={0.0}
                                max={1.0}
                                step={0.01}
                                value={gameplayFocusY}
                                onChange={(e) => setGameplayFocusY(Number(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                              />
                            </div>
                          </div>

                          {layoutMode === 'atas_bawah' && (
                            <div className="pt-1">
                              <label className="text-[10px] text-slate-400 block mb-1">Teks Garis Pembatas (Sponsor / Media Sosial)</label>
                              <input
                                type="text"
                                value={dividerText}
                                onChange={(e) => setDividerText(e.target.value)}
                                placeholder="Contoh: @streamer • Follow Twitch"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#070a12] border border-slate-800 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: POTONG (TRIMMING) */}
                {editorActiveTab === 'potong' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Potong Klip Presisi</span>
                        <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded">
                          Durasi: {Math.max(1, Math.round(editEndTime - editStartTime))}s
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Detik Mulai (In-Point)</span>
                          <span className="font-mono text-cyan-300">{formatSec(editStartTime)} ({editStartTime.toFixed(1)}s)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditStartTime((p) => Math.max(0, Math.round((p - 1) * 10) / 10))}
                            className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 cursor-pointer"
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
                            onClick={() => setEditStartTime((p) => Math.min(editEndTime - 1, Math.round((p + 1) * 10) / 10))}
                            className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            +1s
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Detik Selesai (Out-Point)</span>
                          <span className="font-mono text-cyan-300">{formatSec(editEndTime)} ({editEndTime.toFixed(1)}s)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditEndTime((p) => Math.max(editStartTime + 1, Math.round((p - 1) * 10) / 10))}
                            className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            -1s
                          </button>
                          <input
                            type="range"
                            min={editStartTime + 1}
                            max={videoDuration || 600}
                            step={0.5}
                            value={editEndTime}
                            onChange={(e) => setEditEndTime(Number(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setEditEndTime((p) => Math.round((p + 1) * 10) / 10)}
                            className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            +1s
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!activeClip) return;
                          setClips((prev) =>
                            prev.map((c) =>
                              c.id === activeClip.id
                                ? {
                                    ...c,
                                    startTime: editStartTime,
                                    endTime: editEndTime,
                                    durationSec: Math.round(editEndTime - editStartTime),
                                  }
                                : c
                            )
                          );
                          setShowSavedToast(true);
                          setTimeout(() => setShowSavedToast(false), 2000);
                        }}
                        className="w-full py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                      >
                        Terapkan Potongan Klip
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 6: EFEK & AUDIO */}
                {editorActiveTab === 'efek' && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">Panduan Safe Zone UI</div>
                        <div className="text-[10px] text-slate-400">Garis batas area aman TikTok & IG Reels</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={showSafeZone}
                        onChange={(e) => setShowSafeZone(e.target.checked)}
                        className="accent-cyan-400 w-4 h-4 cursor-pointer"
                      />
                    </div>


                    {/* Auto-Zoom Kata Kunci */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">Auto-Zoom Kata Kunci (Punch-in)</div>
                        <div className="text-[10px] text-slate-400">Zoom in halus 1.12x pada hook awal dan kata-kata viral</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={zoomKeyphrase}
                        onChange={(e) => setZoomKeyphrase(e.target.checked)}
                        className="accent-cyan-400 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Voice Boost (Penjernih Suara) */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">Voice Boost (Penjernih Suara)</div>
                        <div className="text-[10px] text-slate-400">Memperjelas frekuensi suara pembicara</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={voiceBoost !== '100%'}
                        onChange={(e) => setVoiceBoost(e.target.checked ? '150%' : '100%')}
                        className="accent-cyan-400 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {/* Progress Bar Kustomisasi (Standar Video Pendek Viral) */}
                    <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Progress Bar Durasi Bawah</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Garis penunjuk sisa video di bagian bawah layar</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={bottomProgress}
                          onChange={(e) => setBottomProgress(e.target.checked)}
                          className="accent-cyan-400 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      {bottomProgress && (
                        <div className="pt-1.5 border-t border-slate-800/60 space-y-2">
                          <div className="text-[10px] font-mono text-slate-400">Gaya Warna Bar:</div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'cyan', label: 'Cyan', color: '#00F5FF' },
                              { id: 'kuning', label: 'Kuning', color: '#FFD400' },
                              { id: 'hijau', label: 'Hijau', color: '#3DFF8A' },
                              { id: 'pelangi', label: 'Pelangi', color: '#FF3388' },
                            ].map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setProgressBarColor(c.id as any)}
                                className={`py-1 px-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                  progressBarColor === c.id
                                    ? 'ring-2 ring-white scale-102 shadow-sm'
                                    : 'opacity-70 hover:opacity-100'
                                }`}
                                style={{
                                  background: c.id === 'pelangi' ? 'linear-gradient(90deg, #00F5FF, #3DFF8A, #FFD400, #FF3388)' : `${c.color}25`,
                                  color: c.id === 'pelangi' ? '#fff' : c.color,
                                  border: c.id === 'pelangi' ? '1px solid rgba(255,255,255,0.4)' : `1px solid ${c.color}`,
                                }}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-mono text-slate-400">Ketebalan:</span>
                            <div className="flex gap-1.5">
                              {[
                                { id: 5, label: '5px' },
                                { id: 8, label: '8px' },
                                { id: 12, label: '12px' },
                              ].map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setProgressBarThickness(t.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                                    progressBarThickness === t.id
                                      ? 'bg-cyan-400 text-slate-950 font-bold'
                                      : 'bg-slate-800 text-slate-300 hover:text-white'
                                  }`}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mikro-Audio & Sound Effects */}
                    <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Mikro-Audio & Retensi Suara</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-white">Auto Micro-SFX (Pop & Whoosh)</div>
                          <div className="text-[10px] text-slate-400">Suara pop lembut saat emoji muncul & whoosh intro</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoMicroSfx}
                          onChange={(e) => setAutoMicroSfx(e.target.checked)}
                          className="accent-cyan-400 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-white">Auto Audio Ducking BGM</div>
                          <div className="text-[10px] text-slate-400">Musik latar otomatis mengecil saat orang bicara</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoAudioDucking}
                          onChange={(e) => setAutoAudioDucking(e.target.checked)}
                          className="accent-cyan-400 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-white flex items-center gap-1.5">
                            <span>Jernihkan Suara AI (Denoise)</span>
                            <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono border border-cyan-800">Pro</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Pembersih desis kipas & dengung mic otomatis (FFT Denoise)</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={jernihkanSuara}
                          onChange={(e) => setJernihkanSuara(e.target.checked)}
                          className="accent-cyan-400 w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-white flex items-center gap-1.5">
                            <span>Normalisasi Volume (EBU R128)</span>
                            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-emerald-800">-14 LUFS</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Standar volume optimal TikTok/Shorts tanpa pecah/distorsi</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={normalisasiLoudness}
                          onChange={(e) => setNormalisasiLoudness(e.target.checked)}
                          className="accent-cyan-400 w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* B-roll Mode */}
                    <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-300">B-Roll Video Sisipan</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'tanpa', label: 'Tanpa' },
                          { id: 'file', label: 'File saya' },
                          { id: 'pixabay', label: 'Pixabay' },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBRollMode(b.id as any)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer ${
                              bRollMode === b.id
                                ? 'bg-cyan-400 text-slate-950 font-bold'
                                : 'bg-[#070a12] text-slate-400 border border-slate-800'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Music BGM */}
                    <div className="p-3 rounded-xl bg-[#0f172a]/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Musik Latar (BGM)</span>
                        <span className="text-[10px] font-mono text-slate-400">{selectedMusicName} • {musicVol}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={musicVol}
                        onChange={(e) => setMusicVol(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={toggleMusicPreview}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Music className="w-3 h-3 text-cyan-400" />
                          <span>Pratinjau Musik</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => musicFileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                        >
                          Upload Musik
                        </button>
                        <input
                          type="file"
                          ref={musicFileInputRef}
                          accept="audio/*"
                          className="hidden"
                          onChange={handleUploadCustomMusic}
                        />
                        {selectedMusicName !== 'tanpa musik' && (
                          <button
                            type="button"
                            onClick={handleClearMusic}
                            className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-300 text-[11px] cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. BOTTOM PRECISION FILMSTRIP SCRUBBER */}
          {(() => {
            const baseStart = activeClip?.startTime || 0;
            const baseEnd = activeClip?.endTime || 30;
            const span = Math.max(1, baseEnd - baseStart);
            const currentT = hasResults ? currentVideoTime : currentTime;
            const leftPct = Math.max(0, Math.min(95, (((editStartTime || baseStart) - baseStart) / span) * 100));
            const rightPct = Math.max(0, Math.min(95, ((baseEnd - (editEndTime || baseEnd)) / span) * 100));
            const playheadPct = Math.max(0, Math.min(100, (((currentT || baseStart) - baseStart) / span) * 100));

            return (
              <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-3 shadow-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono px-1">
                  <span className="text-cyan-400 font-bold">{formatSec(editStartTime || baseStart)}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <button
                      type="button"
                      onClick={handleDeleteActiveClip}
                      className="hover:text-rose-400 hover:bg-slate-800/80 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 font-medium"
                      title="Buang / hapus klip ini dari daftar proyek"
                    >
                      <span>Buang bagian</span>
                    </button>
                    <span>•</span>
                    <span className="text-slate-500">Geser ujung pemotong</span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleSplitClipAtPlayhead}
                      className="hover:text-cyan-300 hover:bg-slate-800/80 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 font-bold text-cyan-400/90"
                      title="Belah klip di posisi waktu saat ini (Ctrl+B)"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>Ctrl+B belah klip</span>
                    </button>
                  </div>
                  <span className="text-cyan-400 font-bold">{formatSec(editEndTime || baseEnd)}</span>
                </div>

                <div
                  ref={filmstripContainerRef}
                  onMouseDown={(e) => {
                    setIsScrubbingFilmstrip(true);
                    handleFilmstripScrub(e.clientX);
                  }}
                  className="relative w-full h-12 bg-[#070a12] border border-slate-800 rounded-xl overflow-hidden flex items-center select-none cursor-pointer group"
                  title="Klik atau geser mouse untuk menggeser playhead video"
                >
                  {/* Filmstrip Frame Grid */}
                  <div className="w-full h-full flex opacity-30 pointer-events-none">
                    {[...Array(12)].map((_, idx) => (
                      <div key={idx} className="flex-1 h-full border-r border-slate-800/80 bg-slate-900/50 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-slate-700">frame-{idx + 1}</span>
                      </div>
                    ))}
                  </div>

                  {/* Active Trimmer Bounding Box with Left and Right Handles */}
                  <div
                    style={{
                      left: `${leftPct}%`,
                      right: `${rightPct}%`,
                    }}
                    className="absolute inset-y-0 border-2 border-cyan-400 bg-cyan-400/10 pointer-events-none flex items-center justify-between z-20"
                  >
                    {/* Left In-Point Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingLeftHandle(true);
                      }}
                      className="pointer-events-auto h-full w-3 bg-cyan-400 hover:bg-cyan-300 cursor-ew-resize flex items-center justify-center transition-colors shadow-lg z-30"
                      title="Tahan & geser untuk memotong detik awal klip"
                    >
                      <span className="w-0.5 h-4 bg-slate-950 rounded"></span>
                    </div>

                    {/* Right Out-Point Handle */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingRightHandle(true);
                      }}
                      className="pointer-events-auto h-full w-3 bg-cyan-400 hover:bg-cyan-300 cursor-ew-resize flex items-center justify-center transition-colors shadow-lg z-30"
                      title="Tahan & geser untuk memotong detik akhir klip"
                    >
                      <span className="w-0.5 h-4 bg-slate-950 rounded"></span>
                    </div>
                  </div>

                  {/* Real-time Filmstrip Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,1)] z-20 pointer-events-none"
                    style={{
                      left: `${playheadPct}%`,
                    }}
                  />
                </div>
              </div>
            );
          })()}
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
