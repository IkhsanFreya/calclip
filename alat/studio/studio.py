# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["pywebview>=5.0"]
# ///
# kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id · Lisensi Nonkomersial Maliki Studio 1.0 (alat/LISENSI.md): dilarang dijual ulang.
"""Studio Maliki — server lokal untuk tampilan Klip & Motion.

Hanya mendengar di 127.0.0.1 (tidak bisa dibuka dari perangkat lain).
Jalankan: uv run studio.py            → jendela aplikasi (native)
          uv run studio.py --browser  → buka di browser saja
"""
from __future__ import annotations

import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse, parse_qs

AKAR = Path(__file__).resolve().parent
ALAT = AKAR.parent
KLIP = ALAT / "klip"
if not os.environ.get("STUDIO_PY") and (ALAT / "BUNDEL").exists():
    # Versi installer Windows: <app>\python\python.exe dan <app>\bin\uv.exe di samping folder alat
    _py = ALAT.parent / "python" / ("python.exe" if os.name == "nt" else "bin/python3.12")
    if _py.exists():
        os.environ["STUDIO_PY"] = str(_py)
        os.environ.setdefault("PYTHONDONTWRITEBYTECODE", "1")
    _uv = ALAT.parent / "bin" / ("uv.exe" if os.name == "nt" else "uv")
    if _uv.exists():
        os.environ.setdefault("STUDIO_UV", str(_uv))
