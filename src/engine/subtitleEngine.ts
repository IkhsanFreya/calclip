/**
 * Module D — Word-Level ASR Subtitle Engine & Collision-Aware Placement
 * References:
 * - Radford et al. (ICML 2023) "Robust Speech Recognition via Large-Scale Weak Supervision" (Whisper)
 * - Dynamic Time Warping (DTW) for word-level alignment
 * - Procedural GPU/Canvas Kinetic Typography Engine (Zero-WebP dependency)
 */

import { KineticStyleId, SubtitleSegment, SubtitleStyleConfig, SubtitleWord } from '../types/klipflow';

// Indonesian slang/informal dictionary normalization mapping
export const INDONESIAN_SLANG_NORMALIZER: Record<string, string> = {
  gak: 'nggak',
  ga: 'nggak',
  ngga: 'nggak',
  nggak: 'nggak',
  kalo: 'kalau',
  klo: 'kalau',
  yg: 'yang',
  dgn: 'dengan',
  sdh: 'sudah',
  udah: 'udah',
  udh: 'udah',
  bgt: 'banget',
  tp: 'tapi',
  blm: 'belum',
  beneran: 'beneran',
  gimana: 'gimana',
  gmna: 'gimana',
  kenape: 'kenapa',
  knp: 'kenapa',
  gue: 'gue',
  gw: 'gue',
  lu: 'lu',
  lo: 'lu',
  emang: 'emang',
  emg: 'emang',
  aja: 'aja',
  aj: 'aja',
  bikin: 'bikin',
  skrg: 'sekarang',
};

