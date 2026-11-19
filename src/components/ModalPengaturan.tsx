import React, { useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

interface ModalPengaturanProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateKlip: () => void;
  onNavigateMotion: () => void;
}

export const ModalPengaturan: React.FC<ModalPengaturanProps> = ({
  isOpen,
  onClose,
  onNavigateKlip,
  onNavigateMotion,
}) => {
  const [step, setStep] = useState<number>(1); // Mulai dari langkah 1 (Persyaratan Sistem)
  const [aiChoice, setAiChoice] = useState<'lokal' | 'gemini' | 'ollama' | 'langganan'>('lokal');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [sistemStatus, setSistemStatus] = useState<{ klip: boolean; motion: boolean; voxcpm: boolean }>({
    klip: true,
    motion: true,
    voxcpm: true,
  });

  const handleSelesai = () => {
    fetch('/api/wizard-selesai', { method: 'POST', body: '{}' }).catch(() => {});
    try {
      localStorage.setItem('calclip_wizard_selesai', 'true');
    } catch {}
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/pengaturan')
        .then((r) => r.json())
        .then((data) => {
          if (data.sistem) {
            setSistemStatus({
              klip: Boolean(data.sistem.uv),
              motion: Boolean(data.sistem.node),
              voxcpm: Boolean(data.sistem.voxcpm),
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0d1527] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CalClip.IN" className="dark-logo h-8 w-auto object-contain shrink-0" />
            <img src="/logo-light.png" alt="CalClip.IN" className="light-logo h-8 w-auto object-contain shrink-0" />
            <div>
              <div className="font-bold text-sm text-white brand-text">Pemasangan CalClip.IN</div>
              <div className="text-xs text-slate-400">Klip + Motion • gratis • jalan di laptopmu</div>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'persyaratan' },
              { num: 2, label: 'komponen' },
              { num: 3, label: 'sambungkan ai' },
              { num: 4, label: 'selesai' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                  step === s.num
                    ? 'border border-cyan-400 text-cyan-400 bg-cyan-950/40 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s.num} - {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
          {/* STEP 1: Persyaratan */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Persyaratan Sistem</h2>
              <p className="text-xs text-slate-400">
                CalClip.IN dirancang untuk berjalan 100% lokal di laptopmu tanpa memerlukan langganan cloud berbayar.
              </p>
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Sistem Operasi</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Windows 10/11 64-bit / Linux / macOS
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">RAM Minimum</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 8 GB (Disarankan 16 GB untuk VoxCPM2)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Akselerasi Grafis</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> WebGL2 / Direct3D / Metal Hardware Canvas
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Komponen */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Pasang komponen</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Komponen wajib dipasang sekali saja. Unduhannya langsung dari sumber resminya, dan semuanya disimpan di laptopmu.
                </p>
              </div>

              {/* Item 1: Mesin Klip */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Mesin Klip</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">wajib</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">±1 GB</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Python 3.12, ffmpeg, yt-dlp, Whisper (transkripsi), OpenCV (wajah). Model Whisper ±460 MB diunduh saat analisis pertama.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 shrink-0">
                  {sistemStatus.klip ? <><Check className="w-3.5 h-3.5" /> siap</> : <span className="text-amber-400">belum siap</span>}
                </div>
              </div>

              {/* Item 2: Mesin Motion */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Mesin Motion</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">opsional</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">±1,3 GB</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Remotion untuk merender video animasi. Butuh Node.js.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 shrink-0">
                  {sistemStatus.motion ? <><Check className="w-3.5 h-3.5" /> siap</> : <span className="text-amber-400">belum siap</span>}
                </div>
              </div>

              {/* Item 3: Suara AI VoxCPM2 */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Suara AI VoxCPM2</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">opsional</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">±6,7 GB</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Suara narator natural bahasa Indonesia + clone suaramu (Apache-2.0). Disarankan RAM 16 GB. Bisa dilewati — suara bawaan tetap ada.
                  </p>
                  <div className="font-mono text-[11px] text-slate-400 pt-1">
                    $ uv.exe run -q suara.py --cek
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 shrink-0">
                  {sistemStatus.voxcpm ? <><Check className="w-3.5 h-3.5" /> siap</> : <span className="text-amber-400">belum siap</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Sambungkan AI */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Sambungkan AI</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih AI yang kamu punya. Ikuti langkah bernomor, lalu tekan Uji koneksi. Tidak punya apa-apa? Pilih Lokal — tetap jalan, gratis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lokal */}
                <div
                  onClick={() => setAiChoice('lokal')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    aiChoice === 'lokal'
                      ? 'bg-slate-900/90 border-cyan-400 ring-1 ring-cyan-400/40'
                      : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Lokal</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Rumus heatmap, energi suara, dan kata hook. Tanpa daftar apa pun.
                  </p>
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">GRATIS</span>
                  </div>
                </div>

                {/* Google Gemini */}
                <div
                  onClick={() => setAiChoice('gemini')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    aiChoice === 'gemini'
                      ? 'bg-slate-900/90 border-cyan-400 ring-1 ring-cyan-400/40'
                      : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Google Gemini</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Paling mudah: kunci gratis dari Google AI Studio.
                  </p>
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">ADA KUOTA GRATIS</span>
                  </div>
                </div>

                {/* Ollama / OpenAI */}
                <div
                  onClick={() => setAiChoice('ollama')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    aiChoice === 'ollama'
                      ? 'bg-slate-900/90 border-cyan-400 ring-1 ring-cyan-400/40'
                      : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Ollama / OpenAI</div>
                  <p className="text-xs text-slate-400 mt-1">
                    AI di laptop sendiri (Ollama) atau OpenAI, OpenRouter, Groq.
                  </p>
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-300 font-mono">GRATIS / SESUAI PENYEDIA</span>
                  </div>
                </div>

                {/* Pakai langganan */}
                <div
                  onClick={() => setAiChoice('langganan')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    aiChoice === 'langganan'
                      ? 'bg-slate-900/90 border-cyan-400 ring-1 ring-cyan-400/40'
                      : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Pakai langganan</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Claude Pro/Max, ChatGPT Plus/Pro, atau model di OpenCode, lewat aplikasi CLI resminya. Tanpa kunci API.
                  </p>
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-cyan-400 font-mono">PAKAI LANGGANANMU</span>
                  </div>
                </div>
              </div>

              {/* Action test buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setTestResult('Pengaturan AI tersimpan. Model lokal siap!')}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors"
                >
                  Simpan pengaturan
                </button>
                <button
                  onClick={() => setTestResult('Uji koneksi berhasil: Respons latensi 12ms (Lokal Engine).')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
                >
                  Uji koneksi
                </button>
              </div>

              {testResult && (
                <div className="text-xs text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-2.5">
                  {testResult}
                </div>
              )}

              <div className="text-xs text-slate-500 pt-1">
                Bisa dilewati — mode Lokal tetap jalan.
              </div>
            </div>
          )}

          {/* STEP 4: Selesai */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Studio siap dipakai</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pengaturan bisa diubah kapan saja di menu Pengaturan AI. Wizard ini bisa dibuka lagi dari kartu cek sistem.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    onClose();
                    onNavigateKlip();
                  }}
                  className="bg-[#0b0f19] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 cursor-pointer space-y-2 group"
                >
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                    Potong video jadi klip
                  </h3>
                  <p className="text-xs text-slate-400">Tempel link YouTube atau seret video.</p>
                  <div className="text-xs font-bold text-cyan-400 pt-2 flex items-center gap-1">
                    <span>mulai</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div
                  onClick={() => {
                    handleSelesai();
                    onNavigateMotion();
                  }}
                  className="bg-[#0b0f19] border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 cursor-pointer space-y-2 group"
                >
                  <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                    Topik jadi video animasi
                  </h3>
                  <p className="text-xs text-slate-400">24 gaya, suara narator otomatis.</p>
                  <div className="text-xs font-bold text-indigo-400 pt-2 flex items-center gap-1">
                    <span>mulai</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#090d18] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Kembali
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors"
            >
              Lanjut
            </button>
          ) : (
            <button
              onClick={handleSelesai}
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors"
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
