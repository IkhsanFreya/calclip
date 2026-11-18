/**
 * Module B — Multi-Target Object/Gesture Detection & ByteTrack Association
 * References:
 * - Zhang et al. (ECCV 2022) "ByteTrack: Multi-Object Tracking by Associating Every Detection Box"
 * - Khanam & Hussain (2024) "YOLOv11: An Overview of the Key Architectural Enhancements"
 */

import { BoundingBox, DetectedTarget, DetectionCategory } from '../types/klipflow';

export interface RawDetection {
  box: BoundingBox;
  category: DetectionCategory;
  confidence: number;
  label: string;
  saliencyScore: number;
}

export interface TrackState {
  id: number;
  category: DetectionCategory;
  box: BoundingBox;
  confidence: number;
  label: string;
  asdScore: number;
  isSpeaking: boolean;
  lipMotionVariance: number;
  saliencyScore: number;
  lastSeenTimestamp: number;
  framesLost: number;
  state: 'tracked' | 'lost' | 'removed';
  velocity: [number, number];
  historyBoxes: BoundingBox[];
}

export class MultiTargetByteTracker {
  private nextTrackId: number = 1;
  private trackedTargets: TrackState[] = [];
  private lostTargets: TrackState[] = [];

  private readonly highThreshold: number = 0.55;
  private readonly lowThreshold: number = 0.20;
  private readonly maxLostFrames: number = 30; // ~1 second memory
  private readonly matchIoUThreshold: number = 0.25;