MOTION = ALAT / "motion"
SUARA = ALAT / "suara"
if os.environ.get("STUDIO_PY"):
    # Versi installer: folder aplikasi hanya-baca → Motion (npm install, naskah, hasil) dijalankan dari salinan di folder data.
    _m = Path(os.environ.get("STUDIO_DATA", Path.home() / "CalClip")) / ".mesin" / "motion"
    try:
        shutil.copytree(MOTION, _m, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules", "naskah", "hasil"))
        # src/Akar.tsx mengimpor naskah/contoh.json (props bawaan) → wajib ada, walau folder naskah lain tidak disalin
        (_m / "naskah").mkdir(parents=True, exist_ok=True)
        # buat.mjs memanggil ../suara/suara.py (VoxCPM) → folder suara harus ikut di sebelah motion
        if SUARA.exists():
            shutil.copytree(SUARA, _m.parent / "suara", dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__", ".venv"))
        MOTION = _m
    except OSError:
        pass
DIST = ALAT.parent / "dist"
if not DIST.exists():
    DIST = AKAR / "dist"
DATA = Path(os.environ.get("STUDIO_DATA", Path.home() / "CalClip"))
ENV = DATA / "pengaturan.env"
PORT = int(os.environ.get("STUDIO_PORT", "8799"))
KUNCI = ["SUARA", "VOXCPM_MODE", "VOXCPM_DESAIN", "AI", "LANGGANAN", "OPENCODE_MODEL", "CLAUDE_CODE_MODEL", "CODEX_MODEL", "GEMINI_API_KEY", "GEMINI_MODEL",
         "OPENAI_BASE_URL", "OPENAI_API_KEY", "OPENAI_MODEL", "SUARA_MAC", "TEMA", "PIXABAY_API_KEY"]
BAWAAN = {"SUARA": "bawaan", "VOXCPM_MODE": "bawaan", "AI": "lokal", "LANGGANAN": "claude-code", "GEMINI_MODEL": "gemini-3.8-flash",
          "OPENAI_BASE_URL": "http://localhost:11434/v1", "OPENAI_MODEL": "gemma3:4b", "SUARA_MAC": "Damayanti"}


def baca_pengaturan() -> dict:
    p = dict(BAWAAN)
    if ENV.exists():
        for baris in ENV.read_text(encoding="utf-8-sig").splitlines():
            if "=" in baris and not baris.startswith("#"):
                k, v = baris.split("=", 1)
                if k in KUNCI:
                    p[k] = v
    return p


def simpan_pengaturan(baru: dict) -> None:
    p = baca_pengaturan()
    for k in KUNCI:
        if k in baru and baru[k] is not None:
            val = str(baru[k]).strip()
            # Kunci yang disamarkan (mis. "••••...") jangan menimpa kunci asli di file
            if k in ("GEMINI_API_KEY", "OPENAI_API_KEY", "PIXABAY_API_KEY") and val.startswith("••••"):
                continue
            p[k] = val
    DATA.mkdir(parents=True, exist_ok=True)
    ENV.write_text("# Pengaturan Studio Maliki (berisi kunci AI — jangan dibagikan)\n" +
                   "\n".join(f"{k}={p.get(k, '')}" for k in KUNCI) + "\n", encoding="utf-8")
    os.chmod(ENV, 0o600)


def samarkan(p: dict) -> dict:
    """Kunci tidak pernah dikirim balik utuh ke halaman."""
    out = dict(p)
    for k in ("GEMINI_API_KEY", "OPENAI_API_KEY", "PIXABAY_API_KEY"):
        v = out.get(k, "")
        out[k] = ("••••" + v[-4:]) if v else ""
    return out


# ── Pekerjaan (satu per satu) ───────────────────────────────────────────────
class Kerja:
    def __init__(self):
        self.kunci = threading.Lock()
        self.id = 0
        self.jenis = ""
        self.log: list[str] = []
        self.status = "siap"  # siap | jalan | selesai | gagal
        self.folder: Path | None = None
        self.proc: subprocess.Popen | None = None
        self.hasil: dict = {}

    def jalankan(self, jenis: str, langkah: list[tuple[list[str], Path]], folder: Path, setelah=None):
        with self.kunci:
            if self.status == "jalan":
                raise RuntimeError("Masih ada proses berjalan. Tunggu selesai atau batalkan.")
            self.id += 1
            self.jenis, self.log, self.status, self.folder, self.hasil = jenis, [], "jalan", folder, {}
        threading.Thread(target=self._kerja, args=(langkah, setelah), daemon=True).start()

    def _kerja(self, langkah, setelah):
        env = os.environ.copy()
        p = baca_pengaturan()
        env.update({k: v for k, v in p.items() if v})
        env["UV"] = cari_uv()
        if p.get("VOXCPM_MODE") == "clone" and ref_suara():
            env["VOXCPM_REFERENSI"] = str(ref_suara())
        if p.get("VOXCPM_MODE") != "desain":
            env.pop("VOXCPM_DESAIN", None)
        env["PYTHONUNBUFFERED"] = "1"
        env["PYTHONIOENCODING"] = "utf-8"  # Windows: cegah galat cp1252 saat mencetak “ ” dan emoji
        try:
            for cmd, cwd in langkah:
                self.log.append("$ " + " ".join(Path(c).name if i < 2 else c for i, c in enumerate(cmd)))
                self.proc = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE,
                                             stderr=subprocess.STDOUT, text=True, bufsize=1,
                                             encoding="utf-8", errors="replace",
                                             creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                for baris in self.proc.stdout:
                    baris = baris.rstrip()
                    if baris and not re.search(r"objc\[|AVFAudioReceiver|Warning|warn\(|^\s*$", baris):
                        self.log.append(baris)
                        self.log[:] = self.log[-400:]
                if self.proc.wait() != 0:
                    self.status = "gagal" if self.status != "batal" else "batal"
                    return
            if setelah:
                setelah(self)
            self.status = "selesai"
        except Exception as e:  # noqa: BLE001
            self.log.append(f"Galat: {e}")
            self.status = "gagal"
        finally:
            self.proc = None

    def batal(self):
        if self.proc:
            self.status = "batal"
            self.proc.terminate()

    def ringkas(self) -> dict:
        return {"id": self.id, "jenis": self.jenis, "status": self.status, "log": self.log[-200:],
                "hasil": self.hasil}


KERJA = Kerja()


# Versi installer (.dmg/.exe): Python + semua paket sudah dibundel, peluncur mengisi STUDIO_PY.
PY_BUNDEL = os.environ.get("STUDIO_PY") if os.environ.get("STUDIO_PY") and Path(os.environ["STUDIO_PY"]).exists() else None


def jalankan_skrip(skrip: Path) -> list[str]:
    """Perintah untuk menjalankan skrip alat: Python bawaan installer, atau `uv run` (versi folder)."""
    return [PY_BUNDEL, str(skrip)] if PY_BUNDEL else [cari_uv(), "run", "-q", str(skrip)]


def cari_uv() -> str:
    for c in (os.environ.get("STUDIO_UV"), shutil.which("uv"), str(Path.home() / ".local/bin/uv"), str(Path.home() / ".local/bin/uv.exe"),
              "/opt/homebrew/bin/uv"):
        if c and Path(c).exists():
            return c
    raise RuntimeError("uv belum terpasang. Jalankan installer lagi.")


def cari_node() -> str:
    for c in (shutil.which("node"), "/usr/local/bin/node", "/opt/homebrew/bin/node",
              r"C:\Program Files\nodejs\node.exe"):
        if c and Path(c).exists():
            return c
    raise RuntimeError("Node.js belum terpasang (nodejs.org) — dibutuhkan untuk Motion.")


def proyek_baru(jenis: str) -> Path:
    if KERJA.status == "jalan":  # jangan tinggalkan folder kosong kalau ditolak
        raise RuntimeError("Masih ada proses berjalan. Tunggu selesai atau batalkan dulu.")
    f = DATA / jenis / time.strftime("%Y%m%d-%H%M%S")
    f.mkdir(parents=True, exist_ok=True)
    return f


def penyedia_ai(nilai: str | None) -> str:
    """'langganan' → CLI pilihan di Pengaturan (claude-code / codex / opencode)."""
    p = baca_pengaturan()
    v = (nilai or p["AI"] or "lokal").lower()
    if v == "claude":  # Claude API dihapus (14 Nov 2026) → pakai Lokal
        v = "lokal"
    return p.get("LANGGANAN") or "claude-code" if v == "langganan" else v


CLI_DIR = Path.home() / ".studio-maliki" / "cli"  # CLI dipasang di sini (tanpa sudo)
PAKET_CLI = {"codex": "@openai/codex", "opencode": "opencode-ai", "claude": "@anthropic-ai/claude-code"}
PERINTAH_LOGIN = {"claude": "claude auth login", "codex": "codex login", "opencode": "opencode auth login"}
DOMAIN_BOLEH = ("aistudio.google.com", "ollama.com", "nodejs.org", "platform.openai.com",
                "openrouter.ai", "console.groq.com", "chatgpt.com", "claude.ai", "opencode.ai", "docs.astral.sh")


def cari_cli(nama: str) -> str | None:
    for c in (str(CLI_DIR / "bin" / nama), str(CLI_DIR / f"{nama}.cmd"), shutil.which(nama), str(Path.home() / ".local/bin" / nama), f"/opt/homebrew/bin/{nama}",
              f"/usr/local/bin/{nama}", str(Path.home() / ".npm-global/bin" / nama)):
        if c and Path(c).exists():
            return c
    return None


def voxcpm_terpasang() -> bool:
    hub = Path(os.environ.get("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub" / "models--openbmb--VoxCPM2"
    return any(hub.glob("snapshots/*/model.safetensors"))


def ref_suara() -> Path | None:
    for f in sorted(DATA.glob("suara-referensi.*")):
        return f
    return None


VERSI_APLIKASI = "2.1.0"


def cek_pembaruan(repo: str = "IkhsanFreya/callclip") -> dict:
    """Cek rilis terbaru dari GitHub Releases untuk in-app auto update."""
    import urllib.request
    try:
        url = f"https://api.github.com/repos/{repo}/releases/latest"
        req = urllib.request.Request(url, headers={"User-Agent": "CalClip-App"})
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode())
            tag = data.get("tag_name", "").lstrip("v")
            url_unduh = data.get("html_url", "")
            catatan = data.get("body", "")
            ada_update = bool(tag and tag != VERSI_APLIKASI)
            return {
                "versi_lokal": VERSI_APLIKASI,
                "versi_terbaru": tag or VERSI_APLIKASI,
                "ada_update": ada_update,
                "url_unduh": url_unduh,
                "catatan": catatan[:300],
            }
    except Exception:
        return {"versi_lokal": VERSI_APLIKASI, "versi_terbaru": VERSI_APLIKASI, "ada_update": False}


def pasang_suara() -> dict:
    cmd = [cari_uv(), "run", "-q", str(SUARA / "suara.py"), "--cek"]
    KERJA.jalankan("suara", [(cmd, SUARA)], DATA)
    return {"ok": True}


def status_ai() -> dict:
    """Status nyata tiap jalur AI, untuk panduan bertahap di Pengaturan AI."""
    p = baca_pengaturan()
    out = {"gemini": {"kunci": bool(p.get("GEMINI_API_KEY"))}}
    # Ollama: terpasang? server menyala? model apa saja?
    import urllib.request
    ollama = shutil.which("ollama") or ("/Applications/Ollama.app" if Path("/Applications/Ollama.app").exists() else None)
    model, hidup = [], False
    try:
        with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=1.5) as r:
            model = [m["name"] for m in json.loads(r.read()).get("models", [])]
            hidup = True
    except Exception:  # noqa: BLE001
        pass
    out["openai"] = {"ollama": bool(ollama), "hidup": hidup, "model": model}
    # CLI langganan: terpasang? sudah login?
    cli = {}
    for nama in ("claude", "codex", "opencode"):
        jalur = cari_cli(nama)
        login = False
        email = ""
        auth_method = ""
        if jalur:
            try:
                if nama == "claude":
                    r = subprocess.run([jalur, "auth", "status"], capture_output=True, text=True, timeout=20)
                    try:
                        st = json.loads(r.stdout)
                        login = bool(st.get("loggedIn"))
                        email = st.get("email", "")
                        auth_method = st.get("authMethod", "")
                    except Exception:
                        login = '"loggedIn": true' in r.stdout
                elif nama == "codex":
                    r = subprocess.run([jalur, "login", "status"], capture_output=True, text=True, timeout=20)
                    login = r.returncode == 0 and "not logged" not in (r.stdout + r.stderr).lower()
                else:
                    r = subprocess.run([jalur, "auth", "list"], capture_output=True, text=True, timeout=20)
                    m = re.search(r"(\d+)\s+credentials?", re.sub(r"\x1b\[[0-9;]*m", "", r.stdout))
                    login = r.returncode == 0 and bool(m) and int(m.group(1)) > 0
            except Exception:  # noqa: BLE001
                login = False
        lewat_gemini = nama == "opencode" and bool(jalur) and not login and bool(p.get("GEMINI_API_KEY"))
        cli[nama] = {
            "terpasang": bool(jalur),
            "login": login or lewat_gemini,
            "lewat_gemini": lewat_gemini,
            "email": email,
            "auth_method": auth_method,
        }
    out["cli"] = cli
    out["node"] = bool(shutil.which("npm") or Path("/usr/local/bin/npm").exists())
    return out


def info_hardware() -> dict:
    """Deteksi encoder video terbaik untuk akselerasi ekspor."""
    try:
        sys.path.insert(0, str(KLIP))
        import klip
        enc_nama, _ = klip.deteksi_encoder_hw()
        labels = {
            "h264_nvenc": "NVIDIA NVENC (GPU Super Cepat)",
            "h264_qsv": "Intel QuickSync (iGPU Cepat)",
            "h264_amf": "AMD AMF (GPU Cepat)",
            "libx264": "CPU (Kompatibel 100% Semua Laptop)",
        }
        return {
            "encoder": enc_nama,
            "label": labels.get(enc_nama, enc_nama),
            "is_gpu": enc_nama != "libx264"
        }
    except Exception as e:
        return {"encoder": "libx264", "label": "CPU (Standar)", "is_gpu": False, "galat": str(e)}


def sistem_detail() -> dict:
    """Spesifikasi laptop + status komponen untuk wizard pemasangan."""
    import platform
    info = {"os": platform.system(), "versi": platform.mac_ver()[0] or platform.release(), "arsitektur": platform.machine(),
            "prosesor": platform.processor() or platform.machine(), "ram_gb": 0.0, "disk_gb": 0.0}
    try:
        if sys.platform == "darwin":
            info["ram_gb"] = int(subprocess.run(["sysctl", "-n", "hw.memsize"], capture_output=True, text=True).stdout) / 2 ** 30
            info["prosesor"] = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True).stdout.strip() or info["prosesor"]
        elif os.name == "nt":
            import ctypes

            class Mem(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong), ("ullTotalPhys", ctypes.c_ulonglong),
                            ("ullAvailPhys", ctypes.c_ulonglong), ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong), ("sullAvailExtendedVirtual", ctypes.c_ulonglong)]
            m = Mem(); m.dwLength = ctypes.sizeof(Mem)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))  # type: ignore[attr-defined]
            info["ram_gb"] = m.ullTotalPhys / 2 ** 30
    except Exception:  # noqa: BLE001
        pass
    info["disk_gb"] = shutil.disk_usage(Path.home()).free / 2 ** 30
    npm = shutil.which("node") or ("/usr/local/bin/node" if Path("/usr/local/bin/node").exists() else None)
    info["node"] = subprocess.run([npm, "--version"], capture_output=True, text=True).stdout.strip() if npm else ""
    info["komponen"] = {
        "klip": (DATA / ".siap-klip").exists(),
        "motion": (MOTION / "node_modules" / "remotion").exists(),
        "voxcpm": voxcpm_terpasang(),
    }
    info["wizard_selesai"] = (DATA / ".wizard-selesai").exists()
    return info


