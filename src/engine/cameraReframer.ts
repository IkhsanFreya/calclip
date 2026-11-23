/**
 * Module C — Kalman-Smoothed Cinematic Auto-Reframing & Auto Split-Screen
 * References:
 * - Linear Kalman Filter for cinematic camera trajectory estimation
 * - L1-Norm Bezier Curve velocity clamping
 * - Multi-target decision engine: Speaker Follow, Explanation Pan, Auto Split-Screen
 */

import { BoundingBox, DetectedTarget, ReframingMode, ReframingState } from '../types/klipflow';

/**
 * 2D Linear Kalman Filter
 * State vector: [x, y, vx, vy]^T
 */
export class LinearKalmanFilter2D {
  // State: [x, y, vx, vy]
  private state: [number, number, number, number] = [0.5, 0.5, 0, 0];
  // Covariance matrix P (4x4 flattened)
  private P: number[] = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];

  // Process noise Q
  private readonly qPos: number = 0.00015;
  private readonly qVel: number = 0.002;
  // Measurement noise R
  private readonly rNoise: number = 0.04;

  public predict(dt: number): [number, number] {
    // F state transition:
    // x = x + vx * dt
    // y = y + vy * dt
    this.state[0] += this.state[2] * dt;
    this.state[1] += this.state[3] * dt;

    // Add process noise to diagonal
    this.P[0] += this.qPos;
    this.P[5] += this.qPos;
    this.P[10] += this.qVel;
    this.P[15] += this.qVel;

    return [this.state[0], this.state[1]];
  }

  public update(measuredX: number, measuredY: number, confidence: number = 1.0): [number, number] {
    // Measurement residual
    const y0 = measuredX - this.state[0];
    const y1 = measuredY - this.state[1];

    // Adaptive measurement noise: higher confidence -> lower measurement noise R
    const conf = Math.max(0.1, Math.min(1.0, confidence));
    const rAdapt = this.rNoise / conf;

    // Kalman gain K = P * H^T * (H * P * H^T + R)^-1
    const s0 = this.P[0] + rAdapt;
    const s1 = this.P[5] + rAdapt;

    const k0 = this.P[0] / s0;
    const k1 = this.P[5] / s1;
    const k2 = this.P[8] / s0;
    const k3 = this.P[13] / s1;

    // State update
    this.state[0] += k0 * y0;
    this.state[1] += k1 * y1;
    this.state[2] += k2 * y0;
    this.state[3] += k3 * y1;

    // Covariance update: P = (I - K*H) * P
    this.P[0] *= (1 - k0);
    this.P[5] *= (1 - k1);
    this.P[10] *= (1 - k2 * 0.1);
    this.P[15] *= (1 - k3 * 0.1);

    return [this.state[0], this.state[1]];
  }

  public getState(): [number, number, number, number] {
    return [...this.state];
  }

  public setState(x: number, y: number): void {
    this.state = [x, y, 0, 0];
  }
}

export class CameraReframer {
  private kalman = new LinearKalmanFilter2D();
  private lastUpdateTime: number = 0;
  private currentMode: ReframingMode = 'SPEAKER_FOLLOW';
  private targetMode: ReframingMode = 'SPEAKER_FOLLOW';

  // Hysteresis & Dead-zone
  private readonly deadZoneRadius: number = 0.025; // 2.5% of screen dead-zone
  private readonly maxVelocity: number = 0.85; // normalized units per second (L1-norm clamp)

  // Jitter tracking for thesis ablation
  private rawPosHistory: [number, number][] = [];
  private kalmanPosHistory: [number, number][] = [];
  private panTimer: number = 0;
  private explanationHoldDuration: number = 2.4; // seconds to hold on explained object

  // 9:16 target dimensions inside standard 16:9 source (1.0 height, width = (9/16) / (16/9) = 0.5625 / 1.7778 = 0.3164)
  private readonly targetCropWidth: number = 0.3164;
  private readonly targetCropHeight: number = 1.0;

