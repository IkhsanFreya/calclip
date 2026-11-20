import asyncio
import os
import sys
import subprocess
import edge_tts
from pathlib import Path

def cari_ffmpeg():
    # 1. Remotion bundled ffmpeg
    base_motion = Path(__file__).resolve().parent
    calon = [
        base_motion / "node_modules" / "@remotion" / "compositor-win32-x64-msvc" / "ffmpeg.exe",
        base_motion.parent.parent / "node_modules" / "@remotion" / "compositor-win32-x64-msvc" / "ffmpeg.exe",
    ]
    for c in calon:
        if c.is_file():
            return str(c)
    # 2. Sistem ffmpeg
    return "ffmpeg"

async def buat_suara(teks: str, file_wav: str, suara: str = "id-ID-GadisNeural"):
    file_mp3 = file_wav + ".temp.mp3"
    try:
        comm = edge_tts.Communicate(teks, suara)
        await comm.save(file_mp3)
        
        ffmpeg_bin = cari_ffmpeg()
        
        r = subprocess.run([
            ffmpeg_bin, "-y", "-i", file_mp3,
            "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le",
            file_wav
        ], capture_output=True)
        
        if os.path.exists(file_mp3):
            os.remove(file_mp3)
            
        if os.path.exists(file_wav) and os.path.getsize(file_wav) > 500:
            return True
        else:
            print(f"FFmpeg conversion failed: {r.stderr.decode('utf-8', errors='ignore')}", file=sys.stderr)
    except Exception as e:
        print(f"EdgeTTS error: {e}", file=sys.stderr)
        if os.path.exists(file_mp3):
            try:
                os.remove(file_mp3)
            except Exception:
                pass
    return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python suara-natural.py <output.wav> <text> [voice]")
        sys.exit(1)
    file_wav = sys.argv[1]
    teks = sys.argv[2]
    suara = sys.argv[3] if len(sys.argv) > 3 else "id-ID-GadisNeural"
    
    ok = asyncio.run(buat_suara(teks, file_wav, suara))
    if not ok:
        print("Gagal generate suara natural", file=sys.stderr)
        sys.exit(1)
    print(f"Natural speech saved: {file_wav}")

if __name__ == "__main__":
    main()
