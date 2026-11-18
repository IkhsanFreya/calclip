/**
 * Module A — Audio-Visual Active Speaker Detection (Light-ASD / TalkNet Inspired)
 * References:
 * - Liao et al. (CVPR 2023) "A Light Weight Model for Active Speaker Detection"
 * - Duan et al. (IJCV 2025) "LR-ASD: Lightweight and Robust Network for Active Speaker Detection"
 * - Carneiro et al. (2024) "FabuLight-ASD: Unveiling Speech Activity via Body Language"
 */

import { BoundingBox, DetectedTarget } from '../types/klipflow';

export interface AudioBandFeatures {
  voiceBandEnergy: number; // 300Hz - 3400Hz energy
  subBassEnergy: number; // < 150Hz (rumble/noise)
  highFreqEnergy: number; // > 4000Hz (sibilance/percussion)
  spectralCentroid: number;
  snrEstimate: number; // Voice SNR
  isVoiceActive: boolean;
}

export interface SpeakerMotionHistory {
  personId: number;
  mouthIntensityHistory: number[]; // sliding window of 15 frames
  shoulderMotionHistory: number[]; // sliding window of 15 frames
  lastSpeakingTimestamp: number;
  smoothedAsdScore: number;
}

export class ActiveSpeakerDetector {
  private historyMap: Map<number, SpeakerMotionHistory> = new Map();
  private readonly windowSize: number = 15;
  private readonly hangoverThresholdMs: number = 320; // prevent flickering during syllable pauses

  /**
   * Extract audio features from an AnalyserNode frequency byte array
   * Standard telephony voice band: 300 Hz - 3400 Hz
   */
  public extractAudioFeatures(frequencyData: ArrayLike<number>, sampleRate = 44100): AudioBandFeatures {
    const binCount = frequencyData.length;
    const binWidth = sampleRate / (2 * binCount);

    const voiceStartBin = Math.max(0, Math.floor(300 / binWidth));
    const voiceEndBin = Math.min(binCount - 1, Math.floor(3400 / binWidth));
    const bassEndBin = Math.min(binCount - 1, Math.floor(150 / binWidth));
    const highStartBin = Math.min(binCount - 1, Math.floor(4000 / binWidth));

    let voiceSum = 0;
    let voiceCount = 0;
    let bassSum = 0;
    let highSum = 0;
    let weightedFreqSum = 0;
    let totalMagnitude = 0;

    for (let i = 0; i < binCount; i++) {
      const mag = frequencyData[i] / 255;
      totalMagnitude += mag;
      weightedFreqSum += mag * (i * binWidth);

      if (i <= bassEndBin) {
        bassSum += mag;
      }
      if (i >= voiceStartBin && i <= voiceEndBin) {
        voiceSum += mag;
        voiceCount++;
      }
      if (i >= highStartBin) {
        highSum += mag;
      }
    }

    const voiceBandEnergy = voiceCount > 0 ? voiceSum / voiceCount : 0;
    const subBassEnergy = bassEndBin > 0 ? bassSum / (bassEndBin + 1) : 0;
    const highFreqEnergy = binCount > highStartBin ? highSum / (binCount - highStartBin) : 0;
    const spectralCentroid = totalMagnitude > 0.001 ? weightedFreqSum / totalMagnitude : 0;

    // Estimate SNR by voice band vs background ambient floor
    const noiseFloor = (subBassEnergy * 0.6) + (highFreqEnergy * 0.4);
    const snrEstimate = Math.max(0, voiceBandEnergy - noiseFloor * 0.75);

    const isVoiceActive = voiceBandEnergy > 0.16 && snrEstimate > 0.05 && spectralCentroid > 250 && spectralCentroid < 4200;

    return {
      voiceBandEnergy,
      subBassEnergy,
      highFreqEnergy,
      spectralCentroid,
      snrEstimate,
      isVoiceActive,
    };
  }

