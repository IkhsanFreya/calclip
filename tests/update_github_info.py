import urllib.request
import json
import subprocess

cmd = 'git credential fill'
p = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
out, _ = p.communicate('protocol=https\nhost=github.com\n')
token = ''
for line in out.splitlines():
    if line.startswith('password='):
        token = line.split('=', 1)[1]

if not token:
    raise ValueError("Token GitHub tidak ditemukan dari git credential!")

# 1. Pastikan repo description bersih dari unsur akademik/skripsi
repo_data = {
    'description': 'CalClip.IN — Desktop Video Auto-Clipper 9:16 (Faster-Whisper INT8, YuNet ONNX & Filter Kalman 2D) & Motion AI Suite',
    'homepage': 'https://github.com/IkhsanFreya/calclip/releases/tag/v2.1.0'
}
req = urllib.request.Request(
    'https://api.github.com/repos/IkhsanFreya/calclip',
    data=json.dumps(repo_data).encode('utf-8'),
    headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Python',
        'Content-Type': 'application/json'
    },
    method='PATCH'
)
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode())
    print("Repo Description:", res.get('description'))
    print("Repo Homepage:", res.get('homepage'))

# 2. Update release body TANPA hal akademik/skripsi sama sekali
release_body = """## CalClip.IN v2.1.0 — Production Release (Windows 64-bit)

CalClip.IN adalah aplikasi desktop pemrosesan video otomatis untuk mengonversi video horizontal panjang menjadi klip vertikal rasio 9:16 (TikTok, Reels, Shorts) serta generator Motion AI terintegrasi. Berjalan secara mandiri di komputer lokal tanpa ketergantungan cloud berbayar.

---

### 📥 Berkas Unduhan Resmi

Silakan unduh berkas aplikasi resmi pada daftar **Assets** di bawah:

| Berkas Unduhan | Format | Ukuran | Deskripsi |
| :--- | :---: | :---: | :--- |
| **[`CalClip-v2.1-Windows-Setup.exe`](https://github.com/IkhsanFreya/calclip/releases/download/v2.1.0/CalClip-v2.1-Windows-Setup.exe)** | Installer Mandiri | **~330 MB** | **Rekomendasi Utama:** Wizard instalasi satu klik untuk Windows 10 & 11 (64-bit). Termasuk runtime Python mandiri, FFmpeg 87MB hardware-accelerated, Whisper AI INT8, dan yt-dlp. |
| **[`CalClip-v2.1-Windows-Setup.zip`](https://github.com/IkhsanFreya/calclip/releases/download/v2.1.0/CalClip-v2.1-Windows-Setup.zip)** | Arsip ZIP Installer | **~330 MB** | Berkas installer dalam bentuk arsip zip resmi. |

> [!TIP]
> **PEMBERITAHUAN WINDOWS SMARTSCREEN (PENERBIT TIDAK DIKENAL):**  
> Karena CalClip.IN merupakan aplikasi *open-source* independen yang tidak menyertakan sertifikat digital komersial berbayar (EV Code Signing dari Microsoft seharga ~$400/tahun), Windows Defender SmartScreen mungkin menampilkan dialog proteksi *"Windows protected your PC"* atau *"Windows melindungi PC Anda"*.  
> 
> **Langkah melanjutkan instalasi:**  
> 1. Klik tautan **"More info"** / **"Info selengkapnya"**  
> 2. Klik tombol **"Run anyway"** / **"Tetap jalankan"**  
> 
> Seluruh kode sumber CalClip.IN 100% terbuka (*open-source*), terbebas dari *malware* atau pelacak pihak ketiga, dan seluruh pemrosesan AI berjalan secara lokal di komputer Anda.

> [!NOTE]
> **PEMBERITAHUAN MENGENAI `Source code (zip)` & `Source code (tar.gz)` DI DAFTAR ASSETS:**  
> Tautan `Source code (zip)` dan `Source code (tar.gz)` pada bagian paling bawah daftar Assets adalah **fitur standar otomatis bawaan platform GitHub** dari repositori terbuka (*Open Source*) untuk kebutuhan pengembang (*developer*). Pengguna umum/konten kreator **TIDAK PERLU** mengunduh berkas tersebut. Gunakan file installer `.exe` di atas.

---

### 🚀 Rincian Pembaharuan & Fitur Baru v2.1.0

#### 1. 🎬 Sinkronisasi Subtitle Presisi (Lock-Step saat Video Dijeda / Pause)
- **Lock-step Video Pause:** Saat video dijeda (pause) untuk mengatur gaya atau memeriksa tampilan, kata-kata subtitle **terkunci rapat pada detik dan frame video yang sedang dijeda**, tidak bergerak atau berjalan sendiri.
- **Instant Style & Preset Preview:** Perubahan preset gaya subtitle (Pop Kapital, Neon Glow, Karaoke, Lime Box, font, warna sorotan) langsung dirender seketika di posisi jeda secara real-time.
- **Pratinjau Kinetik 60 FPS saat Video Diputar:** Saat video diputar, animasi kinetik kata demi kata (bouncing pop, karaoke sweep, neon pulse) berjalan mulus tersinkronisasi presisi dengan audio transkripsi Whisper.
- **Live Text Editing:** Pengeditan teks pada tab Teks langsung tercermin seketika pada posisi video.

#### 2. 👁️ Peningkatan Akurasi YuNet ONNX & 5-Landmark Anatomical Centering
- **Adaptive 800px Input Resolution:** Skala input deteksi wajah ditingkatkan adaptif ke 800px untuk menangkap wajah kecil dan jarak jauh dengan ketajaman tinggi.
- **Dual-Pass Face Recall:** Ambang batas deteksi primer 0.45 dikombinasikan dengan fallback sensitif 0.30 bila wajah berada pada sudut miring atau pencahayaan redup.
- **5-Landmark Anatomical Centering:** Titik pusat crop kamera dikunci pada koordinat anatomis mata dan hidung (bukan bounding box luar), mengeliminasi getaran mikro (*micro-flutter*) akibat gerakan bibir pembicara atau microphone boom.

#### 3. 📐 Filter Kalman Linear 2D dengan Adaptive Measurement Noise ($R_{\\text{adapt}} = R / \\text{conf}$)
- **Constant Velocity State Model:** Model state Kalman $4 \\times 1$ ($[x, y, v_x, v_y]^T$) dengan perambatan kovariansi penuh $F P F^T + Q$.
- **Adaptive Measurement Noise:** Kovariansi pengukuran $R$ diskalakan berbanding terbalik dengan nilai *confidence* deteksi wajah ($R / \\text{conf}$), sehingga deteksi berbobot rendah tidak memicu pergeseran tiba-tiba.
- **Dynamic Deadzone Hysteresis:** Deadzone mengunci kaku ($0.035$) saat target diam untuk menghilangkan *camera jitter* (variansi jitter teredam > 80%), dan otomatis melebar responsif ($0.012$) saat terjadi pergerakan panning aktif.

#### 4. 🎮 Smart Facecam Framing & Extended Zoom (Hingga 5.0x)
- **Rentang Zoom Ekstra (1.0x – 5.0x):** Batas zoom facecam diperluas hingga 5.0x sehingga webcam streamer di pojok layar gameplay (Mobile Legends, Valorant, dll.) dapat di-crop rapat ke wajah & pundak secara proporsional.
- **Eliminasi Kebocoran HUD/Banner Game:** Memotong rapi area luar webcam sehingga banner event, skor, dan minimap tidak bocor ke frame wajah vertikal 9:16.

#### 5. 🎙️ Studio-Grade Audio Mastering & Voice Denoising
- **Broadcast Loudness Normalization (EBU R128):** Target vokal $-14\\text{ LUFS}$ dan True Peak $-1.0\\text{ dBTP}$ (standar resmi TikTok, Reels, dan Shorts) agar suara terdengar tebal, bertenaga, dan konsisten di speaker HP.
- **AI Speech Denoise (Adaptive FFT):** Pembersih derau pintar yang meredam suara kipas pendingin laptop, dengung kelistrikan mic (>12 kHz), dan getaran angin (<80 Hz).
- **Anti-Click Boundary Micro-Fade:** Transisi fade mikro pada titik potong awal dan akhir untuk mencegah letupan audio (*pop/click*).

#### 6. ⚡ Render Klip Satuan & Peningkatan Reliabilitas Sistem
- **Tombol "Render Klip Ini":** Memungkinkan pengguna mengekspor klip terpilih secara individual tanpa harus merender seluruh daftar klip.
- **Direct Download Headers:** Penanganan header HTTP `Content-Disposition: attachment` pada server lokal untuk menjamin pengunduhan video di browser berjalan mulus.
- **Kemasan Mandiri Teruji:** Paket instalasi ~330 MB yang sudah mengemas seluruh runtime Python 3.12, binary FFmpeg 87MB lengkap dengan encoder hardware (NVENC/QSV/AMF), model Faster-Whisper terkuantisasi INT8, dan yt-dlp.
"""

req_rel = urllib.request.Request(
    'https://api.github.com/repos/IkhsanFreya/calclip/releases/452884996',
    data=json.dumps({'body': release_body}).encode('utf-8'),
    headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Python',
        'Content-Type': 'application/json'
    },
    method='PATCH'
)
with urllib.request.urlopen(req_rel) as resp:
    res = json.loads(resp.read().decode())
    print("Release Body updated successfully! Length:", len(res.get('body', '')))