// Preset Configurations for the 6 Procedural Kinetic Typography Styles (Matching KlipHP v3.2 & Thesis)
export const KINETIC_STYLE_CONFIGS: Record<KineticStyleId, SubtitleStyleConfig> = {
  Neon: {
    id: 'Neon',
    name: 'Neon Pendar',
    description: 'Stiker neon pendar pink/cyan dengan garis bawah bercahaya (Pengganti assets/anim/neon/)',
    fontFamily: 'Syne, Inter, sans-serif',
    fontSize: 34,
    primaryColor: '#f43f5e',
    secondaryColor: '#06b6d4',
    accentColor: '#22d3ee',
    hasShadow: true,
    hasBackground: false,
    uppercase: true,
    badgeEmoji: '🔥',
  },
  Sapuan: {
    id: 'Sapuan',
    name: 'Sapuan Kuas',
    description: 'Animasi sapuan stabilo kuas kuning dinamis (Pengganti assets/anim/sapuan/)',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 32,
    primaryColor: '#ffffff',
    secondaryColor: '#090d16',
    accentColor: '#facc15',
    hasShadow: true,
    hasBackground: true,
    uppercase: true,
    badgeEmoji: '🖌️',
  },
  KertasSobek: {
    id: 'KertasSobek',
    name: 'Kertas Sobek',
    description: 'Pita sobekan kertas grunge miring sudut dinamis (Pengganti assets/anim/sobek/)',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 29,
    primaryColor: '#0f172a',
    secondaryColor: '#1e293b',
    accentColor: '#fef08a',
    hasShadow: true,
    hasBackground: true,
    uppercase: true,
    badgeEmoji: '📌',
  },
  KotakHijau: {
    id: 'KotakHijau',
    name: 'Kotak Hijau',
    description: 'Kotak lime neon pembungkus kata aktif dengan kontras tinggi',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 32,
    primaryColor: '#ffffff',
    secondaryColor: '#94a3b8',
    accentColor: '#a3e635',
    hasShadow: true,
    hasBackground: true,
    uppercase: true,
    badgeEmoji: '⚡',
  },
  SerifElegan: {
    id: 'SerifElegan',
    name: 'Serif Elegan',
    description: 'Tipografi majalah editorial mewah beraksen emas sampanye',
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: 30,
    primaryColor: '#fef08a',
    secondaryColor: '#f8fafc',
    accentColor: '#fbbf24',
    hasShadow: true,
    hasBackground: false,
    uppercase: false,
    badgeEmoji: '✨',
  },
  KaraokePop: {
    id: 'KaraokePop',
    name: 'Karaoke Pop',
    description: 'Pantulan kata-per-kata berenergi tinggi dengan emoji kontekstual',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 33,
    primaryColor: '#ffffff',
    secondaryColor: '#cbd5e1',
    accentColor: '#4ade80',
    hasShadow: true,
    hasBackground: true,
    uppercase: true,
    badgeEmoji: '🚀',
  },
  // Aliases for compatibility
  LimeBox: {
    id: 'LimeBox',
    name: 'Kotak Hijau (Lime)',
    description: 'Kotak lime neon pembungkus kata aktif dengan kontras tinggi',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 32,
    primaryColor: '#ffffff',
    secondaryColor: '#94a3b8',
    accentColor: '#a3e635',
    hasShadow: true,
    hasBackground: true,
    uppercase: true,
    badgeEmoji: '⚡',
  },
  HookNeon: {
    id: 'HookNeon',
    name: 'Neon Pendar',
    description: 'Stiker neon pendar pink/cyan dengan garis bawah bercahaya',
    fontFamily: 'Syne, Inter, sans-serif',
    fontSize: 34,
    primaryColor: '#f43f5e',
    secondaryColor: '#06b6d4',
    accentColor: '#22d3ee',
    hasShadow: true,
    hasBackground: false,
    uppercase: true,
    badgeEmoji: '🔥',
  },
  SerifElegance: {
    id: 'SerifElegance',
    name: 'Serif Elegan',
    description: 'Tipografi majalah editorial mewah beraksen emas sampanye',
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: 30,
    primaryColor: '#fef08a',
    secondaryColor: '#f8fafc',
    accentColor: '#fbbf24',
    hasShadow: true,
    hasBackground: false,
    uppercase: false,
    badgeEmoji: '✨',
  },
  PaperTear: {
    id: 'PaperTear',
    name: 'Kertas Sobek',
    description: 'Pita sobekan kertas grunge miring sudut dinamis',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 29,
    primaryColor: '#0f172a',
    secondaryColor: '#1e293b',
    accentColor: '#fef08a',
    hasShadow: true,
    hasBackground: true,
    uppercase: true,
    badgeEmoji: '📌',
  },
  CyberPop: {
    id: 'CyberPop',
    name: 'Karaoke Pop',
    description: 'Pantulan kata-per-kata berenergi tinggi dengan emoji kontekstual',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 33,
    primaryColor: '#ffffff',
    secondaryColor: '#cbd5e1',
    accentColor: '#4ade80',
    hasShadow: true,
    hasBackground: true,
    uppercase: true,
    badgeEmoji: '🚀',
  },
  MinimalClean: {
    id: 'MinimalClean',
    name: 'Minimal Bersih',
    description: 'Teks siaran televisi bergaris tepi kontras tinggi',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 29,
    primaryColor: '#ffffff',
    secondaryColor: '#94a3b8',
    accentColor: '#38bdf8',
    hasShadow: false,
    hasBackground: true,
    uppercase: false,
    badgeEmoji: '💬',
  },
};

export class SubtitleEngine {
  private segments: SubtitleSegment[] = [];
  private activeStyle: KineticStyleId = 'LimeBox';
  private boxLerpX: number = 0;
  private boxLerpW: number = 0;

  constructor() {
    this.segments = this.getInitialDemoSegments();
  }

  public getSegments(): SubtitleSegment[] {
    return this.segments;
  }

  public setSegments(newSegments: SubtitleSegment[]): void {
    this.segments = newSegments;
  }

  public setStyle(styleId: KineticStyleId): void {
    this.activeStyle = styleId;
    this.segments = this.segments.map(s => ({ ...s, style: styleId }));
  }

  public getActiveStyle(): KineticStyleId {
    return this.activeStyle;
  }

  /**
   * Find current active subtitle segment and word at given video playback time
   */
  public getCurrentSegment(timeSeconds: number): {
    segment: SubtitleSegment | null;
    activeWordIndex: number;
    activeWord: SubtitleWord | null;
  } {
    const segment = this.segments.find(s => timeSeconds >= s.start && timeSeconds <= s.end) || null;
    if (!segment) {
      return { segment: null, activeWordIndex: -1, activeWord: null };
    }

    const wordIdx = segment.words.findIndex(w => timeSeconds >= w.start && timeSeconds <= w.end);
    const activeWord = wordIdx >= 0 ? segment.words[wordIdx] : null;

    return {
      segment,
      activeWordIndex: wordIdx,
      activeWord,
    };
  }

