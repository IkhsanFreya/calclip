import os
import json
import subprocess
import urllib.request
import urllib.error

# 1. Ambil token GitHub tersimpan dari Git Credential Manager
p = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', capture_output=True, text=True)
creds = dict(line.split('=', 1) for line in p.stdout.splitlines() if '=' in line)
token = creds.get('password')

if not token:
    raise SystemExit('Token GitHub tidak ditemukan di Credential Manager.')

headers = {
    'Authorization': f'token {token}',
    'User-Agent': 'CalClip-AutoRelease',
    'Accept': 'application/vnd.github+json'
}

repo = 'IkhsanFreya/calclip'
tag = 'v2.1.0'
title = 'CalClip.IN v2.1.0 - Production Release (Windows 64-bit)'

body = """## CalClip.IN v2.1.0 — Production Release (Windows 64-bit)

CalClip.IN adalah aplikasi desktop pemrosesan video otomatis untuk mengonversi video panjang menjadi klip vertikal rasio 9:16 (TikTok, Reels, Shorts) serta generator Motion AI terintegrasi. Berjalan secara mandiri di komputer lokal tanpa memerlukan konfigurasi dependensi manual.

---

### 📥 Berkas Unduhan Resmi (Pilih Salah Satu)

Silakan unduh berkas aplikasi resmi pada daftar **Assets** di bawah:

| Berkas Unduhan | Format | Deskripsi |
| :--- | :---: | :--- |
| **[`CalClip-v2.1-Windows-Setup.exe`](https://github.com/IkhsanFreya/calclip/releases/download/v2.1.0/CalClip-v2.1-Windows-Setup.exe)** | Installer Mandiri | **Rekomendasi Utama:** Wizard instalasi satu klik untuk Windows 10 & 11 (64-bit). |
| **[`CalClip-v2.1-Windows-Setup.zip`](https://github.com/IkhsanFreya/calclip/releases/download/v2.1.0/CalClip-v2.1-Windows-Setup.zip)** | Arsip ZIP Installer | Untuk pengguna yang membutuhkan berkas installer dalam format `.zip`. |

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
> Tautan `Source code (zip)` dan `Source code (tar.gz)` pada bagian paling bawah daftar Assets adalah **fitur standar bawaan platform GitHub** yang dibuat otomatis dari repositori terbuka (*Open Source*) untuk kebutuhan pengembang (*developer*) dan pengujian akademik skripsi.
> 
> Platform GitHub secara *default* **tidak menampilkan ukuran file** pada *Source code* otomatis tersebut. Pengguna umum/konten kreator **TIDAK PERLU** mengunduh berkas *Source code* tersebut karena hanya berisi kode mentah tanpa installer aplikasi. Gunakan salah satu dari 2 berkas resmi di atas yang telah dilengkapi keterangan ukuran terverifikasi.

---

### Ringkasan Pembaruan dan Fitur v2.1.0

#### 🎬 Sinkronisasi Subtitle Presisi (Terkunci Sesuai Frame Jeda)
- **Lock-step Video Pause**: Saat video dijeda (pause) untuk mengatur gaya atau memeriksa klip, teks subtitle **terkunci rapat pada detik/frame video yang sedang dijeda** (tidak berjalan sendiri).
- **Instant Style & Preset Preview**: Mengganti preset (Pop Kapital, Neon Glow, Karaoke, Lime Box, font, warna sorotan) langsung memperbarui tampilan subtitle di posisi jeda secara instan dan rapi.
- **Dynamic 60 FPS saat Putar**: Saat video diputar, animasi kinetik kata per kata (bouncing pop, karaoke sweep, neon pulse) berjalan mulus tersinkronisasi audio transkrip Whisper.
- **Live Text Editing**: Teks yang disunting pada tab Teks langsung tercermin seketika di posisi video.

#### 👁️ Peningkatan Akurasi YuNet ONNX & Filter Kalman 2D (Sesuai Skripsi)
- **Dual-Pass Face Recall**: Resolusi masukan adaptif 800px dan ambang ganda (0.45 & 0.30 sensitive fallback) memastikan retensi deteksi wajah stabil pada sudut miring dan jarak jauh.
- **5-Landmark Anatomical Centering**: Titik tengah crop kamera dijangkarkan pada koordinat mata dan hidung, menghilangkan getaran mikro (*flutter*) akibat gerakan bibir atau mikrofon.
- **Adaptive Kalman Measurement Noise**: Nilai $R$ diskalakan berbanding terbalik dengan skor confidence ($R_{\text{adapt}} = R / \text{conf}$), menghasilkan pergerakan kamera mulus tanpa getaran (variansi jitter teredam > 80%).
- **Dynamic Deadzone Hysteresis**: Deadzone otomatis mengunci kaku (0.035) saat diam dan responsif (0.012) saat kamera bergerak panning.

#### 🎮 Smart Facecam Framing & Zoom Ekstra (hingga 5.0x)
- **Extended Zoom (1.0x - 5.0x)**: Batas zoom diperluas hingga 5.0x sehingga webcam kecil di sudut video gameplay (Mobile Legends / game lainnya) dapat di-crop rapat ke wajah & pundak streamer.
- **Eliminasi Banner UI Game**: Memotong rapi area luar webcam sehingga banner diskon dan HUD game tidak bocor ke frame wajah atas.

#### 🎙️ Podcast Split Shot & Deteksi 2 Pembicara
- **Shot Transisi Otomatis**: Transisi otomatis antara layar penuh 9:16 (saat menyorot 1 pembicara) dan Split 2 Layar (saat kamera melebar memperlihatkan 2 orang pembicara).
- **Backend Face & Speaker Clustering**: Pelacakan cerdas via endpoint `/api/deteksi-podcast` dan `/api/deteksi-facecam`.

#### ⚡ Render Satuan & Download Header Rapi
- **Tombol "Render Klip Ini"**: Kemampuan merender hanya satu klip terpilih tanpa harus merender semua klip dalam daftar.
- **Direct Download Headers**: Penanganan header HTTP `Content-Disposition: attachment` pada endpoint berkas video untuk mencegah eror unduhan browser.

"""

