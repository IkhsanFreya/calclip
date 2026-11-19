"""Tes runnable untuk Filter Kalman Linear 2D pada dynamic auto-reframing CalClip.IN."""
import sys
from pathlib import Path
import numpy as np

# Tambahkan direktori root agar modul dapat diimpor
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "alat" / "klip"))

from klip import KalmanFilterLinear2D


def test_kalman_filter_state_and_jitter():
    kf = KalmanFilterLinear2D(q_pos=0.00015, q_vel=0.002, r_noise=0.04)
    kf.set_state(0.5, 0.5)
    assert kf.get_pos() == (0.5, 0.5), "Initial state must match set_state"

    # 1. Uji peredaman jitter (variansi teredam signifikan pada koordinat bergetar)
    raw_jitter = [0.50, 0.54, 0.47, 0.53, 0.48, 0.52, 0.55, 0.46, 0.51]
    smoothed = []
    dt = 1.0 / 6.0
    deadzone = 0.025

    for raw_x in raw_jitter:
        curr_x, _ = kf.get_pos()
        dist = abs(raw_x - curr_x)
        meas_x = curr_x + (raw_x - curr_x) * 0.2 if dist < deadzone else raw_x

        kf.predict(dt)
        sx, _ = kf.update(meas_x, 0.5)
        smoothed.append(sx)

    var_raw = float(np.var(raw_jitter))
    var_smoothed = float(np.var(smoothed))
    assert var_smoothed < var_raw * 0.2, f"Kalman filter harus meredam variansi jitter > 80% (raw: {var_raw}, smooth: {var_smoothed})"

    # 2. Uji reset state pada shot-cut (pergantian adegan)
    kf.set_state(0.85, 0.5)
    assert kf.get_pos() == (0.85, 0.5), "State reset pada shot cut harus instan tanpa lag"

    print("Semua pengujian Filter Kalman Linear 2D (alat/klip/klip.py) BERHASIL!")


if __name__ == "__main__":
    test_kalman_filter_state_and_jitter()
