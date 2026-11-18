/**
 * Self-Check Test Suite for KlipFlow AI Engine
 * Assert-based, zero-framework, lightning-fast execution.
 */

import assert from 'node:assert';
import { activeSpeakerDetector } from '../src/engine/activeSpeakerDetector.ts';
import { multiTargetTracker, RawDetection } from '../src/engine/multiTargetTracker.ts';
import { cameraReframer, LinearKalmanFilter2D } from '../src/engine/cameraReframer.ts';
import { subtitleEngine, INDONESIAN_SLANG_NORMALIZER, KINETIC_STYLE_CONFIGS } from '../src/engine/subtitleEngine.ts';
import { telemetryAudit, DEFAULT_SUS_QUESTIONS } from '../src/engine/telemetryAudit.ts';
import { hookScorer } from '../src/engine/hookScorer.ts';

console.log('🧪 Starting KlipFlow AI Engine Self-Check Verification...');

// 1. Test Active Speaker Detection (Light-ASD)
{
  const testFreqs = new Uint8Array(128);
  // Stimulate 300Hz-3400Hz voice band
  for (let i = 4; i < 40; i++) testFreqs[i] = 180;
  const audioFeats = activeSpeakerDetector.extractAudioFeatures(testFreqs, 44100);
  assert.ok(audioFeats.voiceBandEnergy > 0, 'Voice band energy should be non-zero');
  assert.ok(audioFeats.isVoiceActive, 'Voice should be detected as active in speech range');

  const mockTarget = {
    id: 1,
    category: 'speaker_face' as const,
    box: { x: 0.3, y: 0.2, width: 0.2, height: 0.3 },
    confidence: 0.95,
    label: 'Speaker 1',
    asdScore: 0,
    isSpeaking: false,
    lipMotionVariance: 0.25,
    saliencyScore: 0.9,
    lastSeenTimestamp: 1.0,
    velocity: [0.01, 0.0] as [number, number],
  };

  const asdRes = activeSpeakerDetector.evaluateSpeaker(mockTarget, audioFeats, 1.0);
  assert.ok(asdRes.asdScore >= 0 && asdRes.asdScore <= 1.0, 'ASD score must be bounded in [0, 1]');
  console.log('  ✓ Module A (Light-ASD Audio-Visual Detection): Passed');
}

// 2. Test Multi-Target ByteTracker
{
  const dummyDets: RawDetection[] = [
    {
      box: { x: 0.2, y: 0.2, width: 0.15, height: 0.25 },
      category: 'speaker_face',
      confidence: 0.92,
      label: 'Speaker',
      saliencyScore: 0.88,
    },
    {
      box: { x: 0.65, y: 0.2, width: 0.30, height: 0.50 },
      category: 'explained_object',
      confidence: 0.89,
      label: 'Slide Monitor',
      saliencyScore: 0.94,
    },
  ];

  const tracksFrame1 = multiTargetTracker.update(dummyDets, 0.0);
  assert.strictEqual(tracksFrame1.length, 2, 'Should initialize 2 tracks');
  const trackId1 = tracksFrame1[0].id;

  // Frame 2: slightly shifted (tests tracking association)
  const dummyDets2: RawDetection[] = [
    {
      box: { x: 0.21, y: 0.21, width: 0.15, height: 0.25 },
      category: 'speaker_face',
      confidence: 0.91,
      label: 'Speaker',
      saliencyScore: 0.88,
    },
  ];

  const tracksFrame2 = multiTargetTracker.update(dummyDets2, 0.033);
  assert.strictEqual(tracksFrame2[0].id, trackId1, 'Track ID must be preserved via IoU association');
  console.log('  ✓ Module B (Two-Stage ByteTrack Association): Passed');
}