  /**
   * Evaluate Active Speaker Score S_ASD(i, t) for a target person
   */
  public evaluateSpeaker(
    target: DetectedTarget,
    audioFeatures: AudioBandFeatures,
    timestampSeconds: number,
    framePixels?: ImageData
  ): { asdScore: number; isSpeaking: boolean; lipVariance: number } {
    let history = this.historyMap.get(target.id);
    if (!history) {
      history = {
        personId: target.id,
        mouthIntensityHistory: [],
        shoulderMotionHistory: [],
        lastSpeakingTimestamp: 0,
        smoothedAsdScore: 0,
      };
      this.historyMap.set(target.id, history);
    }

    // 1. Compute Lip/Mouth region motion variance
    const lipVariance = framePixels
      ? this.computeMouthRoiVariance(target.box, framePixels)
      : target.lipMotionVariance;

    history.mouthIntensityHistory.push(lipVariance);
    if (history.mouthIntensityHistory.length > this.windowSize) {
      history.mouthIntensityHistory.shift();
    }

    // Compute temporal variance of mouth opening/closing
    const avgLip = history.mouthIntensityHistory.reduce((a, b) => a + b, 0) / history.mouthIntensityHistory.length;
    const temporalLipVariance = history.mouthIntensityHistory.reduce(
      (sum, val) => sum + Math.pow(val - avgLip, 2),
      0
    ) / history.mouthIntensityHistory.length;

    // 2. Compute Body/Shoulder motion cue (FabuLight-ASD)
    const [vx, vy] = target.velocity;
    const bodyMovementMagnitude = Math.sqrt(vx * vx + vy * vy);
    history.shoulderMotionHistory.push(bodyMovementMagnitude);
    if (history.shoulderMotionHistory.length > this.windowSize) {
      history.shoulderMotionHistory.shift();
    }
    const avgBodyMotion = history.shoulderMotionHistory.reduce((a, b) => a + b, 0) / history.shoulderMotionHistory.length;

    // 3. Multimodal correlation: Voice Activity + Lip Cadence + Upper Body Micromovement
    const voiceWeight = 0.52;
    const lipWeight = 0.38;
    const bodyWeight = 0.10;

    // Normalization factors
    const normAudio = Math.min(1.0, audioFeatures.voiceBandEnergy * 2.2);
    const normLip = Math.min(1.0, (temporalLipVariance * 40.0) + (avgLip * 0.7));
    const normBody = Math.min(1.0, avgBodyMotion * 5.0);

    // Raw cross-modal score
    let rawScore = (voiceWeight * normAudio) + (lipWeight * normLip) + (bodyWeight * normBody);

    // Laughter / Coughing / Background chatter suppression:
    // If audio is loud but lips are stationary (<0.02), suppress score
    if (normAudio > 0.4 && normLip < 0.06) {
      rawScore *= 0.25;
    }

    // If mouth is wide open continuously without dynamic variance (e.g. yawn, static smile), suppress
    if (temporalLipVariance < 0.005 && normLip > 0.4) {
      rawScore *= 0.4;
    }

    // Temporal hangover hysteresis
    const nowMs = timestampSeconds * 1000;
    const meetsInstantThreshold = rawScore >= 0.42 && audioFeatures.isVoiceActive;

    if (meetsInstantThreshold) {
      history.lastSpeakingTimestamp = nowMs;
    }

    const isInHangover = (nowMs - history.lastSpeakingTimestamp) < this.hangoverThresholdMs;
    const isSpeaking = meetsInstantThreshold || (isInHangover && rawScore > 0.25);

    // Exponential smoothing for steady metric display
    const alpha = isSpeaking ? 0.35 : 0.18;
    history.smoothedAsdScore = (alpha * rawScore) + ((1 - alpha) * history.smoothedAsdScore);

    return {
      asdScore: Math.min(1.0, Math.max(0.0, history.smoothedAsdScore)),
      isSpeaking,
      lipVariance: temporalLipVariance,
    };
  }

  /**
   * Fast pixel-based mouth ROI luminance variance
   */
  private computeMouthRoiVariance(box: BoundingBox, imageData: ImageData): number {
    const { width: imgW, height: imgH, data } = imageData;
    // Lower 35% of detected face box is the mouth region
    const startX = Math.floor(Math.max(0, (box.x + box.width * 0.25) * imgW));
    const endX = Math.floor(Math.min(imgW - 1, (box.x + box.width * 0.75) * imgW));
    const startY = Math.floor(Math.max(0, (box.y + box.height * 0.65) * imgH));
    const endY = Math.floor(Math.min(imgH - 1, (box.y + box.height * 0.95) * imgH));

    if (endX <= startX || endY <= startY) return 0.05;

    let sum = 0;
    let count = 0;
    // Sample every 2nd pixel for zero CPU overhead
    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const idx = (y * imgW + x) * 4;
        const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        sum += luma;
        count++;
      }
    }
    if (count === 0) return 0.05;
    const mean = sum / count;

    let varSum = 0;
    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const idx = (y * imgW + x) * 4;
        const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        varSum += (luma - mean) * (luma - mean);
      }
    }
    // Normalized variance metric [0, 1]
    return Math.min(1.0, (varSum / count) / 1800);
  }

  public reset(): void {
    this.historyMap.clear();
  }
}

export const activeSpeakerDetector = new ActiveSpeakerDetector();