def siapkan(komponen: str) -> dict:
    """Pasang/siapkan komponen dari wizard (progres tampil di layar)."""
    if komponen == "klip":
        langkah = [] if PY_BUNDEL else [([cari_uv(), "sync", "--script", str(KLIP / "klip.py")], KLIP)]
        langkah.append((jalankan_skrip(KLIP / "klip.py") + ["--uji-ai", "lokal"], KLIP))

        def setelah(k: Kerja):
            (DATA / ".siap-klip").write_text("ok")
        KERJA.jalankan("pasang", langkah, DATA, setelah)
    elif komponen == "motion":
        npm = shutil.which("npm") or "/usr/local/bin/npm"
        if not Path(npm).exists():
            raise RuntimeError("Node.js belum terpasang. Pasang dari nodejs.org, lalu buka ulang Studio.")
        KERJA.jalankan("pasang", [([npm, "install"], MOTION)], MOTION)
    elif komponen == "voxcpm":
        KERJA.jalankan("pasang", [([cari_uv(), "run", "-q", str(SUARA / "suara.py"), "--cek"], SUARA)], DATA)
    else:
        raise ValueError("Komponen tidak dikenal.")
    return {"ok": True}


def pasang_cli(nama: str) -> dict:
    if nama not in PAKET_CLI:
        raise ValueError("CLI tidak dikenal.")
    npm = shutil.which("npm") or "/usr/local/bin/npm"
    if not Path(npm).exists() and not shutil.which("npm"):
        raise RuntimeError("Node.js belum terpasang. Pasang dari nodejs.org dulu.")
    CLI_DIR.mkdir(parents=True, exist_ok=True)
    KERJA.jalankan("pasang", [([npm, "install", "-g", "--prefix", str(CLI_DIR), PAKET_CLI[nama]], CLI_DIR)], CLI_DIR)
    return {"ok": True}


