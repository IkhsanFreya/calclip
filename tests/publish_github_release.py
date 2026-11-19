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
title = 'CalClip.IN v2.0.0 - Auto Clipper 9:16 & Motion AI (Windows)'

body = """## 🚀 CalClip.IN v2.0.0 — Rilis Resmi Windows

Aplikasi desktop pemotong video panjang menjadi klip viral 9:16 (TikTok, Reels, Shorts) & generator Motion AI otomatis. 100% gratis, privasi terjaga, dan berjalan mandiri di laptopmu!

### 📥 Unduhan untuk Windows:
Unduh berkas instalasi di bagian **Assets** di bawah:
👉 **`CalClip-v2.0-Windows-Setup.exe`** *(6,66 MB)*  
Klik dua kali untuk memasang di laptop Windows 10 / 11 64-bit tanpa perlu hak akses Administrator/UAC!

---

### 🌟 Fitur Utama:
- ⚡ **Akselerasi GPU Hardware Cerdas:** Mendukung NVIDIA NVENC (ekspor video 5x–8x lebih ngebut), Intel QuickSync, dan AMD AMF dengan auto-fallback aman ke CPU biasa.
- 🟡 **1-Klik Preset Subtitle Influencer:** Pilihan gaya Alex Hormozi, MrBeast, Ali Abdaal, dan TikTok Neon.
- ✂️ **Timeline Mini Trim Slider:** Potong detik mulai dan selesai (-1s / +1s) dengan live kalkulasi durasi.
- 🛡️ **Sensor Kata Kasar (Family Friendly):** Otomatis menyensor kata tidak pantas di subtitle & banner menjadi `***`.
- 📱 **1-Klik Salin Caption & Tagar Viral:** Sekali klik, caption + 5–8 hashtag langsung siap ditempel ke TikTok / Reels / Shorts.
- 🔒 **Keamanan Berlapis:** Anti-DNS Rebinding, Anti-CSRF, dan data tersimpan aman terisolasi di folder pengguna `%USERPROFILE%\\CalClip` (aman saat aplikasi di-update).
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
        print(f'Rilis tag {tag} sudah ada (ID: {release_id}), memperbarui...')
        
        # Update body & title
        patch_req = urllib.request.Request(f'{release_url}/{release_id}', data=json.dumps({
            'name': title,
            'body': body,
            'draft': False,
            'prerelease': False
        }).encode(), headers=headers, method='PATCH')
        with urllib.request.urlopen(patch_req) as presp:
            pass
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

# 3. Upload binary CalClip-v2.0-Windows-Setup.exe
exe_path = os.path.abspath('hasil-installer/CalClip-v2.0-Windows-Setup.exe')
exe_name = 'CalClip-v2.0-Windows-Setup.exe'
exe_size = os.path.getsize(exe_path)

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
    if 'already_exists' in err_body:
        print('Asset sudah ada di rilis, upload dilewati atau sudah siap!')
    else:
        print('Upload error:', e.code, err_body)
        raise
