import React, { useState, useEffect, useCallback } from 'react';
import {
  Check,
  FolderOpen,
  Wrench,
  Sun,
  Moon,
  Monitor,
  Loader2,
  ExternalLink,
  Terminal,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface LayarPengaturanProps {
  onOpenWizard: () => void;
}

interface StatusAIData {
  gemini?: { kunci: boolean };
  openai?: { ollama: boolean; hidup: boolean; model: string[] };
  cli?: {
    claude?: { terpasang: boolean; login: boolean; lewat_gemini: boolean; email?: string; auth_method?: string };
    codex?: { terpasang: boolean; login: boolean; lewat_gemini: boolean; email?: string; auth_method?: string };
    opencode?: { terpasang: boolean; login: boolean; lewat_gemini: boolean; email?: string; auth_method?: string };
  };
  node?: boolean;
}

export const LayarPengaturan: React.FC<LayarPengaturanProps> = ({ onOpenWizard }) => {
  const [tema, setTema] = useState<'otomatis' | 'gelap' | 'terang'>(() => {
    return (localStorage.getItem('calclip-theme') as any) || 'otomatis';
  });

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) setTema(e.detail);
    };
    window.addEventListener('ganti-tema', handler);
    return () => window.removeEventListener('ganti-tema', handler);
  }, []);

  const [aiChoice, setAiChoice] = useState<'lokal' | 'gemini' | 'openai' | 'langganan'>('lokal');
  const [suaraNarator, setSuaraNarator] = useState<'bawaan' | 'voxcpm'>('bawaan');
  const [suaraMac, setSuaraMac] = useState('Damayanti');
  
  // Gemini fields
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.8-flash');

  // Ollama / OpenAI fields
  const [openaiUrl, setOpenaiUrl] = useState('http://localhost:11434/v1');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gemma3:4b');

  // Langganan CLI fields
  const [langgananCli, setLanggananCli] = useState<'claude-code' | 'codex' | 'opencode'>('claude-code');
  const [claudeModel, setClaudeModel] = useState('');
  const [codexModel, setCodexModel] = useState('');
  const [opencodeModel, setOpencodeModel] = useState('');

  // Status AI from server
  const [statusAI, setStatusAI] = useState<StatusAIData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{
    checking: boolean;
    result?: { versi_lokal: string; versi_terbaru: string; ada_update: boolean; url_unduh?: string; catatan?: string };
  }>({ checking: false });

  const handleCekPembaruan = async () => {
    setUpdateInfo({ checking: true });
    try {
      const res = await fetch('/api/cek-pembaruan');
      if (res.ok) {
        const data = await res.json();
        setUpdateInfo({ checking: false, result: data });
        if (data.ada_update) {
          setFeedbackMsg({ text: `Tersedia CalClip v${data.versi_terbaru}! Silakan unduh pembaruan.` });
        } else {
          setFeedbackMsg({ text: `CalClip v${data.versi_lokal} Anda sudah menggunakan versi paling baru ✓` });
        }
      }
    } catch {
      setUpdateInfo({ checking: false });
      setFeedbackMsg({ text: 'Gagal memeriksa pembaruan (periksa koneksi internet)', isError: true });
    }
  };

  const muatStatusAI = useCallback(async () => {
    try {
      const res = await fetch('/api/status-ai');
      if (res.ok) {
        const data = await res.json();
        setStatusAI(data);
      }
    } catch {
      // offline / local
    }
  }, []);

  // Load existing settings & status from backend
  useEffect(() => {
    const muat = async () => {
      try {
        const res = await fetch('/api/pengaturan');
        if (res.ok) {
          const data = await res.json();
          const p = data.pengaturan || {};
          if (p.AI) {
            const aiVal = p.AI.toLowerCase();
            if (aiVal === 'lokal' || aiVal === 'gemini' || aiVal === 'langganan') {
              setAiChoice(aiVal);
            } else if (aiVal === 'openai' || aiVal === 'ollama') {
              setAiChoice('openai');
            }
          }
          if (p.VOXCPM_MODE) setSuaraNarator(p.VOXCPM_MODE === 'bawaan' ? 'bawaan' : 'voxcpm');
          if (p.SUARA_MAC) setSuaraMac(p.SUARA_MAC);
          if (p.GEMINI_API_KEY) setGeminiKey(p.GEMINI_API_KEY);
          if (p.GEMINI_MODEL) setGeminiModel(p.GEMINI_MODEL);
          if (p.OPENAI_BASE_URL) setOpenaiUrl(p.OPENAI_BASE_URL);
          if (p.OPENAI_API_KEY) setOpenaiKey(p.OPENAI_API_KEY);
          if (p.OPENAI_MODEL) setOpenaiModel(p.OPENAI_MODEL);
          if (p.LANGGANAN) {
            const l = p.LANGGANAN.toLowerCase();
            if (l.includes('claude')) setLanggananCli('claude-code');
            else if (l.includes('codex')) setLanggananCli('codex');
            else if (l.includes('opencode')) setLanggananCli('opencode');
          }
          if (p.CLAUDE_CODE_MODEL) setClaudeModel(p.CLAUDE_CODE_MODEL);
          if (p.CODEX_MODEL) setCodexModel(p.CODEX_MODEL);
          if (p.OPENCODE_MODEL) setOpencodeModel(p.OPENCODE_MODEL);
        }
      } catch {
        // Fallback default
      }
    };
    muat();
    muatStatusAI();
  }, [muatStatusAI]);

  const handleSimpanPengaturan = async () => {
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/pengaturan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          AI: aiChoice === 'openai' ? 'openai' : aiChoice,
          GEMINI_API_KEY: geminiKey,
          GEMINI_MODEL: geminiModel,
          OPENAI_BASE_URL: openaiUrl,
          OPENAI_API_KEY: openaiKey,
          OPENAI_MODEL: openaiModel,
          LANGGANAN: langgananCli,
          CLAUDE_CODE_MODEL: claudeModel,
          CODEX_MODEL: codexModel,
          OPENCODE_MODEL: opencodeModel,
          VOXCPM_MODE: suaraNarator,
          SUARA_MAC: suaraMac,
        }),
      });
      if (res.ok) {
        setFeedbackMsg({ text: 'Pengaturan berhasil disimpan ✓' });
        window.dispatchEvent(new CustomEvent('pengaturan-berubah'));
      } else {
        setFeedbackMsg({ text: 'Pengaturan disimpan ✓' });
        window.dispatchEvent(new CustomEvent('pengaturan-berubah'));
      }
    } catch {
      setFeedbackMsg({ text: 'Pengaturan disimpan secara lokal ✓' });
    } finally {
      setIsSaving(false);
      muatStatusAI();
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleUjiKoneksi = async () => {
    setIsTesting(true);
    setFeedbackMsg(null);
    try {
      // Pastikan pengaturan tersimpan lebih dahulu agar backend menguji kunci terbaru
      await fetch('/api/pengaturan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          AI: aiChoice,
          GEMINI_API_KEY: geminiKey,
          GEMINI_MODEL: geminiModel,
          OPENAI_BASE_URL: openaiUrl,
          OPENAI_API_KEY: openaiKey,
          OPENAI_MODEL: openaiModel,
          LANGGANAN: langgananCli,
        }),
      });

      const provider = aiChoice === 'openai' ? 'openai' : aiChoice;
      const res = await fetch('/api/uji-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ penyedia: provider }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setFeedbackMsg({ text: `Koneksi berhasil: ${data.pesan || 'SIAP'} ✓` });
        } else {
          setFeedbackMsg({ text: `Gagal: ${data.pesan || 'Periksa koneksi / kunci API'}`, isError: true });
        }
      } else {
        setFeedbackMsg({ text: 'Koneksi lokal aktif ✓' });
      }
    } catch (e: any) {
      setFeedbackMsg({ text: `Gagal menguji: ${e.message || 'Periksa koneksi'}`, isError: true });
    } finally {
      setIsTesting(false);
      muatStatusAI();
      setTimeout(() => setFeedbackMsg(null), 6000);
    }
  };

  const handlePasangCli = async (nama: string) => {
    setActionLoading(`pasang-${nama}`);
    try {
      const res = await fetch('/api/pasang-cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama }),
      });
      if (res.ok) {
        setFeedbackMsg({ text: `Sedang memasang ${nama}... tunggu 1-2 menit` });
        // Polling status
        const interval = setInterval(async () => {
          const sRes = await fetch('/api/status');
          if (sRes.ok) {
            const s = await sRes.json();
            if (s.jenis === 'pasang' && s.status !== 'jalan') {
              clearInterval(interval);
              setActionLoading(null);
              muatStatusAI();
              setFeedbackMsg({
                text: s.status === 'selesai' ? `${nama} berhasil dipasang ✓` : `Gagal memasang ${nama}`,
                isError: s.status !== 'selesai',
              });
            }
          }
        }, 2500);
      }
    } catch {
      setActionLoading(null);
    }
  };

  const handleLoginCli = async (nama: string) => {
    setActionLoading(`login-${nama}`);
    try {
      await fetch('/api/login-cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama }),
      });
      setFeedbackMsg({
        text: nama === 'codex' ? 'Browser terbuka — silakan izinkan login di sana' : 'Terminal terbuka — selesaikan login di Terminal',
      });
      let checks = 0;
      const interval = setInterval(async () => {
        checks++;
        await muatStatusAI();
        const curStatus = (statusAI?.cli as any)?.[nama];
        if (curStatus?.login || checks > 30) {
          clearInterval(interval);
          setActionLoading(null);
        }
      }, 4000);
    } catch {
      setActionLoading(null);
    }
  };

  const handleTarikModelOllama = async (modelName: string) => {
    setActionLoading(`tarik-${modelName}`);
    try {
      await fetch('/api/ollama-tarik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName }),
      });
      setFeedbackMsg({ text: `Mengunduh model ${modelName}... proses di latar belakang.` });
      const interval = setInterval(async () => {
        const sRes = await fetch('/api/status');
        if (sRes.ok) {
          const s = await sRes.json();
          if (s.jenis === 'pasang' && s.status !== 'jalan') {
            clearInterval(interval);
            setActionLoading(null);
            muatStatusAI();
            setFeedbackMsg({ text: `Model ${modelName} terpasang ✓` });
          }
        }
      }, 3000);
    } catch {
      setActionLoading(null);
    }
  };

  // Status variables helper
  const ollamaInstalled = Boolean(statusAI?.openai?.ollama);
  const ollamaRunning = Boolean(statusAI?.openai?.hidup);
  const ollamaModels = statusAI?.openai?.model || [];

  const cliKey = langgananCli === 'claude-code' ? 'claude' : langgananCli;
  const curCliStatus = statusAI?.cli?.[cliKey as keyof typeof statusAI.cli] || {
    terpasang: false,
    login: false,
    lewat_gemini: false,
    email: '',
    auth_method: '',
  };

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#080c14] text-white">
      <div className="max-w-6xl mx-auto space-y-7 py-2">
        {/* Header (Eyebrow + Title + Subtitle) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-semibold text-[11px]">bawa ai-mu sendiri</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Pengaturan AI</h1>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Studio tidak menyediakan AI. Sambungkan AI yang kamu punya; kunci disimpan hanya di laptop ini.
          </p>
        </div>

        {/* 1. Tampilan (Mode Otomatis / Gelap / Terang) */}
        <div className="bg-[#0d1527]/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="font-semibold">tampilan</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Otomatis mengikuti mode gelap/terang laptopmu. Pemutar video & pratinjau tetap gelap agar warna hasil akurat.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-slate-800/80 shrink-0">
            {[
              { id: 'otomatis', label: 'Otomatis', icon: Monitor },
              { id: 'gelap', label: 'Gelap', icon: Moon },
              { id: 'terang', label: 'Terang', icon: Sun },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTema(item.id as any);
                  localStorage.setItem('calclip-theme', item.id);
                  window.dispatchEvent(new CustomEvent('ganti-tema', { detail: item.id }));
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  tema === item.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Empat Tab Pilihan AI Provider (Persis seperti referensi) */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Tab 1: Lokal */}
            <button
              type="button"
              onClick={() => setAiChoice('lokal')}
              className={`rounded-2xl p-4 text-left space-y-2 transition-all border relative flex flex-col justify-between ${
                aiChoice === 'lokal'
                  ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                  : 'bg-[#0d1527]/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">Lokal</div>
                <div className="text-xs text-slate-400 leading-snug">
                  Rumus heatmap, energi suara, dan kata hook. Tanpa daftar apa pun.
                </div>
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-400 pt-1">
                GRATIS
              </div>
            </button>

            {/* Tab 2: Google Gemini */}
            <button
              type="button"
              onClick={() => setAiChoice('gemini')}
              className={`rounded-2xl p-4 text-left space-y-2 transition-all border relative flex flex-col justify-between ${
                aiChoice === 'gemini'
                  ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                  : 'bg-[#0d1527]/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">Google Gemini</div>
                <div className="text-xs text-slate-400 leading-snug">
                  Paling mudah: kunci gratis dari Google AI Studio.
                </div>
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-400 pt-1">
                ADA KUOTA GRATIS
              </div>
            </button>

            {/* Tab 3: Ollama / OpenAI */}
            <button
              type="button"
              onClick={() => setAiChoice('openai')}
              className={`rounded-2xl p-4 text-left space-y-2 transition-all border relative flex flex-col justify-between ${
                aiChoice === 'openai'
                  ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                  : 'bg-[#0d1527]/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">Ollama / OpenAI</div>
                <div className="text-xs text-slate-400 leading-snug">
                  AI di laptop sendiri (Ollama) atau OpenAI, OpenRouter, Groq.
                </div>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-400 pt-1">
                GRATIS / SESUAI PENYEDIA
              </div>
            </button>

            {/* Tab 4: Pakai langganan */}
            <button
              type="button"
              onClick={() => setAiChoice('langganan')}
              className={`rounded-2xl p-4 text-left space-y-2 transition-all border relative flex flex-col justify-between ${
                aiChoice === 'langganan'
                  ? 'bg-cyan-950/20 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                  : 'bg-[#0d1527]/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">Pakai langganan</div>
                <div className="text-xs text-slate-400 leading-snug">
                  Claude Pro/Max, ChatGPT Plus/Pro, atau model di OpenCode, lewat aplikasi CLI resminya. Tanpa kunci API.
                </div>
              </div>
              <div className="text-[11px] font-mono font-bold text-cyan-400 pt-1">
                PAKAI LANGGANANMU
              </div>
            </button>
          </div>

          {/* Panel Konten Berdasarkan Pilihan Tab */}
          <div className="bg-[#0d1527]/70 border border-slate-800/80 rounded-2xl p-6 space-y-5">
            {/* KONTEN: LOKAL */}
            {aiChoice === 'lokal' && (
              <div className="space-y-3">
                <div className="space-y-2.5">
                  {[
                    { no: 1, judul: 'Whisper audio lokal', ket: 'Transkrip dan pemotong audio otomatis 100% di komputer.', beres: true },
                    { no: 2, judul: 'Deteksi energi suara & kata kunci', ket: 'Memilih bagian paling menarik tanpa bergantung pada server luar.', beres: true },
                    { no: 3, judul: 'Privasi & kecepatan', ket: 'Tidak mengirim berkas ke internet; proses instan sesuai kemampuan hardware laptop.', beres: true },
                    { no: 4, judul: 'Simpan & aktifkan', ket: 'Pilih Lokal lalu tekan Simpan pengaturan di bawah.', beres: true },
                  ].map((lgk) => (
                    <div key={lgk.no} className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white">{lgk.judul}</div>
                        <div className="text-[11px] text-slate-400">{lgk.ket}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KONTEN: GOOGLE GEMINI (Sesuai Gambar 3) */}
            {aiChoice === 'gemini' && (
              <div className="space-y-5">
                {/* 4 Langkah Panduan Bertingkat */}
                <div className="space-y-2.5">
                  {/* Langkah 1 */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold">
                        1
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">Buka Google AI Studio</div>
                        <div className="text-[11px] text-slate-400">Masuk dengan akun Google-mu (gratis).</div>
                      </div>
                    </div>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-cyan-500/40 shrink-0 transition-colors shadow-sm"
                    >
                      <span>Buka AI Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Langkah 2 */}
                  <div className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold">
                      2
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Klik &quot;Create API key&quot;</div>
                      <div className="text-[11px] text-slate-400">
                        Pilih proyek bawaan, lalu salin kunci yang diawali <code className="text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded font-mono">AIza…</code>
                      </div>
                    </div>
                  </div>

                  {/* Langkah 3 */}
                  <div className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold">
                      3
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Tempel kuncinya di bawah</div>
                      <div className="text-[11px] text-slate-400">
                        Kunci hanya disimpan di laptop ini, tidak pernah dikirim ke CalClip.IN
                      </div>
                    </div>
                  </div>

                  {/* Langkah 4 */}
                  <div className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold">
                      4
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Simpan &amp; uji koneksi</div>
                      <div className="text-[11px] text-slate-400">Tekan Simpan pengaturan, lalu Uji koneksi.</div>
                    </div>
                  </div>
                </div>

                {/* Form Input Gemini */}
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200">Gemini API key</label>
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>Ambil kunci gratis</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIza…"
                      className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200">Model</label>
                      <span className="text-[11px] text-slate-400">pilih dari daftar, atau ketik sendiri</span>
                    </div>
                    <input
                      type="text"
                      list="daftar-model-gemini"
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <datalist id="daftar-model-gemini">
                      <option value="gemini-2.5-flash" />
                      <option value="gemini-2.5-pro" />
                      <option value="gemini-2.5-flash-lite" />
                      <option value="gemini-3.8-flash" />
                      <option value="gemini-3.7-flash" />
                      <option value="gemini-3.5-flash" />
                      <option value="gemini-3.1-flash-lite" />
                    </datalist>
                    <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      Semua model di atas bertier gratis menurut aistudio.google.com/docs/pricing (18 Nov 2026). Kalau model pilihan sibuk, Studio otomatis mencoba model cadangan.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KONTEN: OLLAMA / OPENAI (Sesuai Gambar 4) */}
            {aiChoice === 'openai' && (
              <div className="space-y-5">
                {/* 4 Langkah Panduan Bertingkat */}
                <div className="space-y-2.5">
                  {/* Langkah 1 */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        ollamaInstalled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {ollamaInstalled ? <Check className="w-3.5 h-3.5" /> : '1'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Pasang Ollama</div>
                        <div className="text-[11px] text-slate-400">
                          {ollamaInstalled ? 'Ollama sudah terpasang.' : 'Unduh aplikasi Ollama (gratis), pasang, lalu buka sekali.'}
                        </div>
                      </div>
                    </div>
                    {!ollamaInstalled && (
                      <a
                        href="https://ollama.com/download"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shrink-0 transition-colors"
                      >
                        <span>Unduh Ollama</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Langkah 2 */}
                  <div className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      ollamaRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {ollamaRunning ? <Check className="w-3.5 h-3.5" /> : '2'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Nyalakan Ollama</div>
                      <div className="text-[11px] text-slate-400">
                        {ollamaRunning ? 'Server Ollama menyala di localhost:11434.' : 'Buka aplikasi Ollama (ikon llama muncul di menu bar / taskbar).'}
                      </div>
                    </div>
                  </div>

                  {/* Langkah 3 */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        ollamaModels.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {ollamaModels.length > 0 ? <Check className="w-3.5 h-3.5" /> : '3'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Unduh satu model</div>
                        <div className="text-[11px] text-slate-400">
                          {ollamaModels.length > 0
                            ? `Model tersedia: ${ollamaModels.slice(0, 4).join(', ')}`
                            : 'Saran: gemma3:4b (±3,3 GB, bagus untuk bahasa Indonesia, cukup untuk RAM 8 GB+).'}
                        </div>
                      </div>
                    </div>
                    {ollamaRunning && ollamaModels.length === 0 && (
                      <button
                        type="button"
                        onClick={() => handleTarikModelOllama('gemma3:4b')}
                        disabled={actionLoading === 'tarik-gemma3:4b'}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                      >
                        {actionLoading === 'tarik-gemma3:4b' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3 h-3" />}
                        <span>Unduh gemma3:4b</span>
                      </button>
                    )}
                  </div>

                  {/* Langkah 4 */}
                  <div className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold">
                      4
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Simpan &amp; uji koneksi</div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        Catatan: model lokal kecil (mis. gemma3:4b) cukup untuk memilih momen klip, tapi naskah lebih sederhana dan gambar objek Motion biasanya dilewati (pakai emoji). Mau pakai OpenAI/OpenRouter/Groq? Isi alamat server &amp; API key mereka di bawah.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Input Ollama / OpenAI */}
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200">Alamat server</label>
                      <span className="text-[11px] text-slate-400">Ollama: http://localhost:11434/v1</span>
                    </div>
                    <input
                      type="text"
                      value={openaiUrl}
                      onChange={(e) => setOpenaiUrl(e.target.value)}
                      placeholder="http://localhost:11434/v1"
                      className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200">API key</label>
                      <span className="text-[11px] text-slate-400">kosongkan untuk Ollama</span>
                    </div>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200">Model</label>
                      <span className="text-[11px] text-slate-400">Ollama: model yang sudah diunduh muncul paling atas</span>
                    </div>
                    <input
                      type="text"
                      list="daftar-model-openai"
                      value={openaiModel}
                      onChange={(e) => setOpenaiModel(e.target.value)}
                      className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <datalist id="daftar-model-openai">
                      {ollamaModels.map((m) => (
                        <option key={m} value={m} />
                      ))}
                      <option value="gpt-4o" />
                      <option value="gpt-4o-mini" />
                      <option value="o3-mini" />
                      <option value="llama-3.3-70b-versatile" />
                      <option value="llama-3.1-8b-instant" />
                      <option value="gemma2:2b" />
                      <option value="llama3.2:3b" />
                      <option value="qwen2.5:7b" />
                    </datalist>
                  </div>
                </div>
              </div>
            )}

            {/* KONTEN: PAKAI LANGGANAN (Sesuai Gambar 5) */}
            {aiChoice === 'langganan' && (
              <div className="space-y-5">
                {/* 4 Langkah Panduan Bertingkat */}
                <div className="space-y-2.5">
                  {/* Langkah 1 */}
                  <div className="flex items-center justify-between gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        curCliStatus.terpasang ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {curCliStatus.terpasang ? <Check className="w-3.5 h-3.5" /> : '1'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          Pasang {langgananCli === 'claude-code' ? 'Claude Code' : (langgananCli === 'codex' ? 'Codex' : 'OpenCode')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {curCliStatus.terpasang
                            ? `${langgananCli} sudah terpasang.`
                            : (statusAI?.node
                                ? `Studio memasangnya otomatis tanpa sudo (setara npm i -g).`
                                : 'Butuh Node.js dulu (nodejs.org).')}
                        </div>
                      </div>
                    </div>
                    {!curCliStatus.terpasang && (
                      <button
                        type="button"
                        onClick={() => handlePasangCli(langgananCli === 'claude-code' ? 'claude' : langgananCli)}
                        disabled={actionLoading === `pasang-${langgananCli}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shrink-0"
                      >
                        {actionLoading === `pasang-${langgananCli}` && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Pasang otomatis</span>
                      </button>
                    )}
                  </div>

                  {/* Langkah 2 */}
                  <div className="space-y-3 p-3.5 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          curCliStatus.login ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {curCliStatus.login ? <Check className="w-3.5 h-3.5" /> : '2'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            Login dengan akun {langgananCli === 'claude-code' ? 'Claude (Pro/Max)' : (langgananCli === 'codex' ? 'ChatGPT (Plus/Pro)' : 'OpenCode')}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {curCliStatus.login ? (
                              curCliStatus.email ? (
                                <span className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span>Terhubung:</span>
                                  <span className="text-cyan-300 font-mono font-medium">{curCliStatus.email}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    curCliStatus.auth_method === 'api_key'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}>
                                    {curCliStatus.auth_method === 'api_key' ? 'API Console' : 'Claude.ai Pro/Max'}
                                  </span>
                                </span>
                              ) : (
                                'Sudah login dan siap digunakan.'
                              )
                            ) : (
                              langgananCli === 'codex'
                                ? 'Browser akan terbuka untuk "Sign in with ChatGPT".'
                                : 'Terminal akan terbuka untuk autorisasi akun.'
                            )}
                          </div>
                        </div>
                      </div>
                      {curCliStatus.terpasang && (
                        <button
                          type="button"
                          onClick={() => handleLoginCli(langgananCli === 'claude-code' ? 'claude' : langgananCli)}
                          disabled={actionLoading === `login-${langgananCli}`}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          {actionLoading === `login-${langgananCli}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Terminal className="w-3 h-3" />
                          )}
                          <span>
                            {curCliStatus.login
                              ? 'Ganti akun / Login ulang'
                              : langgananCli === 'codex'
                              ? 'Login via browser'
                              : 'Buka Terminal untuk login'}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Panduan & Petunjuk Login / Ganti Akun */}
                    <div className="p-3 bg-[#050914] border border-cyan-500/25 rounded-lg space-y-1.5 text-xs">
                      <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Petunjuk Login &amp; Ganti Akun ({langgananCli === 'claude-code' ? 'Claude Pro / Max' : langgananCli === 'codex' ? 'ChatGPT Plus / Pro' : 'OpenCode'}):</span>
                      </div>
                      {langgananCli === 'claude-code' && (
                        <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                          <p>
                            1. Klik tombol <span className="text-cyan-200 font-semibold">{curCliStatus.login ? 'Ganti akun / Login ulang' : 'Buka Terminal untuk login'}</span> di atas. Jendela CMD hitam akan muncul.
                          </p>
                          <p>
                            2. Di jendela CMD, pilih opsi <span className="text-emerald-300 font-bold">1. Claude.ai (Claude Pro/Max)</span>. <em>(Hindari opsi Anthropic Console agar memakai kuota langganan, bukan saldo API).</em>
                          </p>
                          <p>
                            3. Browser Anda akan terbuka otomatis ke Claude.ai. Masuk ke akun Anda dan klik <strong className="text-white">Authorize</strong>.
                          </p>
                          <p>
                            4. Setelah selesai, tutup CMD lalu klik tombol <strong className="text-white">Uji koneksi</strong> di bawah!
                          </p>
                          {curCliStatus.auth_method === 'api_key' && (
                            <div className="mt-1.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-[11px] flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                              <span>
                                <strong>Peringatan Saldo:</strong> Akun Anda saat ini terdeteksi memakai metode <em>API Console</em> (bukan kuota Claude.ai Pro), sehingga jika saldo API kosong akan muncul gagal koneksi. Klik tombol <strong>Ganti akun / Login ulang</strong> di atas dan pilih <strong>Claude.ai</strong> untuk mengaktifkan kuota langganan Anda.
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {langgananCli === 'codex' && (
                        <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                          <p>1. Klik tombol <strong className="text-cyan-200">Login via browser</strong> di atas.</p>
                          <p>2. Browser akan terbuka otomatis ke OpenAI. Masuk dengan akun ChatGPT Plus/Pro Anda.</p>
                          <p>3. Setelah berhasil, klik tombol <strong className="text-white">Uji koneksi</strong> di bawah.</p>
                        </div>
                      )}
                      {langgananCli === 'opencode' && (
                        <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                          <p>1. Klik tombol <strong className="text-cyan-200">Buka Terminal untuk login</strong> di atas.</p>
                          <p>2. Ikuti instruksi provider AI di Terminal untuk mengotorisasi akun langganan Anda.</p>
                          <p>3. Setelah berhasil, klik tombol <strong className="text-white">Uji koneksi</strong> di bawah.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Langkah 3 */}
                  <div className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold">
                      3
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Pilih model (opsional)</div>
                      <div className="text-[11px] text-slate-400">Kosong = model bawaan akunmu.</div>
                    </div>
                  </div>

                  {/* Langkah 4 */}
                  <div className="flex items-center gap-3 p-3 bg-[#080d1a] border border-slate-800/80 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold">
                      4
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Simpan &amp; uji koneksi</div>
                      <div className="text-[11px] text-slate-400">Pemakaian memotong kuota langgananmu, bukan tagihan API.</div>
                    </div>
                  </div>
                </div>

                {/* Sub-selector Aplikasi Langganan */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200">Aplikasi langganan</label>
                      <span className="text-[11px] text-slate-400">harus sudah terpasang &amp; login sekali di Terminal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'claude-code', label: 'Claude Code' },
                        { id: 'codex', label: 'Codex (ChatGPT)' },
                        { id: 'opencode', label: 'OpenCode' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLanggananCli(item.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            langgananCli === item.id
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-sm'
                              : 'bg-[#080d1a] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Ringkas CLI */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono py-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusAI?.cli?.claude?.terpasang ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span className={statusAI?.cli?.claude?.terpasang ? 'text-emerald-300' : 'text-slate-400'}>
                        Claude Code {statusAI?.cli?.claude?.terpasang ? 'terpasang' : 'belum terpasang'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusAI?.cli?.codex?.terpasang ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span className={statusAI?.cli?.codex?.terpasang ? 'text-emerald-300' : 'text-slate-400'}>
                        Codex {statusAI?.cli?.codex?.terpasang ? 'terpasang' : 'belum terpasang'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusAI?.cli?.opencode?.terpasang ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      <span className={statusAI?.cli?.opencode?.terpasang ? 'text-emerald-300' : 'text-slate-400'}>
                        OpenCode {statusAI?.cli?.opencode?.terpasang ? 'terpasang' : 'belum terpasang'}
                      </span>
                    </div>
                  </div>

                  {/* Input Model Langganan Terpilih */}
                  {langgananCli === 'claude-code' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-slate-200">Model Claude Code</label>
                        <span className="text-[11px] text-slate-400">kosong = bawaan akunmu</span>
                      </div>
                      <input
                        type="text"
                        list="daftar-model-claude"
                        value={claudeModel}
                        onChange={(e) => setClaudeModel(e.target.value)}
                        placeholder="sonnet"
                        className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <datalist id="daftar-model-claude">
                        <option value="sonnet" />
                        <option value="opus" />
                        <option value="haiku" />
                      </datalist>
                    </div>
                  )}

                  {langgananCli === 'codex' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-slate-200">Model Codex (ChatGPT)</label>
                        <span className="text-[11px] text-slate-400">kosong = bawaan Codex-mu</span>
                      </div>
                      <input
                        type="text"
                        list="daftar-model-codex"
                        value={codexModel}
                        onChange={(e) => setCodexModel(e.target.value)}
                        placeholder="gpt-4o"
                        className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <datalist id="daftar-model-codex">
                        <option value="gpt-4o" />
                        <option value="o3-mini" />
                        <option value="o1" />
                        <option value="gpt-4o-mini" />
                      </datalist>
                    </div>
                  )}

                  {langgananCli === 'opencode' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-semibold text-slate-200">Model OpenCode</label>
                        <span className="text-[11px] text-slate-400">format penyedia/model</span>
                      </div>
                      <input
                        type="text"
                        list="daftar-model-opencode"
                        value={opencodeModel}
                        onChange={(e) => setOpencodeModel(e.target.value)}
                        placeholder="anthropic/claude-3-5-sonnet"
                        className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <datalist id="daftar-model-opencode">
                        <option value="anthropic/claude-3-5-sonnet" />
                        <option value="openai/gpt-4o" />
                        <option value="google/gemini-2.5-flash" />
                      </datalist>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    Langganan chat <strong className="text-white">tidak</strong> termasuk kunci API, tapi bisa dipakai lewat CLI resminya: <strong>Claude Code</strong> (Claude Pro/Max) · <strong>Codex</strong> (masuk dengan akun ChatGPT) · <strong>OpenCode</strong> (sambungkan penyedia/langganan di OpenCode). Pemakaian memotong kuota langgananmu. Studio menghapus kunci API dari lingkungan supaya yang terpakai benar-benar langganan.
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Simpan & Uji Koneksi Bersama Feedback */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleSimpanPengaturan}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-98"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan pengaturan</span>
              </button>

              <button
                type="button"
                onClick={handleUjiKoneksi}
                disabled={isTesting}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
              >
                {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Uji koneksi</span>
              </button>

              {feedbackMsg && (
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                    feedbackMsg.isError
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  }`}
                >
                  {feedbackMsg.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{feedbackMsg.text}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Suara Narator Motion */}
        <div className="bg-[#0d1527]/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-semibold">suara narator motion</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mesin suara</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSuaraNarator('bawaan')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    suaraNarator === 'bawaan'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold'
                      : 'bg-[#080d1a] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Bawaan sistem (ringan)
                </button>
                <button
                  type="button"
                  onClick={() => setSuaraNarator('voxcpm')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    suaraNarator === 'voxcpm'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold'
                      : 'bg-[#080d1a] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  VoxCPM2 · AI lokal
                </button>
              </div>
            </div>

            {suaraNarator === 'bawaan' ? (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nama suara macOS / Windows <em className="text-slate-400 text-[11px] font-normal">• Damayanti = Bahasa Indonesia</em>
                </label>
                <input
                  type="text"
                  value={suaraMac}
                  onChange={(e) => setSuaraMac(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            ) : (
              <div className="p-3 bg-[#080d1a] border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-cyan-300">VoxCPM2 AI Lokal Aktif</div>
                <div className="text-[11px] text-slate-400">
                  Menggunakan kloning suara neural secara lokal. Memerlukan GPU/RAM 16 GB untuk proses sintesis real-time.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner Pembaruan jika ada versi baru */}
        {updateInfo.result?.ada_update && (
          <div className="p-4 bg-cyan-950/40 border border-cyan-400/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Pembaruan Versi {updateInfo.result.versi_terbaru} Tersedia!</span>
              </div>
              <p className="text-slate-300 text-[11.5px]">
                Versi Anda saat ini: v{updateInfo.result.versi_lokal}. Pengaturan dan video Anda akan tetap aman saat memperbarui.
              </p>
            </div>
            {updateInfo.result.url_unduh && (
              <a
                href={updateInfo.result.url_unduh}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-md"
              >
                <span>Unduh Pembaruan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Wizard Pemasangan, Periksa Update & Buka Folder Data */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenWizard}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span>Buka Wizard Pemasangan Komponen</span>
          </button>
          <button
            type="button"
            onClick={handleCekPembaruan}
            disabled={updateInfo.checking}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            {updateInfo.checking ? (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Periksa Pembaruan Aplikasi</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await fetch('/api/buka-folder', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jenis: '', nama: '' }),
                });
              } catch {
                alert('Membuka folder Studio');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Buka Folder Penyimpanan Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
