/**
 * Demo Scene Simulator
 * Generates an interactive multi-speaker + object explanation video scene
 * Contains:
 * - Speaker 1 (Left / Center, Active Speaker with dynamic lip motion & gestures)
 * - Speaker 2 (Listener / Occasional Commenter)
 * - Explained Object / Presentation Screen (Right side, with live diagrams & charts)
 * - Pointing Hand Gestures
 */

import { RawDetection } from './multiTargetTracker';
import { safeRoundRect } from './subtitleEngine';

export interface DemoSceneFrameData {
  timestamp: number;
  detections: RawDetection[];
  speaker1IsSpeaking: boolean;
  speaker2IsSpeaking: boolean;
  isPointingAtSlide: boolean;
  slideHighlightLevel: number;
}

export class DemoSceneSimulator {
  public readonly duration: number = 16.0; // 16 seconds loop

  /**
   * Calculate ground truth positions and states for the demo scene at timestamp t
   */
  public getFrameState(t: number): DemoSceneFrameData {
    const cycleTime = t % this.duration;

    // Timeline phases:
    // 0 - 3.5s: Speaker 1 speaking, introduces KlipFlow AI (Speaker Follow)
    // 3.5 - 7.2s: Speaker 1 points right to Slide Presentation (Explanation Pan)
    // 7.2 - 11.6s: Split-Screen demo - wide distance between Speaker 1 & Slide (Auto Split-Screen)
    // 11.6 - 16.0s: Speaker 1 concludes with quick interaction (Speaker Follow)

    const isPhase1 = cycleTime < 3.5;
    const isPhase2 = cycleTime >= 3.5 && cycleTime < 7.2;
    const isPhase3 = cycleTime >= 7.2 && cycleTime < 11.6;
    const isPhase4 = cycleTime >= 11.6;

    const speaker1IsSpeaking = isPhase1 || isPhase2 || isPhase4 || (isPhase3 && (cycleTime % 2.0 < 1.4));
    const speaker2IsSpeaking = isPhase3 && !speaker1IsSpeaking;
    const isPointingAtSlide = isPhase2 || (isPhase3 && cycleTime > 9.0);

    // Natural breathing / micro-sway motion for realistic tracking
    const swayX = Math.sin(cycleTime * 1.8) * 0.015;
    const swayY = Math.cos(cycleTime * 2.2) * 0.008;

    // Speaker 1 position (starts near center-left, steps slightly left during split-screen)
    const spk1BaseX = isPhase3 ? 0.16 : 0.28;
    const spk1X = spk1BaseX + swayX;
    const spk1Y = 0.22 + swayY;

    // Slide / Object presentation screen position (on the right)
    const slideX = 0.62;
    const slideY = 0.18;
    const slideW = 0.32;
    const slideH = 0.54;

    const detections: RawDetection[] = [
      // Speaker 1 Face
      {
        box: {
          x: spk1X,
          y: spk1Y,
          width: 0.16,
          height: 0.28,
        },
        category: 'speaker_face',
        confidence: 0.94,
        label: 'Speaker 1 (Dev Lead)',
        saliencyScore: speaker1IsSpeaking ? 0.92 : 0.55,
      },
      // Explained Object: Slide Presentation Screen
      {
        box: {
          x: slideX,
          y: slideY,
          width: slideW,
          height: slideH,
        },
        category: 'explained_object',
        confidence: 0.91,
        label: 'Presentation Slide: KlipFlow Architecture',
        saliencyScore: isPointingAtSlide ? 0.96 : (isPhase3 ? 0.88 : 0.45),
      },
    ];

    // Pointing hand gesture when explaining slide
    if (isPointingAtSlide) {
      detections.push({
        box: {
          x: spk1X + 0.12 + (Math.sin(cycleTime * 3) * 0.02),
          y: spk1Y + 0.16,
          width: 0.10,
          height: 0.14,
        },
        category: 'speaker_hand_gesture',
        confidence: 0.88,
        label: 'Pointing Hand Gesture',
        saliencyScore: 0.85,
      });
    }

    // Optional Speaker 2 (Co-host in phase 3)
    if (isPhase3) {
      detections.push({
        box: {
          x: 0.46,
          y: 0.25,
          width: 0.13,
          height: 0.24,
        },
        category: 'speaker_face',
        confidence: 0.85,
        label: 'Speaker 2 (Co-Host)',
        saliencyScore: speaker2IsSpeaking ? 0.86 : 0.32,
      });
    }

    return {
      timestamp: t,
      detections,
      speaker1IsSpeaking,
      speaker2IsSpeaking,
      isPointingAtSlide,
      slideHighlightLevel: isPointingAtSlide ? 1.0 : 0.3,
    };
  }

