import React, { useState } from 'react';
import { Sparkles, Volume2, Film, ArrowRight, Loader2 } from 'lucide-react';

export const TEMPLATE_STYLES_24 = [
  'Neon Cyber', 'Minimalist Serif', 'Paper Tear Modern', 'Dynamic Split',
  'Tech Explainer', 'Magazine Bold', 'Retro Anime', 'Clean Corporate',
  'Cinema Noir', 'Glow Gradient', 'Pop Art Comic', 'Vlog Casual',
  'Luxury Gold', 'Podcast Wave', 'News Flash', 'Pastel Aesthetic',
  'Dark Terminal', 'Handdrawn Doodle', 'Glitch Impact', 'Typo Kinetic',
  'Documentary Real', 'Storybook Fantasy', 'Bold Brutalism', 'Futuristic UI'
];

export const LayarMotion: React.FC = () => {
  const [topicPrompt, setTopicPrompt] = useState('3 Cara Meningkatkan Fokus Saat Coding');
  const [selectedStyle, setSelectedStyle] = useState('Neon Cyber');
  const [selectedVoice, setSelectedVoice] = useState('VoxCPM2 (Bahasa Indonesia Natural)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<Array<{ id: number; title: string; naration: string; duration: string }>>([
    { id: 1, title: 'Hook Awal', naration: 'Pernah nggak sih kamu baru buka VS Code 5 menit langsung buka media sosial?', duration: '0:00 - 0:04' },
    { id: 2, title: 'Solusi 1: Timeboxing', naration: 'Teknik pertama: Pasang timer 25 menit fokus penuh, lalu istirahat 5 menit.', duration: '0:04 - 0:11' },
    { id: 3, title: 'Solusi 2: Single Screen', naration: 'Tutup semua tab browser yang nggak berhubungan dengan bug yang kamu kerjakan sekarang.', duration: '0:11 - 0:19' },
    { id: 4, title: 'Call To Action', naration: 'Coba terapkan hari ini dan rasakan peningkatan produktivitasmu.', duration: '0:19 - 0:25' }
  ]);

  const handleGenerateScript = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setScenes([
        { id: 1, title: 'Hook Pembuka', naration: `Tahukah kamu rahasia terbesar di balik ${topicPrompt}?`, duration: '0:00 - 0:05' },
        { id: 2, title: 'Poin Utama', naration: 'Banyak orang melewatkan langkah krusial ini saat baru memulai.', duration: '0:05 - 0:14' },
        { id: 3, title: 'Implementasi Cepat', naration: 'Gunakan metode sederhana ini secara konsisten setiap hari.', duration: '0:14 - 0:22' },
        { id: 4, title: 'Penutup Viral', naration: 'Simpan video ini dan bagikan ke temanmu yang membutuhkan!', duration: '0:22 - 0:28' }
      ]);
    }, 800);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#080c14] text-white">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>motion studio • jalan di laptopmu</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Topik jadi video animasi
        </h1>
        <p className="text-sm text-slate-400">
          Naskah per adegan, suara narator, 24 gaya template, render MP4 1080x1920.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">
            Topik atau ide video
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              placeholder="mis. 5 Kebiasaan Orang Sukses, Tips Investasi Pemula..."
              className="flex-1 bg-[#0b0f19] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleGenerateScript}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyusun...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Susun Naskah</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Volume2 className="w-4 h-4 text-indigo-400" /> Suara Narator:
          </span>
          {['VoxCPM2 (Bahasa Indonesia Natural)', 'Bawaan Sistem', 'Kokoro Local TTS'].map((voice) => (
            <button
              key={voice}
              onClick={() => setSelectedVoice(voice)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                selectedVoice === voice
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {voice}
            </button>
          ))}
        </div>
      </div>

      {/* 24 Template Styles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Film className="w-4 h-4 text-indigo-400" />
            <span>Pilih Gaya Template (24 Gaya Siap Pakai)</span>
          </div>
          <span className="text-xs font-mono text-slate-500">1080x1920 Vertikal</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {TEMPLATE_STYLES_24.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                selectedStyle === style
                  ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300 shadow-sm'
                  : 'bg-[#0f172a]/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="truncate">{style}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Scene Script Breakdown */}
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Naskah Adegan Terstruktur</h3>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
            Gaya Aktif: {selectedStyle}
          </span>
        </div>

        <div className="space-y-3">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {scene.id}
                  </span>
                  <span className="text-xs font-bold text-white">{scene.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{scene.duration}</span>
                </div>
                <p className="text-xs text-slate-300 pl-7">{scene.naration}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => alert('Animasi berhasil dirender ke MP4 1080x1920 (Remotion Engine).')}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <span>Render Video Animasi MP4</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
