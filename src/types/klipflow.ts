/**
 * KlipFlow AI Core Types & Interfaces
 * Thesis: Multi-Target Active Speaker Reframing & Procedural Subtitles
 * Author: Muhammad Ikhsan Fauzi (Universitas Siliwangi)
 */

export type DetectionCategory = 'speaker_face' | 'speaker_hand_gesture' | 'explained_object';

export interface BoundingBox {
  x: number; // normalized [0, 1] top-left x
  y: number; // normalized [0, 1] top-left y
  width: number; // normalized [0, 1] width
  height: number; // normalized [0, 1] height
}

export interface DetectedTarget {
  id: number;
  category: DetectionCategory;
  box: BoundingBox;
  confidence: number; // 0 - 1
  label: string;
  asdScore: number; // Active Speaker Detection score [0, 1]
  isSpeaking: boolean;
  lipMotionVariance: number;
  saliencyScore: number; // [0, 1]
  lastSeenTimestamp: number;
  velocity: [number, number]; // dx, dy per second
}

export type ReframingMode = 'SPEAKER_FOLLOW' | 'EXPLANATION_PAN' | 'AUTO_SPLIT_SCREEN';

export interface ReframingState {
  mode: ReframingMode;
  targetMode: ReframingMode;
  cropBox: BoundingBox; // 9:16 target crop window inside source 16:9
  rawTargetCenter: [number, number];
  smoothedCenter: [number, number];
  velocity: [number, number];
  isSplitScreenActive: boolean;
  splitTopCrop?: BoundingBox; // Explained object or context
  splitBottomCrop?: BoundingBox; // Active speaker close up
  splitRatio: number; // top portion (e.g. 0.58)
  activeSpeakerId: number | null;
  activeObjectId: number | null;
  cameraJitterRaw: number;
  cameraJitterKalman: number;
  panProgress: number; // 0 = fully at speaker, 1 = fully at object
  safeZoneOffset: number; // -1 (top), 0 (center), 1 (bottom)
}

export type KineticStyleId = 
  | 'Neon'
  | 'Sapuan'
  | 'KertasSobek'
  | 'KotakHijau'
  | 'SerifElegan'
  | 'KaraokePop'
  | 'LimeBox'
  | 'HookNeon'
  | 'SerifElegance'
  | 'PaperTear'
  | 'CyberPop'
  | 'MinimalClean';

export interface SubtitleWord {
  id: string;
  text: string;
  start: number; // in seconds
  end: number; // in seconds
  isHighlighted?: boolean;
  emoji?: string;
  confidence: number;
}

export interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: SubtitleWord[];
  style: KineticStyleId;
  safeZoneAnchor: 'bottom' | 'middle' | 'top';
}

export interface ViralMoment {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  hookScore: number; // 0 - 100
  reasons: string[];
  previewSnippet: string;
  recommendedMode: ReframingMode;
  speechEnergyPeak: number;
  visualSaliencyPeak: number;
  keywordScore: number;
}

export interface TelemetryMetrics {
  currentFps: number;
  realTimeFactor: number; // RTF <= 0.35
  cameraJitterRaw: number;
  cameraJitterKalman: number;
  jitterReductionPercent: number; // e.g. 78.4%
  iouFramingAccuracy: number; // e.g. 91.2%
  hotaScore: number; // Higher Order Tracking Accuracy (0-100)
  idf1Score: number; // ID F1-Score (0-100)
  wordErrorRate: number; // WER % (e.g. 4.8%)
  characterErrorRate: number; // CER % (e.g. 1.9%)
  activeSpeakerAccuracy: number; // %
  ramUsageMB: number; // < 220 MB
  binarySizeMB: number; // < 25 MB vs 80.16 MB baseline
  susScore: number; // >= 80.5 (Grade A)
}

export interface VideoSourceMeta {
  id: string;
  name: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  isDemo: boolean;
  url?: string;
}

export interface SubtitleStyleConfig {
  id: KineticStyleId;
  name: string;
  description: string;
  fontFamily: string;
  fontSize: number; // base font size in px
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hasShadow: boolean;
  hasBackground: boolean;
  uppercase: boolean;
  badgeEmoji?: string;
}
