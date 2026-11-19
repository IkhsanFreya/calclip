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
tag = 'v2.0.0'
title = 'CalClip.IN v2.0.0 - Production Release (Windows 64-bit)'

body = """## CalClip.IN v2.0.0 — Production Release (Windows 64-bit)

CalClip.IN adalah aplikasi desktop pemrosesan video otomatis untuk mengonversi video panjang menjadi klip vertikal rasio 9:16 (TikTok, Reels, Shorts) serta generator Motion AI terintegrasi. Berjalan secara mandiri di komputer lokal tanpa memerlukan konfigurasi dependensi manual.

### Berkas Instalasi

Unduh berkas instalasi mandiri pada daftar **Assets** di bawah:
- **`CalClip-v2.0-Windows-Setup.exe`** (~145.76 MB)
  - Termasuk runtime mandiri: Python 3.12, PyWebView (Microsoft Edge WebView2), Faster-Whisper (CTranslate2), dan FFmpeg.
  - Kompatibel dengan Windows 10 dan Windows 11 (64-bit).
  - Tidak memerlukan hak akses Administrator (UAC) untuk instalasi.

---

### Ringkasan Pembaruan dan Fitur

#### Antarmuka dan Pengalaman Pengguna
- **Launcher Native (`CalClip.exe`)**: Eksekusi langsung sebagai aplikasi desktop mandiri tanpa jendela konsol terminal.
- **Identitas Visual**: Menggunakan logo resmi CC.IN beresolusi tinggi (dukungan 16px hingga 256px) untuk installer, pintasan desktop, taskbar, dan jendela aplikasi.
- **Penyunting Subtitle Presisi**: Timeline mini trim slider untuk penyesuaian detik mulai dan selesai (-1s / +1s) secara real-time.

#### Performa dan Pemrosesan
- **Akselerasi Perangkat Keras GPU**: Deteksi otomatis NVIDIA NVENC, Intel QuickSync Video (QSV), dan AMD AMF untuk peningkatan kecepatan ekspor video hingga 5x–8x.
- **CPU Fallback Otomatis**: Transisi mulus ke encoder CPU (`libx264`) apabila akselerasi GPU tidak terdeteksi pada perangkat.
- **Preset Subtitle Kinetik**: Pilihan gaya teks terinspirasi Alex Hormozi, MrBeast, Ali Abdaal, dan TikTok Neon.
- **Generator Teks dan Tagar Otomatis**: Pembuatan kutipan, ringkasan, dan tagar relevan dalam satu klik untuk distribusi konten.
- **Penyaring Kata**: Sensor otomatis kata tidak pantas pada subtitle dan teks banner (*Family Friendly*).

#### Keamanan dan Penyimpanan Data
- **Loopback Isolation**: Backend hanya melayani koneksi lokal `127.0.0.1`.
- **Perlindungan Jaringan**: Validasi Host Header (Anti-DNS Rebinding) dan penolakan permintaan lintas domain (Anti-CSRF).
- **Isolasi Data Pengguna**: Seluruh riwayat proyek, konfigurasi, dan token disimpan terpisah di direktori pengguna (`%USERPROFILE%\\CalClip`), sehingga data tetap aman saat aplikasi diperbarui.
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

# 3. Cek asset apakah sudah sesuai
exe_path = os.path.abspath('hasil-installer/CalClip-v2.0-Windows-Setup.exe')
exe_name = 'CalClip-v2.0-Windows-Setup.exe'
exe_size = os.path.getsize(exe_path)

asset_exists = False
assets_req = urllib.request.Request(f'{release_url}/{release_id}/assets', headers=headers)
try:
    with urllib.request.urlopen(assets_req) as aresp:
        assets_list = json.loads(aresp.read().decode())
        for a in assets_list:
            if a.get('name') == exe_name:
                if a.get('size') == exe_size:
                    print(f"Asset {exe_name} ({exe_size / (1024*1024):.2f} MB) sudah ada dan sesuai.")
                    asset_exists = True
                else:
                    aid = a['id']
                    print(f"Ukuran berbeda, menghapus asset ID {aid}...")
                    del_req = urllib.request.Request(f'https://api.github.com/repos/{repo}/releases/assets/{aid}', headers=headers, method='DELETE')
                    with urllib.request.urlopen(del_req) as dresp:
                        print("Asset lama dihapus.")
except Exception as ea:
    print(f"Catatan pengecekan asset: {ea}")

if not asset_exists:
    print(f'Mengunggah berkas {exe_name} ({exe_size / (1024*1024):.2f} MB)...')
    upload_url = upload_url_template.split('{')[0] + f'?name={exe_name}'
    with open(exe_path, 'rb') as f:
        exe_bytes = f.read()

    upload_headers = {
        'Authorization': f'token {token}',
        'User-Agent': 'CalClip-AutoRelease',
        'Content-Type': 'application/octet-stream',
        'Content-Length': str(exe_size)
    }

    upload_req = urllib.request.Request(upload_url, data=exe_bytes, headers=upload_headers, method='POST')
    try:
        with urllib.request.urlopen(upload_req) as resp:
            asset_data = json.loads(resp.read().decode())
            print('BERHASIL DIUNGGAH!')
            print('Download URL:', asset_data.get('browser_download_url'))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print('Upload error:', e.code, err_body)
        raise