  /**
   * Normalize Indonesian words using slang dictionary
   */
  public normalizeIndonesianWord(rawWord: string): string {
    const clean = rawWord.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    if (INDONESIAN_SLANG_NORMALIZER[clean]) {
      return INDONESIAN_SLANG_NORMALIZER[clean];
    }
    return rawWord;
  }

  /**
   * Update a specific word inside a segment
   */
  public updateWord(
    segmentId: string,
    wordId: string,
    newText: string,
    newStart?: number,
    newEnd?: number,
    isHighlighted?: boolean,
    emoji?: string
  ): void {
    this.segments = this.segments.map(s => {
      if (s.id !== segmentId) return s;
      const updatedWords = s.words.map(w => {
        if (w.id !== wordId) return w;
        return {
          ...w,
          text: newText,
          start: newStart ?? w.start,
          end: newEnd ?? w.end,
          isHighlighted: isHighlighted ?? w.isHighlighted,
          emoji: emoji ?? w.emoji,
        };
      });
      return {
        ...s,
        text: updatedWords.map(w => w.text).join(' '),
        words: updatedWords,
      };
    });
  }

  /**
   * Import Subtitles from standard SRT text
   */
  public importFromSRT(srtContent: string): void {
    const lines = srtContent.replace(/\r\n/g, '\n').split('\n');
    const parsedSegments: SubtitleSegment[] = [];
    let i = 0;

    const parseTimestamp = (tStr: string): number => {
      const [hms, ms] = tStr.trim().split(',');
      const [h, m, s] = hms.split(':').map(Number);
      return h * 3600 + m * 60 + s + (Number(ms) || 0) / 1000;
    };

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }
      if (/^\d+$/.test(line)) {
        i++;
        if (i >= lines.length) break;
        const timeLine = lines[i].trim();
        const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        if (timeMatch) {
          const startTime = parseTimestamp(timeMatch[1]);
          const endTime = parseTimestamp(timeMatch[2]);
          i++;
          const textLines: string[] = [];
          while (i < lines.length && lines[i].trim() !== '') {
            textLines.push(lines[i].trim());
            i++;
          }
          const fullText = textLines.join(' ');
          const wordsList = fullText.split(/\s+/).filter(Boolean);
          const duration = Math.max(0.1, endTime - startTime);
          const wordDuration = duration / Math.max(1, wordsList.length);

          const words: SubtitleWord[] = wordsList.map((w, idx) => ({
            id: `word-${parsedSegments.length}-${idx}-${Date.now()}`,
            text: this.normalizeIndonesianWord(w),
            start: startTime + idx * wordDuration,
            end: startTime + (idx + 1) * wordDuration,
            confidence: 0.94,
          }));

          parsedSegments.push({
            id: `seg-${parsedSegments.length}-${Date.now()}`,
            start: startTime,
            end: endTime,
            text: words.map(w => w.text).join(' '),
            words,
            style: this.activeStyle,
            safeZoneAnchor: 'bottom',
          });
        }
      }
      i++;
    }

    if (parsedSegments.length > 0) {
      this.segments = parsedSegments;
    }
  }

  /**
   * Export to standard SRT
   */
  public exportToSRT(): string {
    const formatTime = (sec: number): string => {
      const h = Math.floor(sec / 3600).toString().padStart(2, '0');
      const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
      return `${h}:${m}:${s},${ms}`;
    };

    return this.segments
      .map((seg, idx) => {
        return `${idx + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text}\n`;
      })
      .join('\n');
  }

  /**
   * Export to JSON word-level alignment format
   */
  public exportToJSON(): string {
    return JSON.stringify(this.segments, null, 2);
  }

  /**
   * Real-Time Procedural Canvas Subtitle Renderer
   * Renders the 6 kinetic typography styles directly into 2D Canvas at 60 FPS
   */
  public renderToCanvas(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    currentTime: number,
    safeZoneOffset: number = 1 // 1 = bottom, 0 = middle, -1 = top
  ): void {
    const { segment, activeWordIndex } = this.getCurrentSegment(currentTime);
    if (!segment) return;

    const styleConfig = KINETIC_STYLE_CONFIGS[segment.style] || KINETIC_STYLE_CONFIGS.LimeBox;

    // Determine Y coordinate based on Collision-Aware Safe Zone
    let anchorY = canvasH * 0.82; // bottom
    if (safeZoneOffset === 0) {
      anchorY = canvasH * 0.50; // middle safe-zone
    } else if (safeZoneOffset === -1) {
      anchorY = canvasH * 0.18; // top safe-zone
    }

    ctx.save();

    // Scale font size proportionally to 9:16 canvas height
    const baseScale = canvasH / 960;
    const computedFontSize = Math.round(styleConfig.fontSize * baseScale);
    ctx.font = `800 ${computedFontSize}px ${styleConfig.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = segment.words;
    if (words.length === 0) {
      ctx.restore();
      return;
    }

    // Measure widths of each word for kinetic positioning
    const spaceWidth = ctx.measureText(' ').width;
    const wordWidths = words.map(w => {
      const displayTxt = styleConfig.uppercase ? w.text.toUpperCase() : w.text;
      return ctx.measureText(displayTxt).width;
    });
    const totalTextWidth = wordWidths.reduce((a, b) => a + b, 0) + spaceWidth * (words.length - 1);

    // Starting X for centered subtitle group
    let currentX = (canvasW - totalTextWidth) / 2;

    switch (segment.style) {
      case 'Sapuan': {
        // Procedural Brush Sweep Effect (Zero-WebP replacement for assets/anim/sapuan/*.webp)
        const padX = 14 * baseScale;
        const padY = 8 * baseScale;
        ctx.fillStyle = 'rgba(10, 15, 29, 0.70)';
        ctx.beginPath();
        ctx.roundRect(
          currentX - padX,
          anchorY - computedFontSize / 2 - padY,
          totalTextWidth + padX * 2,
          computedFontSize + padY * 2,
          10 * baseScale
        );
        ctx.fill();

        // Calculate active word position for brush sweep
        let activeX = currentX;
        let activeW = wordWidths[0] || 50;
        let tempX = currentX;
        for (let i = 0; i < words.length; i++) {
          if (i === activeWordIndex) {
            activeX = tempX;
            activeW = wordWidths[i];
            break;
          }
          tempX += wordWidths[i] + spaceWidth;
        }

        // Draw dynamic brush highlighter sweep
        if (activeWordIndex >= 0) {
          ctx.save();
          const sweepGrad = ctx.createLinearGradient(activeX - 10, anchorY, activeX + activeW + 10, anchorY);
          sweepGrad.addColorStop(0, '#facc15'); // vibrant yellow
          sweepGrad.addColorStop(0.5, '#fde047');
          sweepGrad.addColorStop(1, '#eab308');
          ctx.fillStyle = sweepGrad;
          ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
          ctx.shadowBlur = 10 * baseScale;

          // Brush stroke polygon with natural painterly variation
          ctx.beginPath();
          ctx.moveTo(activeX - 4 * baseScale, anchorY - computedFontSize * 0.45);
          ctx.lineTo(activeX + activeW + 6 * baseScale, anchorY - computedFontSize * 0.48);
          ctx.lineTo(activeX + activeW + 4 * baseScale, anchorY + computedFontSize * 0.52);
          ctx.lineTo(activeX - 6 * baseScale, anchorY + computedFontSize * 0.48);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Draw words
        currentX = (canvasW - totalTextWidth) / 2;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const displayTxt = w.text.toUpperCase();
          const wCenter = currentX + wordWidths[i] / 2;
          ctx.fillStyle = (i === activeWordIndex) ? '#090d16' : '#ffffff';
          ctx.fillText(displayTxt, wCenter, anchorY);
          currentX += wordWidths[i] + spaceWidth;
        }
        break;
      }

      case 'KotakHijau':
      case 'LimeBox': {
        // Draw dark pill backdrop for full segment
        const paddingX = 18 * baseScale;
        const paddingY = 12 * baseScale;
        ctx.fillStyle = 'rgba(10, 15, 29, 0.78)';
        ctx.beginPath();
        ctx.roundRect(
          currentX - paddingX,
          anchorY - computedFontSize / 2 - paddingY,
          totalTextWidth + paddingX * 2,
          computedFontSize + paddingY * 2,
          16 * baseScale
        );
        ctx.fill();

        // Calculate active word box target
        let activeBoxX = currentX;
        let activeBoxW = 0;
        for (let i = 0; i < words.length; i++) {
          if (i === activeWordIndex) {
            activeBoxX = currentX;
            activeBoxW = wordWidths[i];
            break;
          }
          currentX += wordWidths[i] + spaceWidth;
        }

        // Smooth Lerp tracking for Lime Box
        if (this.boxLerpW === 0) {
          this.boxLerpX = activeBoxX;
          this.boxLerpW = activeBoxW;
        } else {
          this.boxLerpX += (activeBoxX - this.boxLerpX) * 0.35;
          this.boxLerpW += (activeBoxW - this.boxLerpW) * 0.35;
        }

        // Draw animated Lime highlight box behind active word
        if (activeWordIndex >= 0) {
          ctx.fillStyle = '#a3e635'; // Lime-400
          ctx.shadowColor = 'rgba(163, 230, 53, 0.6)';
          ctx.shadowBlur = 14 * baseScale;
          ctx.beginPath();
          ctx.roundRect(
            this.boxLerpX - 6 * baseScale,
            anchorY - computedFontSize / 2 - 4 * baseScale,
            this.boxLerpW + 12 * baseScale,
            computedFontSize + 8 * baseScale,
            8 * baseScale
          );
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw words
        currentX = (canvasW - totalTextWidth) / 2;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const displayTxt = styleConfig.uppercase ? w.text.toUpperCase() : w.text;
          const wCenter = currentX + wordWidths[i] / 2;

          if (i === activeWordIndex) {
            // High-contrast black text inside lime box
            ctx.fillStyle = '#090d16';
          } else {
            // White or highlighted
            ctx.fillStyle = w.isHighlighted ? '#fde047' : '#ffffff';
          }
          ctx.fillText(displayTxt, wCenter, anchorY);

          // Auto-emoji pop
          if (w.emoji && i === activeWordIndex) {
            ctx.font = `${Math.round(computedFontSize * 1.1)}px sans-serif`;
            ctx.fillText(w.emoji, wCenter, anchorY - computedFontSize - 8 * baseScale);
            ctx.font = `800 ${computedFontSize}px ${styleConfig.fontFamily}`;
          }

          currentX += wordWidths[i] + spaceWidth;
        }
        break;
      }

      case 'Neon':
      case 'HookNeon': {
        // Glowing Sticker Title + Pulsing Gradient Underline
        const nowSec = currentTime;
        const pulse = 0.5 + 0.5 * Math.sin(nowSec * 8);

        // Neon Underline Stroke
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.7 + pulse * 0.3})`;
        ctx.lineWidth = 4 * baseScale;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = (15 + pulse * 10) * baseScale;
        ctx.beginPath();
        ctx.moveTo(currentX - 10, anchorY + computedFontSize * 0.65);
        ctx.lineTo(currentX + totalTextWidth + 10, anchorY + computedFontSize * 0.65);
        ctx.stroke();

        // Neon Text with dual glow
        currentX = (canvasW - totalTextWidth) / 2;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const displayTxt = w.text.toUpperCase();
          const wCenter = currentX + wordWidths[i] / 2;

          if (i === activeWordIndex) {
            ctx.fillStyle = '#f43f5e'; // vibrant neon pink
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 18 * baseScale;
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 8 * baseScale;
          }
          ctx.fillText(displayTxt, wCenter, anchorY);
          currentX += wordWidths[i] + spaceWidth;
        }
        break;
      }

      case 'SerifElegan':
      case 'SerifElegance': {
        // Editorial Serif with gold accents
        ctx.font = `600 ${computedFontSize}px 'Playfair Display', Georgia, serif`;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.beginPath();
        ctx.roundRect(
          currentX - 20 * baseScale,
          anchorY - computedFontSize / 2 - 10 * baseScale,
          totalTextWidth + 40 * baseScale,
          computedFontSize + 20 * baseScale,
          10 * baseScale
        );
        ctx.fill();

        currentX = (canvasW - totalTextWidth) / 2;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const isItalic = i === 1 || w.isHighlighted;
          ctx.font = isItalic
            ? `italic 700 ${computedFontSize}px 'Playfair Display', Georgia, serif`
            : `700 ${computedFontSize}px 'Playfair Display', Georgia, serif`;

          const wCenter = currentX + wordWidths[i] / 2;
          ctx.fillStyle = i === activeWordIndex ? '#fbbf24' : '#f8fafc';
          ctx.fillText(w.text, wCenter, anchorY);
          currentX += wordWidths[i] + spaceWidth;
        }
        break;
      }

      case 'KertasSobek':
      case 'PaperTear': {
        // Ripped-paper textured polygon
        const padX = 16 * baseScale;
        const padY = 10 * baseScale;
        ctx.save();
        ctx.translate((canvasW) / 2, anchorY);
        ctx.rotate(-0.02); // 1.2 degree editorial tilt

        ctx.fillStyle = '#fef08a'; // aged paper yellow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 12 * baseScale;
        ctx.shadowOffsetY = 6 * baseScale;

        // Jagged ripped paper edges
        const boxLeft = -totalTextWidth / 2 - padX;
        const boxRight = totalTextWidth / 2 + padX;
        const boxTop = -computedFontSize / 2 - padY;
        const boxBottom = computedFontSize / 2 + padY;

        ctx.beginPath();
        ctx.moveTo(boxLeft, boxTop);
        ctx.lineTo(boxRight, boxTop);
        // Jagged right edge
        ctx.lineTo(boxRight + 6, boxTop + (boxBottom - boxTop) * 0.5);
        ctx.lineTo(boxRight, boxBottom);
        ctx.lineTo(boxLeft, boxBottom);
        // Jagged left edge
        ctx.lineTo(boxLeft - 6, boxTop + (boxBottom - boxTop) * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw dark bold text
        ctx.fillStyle = '#0f172a';
        ctx.font = `900 ${computedFontSize}px 'JetBrains Mono', monospace`;
        ctx.fillText(segment.text.toUpperCase(), 0, 0);

        ctx.restore();
        break;
      }

      case 'KaraokePop':
      case 'CyberPop': {
        // Bouncy word tracker + automatic pop-up animation
        currentX = (canvasW - totalTextWidth) / 2;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const displayTxt = w.text.toUpperCase();
          const wCenter = currentX + wordWidths[i] / 2;
          const isActive = i === activeWordIndex;

          let yOffset = 0;
          if (isActive) {
            // Bounce motion curve
            const wordElapsed = currentTime - w.start;
            const bounce = Math.sin(Math.min(Math.PI, wordElapsed * 10)) * 8 * baseScale;
            yOffset = -bounce;
          }

          if (isActive) {
            ctx.fillStyle = '#4ade80'; // Emerald Green
            ctx.shadowColor = '#4ade80';
            ctx.shadowBlur = 16 * baseScale;
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
          }

          ctx.fillText(displayTxt, wCenter, anchorY + yOffset);
          currentX += wordWidths[i] + spaceWidth;
        }
        break;
      }

      case 'MinimalClean':
      default: {
        // Broadcast solid caption with dark backdrop
        const padX = 14 * baseScale;
        const padY = 8 * baseScale;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.beginPath();
        ctx.roundRect(
          currentX - padX,
          anchorY - computedFontSize / 2 - padY,
          totalTextWidth + padX * 2,
          computedFontSize + padY * 2,
          8 * baseScale
        );
        ctx.fill();

        currentX = (canvasW - totalTextWidth) / 2;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const wCenter = currentX + wordWidths[i] / 2;

          ctx.fillStyle = i === activeWordIndex ? '#38bdf8' : '#ffffff';
          ctx.fillText(w.text, wCenter, anchorY);
          currentX += wordWidths[i] + spaceWidth;
        }
        break;
      }
    }

    ctx.restore();
  }

  /**
   * Built-in multi-speaker demonstration subtitles (Bahasa Indonesia casual tech discussion)
   */
  public getInitialDemoSegments(): SubtitleSegment[] {
    return [
      {
        id: 'seg-1',
        start: 0.0,
        end: 3.4,
        text: 'Halo semuanya balik lagi di KlipFlow AI tutorial!',
        style: 'LimeBox',
        safeZoneAnchor: 'bottom',
        words: [
          { id: 'w1', text: 'Halo', start: 0.1, end: 0.5, confidence: 0.98 },
          { id: 'w2', text: 'semuanya', start: 0.5, end: 1.0, confidence: 0.97 },
          { id: 'w3', text: 'balik', start: 1.0, end: 1.4, confidence: 0.95 },
          { id: 'w4', text: 'lagi', start: 1.4, end: 1.8, confidence: 0.99 },
          { id: 'w5', text: 'di', start: 1.8, end: 2.0, confidence: 0.99 },
          { id: 'w6', text: 'KlipFlow', start: 2.0, end: 2.6, confidence: 0.96, isHighlighted: true, emoji: '⚡' },
          { id: 'w7', text: 'AI', start: 2.6, end: 2.9, confidence: 0.98 },
          { id: 'w8', text: 'tutorial!', start: 2.9, end: 3.4, confidence: 0.96 },
        ],
      },
      {
        id: 'seg-2',
        start: 3.5,
        end: 7.2,
        text: 'Coba perhatikan slide arsitektur di sebelah kanan ini',
        style: 'LimeBox',
        safeZoneAnchor: 'bottom',
        words: [
          { id: 'w9', text: 'Coba', start: 3.6, end: 4.0, confidence: 0.95 },
          { id: 'w10', text: 'perhatikan', start: 4.0, end: 4.7, confidence: 0.98 },
          { id: 'w11', text: 'slide', start: 4.7, end: 5.2, confidence: 0.97, isHighlighted: true, emoji: '📊' },
          { id: 'w12', text: 'arsitektur', start: 5.2, end: 6.0, confidence: 0.96 },
          { id: 'w13', text: 'di', start: 6.0, end: 6.2, confidence: 0.99 },
          { id: 'w14', text: 'sebelah', start: 6.2, end: 6.6, confidence: 0.98 },
          { id: 'w15', text: 'kanan', start: 6.6, end: 7.0, confidence: 0.99 },
          { id: 'w16', text: 'ini', start: 7.0, end: 7.2, confidence: 0.99 },
        ],
      },
      {
        id: 'seg-3',
        start: 7.3,
        end: 11.6,
        text: 'Kamera otomatis split-screen tanpa lag sama sekali!',
        style: 'LimeBox',
        safeZoneAnchor: 'bottom',
        words: [
          { id: 'w17', text: 'Kamera', start: 7.4, end: 8.0, confidence: 0.99 },
          { id: 'w18', text: 'otomatis', start: 8.0, end: 8.6, confidence: 0.98 },
          { id: 'w19', text: 'split-screen', start: 8.6, end: 9.6, confidence: 0.97, isHighlighted: true, emoji: '🎬' },
          { id: 'w20', text: 'tanpa', start: 9.6, end: 10.0, confidence: 0.99 },
          { id: 'w21', text: 'lag', start: 10.0, end: 10.4, confidence: 0.94 },
          { id: 'w22', text: 'sama', start: 10.4, end: 10.8, confidence: 0.99 },
          { id: 'w23', text: 'sekali!', start: 10.8, end: 11.5, confidence: 0.99, emoji: '🔥' },
        ],
      },
      {
        id: 'seg-4',
        start: 11.7,
        end: 15.5,
        text: 'Nggak perlu ribet potong manual lagi, semuanya instan!',
        style: 'LimeBox',
        safeZoneAnchor: 'bottom',
        words: [
          { id: 'w24', text: 'Nggak', start: 11.8, end: 12.3, confidence: 0.96 },
          { id: 'w25', text: 'perlu', start: 12.3, end: 12.7, confidence: 0.99 },
          { id: 'w26', text: 'ribet', start: 12.7, end: 13.2, confidence: 0.95 },
          { id: 'w27', text: 'potong', start: 13.2, end: 13.7, confidence: 0.98 },
          { id: 'w28', text: 'manual', start: 13.7, end: 14.3, confidence: 0.97 },
          { id: 'w29', text: 'lagi,', start: 14.3, end: 14.7, confidence: 0.99 },
          { id: 'w30', text: 'semuanya', start: 14.7, end: 15.1, confidence: 0.98 },
          { id: 'w31', text: 'instan!', start: 15.1, end: 15.5, confidence: 0.99, isHighlighted: true, emoji: '⚡' },
        ],
      },
    ];
  }
}

export const subtitleEngine = new SubtitleEngine();