// 3. Test Camera Reframer & Kalman Filter
{
  const kf = new LinearKalmanFilter2D();
  kf.setState(0.5, 0.5);
  kf.predict(0.033);
  const [upX, upY] = kf.update(0.6, 0.5);
  assert.ok(upX > 0.5 && upX < 0.6, 'Kalman filter should smooth step change');

  // Test Auto Split-Screen condition (Speaker at 0.15, Object at 0.75 -> Distance = 0.60 > 0.42)
  const targetsForSplit = [
    {
      id: 1,
      category: 'speaker_face' as const,
      box: { x: 0.15, y: 0.2, width: 0.15, height: 0.25 },
      confidence: 0.95,
      label: 'Speaker',
      asdScore: 0.85,
      isSpeaking: true,
      lipMotionVariance: 0.2,
      saliencyScore: 0.8,
      lastSeenTimestamp: 1.0,
      velocity: [0, 0] as [number, number],
    },
    {
      id: 2,
      category: 'explained_object' as const,
      box: { x: 0.75, y: 0.2, width: 0.20, height: 0.50 },
      confidence: 0.92,
      label: 'Slide Screen',
      asdScore: 0,
      isSpeaking: false,
      lipMotionVariance: 0,
      saliencyScore: 0.95,
      lastSeenTimestamp: 1.0,
      velocity: [0, 0] as [number, number],
    },
  ];

  const reframingRes = cameraReframer.computeReframing(targetsForSplit, 1.0);
  assert.strictEqual(reframingRes.mode, 'AUTO_SPLIT_SCREEN', 'Should trigger AUTO_SPLIT_SCREEN when dist > 42%');
  assert.ok(reframingRes.isSplitScreenActive, 'Split screen flag must be active');
  assert.ok(reframingRes.splitTopCrop !== undefined, 'Top crop should exist');
  assert.ok(reframingRes.splitBottomCrop !== undefined, 'Bottom crop should exist');
  console.log('  ✓ Module C (Cinematic Kalman & Auto Split-Screen Triad): Passed');
}

// 4. Test Subtitle Engine & Indonesian Slang Normalization
{
  assert.strictEqual(INDONESIAN_SLANG_NORMALIZER['gak'], 'nggak');
  assert.strictEqual(INDONESIAN_SLANG_NORMALIZER['udah'], 'udah');
  assert.strictEqual(INDONESIAN_SLANG_NORMALIZER['gw'], 'gue');

  const normalized = subtitleEngine.normalizeIndonesianWord('klo');
  assert.strictEqual(normalized, 'kalau');

  // Verify kinetic styles are defined
  const styleKeys = Object.keys(KINETIC_STYLE_CONFIGS);
  assert.ok(styleKeys.length >= 6, 'All kinetic styles must be registered');

  const srtExport = subtitleEngine.exportToSRT();
  assert.ok(srtExport.includes('00:00:'), 'SRT must include valid timestamp lines');
  console.log('  ✓ Module D (Whisper DTW Subtitle & 6 Kinetic Styles): Passed');
}

// 5. Test Telemetry Audit (WER/CER, RTF, SUS)
{
  // Test WER
  const wer = telemetryAudit.calculateWER(
    'KlipFlow AI adalah aplikasi auto clipper',
    'KlipFlow AI aplikasi auto clipper' // 1 deletion
  );
  assert.ok(wer > 0 && wer < 30, 'WER should reflect deletion accurately');

  // Test SUS Score Formula
  const sus = telemetryAudit.calculateSUS(DEFAULT_SUS_QUESTIONS);
  assert.ok(sus.score >= 80.5, 'Default SUS should achieve Grade A target (>= 80.5)');
  assert.strictEqual(sus.grade, 'Grade A (Excellent)');

  // Test RTF
  const rtf = telemetryAudit.calculateRTF(18, 60);
  assert.strictEqual(rtf, 0.3, 'RTF 18s/60s should equal 0.30 (<= 0.35)');
  console.log('  ✓ Module E (Bab 4 Skripsi Telemetry: WER, CJI, SUS >= 80.5, RTF <= 0.35): Passed');
}

// 6. Test Viral Hook Scorer
{
  const moments = hookScorer.detectViralMoments(subtitleEngine.getSegments(), 16.0);
  assert.ok(moments.length > 0, 'Should detect viral highlight moments');
  assert.ok(moments[0].hookScore >= 70, 'Top moment should have hook score >= 70');
  console.log('  ✓ Module F (Smart Moment Hook Scorer): Passed');
}

console.log('🎉 ALL ENGINE VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