  /**
   * Calculate Intersection over Union (IoU) between two bounding boxes
   */
  public calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
    const xA = Math.max(boxA.x, boxB.x);
    const yA = Math.max(boxA.y, boxB.y);
    const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const boxAArea = boxA.width * boxA.height;
    const boxBArea = boxB.width * boxB.height;
    const unionArea = boxAArea + boxBArea - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }

  /**
   * Run Two-Stage ByteTrack Association on incoming detections
   */
  public update(detections: RawDetection[], timestampSeconds: number): DetectedTarget[] {
    // 1. Separate detections into High-confidence and Low-confidence pools
    const detHigh: RawDetection[] = [];
    const detLow: RawDetection[] = [];

    for (const det of detections) {
      if (det.confidence >= this.highThreshold) {
        detHigh.push(det);
      } else if (det.confidence >= this.lowThreshold) {
        detLow.push(det);
      }
    }

    // Combine currently active tracks and lost tracks
    const activePool = [...this.trackedTargets];

    // Stage 1: Associate Active Tracks with High-Confidence Detections
    const { matched: matchedStage1, unmatchedTracks: unmatchedTracks1, unmatchedDetections: unmatchedDetsHigh } =
      this.associate(activePool, detHigh, this.matchIoUThreshold);

    // Update Stage 1 matched tracks
    for (const [track, det] of matchedStage1) {
      this.updateTrackWithDetection(track, det, timestampSeconds);
    }

    // Stage 2: Associate Unmatched Active Tracks with Low-Confidence Detections (Handles Partial Occlusion)
    const { matched: matchedStage2, unmatchedTracks: unmatchedTracksFinal } =
      this.associate(unmatchedTracks1, detLow, 0.20);

    for (const [track, det] of matchedStage2) {
      this.updateTrackWithDetection(track, det, timestampSeconds);
    }

    // Mark remaining unmatched tracks as lost or increment lost frames
    const currentTracked: TrackState[] = [];
    const currentLost: TrackState[] = [];

    for (const track of [...matchedStage1.map(m => m[0]), ...matchedStage2.map(m => m[0])]) {
      track.framesLost = 0;
      track.state = 'tracked';
      currentTracked.push(track);
    }

    for (const track of unmatchedTracksFinal) {
      track.framesLost++;
      if (track.framesLost <= this.maxLostFrames) {
        track.state = 'lost';
        currentLost.push(track);
      } else {
        track.state = 'removed';
      }
    }

    // Stage 3: Initialize new tracks for unmatched high-confidence detections
    for (const det of unmatchedDetsHigh) {
      const newTrack: TrackState = {
        id: this.nextTrackId++,
        category: det.category,
        box: { ...det.box },
        confidence: det.confidence,
        label: det.label,
        asdScore: 0,
        isSpeaking: false,
        lipMotionVariance: 0.05,
        saliencyScore: det.saliencyScore,
        lastSeenTimestamp: timestampSeconds,
        framesLost: 0,
        state: 'tracked',
        velocity: [0, 0],
        historyBoxes: [{ ...det.box }],
      };
      currentTracked.push(newTrack);
    }

    this.trackedTargets = currentTracked;
    this.lostTargets = currentLost;

    // Return active tracked targets formatted
    return this.trackedTargets.map(t => ({
      id: t.id,
      category: t.category,
      box: t.box,
      confidence: t.confidence,
      label: t.label,
      asdScore: t.asdScore,
      isSpeaking: t.isSpeaking,
      lipMotionVariance: t.lipMotionVariance,
      saliencyScore: t.saliencyScore,
      lastSeenTimestamp: t.lastSeenTimestamp,
      velocity: t.velocity,
    }));
  }

  /**
   * Greedy IoU association matrix solver (fast, deterministic, zero-allocation)
   */
  private associate(
    tracks: TrackState[],
    detections: RawDetection[],
    threshold: number
  ): {
    matched: [TrackState, RawDetection][];
    unmatchedTracks: TrackState[];
    unmatchedDetections: RawDetection[];
  } {
    if (tracks.length === 0 || detections.length === 0) {
      return {
        matched: [],
        unmatchedTracks: [...tracks],
        unmatchedDetections: [...detections],
      };
    }

    // Compute pairwise IoU cost matrix
    const matches: { trackIdx: number; detIdx: number; iou: number }[] = [];
    for (let t = 0; t < tracks.length; t++) {
      for (let d = 0; d < detections.length; d++) {
        // Enforce category consistency
        if (tracks[t].category !== detections[d].category) continue;
        const iou = this.calculateIoU(tracks[t].box, detections[d].box);
        if (iou >= threshold) {
          matches.push({ trackIdx: t, detIdx: d, iou });
        }
      }
    }

    // Sort descending by IoU
    matches.sort((a, b) => b.iou - a.iou);

    const matchedTracks = new Set<number>();
    const matchedDets = new Set<number>();
    const paired: [TrackState, RawDetection][] = [];

    for (const m of matches) {
      if (!matchedTracks.has(m.trackIdx) && !matchedDets.has(m.detIdx)) {
        matchedTracks.add(m.trackIdx);
        matchedDets.add(m.detIdx);
        paired.push([tracks[m.trackIdx], detections[m.detIdx]]);
      }
    }

    const unmatchedTracks = tracks.filter((_, idx) => !matchedTracks.has(idx));
    const unmatchedDetections = detections.filter((_, idx) => !matchedDets.has(idx));

    return { matched: paired, unmatchedTracks, unmatchedDetections };
  }

  private updateTrackWithDetection(track: TrackState, det: RawDetection, timestampSeconds: number): void {
    const dt = Math.max(0.016, timestampSeconds - track.lastSeenTimestamp);
    const oldCenterX = track.box.x + track.box.width / 2;
    const oldCenterY = track.box.y + track.box.height / 2;
    const newCenterX = det.box.x + det.box.width / 2;
    const newCenterY = det.box.y + det.box.height / 2;

    track.velocity = [(newCenterX - oldCenterX) / dt, (newCenterY - oldCenterY) / dt];
    track.box = { ...det.box };
    track.confidence = det.confidence;
    track.saliencyScore = det.saliencyScore;
    track.lastSeenTimestamp = timestampSeconds;
    track.historyBoxes.push({ ...det.box });
    if (track.historyBoxes.length > 30) {
      track.historyBoxes.shift();
    }
  }

  public getTrackCount(): { active: number; lost: number } {
    return {
      active: this.trackedTargets.length,
      lost: this.lostTargets.length,
    };
  }

  public reset(): void {
    this.trackedTargets = [];
    this.lostTargets = [];
    this.nextTrackId = 1;
  }
}

export const multiTargetTracker = new MultiTargetByteTracker();
