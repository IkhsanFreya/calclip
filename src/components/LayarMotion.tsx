import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

export const TEMPLATES_MOTION = [
  { id: 'pixel-art', label: 'Pixel Art', category: 'Ilustrasi', color: 'from-amber-600/30 to-purple-900/40' },
  { id: 'papan-kapur', label: 'Papan Kapur', category: 'Ilustrasi', color: 'from-emerald-950 to-slate-900' },
  { id: 'sketsa-emas', label: 'Sketsa Emas', category: 'Ilustrasi', color: 'from-yellow-900/40 to-slate-950' },
  { id: 'low-poly', label: 'Low-poly PS2', category: 'Ilustrasi', color: 'from-indigo-950 to-purple-950' },
  { id: 'komik', label: 'Komik', category: 'Ilustrasi', color: 'from-amber-500/30 to-yellow-950' },
  { id: 'flat-vector', label: 'Flat Vector', category: 'Ilustrasi', color: 'from-sky-950 to-blue-950' },
  { id: 'stickman', label: 'Stickman Minimalis', category: 'Ilustrasi', color: 'from-slate-900 to-black' },
  { id: 'cgi-mengilap', label: 'CGI Mengilap', category: 'Ilustrasi', color: 'from-cyan-950 to-blue-900/30' },
];

export const LayarMotion: React.FC = () => {
  const [tabIsi, setTabIsi] = useState<'topik' | 'json'>('topik');
  const [topikInput, setTopikInput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('pixel-art');
  const [isAiDrawing, setIsAiDrawing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = () => {
    const promptText = `Kamu penulis naskah video pendek berbahasa Indonesia. Topik: [TOPIK]. Tulis 4–7 adegan; adegan 1 hook; satu kalimat narasi per adegan maks 14 kata; judul layar 2–5 kata; jangan mengarang angka; adegan terakhir ajakan. Balas HANYA JSON: {"judul":"...","adegan":[{"judul":"2-5 kata","teks":"kalimat narasi","kunci":["kata"],"ikon":"🔥"}]}`;
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleBuatVideo = async () => {
    setIsGenerating(true);
    try {
      await fetch('/api/motion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topik: tabIsi === 'topik' ? topikInput : '',
          naskah: tabIsi === 'json' ? jsonInput : '',
          gaya: selectedTemplate,
          ai: 'lokal',
          gambar: isAiDrawing,
        }),
      });
    } catch {
      // offline simulation fallback
    } finally {
      setTimeout(() => setIsGenerating(false), 2000);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#080c14] text-white">
      <div className="max-w-6xl mx-auto space-y-7 py-2">
        {/* Header matching 763f2c66.jpg */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">calclip.in • motion graphic 9:16</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Dari satu topik jadi video animasi 9:16
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            AI menulis naskah per adegan, suara narator dibuat otomatis, lalu dirender jadi MP4.
          </p>
        </div>

        {/* Main 2-Column Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Left Column: • isi video */}
          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>isi video</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTabIsi('topik')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tabIsi === 'topik'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#090d16] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Dari topik (AI)
              </button>
              <button
                onClick={() => setTabIsi('json')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  tabIsi === 'json'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#090d16] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Tempel naskah JSON
              </button>
            </div>

            {/* Input field */}
            {tabIsi === 'topik' ? (
              <textarea
                rows={5}
                value={topikInput}
                onChange={(e) => setTopikInput(e.target.value)}
                placeholder="mis. 3 kebiasaan pagi yang bikin produktif"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl p-4 text-xs text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
              />
            ) : (
              <textarea
                rows={5}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"judul": "Tips Coding", "adegan": [{"judul": "Hook", "teks": "Pernah gak sih..."}]}'
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl p-4 text-xs text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-cyan-400 font-mono"
              />
            )}

            {/* Hint text */}
            <p className="text-xs text-slate-500 leading-relaxed">
              Butuh AI di Pengaturan (Gemini gratis cukup). Tanpa kunci? Pakai tab Tempel naskah JSON — minta naskahnya di Claude/Gemini gratis dengan{' '}
              <button
                onClick={handleCopyPrompt}
                className="text-cyan-400 hover:underline font-semibold inline-flex items-center gap-1"
              >
                {copiedPrompt ? (
                  <span className="text-emerald-400 font-bold">tersalin ✓</span>
                ) : (
                  <span>prompt ini.</span>
                )}
              </button>
            </p>
          </div>

          {/* Right Column: • gaya • 24 template */}
          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>gaya • 24 template</span>
              </div>
              <span className="text-xs font-mono text-slate-500">1080×1920 Vertikal</span>
            </div>

            {/* 8 Visible Template Cards in 2x4 grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {TEMPLATES_MOTION.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`group rounded-xl p-2.5 flex flex-col justify-between cursor-pointer border transition-all aspect-[9/13] bg-gradient-to-b ${tmpl.color} ${
                    selectedTemplate === tmpl.id
                      ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-sm'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Visual Placeholder Art */}
                  <div className="w-full h-20 rounded bg-black/40 flex items-center justify-center text-center p-2 border border-white/5">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase">
                      {tmpl.label}
                    </span>
                  </div>
                  <div className="space-y-0.5 pt-2">
                    <div className="text-xs font-bold text-white truncate">{tmpl.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tmpl.category}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Object Drawing Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  AI menggambar objek tiap adegan
                </div>
                <div className="text-[11px] text-slate-500">
                  SVG, menggantikan emoji • butuh AI di Pengaturan
                </div>
              </div>
              <button
                onClick={() => setIsAiDrawing(!isAiDrawing)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  isAiDrawing ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                    isAiDrawing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Status Note */}
            <div className="text-xs text-slate-400">
              Suara narator: <span className="text-slate-200 font-semibold">Damayanti (bawaan sistem)</span> • ubah di Pengaturan AI. Resolusi 1080×1920, 30 fps.
            </div>

            {/* Button Buat Video */}
            <button
              onClick={handleBuatVideo}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Buat video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