  /**
   * Render the simulated 16:9 source video frame directly onto a canvas
   */
  public renderSourceFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    t: number
  ): DemoSceneFrameData {
    const frameState = this.getFrameState(t);
    const cycleTime = t % this.duration;

    // Background: Modern tech studio environment with subtle lighting
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Studio ambient lighting glow
    const glowGrad = ctx.createRadialGradient(width * 0.3, height * 0.4, 50, width * 0.3, height * 0.4, width * 0.6);
    glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Studio grid lines on floor/wall
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += width / 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 1. Render Explained Object / Slide Screen (Right side)
    const slideDet = frameState.detections.find(d => d.category === 'explained_object')!;
    const sBox = slideDet.box;
    const sx = sBox.x * width;
    const sy = sBox.y * height;
    const sw = sBox.width * width;
    const sh = sBox.height * height;

    // Slide monitor frame
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = frameState.isPointingAtSlide ? '#38bdf8' : '#334155';
    ctx.lineWidth = frameState.isPointingAtSlide ? 3 : 1.5;
    ctx.beginPath();
    safeRoundRect(ctx, sx, sy, sw, sh, 12);
    ctx.fill();
    ctx.stroke();

    // Slide screen header
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(sx, sy, sw, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('KLIPFLOW AI — PIPELINE ARCHITECTURE', sx + 12, sy + 21);

    // Slide diagram content
    const box1Y = sy + 48;
    ctx.fillStyle = '#1e293b';
    safeRoundRect(ctx, sx + 16, box1Y, sw - 32, 42, 6);
    ctx.fill();
    ctx.fillStyle = '#a3e635';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('[Module A] Light-ASD + Web Audio (300Hz-3400Hz)', sx + 26, box1Y + 26);

    const box2Y = sy + 98;
    ctx.fillStyle = '#1e293b';
    safeRoundRect(ctx, sx + 16, box2Y, sw - 32, 42, 6);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('[Module B] YOLO11n + Two-Stage ByteTrack', sx + 26, box2Y + 26);

    const box3Y = sy + 148;
    ctx.fillStyle = '#1e293b';
    safeRoundRect(ctx, sx + 16, box3Y, sw - 32, 42, 6);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('[Module C] 2D Kalman Filter Auto Split-Screen', sx + 26, box3Y + 26);

    // Live animated audio-visual waveform graph on slide
    const waveY = sy + 210;
    ctx.strokeStyle = '#a3e635';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let wx = 0; wx < sw - 32; wx += 4) {
      const wy = Math.sin((wx + t * 60) * 0.08) * (frameState.speaker1IsSpeaking ? 16 : 4);
      if (wx === 0) ctx.moveTo(sx + 16 + wx, waveY + wy);
      else ctx.lineTo(sx + 16 + wx, waveY + wy);
    }
    ctx.stroke();

    // 2. Render Speaker 1 (Avatar representation with animated lips and body)
    const spkDet = frameState.detections.find(d => d.category === 'speaker_face')!;
    const pBox = spkDet.box;
    const px = pBox.x * width;
    const py = pBox.y * height;
    const pw = pBox.width * width;
    const ph = pBox.height * height;

    // Body / Shoulders
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, py + ph * 1.5, pw * 1.1, ph * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, py + ph / 2, pw * 0.42, ph * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph * 0.35, pw * 0.44, Math.PI, 0, false);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(px + pw * 0.38, py + ph * 0.45, 3.5, 0, Math.PI * 2);
    ctx.arc(px + pw * 0.62, py + ph * 0.45, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic mouth opening/closing synced to speech
    const mouthOpen = frameState.speaker1IsSpeaking
      ? 4 + Math.abs(Math.sin(cycleTime * 18)) * 12
      : 2;
    ctx.fillStyle = frameState.speaker1IsSpeaking ? '#881337' : '#991b1b';
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, py + ph * 0.72, pw * 0.16, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Render Hand Gesture (if pointing)
    if (frameState.isPointingAtSlide) {
      const gDet = frameState.detections.find(d => d.category === 'speaker_hand_gesture')!;
      const gx = gDet.box.x * width;
      const gy = gDet.box.y * height;
      const gw = gDet.box.width * width;
      const gh = gDet.box.height * height;

      // Arm connecting to hand
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px + pw * 0.8, py + ph * 1.2);
      ctx.lineTo(gx + gw / 2, gy + gh / 2);
      ctx.stroke();

      // Hand with pointing finger
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.ellipse(gx + gw / 2, gy + gh / 2, gw * 0.4, gh * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Laser focus pointer effect to slide
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx + gw / 2, gy + gh / 2);
      ctx.lineTo(sx, sy + sh * 0.4);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    return frameState;
  }
}

export const demoSceneSimulator = new DemoSceneSimulator();