def buka_login(nama: str) -> dict:
    """Buka Terminal berisi perintah login resmi — pengguna sendiri yang masuk ke akunnya."""
    jalur = cari_cli(nama)
    if not jalur:
        raise ValueError(f"{nama} belum terpasang.")
    if nama not in PERINTAH_LOGIN:
        raise ValueError(f"CLI {nama} tidak dikenal.")
    args = PERINTAH_LOGIN[nama].split()[1:]
    if nama == "codex":
        # `codex login` membuka browser untuk "Sign in with ChatGPT" dan menunggu izin di server lokalnya
        if os.name == "nt":
            subprocess.Popen(["cmd", "/c", "call", jalur, "login"], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            subprocess.Popen([jalur, "login"], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                             start_new_session=True)
        return {"ok": True, "browser": True}
    if sys.platform == "darwin":
        perintah = f'"{jalur}" ' + " ".join(args)
        skrip = f'tell application "Terminal" to do script "{perintah.replace(chr(34), chr(92) + chr(34))}"'
        subprocess.run(["osascript", "-e", skrip, "-e", 'tell application "Terminal" to activate'], check=False)
    elif os.name == "nt":
        subprocess.Popen(["cmd", "/c", "start", f"Login {nama.capitalize()}", "cmd", "/k", "call", jalur, *args])
    else:
        perintah = f'"{jalur}" ' + " ".join(args)
        subprocess.Popen(["x-terminal-emulator", "-e", perintah])
    return {"ok": True}


def uji_ai(penyedia: str) -> dict:
    p = baca_pengaturan()
    env = os.environ.copy()
    env.update({k: v for k, v in p.items() if v})
    env["PYTHONIOENCODING"] = "utf-8"
    nyata = penyedia_ai(penyedia)
    try:
        r = subprocess.run([*jalankan_skrip(KLIP / "klip.py"), "--uji-ai", nyata], capture_output=True, text=True,
                           encoding="utf-8", errors="replace", env=env, timeout=240, cwd=KLIP,
                           creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except subprocess.TimeoutExpired:
        return {"ok": False, "pesan": "Tidak ada jawaban dalam 4 menit."}
    bersih = lambda t: re.sub(r"\x1b\[[0-9;]*m", "", t or "")  # noqa: E731
    r.stdout, r.stderr = bersih(r.stdout), bersih(r.stderr)
    keluaran = (r.stdout or "").strip().splitlines()
    galat = [b for b in (r.stderr or "").splitlines() if b.strip() and not re.search(r"warn|objc\[|AVFAudio|ctranslate2", b, re.I)]
    if r.returncode == 0 and keluaran:
        return {"ok": True, "pesan": keluaran[-1][:200], "penyedia": nyata}
    return {"ok": False, "pesan": (galat[-1] if galat else (keluaran[-1] if keluaran else "Gagal tanpa pesan."))[:400], "penyedia": nyata}


def mulai_klip(d: dict) -> dict:
    sumber = (d.get("sumber") or "").strip()
    if not sumber:
        raise ValueError("Isi link YouTube atau pilih file video dulu.")
    folder = proyek_baru("klip")
    bahasa = d.get("bahasa", "auto")
    cmd = [*jalankan_skrip(KLIP / "klip.py"), sumber, "--keluar", str(folder),
           "--jumlah", str(int(d.get("jumlah", 3))), "--durasi", str(int(d.get("durasi", 30))),
           "--ai", penyedia_ai(d.get("ai")), "--model", d.get("model", "small"),
           "--bahasa", bahasa,
           "--warna", d.get("warna", "#FFB020")]
    cmd.append("--hanya-analisis")
    if d.get("arahan"):
        cmd += ["--arahan", d["arahan"]]
    if d.get("rentang"):
        cmd += ["--rentang", d["rentang"]]
    if d.get("subtitle_file"):
        cmd += ["--subtitle-file", d["subtitle_file"]]
    (folder / "permintaan.json").write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")

    def setelah(k: Kerja):
        k.hasil = muat_proyek("klip", folder.name)

    KERJA.jalankan("klip", [(cmd, KLIP)], folder, setelah)
    return {"proyek": folder.name}


def _folder_klip(nama: str) -> Path:
    f = DATA / "klip" / re.sub(r"[^\w-]", "", nama or "")
    if not (f / "transkrip.json").exists():
        raise ValueError("Proyek tidak ditemukan. Analisis videonya dulu.")
    return f


def kalimat_klip(d: dict) -> dict:
    """Kalimat transkrip yang masuk rentang satu klip (untuk disunting sebelum render)."""
    f = _folder_klip(d.get("nama"))
    klip = next((x for x in json.loads((f / "klip.json").read_text(encoding="utf-8-sig")) if x["no"] == int(d.get("no", 0))), None)
    if not klip:
        raise ValueError("Klip tidak ditemukan.")
    tr = json.loads((f / "transkrip.json").read_text(encoding="utf-8-sig"))
    out = [{"i": i, "mulai": k["mulai"], "teks": " ".join(w["teks"] for w in k.get("kata", [])) or k["teks"]}
           for i, k in enumerate(tr) if k["selesai"] > klip["mulai"] and k["mulai"] < klip["selesai"]]
    return {"kalimat": out}


def simpan_subtitle(d: dict) -> dict:
    """Ganti teks kalimat. Jumlah kata sama -> waktu tiap kata tetap; berbeda -> waktu dibagi rata sepanjang kalimat."""
    f = _folder_klip(d.get("nama"))
    tr = json.loads((f / "transkrip.json").read_text(encoding="utf-8-sig"))
    n = 0
    for x in d.get("kalimat") or []:
        i = int(x.get("i", -1))
        if not 0 <= i < len(tr):
            continue
        kata_baru = str(x.get("teks", "")).split()
        k = tr[i]
        lama = k.get("kata") or []
        if [w["teks"] for w in lama] == kata_baru:
            continue
        if kata_baru and len(kata_baru) == len(lama):
            for w, t in zip(lama, kata_baru):
                w["teks"] = t
        elif kata_baru:
            a, b = (lama[0]["mulai"], lama[-1]["selesai"]) if lama else (k["mulai"], k["selesai"])
            dur = max(b - a, 0.05) / len(kata_baru)
            k["kata"] = [{"mulai": round(a + j * dur, 3), "selesai": round(a + (j + 1) * dur, 3), "teks": t}
                         for j, t in enumerate(kata_baru)]
        else:
            k["kata"] = []
        k["teks"] = " ".join(kata_baru)
        n += 1
    if n:
        (f / "transkrip.json").write_text(json.dumps(tr, ensure_ascii=False), encoding="utf-8")
    return {"diubah": n}


def mulai_render_klip(d: dict) -> dict:
    nama = re.sub(r"[^\w-]", "", d.get("nama", ""))
    folder = DATA / "klip" / nama
    if not (folder / "klip.json").exists():
        raise ValueError("Proyek tidak ditemukan. Analisis videonya dulu.")
    pilih = [int(x) for x in d.get("pilih", [])]
    if not pilih:
        raise ValueError("Centang minimal satu klip untuk dirender.")
    gaya = d.get("gaya") or {}
    for k in ("musik", "sfx"):  # berkas musik di folder aset Studio atau jalur langsung
        if gaya.get(k):
            raw = Path(gaya[k])
            if raw.exists():
                gaya[k] = str(raw.resolve())
            else:
                p = (DATA / "aset" / raw.name)
                gaya[k] = str(p) if p.exists() else ""
    gaya["broll_file"] = [str(DATA / "aset" / Path(x).name) for x in (gaya.get("broll_file") or [])
                          if (DATA / "aset" / Path(x).name).exists()]
    # judul banner & rentang waktu (trim) hasil suntingan pengguna
    if d.get("klip_edit") or d.get("judul"):
        daftar = json.loads((folder / "klip.json").read_text(encoding="utf-8-sig"))
        edits = d.get("klip_edit") or {}
        juduls = d.get("judul") or {}
        for x in daftar:
            s_no = str(x.get("no", ""))
            if s_no in juduls:
                x["judul_banner"] = juduls[s_no]
            if s_no in edits:
                ed = edits[s_no]
                if "mulai" in ed:
                    x["mulai"] = round(float(ed["mulai"]), 2)
                if "selesai" in ed:
                    x["selesai"] = round(float(ed["selesai"]), 2)
                if "judul" in ed:
                    x["judul_banner"] = ed["judul"]
        (folder / "klip.json").write_text(json.dumps(daftar, ensure_ascii=False, indent=2), encoding="utf-8")
    (folder / "gaya-permintaan.json").write_text(json.dumps(gaya, ensure_ascii=False), encoding="utf-8")
    cmd = [*jalankan_skrip(KLIP / "klip.py"), "--render", "--keluar", str(folder),
           "--pilih", ",".join(map(str, pilih)), "--gaya", str(folder / "gaya-permintaan.json")]

    def setelah(k: Kerja):
        k.hasil = muat_proyek("klip", nama)

    KERJA.jalankan("render", [(cmd, KLIP)], folder, setelah)
    return {"proyek": nama}


def buat_naskah_lokal(topik: str, gaya: str = "neon") -> dict:
    t_clean = topik.strip()
    low = t_clean.lower()

    # 1. Game / Gaming / PC
    if any(k in low for k in ("game", "gaming", "pc", "mabar", "esport")):
        return {
            "judul": "3 Game PC Terpopuler",
            "gaya": gaya,
            "handle": "calclip.in",
            "adegan": [
                {"judul": "3 Game PC Terpopuler", "teks": "Ini dia tiga game PC paling ramai dan bikin ketagihan di Indonesia saat ini!", "kunci": ["game", "indonesia"], "ikon": "🎮"},
                {"judul": "1. Valorant & Point Blank", "teks": "Game tembak-menembak taktis legendaris dengan jutaan pemain aktif setiap harinya.", "kunci": ["taktis", "pemain"], "ikon": "🎯"},
                {"judul": "2. Dota 2 & Steam", "teks": "Komunitas esports terbesar dengan strategi pertempuran tim tiada tanding.", "kunci": ["esports", "komunitas"], "ikon": "⚡"},
                {"judul": "3. GTA V Roleplay", "teks": "Server kota virtual Indonesia yang selalu seru, viral, dan penuh drama tak terduga.", "kunci": ["virtual", "viral"], "ikon": "🚀"},
                {"judul": "Apa Game Favoritmu?", "teks": "Tulis game jagoanmu di kolom komentar dan bagikan ke teman mabar kamu sekarang!", "kunci": ["komentar", "bagikan"], "ikon": "🔥"}
            ]
        }

    # 2. Sains / Semesta / Fisika
    if any(k in low for k in ("sains", "alam", "semesta", "fisika", "antariksa")):
        return {
            "judul": "Fakta Sains Menakjubkan",
            "gaya": gaya,
            "handle": "calclip.in",
            "adegan": [
                {"judul": "Fakta Sains Menakjubkan", "teks": "Pernahkah kamu membayangkan keajaiban luar biasa yang ada di alam semesta kita?", "kunci": ["sains", "semesta"], "ikon": "💡"},
                {"judul": "1. Kecepatan Cahaya", "teks": "Cahaya mampu mengitari bumi hingga tujuh setengah kali hanya dalam satu detik.", "kunci": ["cahaya", "bumi"], "ikon": "⚡"},
                {"judul": "2. Misteri Laut Dalam", "teks": "Lebih dari delapan puluh persen kedalaman lautan bumi belum pernah terjamah manusia.", "kunci": ["lautan", "misteri"], "ikon": "🌊"},
                {"judul": "3. Waktu di Antariksa", "teks": "Gravitasi masif dapat memperlambat jalannya waktu nyata sesuai teori relativitas.", "kunci": ["gravitasi", "waktu"], "ikon": "🪐"},
                {"judul": "Keren Banget Kan?", "teks": "Simpan video ini sekarang dan ikuti untuk fakta sains luar biasa berikutnya!", "kunci": ["simpan", "sains"], "ikon": "🔥"}
            ]
        }

    # 3. Produktivitas / Pagi / Kebiasaan
    if any(k in low for k in ("pagi", "produktivitas", "kebiasaan", "fokus", "rutinitas")):
        return {
            "judul": "3 Tips Produktivitas Pagi",
            "gaya": gaya,
            "handle": "calclip.in",
            "adegan": [
                {"judul": "3 Tips Produktivitas Pagi", "teks": "Lakukan tiga kebiasaan ini agar harimu penuh energi dan fokus sepanjang hari.", "kunci": ["kebiasaan", "fokus"], "ikon": "⏰"},
                {"judul": "1. Jangan Sentuh Ponsel", "teks": "Hindari membuka ponsel selama tiga puluh menit pertama setelah kamu bangun tidur.", "kunci": ["hindari", "ponsel"], "ikon": "📱"},
                {"judul": "2. Hidrasi Segelas Air", "teks": "Minum air putih hangat langsung merehidrasi organ tubuh dan mengaktifkan energimu.", "kunci": ["air", "energi"], "ikon": "💧"},
                {"judul": "3. Sinar Matahari 5 Menit", "teks": "Dapatkan paparan sinar matahari pagi untuk mengunci ritme sirkadian dan konsentrasi.", "kunci": ["matahari", "konsentrasi"], "ikon": "☀️"},
                {"judul": "Mulai Besok Pagi!", "teks": "Simpan video ini sekarang dan buktikan hasilnya di pagi harimu besok!", "kunci": ["simpan", "sekarang"], "ikon": "🔥"}
            ]
        }

    # 4. Komunikasi / Psikologi
    if any(k in low for k in ("komunikasi", "psikologi", "bicara", "hipnotik", "ngobrol")):
        return {
            "judul": "Trik Komunikasi Hipnotik",
            "gaya": gaya,
            "handle": "calclip.in",
            "adegan": [
                {"judul": "Trik Komunikasi Hipnotik", "teks": "Gunakan tiga trik psikologi ini agar perkataanmu selalu didengarkan dan diingat.", "kunci": ["psikologi", "didengarkan"], "ikon": "💡"},
                {"judul": "1. Sebut Nama Lawan Bicara", "teks": "Menyebut nama seseorang secara natural langsung mengaktifkan rasa percaya diri mereka.", "kunci": ["percaya", "bicara"], "ikon": "🧠"},
                {"judul": "2. Jeda Dua Detik", "teks": "Berikan jeda sebelum menjawab untuk menunjukkan wibawa dan pemikiran yang matang.", "kunci": ["jeda", "matang"], "ikon": "⏳"},
                {"judul": "3. Samakan Tempo Bicara", "teks": "Secara halus ikuti ritme bicara lawan bicaramu untuk membangun koneksi instan.", "kunci": ["ritme", "koneksi"], "ikon": "⚡"},
                {"judul": "Coba Hari Ini!", "teks": "Simpan tips ini sekarang dan praktikkan langsung di obrolanmu hari ini!", "kunci": ["simpan", "sekarang"], "ikon": "🔥"}
            ]
        }

    # 5. Finansial / Uang
    if any(k in low for k in ("finansial", "uang", "investasi", "gaji", "kaya", "usia 20")):
        return {
            "judul": "Mindset Finansial Cerdas",
            "gaya": gaya,
            "handle": "calclip.in",
            "adegan": [
                {"judul": "Mindset Finansial Cerdas", "teks": "Hindari jebakan keuangan ini sebelum menyesal di kemudian hari!", "kunci": ["keuangan", "cerdas"], "ikon": "💰"},
                {"judul": "1. Stop Utang Konsumtif", "teks": "Jangan membeli barang mahal hanya demi gengsi semu di media sosial.", "kunci": ["gengsi", "utang"], "ikon": "⚠️"},
                {"judul": "2. Bangun Dana Darurat", "teks": "Amankan tabungan minimal tiga sampai enam bulan pengeluaran untuk proteksi hidupmu.", "kunci": ["tabungan", "darurat"], "ikon": "🛡️"},
                {"judul": "3. Upgrade Skill Berharga", "teks": "Investasi ilmu dan keahlian adalah aset terbaik yang terus menghasilkan nilai tinggi.", "kunci": ["investasi", "keahlian"], "ikon": "📈"},
                {"judul": "Mulai Amankan Masa Depan!", "teks": "Simpan video ini sekarang dan mulailah kelola keuanganmu dengan bijak!", "kunci": ["simpan", "bijak"], "ikon": "🔥"}
            ]
        }

    # 6. Fallback cerdas untuk topik umum
    kata = [k for k in re.sub(r"[.,?!]+", "", t_clean).split() if k]
    judul_ringkas = " ".join(kata[:4]).title() if kata else "Tips Terpenting"
    kunci_awal = kata[0] if kata else "rahasia"
    return {
        "judul": judul_ringkas,
        "gaya": gaya,
        "handle": "calclip.in",
        "adegan": [
            {"judul": f"Rahasia {judul_ringkas}", "teks": f"Pernah gak sih kamu memikirkan hal paling penting seputar {t_clean}?", "kunci": [kunci_awal, "rahasia"], "ikon": "💡"},
            {"judul": "1. Pondasi Paling Utama", "teks": f"Langkah pertama yang paling menentukan adalah memahami inti dasar dari {t_clean}.", "kunci": ["dasar", "menentukan"], "ikon": "⚡"},
            {"judul": "2. Strategi Eksekusi Nyata", "teks": "Kuncinya bukan sekadar teori, melainkan konsistensi aksi kecil yang terus diulang.", "kunci": ["konsistensi", "aksi"], "ikon": "🎯"},
            {"judul": "3. Hasil Yang Nyata", "teks": "Saat kamu fokus dan disiplin, kemajuan besar akan mulai terlihat dalam waktu singkat.", "kunci": ["kemajuan", "disiplin"], "ikon": "🚀"},
            {"judul": "Simpan & Terapkan!", "teks": "Simpan video ini sekarang dan bagikan ke temanmu yang butuh info ini!", "kunci": ["simpan", "sekarang"], "ikon": "🔥"}
        ]
    }


def mulai_motion(d: dict) -> dict:
    topik = (d.get("topik") or "").strip()
    naskah_teks = (d.get("naskah") or "").strip()
    if not topik and not naskah_teks:
        raise ValueError("Isi topik, atau tempel naskah JSON.")
    ai = penyedia_ai(d.get("ai"))
    if not naskah_teks and ai == "lokal":
        naskah_teks = json.dumps(buat_naskah_lokal(topik, d.get("gaya", "neon")), ensure_ascii=False)
    node = cari_node()
    folder = proyek_baru("motion")
    nama = folder.name
    if not (MOTION / "node_modules").exists():
        langkah = [([shutil.which("npm") or "npm", "install", "--silent"], MOTION)]
    else:
        langkah = []
    gaya = d.get("gaya", "garis")
    if naskah_teks:
        data = json.loads(naskah_teks)
        data["gaya"] = gaya
        (MOTION / "naskah").mkdir(exist_ok=True)
        (MOTION / "naskah" / f"{nama}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        langkah.append(([node, "naskah.mjs", topik, f"--ai={ai}", f"--gaya={gaya}", f"--nama={nama}"], MOTION))
    if d.get("gambar") and ai != "lokal":
        # AI menggambar objek SVG per adegan (gagal → video tetap jadi dengan emoji)
        langkah.append(([node, "gambar.mjs", f"naskah/{nama}.json", f"--ai={ai}"], MOTION))
    p = baca_pengaturan()
    suara_id = d.get("suara_id") or p.get("SUARA_ID") or "id-ID-GadisNeural"
    perintah = [node, "buat.mjs", f"naskah/{nama}.json", f"--gaya={gaya}", f"--suara-id={suara_id}", f"--suara-mac={p.get('SUARA_MAC', 'Damayanti')}"]
    if p.get("SUARA") == "voxcpm":
        if not voxcpm_terpasang():
            raise ValueError("Suara AI (VoxCPM) belum dipasang. Buka Pengaturan AI → Suara narator → Pasang suara AI.")
        if p.get("VOXCPM_MODE") == "clone" and not ref_suara():
            # tidak ada suara bawaan siapa pun: mode clone WAJIB memakai rekaman pengguna sendiri (dengan izin)
            raise ValueError("Mode \"Clone suaraku\" butuh rekaman suaramu sendiri. Buka Pengaturan AI → Suara narator, "
                             "centang pernyataan izin, lalu pilih rekaman 10–20 detik. Atau pilih warna suara Netral.")
        perintah.append("--suara=voxcpm")
    langkah.append((perintah, MOTION))

    def setelah(k: Kerja):
        for f in (MOTION / "hasil").glob(f"{nama}-*.mp4"):
            shutil.move(str(f), folder / "video.mp4")
        n = MOTION / "naskah" / f"{nama}.json"
        if n.exists():
            shutil.copy(n, folder / "naskah.json")
        k.hasil = muat_proyek("motion", nama)

    KERJA.jalankan("motion", langkah, folder, setelah)
    return {"proyek": nama, "id": KERJA.id}


def muat_proyek(jenis: str, nama: str) -> dict:
    f = DATA / jenis / nama
    out = {"jenis": jenis, "nama": nama}
    for berkas in ("klip.json", "info.json", "permintaan.json", "naskah.json", "transkrip.json"):
        p = f / berkas
        if p.exists():
            out[berkas.split(".")[0]] = json.loads(p.read_text(encoding="utf-8-sig"))
    if (f / "video.mp4").exists():
        out["video"] = f"/stream/{jenis}/{nama}/video"
    if (f / "gambar.jpg").exists():
        out["gambar"] = f"/berkas/{jenis}/{nama}/gambar.jpg"
    if (f / "gaya.json").exists():
        out["gaya"] = json.loads((f / "gaya.json").read_text(encoding="utf-8-sig"))
    pr = (out.get("info") or {}).get("pratinjau")
    if pr and (f / pr).exists():
        stem = Path(pr).stem if pr.endswith(".mp4") else pr
        out["sumber"] = f"/stream/{jenis}/{nama}/{stem}"
    elif (f / "sumber.mp4").exists():
        out["sumber"] = f"/stream/{jenis}/{nama}/sumber"
    return out


def jejak_klip(nama: str, no: int) -> dict:
    """Jejak wajah satu klip (detik relatif, posisi-x 0..1) untuk pratinjau Studio — sama persis dengan yang dipakai render."""
    folder = DATA / "klip" / nama
    daftar = json.loads((folder / "klip.json").read_text(encoding="utf-8-sig"))
    d = next((x for x in daftar if x.get("no") == no), None)
    if not d:
        return {"jejak": []}
    if d.get("jejak"):
        return {"jejak": d["jejak"]}
    r = subprocess.run([*jalankan_skrip(KLIP / "klip.py"), "--keluar", str(folder), "--jejak", str(no)],
                       capture_output=True, text=True, cwd=KLIP, timeout=300,
                       creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    try:
        return {"jejak": json.loads(r.stdout.strip().splitlines()[-1])}
    except Exception:  # noqa: BLE001
        return {"jejak": [], "galat": (r.stderr or "")[-300:]}


def deteksi_facecam_klip(d: dict) -> dict:
    """Deteksi otomatis posisi webcam streamer untuk layout Wajah Atas + Gameplay & PiP."""
    nama = d.get("nama")
    folder = DATA / "klip" / nama if nama else None
    if not folder or not folder.exists():
        proyek = sorted((DATA / "klip").glob("*"), reverse=True) if (DATA / "klip").exists() else []
        if proyek:
            folder = proyek[0]
    if not folder or not (folder / "info.json").exists():
        return {"ada": False, "x": 0.10, "y": 0.86, "zoom": 2.4, "sudut": "kiri_bawah"}
    try:
        info = json.loads((folder / "info.json").read_text(encoding="utf-8"))
        file = Path(info.get("sumber", ""))
        if not file.exists():
            file = folder / info.get("pratinjau", "sumber.mp4")
        w, h = info.get("lebar", 1920), info.get("tinggi", 1080)
        no = int(d.get("no", 1))
        daftar = json.loads((folder / "klip.json").read_text(encoding="utf-8-sig")) if (folder / "klip.json").exists() else []
        klip = next((x for x in daftar if x.get("no") == no), (daftar[0] if daftar else None))
        a = klip["mulai"] if klip else 0.0
        b = klip["selesai"] if klip else min(8.0, float(info.get("durasi", 10.0)))
        import sys
        if str(KLIP) not in sys.path:
            sys.path.insert(0, str(KLIP))
        from klip import deteksi_streamer_facecam
        res = deteksi_streamer_facecam(file, a, b, w, h)
        return res
    except Exception as e:
        return {"ada": False, "galat": str(e), "x": 0.10, "y": 0.86, "zoom": 2.4, "sudut": "kiri_bawah"}


def deteksi_podcast_klip(d: dict) -> dict:
    """Deteksi otomatis posisi 2 pembicara podcast (kiri & kanan) untuk mode 1 Layar Penuh & Split."""
    nama = d.get("nama")
    folder = DATA / "klip" / nama if nama else None
    if not folder or not folder.exists():
        proyek = sorted((DATA / "klip").glob("*"), reverse=True) if (DATA / "klip").exists() else []
        if proyek:
            folder = proyek[0]
    if not folder or not (folder / "info.json").exists():
        return {"ada": False, "p1_x": 0.28, "p2_x": 0.72, "zoom": 1.30}
    try:
        info = json.loads((folder / "info.json").read_text(encoding="utf-8"))
        file = Path(info.get("sumber", ""))
        if not file.exists():
            file = folder / info.get("pratinjau", "sumber.mp4")
        w, h = info.get("lebar", 1920), info.get("tinggi", 1080)
        no = int(d.get("no", 1))
        daftar = json.loads((folder / "klip.json").read_text(encoding="utf-8-sig")) if (folder / "klip.json").exists() else []
        klip = next((x for x in daftar if x.get("no") == no), (daftar[0] if daftar else None))
        a = klip["mulai"] if klip else 0.0
        b = klip["selesai"] if klip else min(6.0, float(info.get("durasi", 6.0)))
        # Batasi sampel deteksi awal maksimal 6 detik untuk respon instan (< 1 detik di semua CPU)
        b_cepat = min(a + 6.0, b)
        import sys
        if str(KLIP) not in sys.path:
            sys.path.insert(0, str(KLIP))
        from klip import jejak_podcast_cerdas
        posisi_dua, _ = jejak_podcast_cerdas(file, a, b_cepat, w, h)
        if posisi_dua and len(posisi_dua) >= 2:
            return {
                "ada": True,
                "p1_x": round(posisi_dua[0]["x"], 3),
                "p2_x": round(posisi_dua[1]["x"], 3),
                "zoom": 1.30,
            }
        return {"ada": False, "p1_x": 0.28, "p2_x": 0.72, "zoom": 1.30}
    except Exception as e:
        return {"ada": False, "galat": str(e), "p1_x": 0.28, "p2_x": 0.72, "zoom": 1.30}


def daftar_proyek() -> list[dict]:
    out = []
    for jenis in ("klip", "motion"):
        for f in sorted((DATA / jenis).glob("*"), reverse=True) if (DATA / jenis).exists() else []:
            p = muat_proyek(jenis, f.name)
            if (jenis == "klip" and "info" not in p and "klip" not in p) or (jenis == "motion" and "video" not in p):
                continue  # proyek gagal/terputus tidak ditampilkan (berkasnya tetap ada di disk)
            judul = (p.get("info") or {}).get("judul") or (p.get("naskah") or {}).get("judul") or \
                (p.get("permintaan") or {}).get("sumber") or (p.get("permintaan") or {}).get("topik") or f.name
            jumlah = len(p.get("klip") or []) or (1 if p.get("video") else 0)
            out.append({"jenis": jenis, "nama": f.name, "judul": judul, "jumlah": jumlah,
                        "gambar": p.get("gambar", ""), "durasi": (p.get("info") or {}).get("durasi"),
                        "ai": (p.get("info") or {}).get("ai", "")})
    return sorted(out, key=lambda x: x["nama"], reverse=True)[:50]


def cek_sistem() -> dict:
    return {"uv": bool(PY_BUNDEL or os.environ.get("STUDIO_UV") or shutil.which("uv") or (Path.home() / ".local/bin/uv").exists()),
            "node": bool(shutil.which("node") or Path("/usr/local/bin/node").exists()),
            "mac": sys.platform == "darwin", "win": os.name == "nt", "data": str(DATA),
            "cli": {n: bool(cari_cli(n)) for n in ("claude", "codex", "opencode")},
            "voxcpm": voxcpm_terpasang(), "referensi": ref_suara().name if ref_suara() else ""}


# ── HTTP ────────────────────────────────────────────────────────────────────
class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    def do_HEAD(self):
        self.do_GET()

    def _json(self, obj, kode=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(kode)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(b)

    def _file(self, p: Path):
        if not p.is_file():
            return self._json({"galat": "tidak ditemukan"}, 404)
        ukuran = p.stat().st_size
        tipe = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
        rng = self.headers.get("Range")
        mulai, akhir = 0, ukuran - 1
        if rng and (m := re.match(r"bytes=(\d*)-(\d*)", rng)):
            mulai = int(m.group(1) or 0)
            akhir = int(m.group(2)) if m.group(2) else ukuran - 1
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {mulai}-{akhir}/{ukuran}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", tipe)
        qs = parse_qs(urlparse(self.path).query)
        if "unduh" in qs:
            nama_unduh = qs.get("nama", [p.name])[0]
            self.send_header("Content-Disposition", f'attachment; filename="{nama_unduh}"')
        else:
            self.send_header("Content-Disposition", "inline")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Length", str(akhir - mulai + 1))
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        if self.command == "HEAD":
            return
        with open(p, "rb") as fh:
            fh.seek(mulai)
            sisa = akhir - mulai + 1
            while sisa > 0 and (blok := fh.read(min(1 << 16, sisa))):
                self.wfile.write(blok)
                sisa -= len(blok)
        try:
            self.wfile.flush()
        except Exception:
            pass

    def _body(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"{}")

    def _asal_aman(self) -> bool:
        # 1. Lindungi dari DNS Rebinding: pastikan Host header adalah 127.0.0.1 / localhost
        host = (self.headers.get("Host") or "").split(":")[0].lower()
        if host not in ("127.0.0.1", "localhost", ""):
            return False
        # 2. Lindungi dari CSRF: tolak permintaan lintas situs jika Origin/Referer berasal dari luar
        asal = self.headers.get("Origin")
        if asal and asal not in (f"http://127.0.0.1:{PORT}", f"http://localhost:{PORT}") and not asal.startswith("http://localhost:"):
            return False
        ref = self.headers.get("Referer")
        if ref and not any(ref.startswith(h) for h in (f"http://127.0.0.1:{PORT}", f"http://localhost:{PORT}", "http://localhost:")):
            return False
        return True

    def do_GET(self):
        u = urlparse(self.path)
        jalur = unquote(u.path)
        try:
            if jalur.startswith("/api/") and not self._asal_aman():
                return self._json({"galat": "akses ditolak"}, 403)
            if jalur in ("/", "/index.html"):
                if (DIST / "index.html").is_file():
                    return self._file(DIST / "index.html")
                return self._file(AKAR / "index.html")
            # Berkas statis dari hasil build frontend (dist)
            if DIST.exists() and not jalur.startswith("/api/"):
                berkas_dist = (DIST / jalur.lstrip("/")).resolve()
                if berkas_dist.is_file() and DIST in berkas_dist.parents:
                    return self._file(berkas_dist)
            if jalur == "/api/status":
                return self._json(KERJA.ringkas())
            if jalur == "/api/cek-pembaruan":
                return self._json(cek_pembaruan())
            if jalur == "/api/pengaturan":
                return self._json({"pengaturan": samarkan(baca_pengaturan()), "sistem": cek_sistem()})
            if jalur == "/api/model-opencode":
                # daftar model dari OpenCode milik pengguna (`opencode models`)
                cli = cari_cli("opencode")
                if not cli:
                    return self._json({"model": []})
                try:
                    r = subprocess.run([cli, "models"], capture_output=True, text=True, timeout=30)
                    daftar = [b.strip() for b in r.stdout.splitlines() if re.match(r"^[\w.-]+/[\w.:@/-]+$", b.strip())]
                except Exception:  # noqa: BLE001
                    daftar = []
                return self._json({"model": daftar[:300]})
            if jalur == "/api/info-hardware":
                return self._json(info_hardware())
            if jalur == "/api/sistem-detail":
                return self._json(sistem_detail())
            if jalur == "/api/status-ai":
                return self._json(status_ai())
            if jalur == "/api/proyek":
                return self._json(daftar_proyek())
            if m := re.match(r"^/api/jejak/([\w-]+)/(\d+)$", jalur):
                return self._json(jejak_klip(m.group(1), int(m.group(2))))
            if m := re.match(r"^/api/proyek/(klip|motion)/([\w-]+)$", jalur):
                return self._json(muat_proyek(m.group(1), m.group(2)))
            if m := re.match(r"^/(?:stream|berkas)/(klip|motion)/([\w-]*)/([\w.-]+)$", jalur):
                jenis = m.group(1)
                proy = m.group(2)
                if not proy:
                    daftar_p = sorted((DATA / jenis).glob("*"), reverse=True) if (DATA / jenis).exists() else []
                    proy = daftar_p[0].name if daftar_p else ""
                nama_file = m.group(3)
                folder = DATA / jenis / proy
                p = folder / nama_file
                if not p.is_file() and not nama_file.endswith(".mp4"):
                    p = folder / f"{nama_file}.mp4"
                if not p.is_file() and (folder / ".kerja" / nama_file).is_file():
                    p = folder / ".kerja" / nama_file
                if not p.is_file() and (folder / ".kerja" / f"{nama_file}.mp4").is_file():
                    p = folder / ".kerja" / f"{nama_file}.mp4"
                return self._file(p)
            if m := re.match(r"^/font/([\w.-]+\.ttf)$", jalur):  # font preset klip (OFL) untuk pratinjau
                return self._file(KLIP / "font" / m.group(1))
            if jalur.startswith("/aset/"):
                p = (AKAR / jalur.lstrip("/")).resolve()
                if AKAR in p.parents:
                    return self._file(p)
            self._json({"galat": "tidak ditemukan"}, 404)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_POST(self):
        if not self._asal_aman():
            return self._json({"galat": "asal tidak diizinkan"}, 403)
        jalur = urlparse(self.path).path
        try:
            if jalur == "/api/pasang-suara":
                return self._json(pasang_suara())
            if jalur == "/api/referensi-suara":
                # rekaman suara untuk clone — hanya suara sendiri / yang sudah memberi izin (dicentang di UI)
                if self.headers.get("X-Izin") != "ya":
                    return self._json({"galat": "Centang dulu pernyataan izin suara."}, 400)
                eks = re.sub(r"[^a-z0-9]", "", Path(self.headers.get("X-Nama-File", "a.wav")).suffix.lower())[:5] or "wav"
                if eks not in ("wav", "mp3", "m4a", "flac", "ogg"):
                    return self._json({"galat": "Format rekaman harus wav/mp3/m4a/flac/ogg."}, 400)
                for lama in DATA.glob("suara-referensi.*"):
                    lama.unlink()
                n = int(self.headers.get("Content-Length") or 0)
                if n > 50 * 1024 * 1024:
                    return self._json({"galat": "Rekaman terlalu besar (maks 50 MB, cukup 10–20 detik)."}, 400)
                (DATA / f"suara-referensi.{eks}").write_bytes(self.rfile.read(n))
                return self._json({"ok": True})
            if jalur == "/api/unggah":
                nama = re.sub(r"[^\w.-]", "_", self.headers.get("X-Nama-File", "video.mp4"))
                tujuan = DATA / ("aset" if self.headers.get("X-Jenis") == "aset" else "unggahan")
                tujuan.mkdir(parents=True, exist_ok=True)
                p = tujuan / nama
                n = int(self.headers.get("Content-Length") or 0)
                with open(p, "wb") as fh:
                    while n > 0 and (blok := self.rfile.read(min(1 << 20, n))):
                        fh.write(blok)
                        n -= len(blok)
                return self._json({"jalur": str(p)})
            d = self._body()
            if jalur == "/api/pengaturan":
                simpan_pengaturan(d)
                return self._json({"ok": True, "pengaturan": samarkan(baca_pengaturan())})
            if jalur == "/api/siapkan":
                return self._json(siapkan(d.get("komponen", "")))
            if jalur == "/api/wizard-selesai":
                (DATA / ".wizard-selesai").write_text("ok")
                return self._json({"ok": True})
            if jalur == "/api/uji-ai":
                return self._json(uji_ai(d.get("penyedia", "")))
            if jalur == "/api/pasang-cli":
                return self._json(pasang_cli(d.get("nama", "")))
            if jalur == "/api/login-cli":
                return self._json(buka_login(d.get("nama", "")))
            if jalur == "/api/ollama-tarik":
                model = re.sub(r"[^\w.:/-]", "", d.get("model", "gemma3:4b"))
                ollama = shutil.which("ollama") or next((c for c in ("/usr/local/bin/ollama", "/Applications/Ollama.app/Contents/Resources/ollama",
                    str(Path.home() / "AppData/Local/Programs/Ollama/ollama.exe")) if Path(c).exists()), "ollama")
                KERJA.jalankan("pasang", [([ollama, "pull", model], DATA)], DATA)
                return self._json({"ok": True})
            if jalur == "/api/buka-url":
                from urllib.parse import urlparse as _u
                url = d.get("url", "")
                if _u(url).scheme == "https" and _u(url).hostname in DOMAIN_BOLEH:
                    webbrowser.open(url)
                    return self._json({"ok": True})
                return self._json({"galat": "Alamat tidak diizinkan."}, 400)
            if jalur == "/api/klip-kalimat":
                return self._json(kalimat_klip(d))
            if jalur == "/api/klip-subtitle":
                return self._json(simpan_subtitle(d))
            if jalur == "/api/klip-render":
                return self._json(mulai_render_klip(d))
            if jalur == "/api/deteksi-facecam":
                return self._json(deteksi_facecam_klip(d))
            if jalur == "/api/deteksi-podcast":
                return self._json(deteksi_podcast_klip(d))
            if jalur == "/api/hapus-proyek":
                f = (DATA / d.get("jenis", "") / re.sub(r"[^\w-]", "", d.get("nama", ""))).resolve()
                if f.is_dir() and DATA.resolve() in f.parents and f.parent.name in ("klip", "motion"):
                    shutil.rmtree(f)
                return self._json({"ok": True})
            if jalur == "/api/klip":
                return self._json(mulai_klip(d))
            if jalur == "/api/motion":
                return self._json(mulai_motion(d))
            if jalur == "/api/unduh":
                f = (DATA / d.get("jenis", "") / d.get("nama", "") / d.get("file", "")).resolve()
                if not f.is_file() or DATA.resolve() not in f.parents:
                    return self._json({"galat": "berkas tidak ditemukan"}, 404)
                tujuan = Path.home() / "Downloads" / f"{d.get('nama')}-{f.name}"
                shutil.copy(f, tujuan)
                return self._json({"jalur": str(tujuan)})
            if jalur == "/api/matikan":
                KERJA.batal()
                threading.Timer(0.3, lambda: os._exit(0)).start()
                return self._json({"ok": True})
            if jalur == "/api/batal":
                KERJA.batal()
                return self._json({"ok": True})
            if jalur == "/api/buka-folder":
                f = DATA / d.get("jenis", "") / d.get("nama", "")
                if f.exists() and DATA in f.resolve().parents:
                    buka_folder(f)
                return self._json({"ok": True})
            self._json({"galat": "tidak ditemukan"}, 404)
        except (ValueError, RuntimeError, json.JSONDecodeError) as e:
            self._json({"galat": str(e)}, 400)


def buka_folder(f: Path) -> None:
    if sys.platform == "darwin":
        subprocess.run(["open", str(f)])
    elif os.name == "nt":
        os.startfile(str(f))  # type: ignore[attr-defined]
    else:
        subprocess.run(["xdg-open", str(f)])


class ServerStudio(ThreadingHTTPServer):
    """Di Windows, SO_REUSEADDR membuat dua program bisa memakai port yang sama (Studio mengira port kosong,
    padahal permintaan masuk ke aplikasi lain). Pakai SO_EXCLUSIVEADDRUSE agar port yang terpakai benar-benar ditolak."""
    allow_reuse_address = os.name != "nt"

    def server_bind(self):
        import socket
        if os.name == "nt" and hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def server_hidup(url: str) -> bool:
    import urllib.request
    try:
        with urllib.request.urlopen(url + "/api/status", timeout=1) as r:  # hanya Studio Maliki yang dianggap
            d = json.loads(r.read().decode("utf-8", "replace") or "null")
            return isinstance(d, dict) and {"jenis", "status", "log"} <= d.keys()
    except Exception:  # noqa: BLE001
        return False


def main():
    global PORT
    DATA.mkdir(parents=True, exist_ok=True)
    if os.name == "nt":
        # Lindungi WebView2 dari crash saat lonjakan beban GPU encoder NVENC
        os.environ["WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS"] = "--disable-gpu-watchdog --disable-gpu-process-crash-limit"
    # Port 8787 bisa dipakai aplikasi lain (mis. server pengembangan). Cari Studio yang sudah jalan,
    # kalau tidak ada, pakai port kosong pertama dari 8787–8806.
    sudah, srv = False, None
    for p in range(PORT, PORT + 20):
        url = f"http://127.0.0.1:{p}"
        if server_hidup(url):
            PORT, sudah = p, True
            break
        try:
            srv = ServerStudio(("127.0.0.1", p), H)
            PORT = p
            break
        except OSError:
            print(f"Port {p} sedang dipakai aplikasi lain, coba port berikutnya.")
    url = f"http://127.0.0.1:{PORT}"
    if not sudah:
        if srv is None:
            raise SystemExit("Tidak ada port kosong di 8787–8806. Tutup aplikasi lain lalu buka Studio lagi.")
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        print(f"CalClip.IN Backend jalan di {url}")
    if "--tanpa-buka" in sys.argv:
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            return
    if "--browser" in sys.argv:
        webbrowser.open(url)
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            return
    # Jendela aplikasi native (WebKit di macOS, WebView2 di Windows). Tutup jendela = mesin berhenti.
    try:
        import webview
    except Exception as e:  # noqa: BLE001
        print(f"Jendela native tidak tersedia ({e}); membuka browser.")
        webbrowser.open(url)
        while True:
            time.sleep(3600)

    class Jembatan:
        def unduh(self, nama: str, isi: str) -> str:
            tujuan = Path.home() / "Downloads" / nama
            tujuan.write_text(isi, encoding="utf-8")
            return str(tujuan)

    if sys.platform == "darwin":
        # Nama & ikon di menu bar/Dock: "CalClip.IN", bukan "python"
        try:
            from AppKit import NSApplication, NSImage
            from Foundation import NSBundle
            info = NSBundle.mainBundle().localizedInfoDictionary() or NSBundle.mainBundle().infoDictionary()
            info["CFBundleName"] = "CalClip.IN"
        except Exception:  # noqa: BLE001
            pass

    def setelah_mulai():
        # ikon Dock dipasang setelah aplikasi Cocoa berjalan (kalau terlalu awal, ditimpa ikon python)
        if sys.platform != "darwin":
            return
        try:
            from AppKit import NSApplication, NSImage
            from PyObjCTools import AppHelper
            gambar = NSImage.alloc().initWithContentsOfFile_(str(AKAR / "aset" / "ikon.png"))
            AppHelper.callAfter(lambda: NSApplication.sharedApplication().setApplicationIconImage_(gambar))
        except Exception:  # noqa: BLE001
            pass

    webview.settings["ALLOW_DOWNLOADS"] = True
    webview.create_window("CalClip.IN", url, width=1360, height=880, min_size=(900, 640),
                          background_color="#07090F", js_api=Jembatan())
    ikon_file = DIST / "ikon.ico"
    if not ikon_file.exists():
        ikon_file = AKAR / "aset" / "ikon.ico"
    try:
        webview.start(setelah_mulai, icon=str(ikon_file) if ikon_file.exists() else None)
    except Exception as e:
        (DATA / "crash.log").write_text(f"WebView error: {e}\n", encoding="utf-8")
    finally:
        KERJA.batal()
        os._exit(0)


if __name__ == "__main__":
    main()