  /**
   * Reframes the camera based on active targets, mode, and smoothing options
   */
  public computeReframing(
    targets: DetectedTarget[],
    timestampSeconds: number,
    forceMode?: ReframingMode,
    isKalmanEnabled: boolean = true
  ): ReframingState {
    const dt = this.lastUpdateTime > 0 ? Math.min(0.1, timestampSeconds - this.lastUpdateTime) : 0.033;
    this.lastUpdateTime = timestampSeconds;

    // 1. Identify primary speaker and explained object candidates
    const speakers = targets.filter(t => t.category === 'speaker_face');
    const objects = targets.filter(t => t.category === 'explained_object');
    const gestures = targets.filter(t => t.category === 'speaker_hand_gesture');

    // Active speaker: highest ASD score or confidence
    let activeSpeaker = speakers.find(s => s.isSpeaking);
    if (!activeSpeaker && speakers.length > 0) {
      activeSpeaker = speakers.reduce((prev, curr) => (curr.asdScore > prev.asdScore ? curr : prev), speakers[0]);
    }

    // Active object: highest saliency score
    let activeObject: DetectedTarget | null = null;
    if (objects.length > 0) {
      activeObject = objects.reduce((prev, curr) => (curr.saliencyScore > prev.saliencyScore ? curr : prev), objects[0]);
    }

    // Pointing gesture detection
    const isPointingAtObject = gestures.some(g => g.confidence > 0.6 && activeObject && Math.abs((g.box.x + g.box.width / 2) - (activeObject.box.x + activeObject.box.width / 2)) < 0.35);

    // 2. Automatic Mode Resolution
    let computedMode: ReframingMode = forceMode || this.currentMode;

    if (!forceMode) {
      if (activeSpeaker && activeObject) {
        const speakerCenterX = activeSpeaker.box.x + activeSpeaker.box.width / 2;
        const objectCenterX = activeObject.box.x + activeObject.box.width / 2;
        const horizontalDistance = Math.abs(speakerCenterX - objectCenterX);

        // Distance > 45% (0.45) of frame -> Trigger AUTO_SPLIT_SCREEN
        if (horizontalDistance > 0.42) {
          computedMode = 'AUTO_SPLIT_SCREEN';
        } else if (isPointingAtObject || activeObject.saliencyScore > 0.72) {
          computedMode = 'EXPLANATION_PAN';
        } else {
          computedMode = 'SPEAKER_FOLLOW';
        }
      } else if (activeObject && activeObject.saliencyScore > 0.8) {
        computedMode = 'EXPLANATION_PAN';
      } else {
        computedMode = 'SPEAKER_FOLLOW';
      }
    }

    this.currentMode = computedMode;

    // 3. Target Center Coordinate Computation
    let rawTargetX = 0.5;
    let rawTargetY = 0.5;
    let panProgress = 0;

    if (activeSpeaker) {
      const spkX = activeSpeaker.box.x + activeSpeaker.box.width / 2;
      const spkY = activeSpeaker.box.y + activeSpeaker.box.height * 0.45; // upper chest/head center

      if (computedMode === 'SPEAKER_FOLLOW') {
        rawTargetX = spkX;
        rawTargetY = spkY;
        this.panTimer = 0;
      } else if (computedMode === 'EXPLANATION_PAN' && activeObject) {
        const objX = activeObject.box.x + activeObject.box.width / 2;
        const objY = activeObject.box.y + activeObject.box.height / 2;

        this.panTimer += dt;
        // Smooth cinematic pan transition using cosine easing
        const t = Math.min(1.0, this.panTimer / 1.2);
        panProgress = 0.5 * (1 - Math.cos(Math.PI * t)); // Ease-in-out [0, 1]

        if (this.panTimer > this.explanationHoldDuration) {
          // Pan back toward speaker
          const returnT = Math.min(1.0, (this.panTimer - this.explanationHoldDuration) / 1.0);
          panProgress = 1.0 - (0.5 * (1 - Math.cos(Math.PI * returnT)));
        }

        rawTargetX = spkX * (1 - panProgress) + objX * panProgress;
        rawTargetY = spkY * (1 - panProgress) + objY * panProgress;
      } else if (computedMode === 'AUTO_SPLIT_SCREEN' && activeObject) {
        // Focus on midpoint for wide preview
        const objX = activeObject.box.x + activeObject.box.width / 2;
        rawTargetX = (spkX + objX) / 2;
        rawTargetY = 0.5;
      }
    } else if (activeObject) {
      rawTargetX = activeObject.box.x + activeObject.box.width / 2;
      rawTargetY = activeObject.box.y + activeObject.box.height / 2;
    }

    // 4. Dead-Zone Hysteresis & Velocity Clamping
    const [currX, currY, currVx, currVy] = this.kalman.getState();
    const speed = Math.sqrt(currVx * currVx + currVy * currVy);
    const dynamicDeadZone = speed < 0.05 ? this.deadZoneRadius * 1.4 : this.deadZoneRadius * 0.48; // Rigid anti-jitter when still, responsive when moving

    const distFromCenter = Math.sqrt(Math.pow(rawTargetX - currX, 2) + Math.pow(rawTargetY - currY, 2));

    // Jump-cut or speaker change snap threshold (avoids slow rubber-banding across scene shifts)
    if (distFromCenter >= 0.16) {
      this.kalman.setState(rawTargetX, rawTargetY);
    }

    // If within dynamic dead-zone, soften target pull
    let targetX = rawTargetX;
    let targetY = rawTargetY;
    if (distFromCenter < dynamicDeadZone) {
      targetX = currX + (rawTargetX - currX) * 0.15;
      targetY = currY + (rawTargetY - currY) * 0.15;
    }

    // 5. Kalman Filtering or Raw Unsmoothed
    let smoothedX = targetX;
    let smoothedY = targetY;

    if (isKalmanEnabled) {
      this.kalman.predict(dt);
      const targetConfidence = activeSpeaker ? activeSpeaker.confidence : (activeObject ? activeObject.confidence : 0.8);
      const [kx, ky] = this.kalman.update(targetX, targetY, targetConfidence);

      // Cubic-bezier L1-norm velocity clamping
      const maxDelta = this.maxVelocity * dt;
      const dx = Math.max(-maxDelta, Math.min(maxDelta, kx - currX));
      const dy = Math.max(-maxDelta, Math.min(maxDelta, ky - currY));

      smoothedX = currX + dx;
      smoothedY = currY + dy;
    } else {
      // Raw unsmoothed with simulated tracking noise for ablation comparison
      smoothedX = rawTargetX;
      smoothedY = rawTargetY;
      this.kalman.setState(smoothedX, smoothedY);
    }

    // Keep crop box strictly within bounds [0, 1]
    const halfW = this.targetCropWidth / 2;
    const clampedCropX = Math.max(0, Math.min(1.0 - this.targetCropWidth, smoothedX - halfW));
    const clampedCropY = 0; // vertical height is full in 16:9 to 9:16 reframe

    // 6. Record Jitter history for thesis metrics
    this.rawPosHistory.push([rawTargetX, rawTargetY]);
    this.kalmanPosHistory.push([smoothedX, smoothedY]);
    if (this.rawPosHistory.length > 50) this.rawPosHistory.shift();
    if (this.kalmanPosHistory.length > 50) this.kalmanPosHistory.shift();

    const cjiRaw = this.computeCameraJitter(this.rawPosHistory);
    const cjiKalman = this.computeCameraJitter(this.kalmanPosHistory);

    // 7. Collision Detection for Safe-Zone Subtitle Placement
    // Check if bottom 30% of crop box is occupied by active speaker or object
    let safeZoneOffset = 1; // 1 = bottom (default)
    const isLowerThirdOccupied = targets.some(t => {
      const b = t.box;
      const overlapsHorizontally = (b.x + b.width) >= clampedCropX && b.x <= (clampedCropX + this.targetCropWidth);
      const inLowerThird = (b.y + b.height) > 0.68;
      return overlapsHorizontally && inLowerThird;
    });

    if (isLowerThirdOccupied) {
      // Shift subtitle to middle safe-zone or top
      const isMiddleThirdOccupied = targets.some(t => {
        const b = t.box;
        return (b.y + b.height) > 0.38 && b.y < 0.68;
      });
      safeZoneOffset = isMiddleThirdOccupied ? -1 : 0; // -1 = top, 0 = middle
    }

    // Split-screen crops
    const isSplitScreenActive = computedMode === 'AUTO_SPLIT_SCREEN' && Boolean(activeSpeaker && activeObject);
    let splitTopCrop: BoundingBox | undefined;
    let splitBottomCrop: BoundingBox | undefined;

    if (isSplitScreenActive && activeObject && activeSpeaker) {
      // Top crop: Explained Object Context
      const objCenterX = activeObject.box.x + activeObject.box.width / 2;
      const topHalfW = this.targetCropWidth / 2;
      splitTopCrop = {
        x: Math.max(0, Math.min(1.0 - this.targetCropWidth, objCenterX - topHalfW)),
        y: Math.max(0, activeObject.box.y - 0.05),
        width: this.targetCropWidth,
        height: 0.58,
      };

      // Bottom crop: Active Speaker Close-up
      const spkCenterX = activeSpeaker.box.x + activeSpeaker.box.width / 2;
      splitBottomCrop = {
        x: Math.max(0, Math.min(1.0 - this.targetCropWidth, spkCenterX - topHalfW)),
        y: Math.max(0, activeSpeaker.box.y - 0.08),
        width: this.targetCropWidth,
        height: 0.42,
      };
    }

    return {
      mode: computedMode,
      targetMode: this.targetMode,
      cropBox: {
        x: clampedCropX,
        y: clampedCropY,
        width: this.targetCropWidth,
        height: this.targetCropHeight,
      },
      rawTargetCenter: [rawTargetX, rawTargetY],
      smoothedCenter: [smoothedX, smoothedY],
      velocity: [(smoothedX - currX) / dt, (smoothedY - currY) / dt],
      isSplitScreenActive,
      splitTopCrop,
      splitBottomCrop,
      splitRatio: 0.58,
      activeSpeakerId: activeSpeaker ? activeSpeaker.id : null,
      activeObjectId: activeObject ? activeObject.id : null,
      cameraJitterRaw: cjiRaw,
      cameraJitterKalman: cjiKalman,
      panProgress,
      safeZoneOffset,
    };
  }

  /**
   * Compute Camera Jitter Index (CJI) as mean acceleration deviation
   * CJI = (1 / T) * sum || a_t ||
   */
  private computeCameraJitter(history: [number, number][]): number {
    if (history.length < 3) return 0.005;
    let totalAcc = 0;
    for (let i = 2; i < history.length; i++) {
      const [x0, y0] = history[i - 2];
      const [x1, y1] = history[i - 1];
      const [x2, y2] = history[i];

      // Second derivative: (p[i] - 2*p[i-1] + p[i-2])
      const ax = x2 - 2 * x1 + x0;
      const ay = y2 - 2 * y1 + y0;
      totalAcc += Math.sqrt(ax * ax + ay * ay);
    }
    return (totalAcc / (history.length - 2)) * 100; // multiplied by 100 for readable percentage index
  }

  public reset(): void {
    this.kalman = new LinearKalmanFilter2D();
    this.lastUpdateTime = 0;
    this.rawPosHistory = [];
    this.kalmanPosHistory = [];
    this.panTimer = 0;
  }
}

export const cameraReframer = new CameraReframer();