# 2. Cek apakah rilis sudah ada atau buat baru
release_url = f'https://api.github.com/repos/{repo}/releases'
release_id = None
upload_url_template = None

# Cek tag release
check_req = urllib.request.Request(f'{release_url}/tags/{tag}', headers=headers)
try:
    with urllib.request.urlopen(check_req) as resp:
        rel_data = json.loads(resp.read().decode())
        release_id = rel_data['id']
        upload_url_template = rel_data['upload_url']
        print(f'Rilis tag {tag} sudah ada (ID: {release_id}), memperbarui teks...')
        
        # Update body & title
        patch_req = urllib.request.Request(f'{release_url}/{release_id}', data=json.dumps({
            'name': title,
            'body': body,
            'draft': False,
            'prerelease': False
        }).encode(), headers=headers, method='PATCH')
        with urllib.request.urlopen(patch_req) as presp:
            print('Teks rilis berhasil diperbarui menjadi minimalis dan profesional.')
except urllib.error.HTTPError as e:
    if e.code == 404:
        print(f'Membuat rilis baru {tag}...')
        post_data = json.dumps({
            'tag_name': tag,
            'target_commitish': 'main',
            'name': title,
            'body': body,
            'draft': False,
            'prerelease': False
        }).encode()
        post_req = urllib.request.Request(release_url, data=post_data, headers=headers, method='POST')
        with urllib.request.urlopen(post_req) as resp:
            rel_data = json.loads(resp.read().decode())
            release_id = rel_data['id']
            upload_url_template = rel_data['upload_url']
            print(f'Rilis berhasil dibuat (ID: {release_id})!')
    else:
        raise

# 3. Cek asset apakah sudah sesuai dan unggah bila perlu
files_to_publish = [
    'hasil-installer/CalClip-v2.1-Windows-Setup.exe',
    'hasil-installer/CalClip-v2.1-Windows-Setup.zip'
]

# Pastikan file zip selalu baru dan sinkron dengan installer .exe
import zipfile
if os.path.exists('hasil-installer/CalClip-v2.1-Windows-Setup.zip'):
    try:
        os.remove('hasil-installer/CalClip-v2.1-Windows-Setup.zip')
    except Exception:
        pass

print('Membuat arsip zip terbaru dari installer...')
with zipfile.ZipFile('hasil-installer/CalClip-v2.1-Windows-Setup.zip', 'w', compression=zipfile.ZIP_STORED) as z:
    z.write('hasil-installer/CalClip-v2.1-Windows-Setup.exe', arcname='CalClip-v2.1-Windows-Setup.exe')

for rel_fpath in files_to_publish:
    file_path = os.path.abspath(rel_fpath)
    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)

    asset_exists = False
    assets_req = urllib.request.Request(f'{release_url}/{release_id}/assets', headers=headers)
    try:
        with urllib.request.urlopen(assets_req) as aresp:
            assets_list = json.loads(aresp.read().decode())
            for a in assets_list:
                if a.get('name') == file_name:
                    aid = a['id']
                    print(f"Menghapus asset lama {file_name} (ID {aid})...")
                    del_req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases/assets/{aid}', headers=headers, method='DELETE')
                    with urllib.request.urlopen(del_req) as dresp:
                        print(f"Asset lama {file_name} dihapus.")
    except Exception as ea:
        print(f"Catatan pengecekan asset {file_name}: {ea}")

    if not asset_exists:
        print(f'Mengunggah berkas {file_name} ({file_size / (1024*1024):.2f} MB)...')
        upload_url = upload_url_template.split('{')[0] + f'?name={file_name}'
        with open(file_path, 'rb') as f:
            file_bytes = f.read()

        upload_headers = {
            'Authorization': f'token {token}',
            'User-Agent': 'CalClip-AutoRelease',
            'Content-Type': 'application/octet-stream',
            'Content-Length': str(file_size)
        }

        upload_req = urllib.request.Request(upload_url, data=file_bytes, headers=upload_headers, method='POST')
        try:
            with urllib.request.urlopen(upload_req) as resp:
                asset_data = json.loads(resp.read().decode())
                print(f'BERHASIL DIUNGGAH: {file_name}!')
                print('Download URL:', asset_data.get('browser_download_url'))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            print('Upload error:', e.code, err_body)
            raise
