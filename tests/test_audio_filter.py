import imageio_ffmpeg, subprocess
exe = imageio_ffmpeg.get_ffmpeg_exe()

def test_pipeline(with_music=False, with_ducking=True, jernihkan=True, norm=True):
    durasi = 3.0
    g = {
        'suara': 100,
        'jernihkan_suara': jernihkan,
        'normalisasi_loudness': norm,
        'audio_ducking': with_ducking,
        'volume_musik': 18
    }

    vol_suara = float(g.get("suara", 100)) / 100
    filter_vokal = [f"volume={vol_suara:.2f}"]

    if g.get("jernihkan_suara", True):
        filter_vokal.extend(["highpass=f=80", "lowpass=f=12000", "afftdn=nf=-25"])

    d_fade_out = max(durasi - 0.12, 0.0)
    filter_vokal.extend(["afade=t=in:ss=0:d=0.08", f"afade=t=out:st={d_fade_out:.2f}:d=0.12"])

    idx = 1
    aud = []
    campur = []
    inputs = [
        exe, '-y', '-v', 'error',
        '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3'
    ]

    if with_music:
        inputs += ['-f', 'lavfi', '-i', 'sine=frequency=220:duration=3']
        vol_m = float(g.get("volume_musik", 18)) / 100
        if g.get("audio_ducking", True):
            aud.append(f"[0:a]{','.join(filter_vokal)},asplit=2[a0_mix][a0_sc]")
            aud.append(f"[{idx}:a]volume={vol_m:.2f},atrim=0:{durasi:.2f},"
                       f"afade=t=out:st={max(durasi - 1.5, 0):.2f}:d=1.5[am_raw]")
            aud.append("[am_raw][a0_sc]sidechaincompress=threshold=0.08:ratio=4:attack=80:release=350[am]")
            campur = ["[a0_mix]", "[am]"]
        else:
            aud.append(f"[0:a]{','.join(filter_vokal)}[a0]")
            aud.append(f"[{idx}:a]volume={vol_m:.2f},atrim=0:{durasi:.2f},"
                       f"afade=t=out:st={max(durasi - 1.5, 0):.2f}:d=1.5[am]")
            campur = ["[a0]", "[am]"]
        idx += 1
    else:
        aud.append(f"[0:a]{','.join(filter_vokal)}[a0]")
        campur = ["[a0]"]

    mastering_post = []
    if g.get("normalisasi_loudness", True):
        mastering_post.append("loudnorm=I=-14:TP=-1.0:LRA=11")
    mastering_post.append("alimiter=limit=0.95")
    str_post = ",".join(mastering_post)

    if len(campur) > 1:
        aud.append(f"{''.join(campur)}amix=inputs={len(campur)}:duration=first:normalize=0,{str_post}[aout]")
    else:
        aud.append(f"{campur[0]}{str_post}[aout]")

    cmd = inputs + [
        '-filter_complex', ';'.join(aud),
        '-map', '[aout]',
        '-f', 'null', '-'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    assert res.returncode == 0, f"Error (code {res.returncode}): {res.stderr}"
    print(f"PASS: with_music={with_music}, with_ducking={with_ducking}, jernihkan={jernihkan}, norm={norm}")

# Run all 4 combinations
test_pipeline(with_music=False, jernihkan=True, norm=True)
test_pipeline(with_music=True, with_ducking=True, jernihkan=True, norm=True)
test_pipeline(with_music=True, with_ducking=False, jernihkan=True, norm=True)
test_pipeline(with_music=False, jernihkan=False, norm=False)
print("ALL PIPELINE COMBINATIONS PASSED PERFECTLY!")
