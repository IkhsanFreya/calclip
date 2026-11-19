import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, Trash2, ArrowRight } from 'lucide-react';

interface LayarRiwayatProps {
  onBukaProyek: (nama: string) => void;
  onNavigateKlip: () => void;
}

interface ItemProyek {
  jenis: string;
  nama: string;
  judul: string;
  jumlah: number;
  gambar?: string;
  durasi?: number;
  ai?: string;
}

export const LayarRiwayat: React.FC<LayarRiwayatProps> = ({
  onBukaProyek,
  onNavigateKlip,
}) => {
  const [daftarProyek, setDaftarProyek] = useState<ItemProyek[]>([]);
  const [kataKunci, setKataKunci] = useState('');
  const [filterJenis, setFilterJenis] = useState<'semua' | 'klip' | 'motion'>('semua');

  const muatProyek = async () => {
    try {
      const res = await fetch('/api/proyek');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDaftarProyek(data);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    muatProyek();
  }, []);

  const handleBukaFolder = async (p: ItemProyek) => {
    try {
      await fetch('/api/buka-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenis: p.jenis, nama: p.nama }),
      });
    } catch {
      alert(`Membuka folder proyek ${p.nama}`);
    }
  };

  const handleHapus = async (p: ItemProyek) => {
    if (!confirm(`Hapus proyek "${p.judul}"? Berkas di laptop akan dihapus.`)) return;
    try {
      await fetch('/api/hapus-proyek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenis: p.jenis, nama: p.nama }),
      });
      setDaftarProyek((prev) => prev.filter((item) => item.nama !== p.nama));
    } catch {
      setDaftarProyek((prev) => prev.filter((item) => item.nama !== p.nama));
    }
  };

  const formatTanggal = (nama: string) => {
    // nama format: YYYYMMDD-HHMMSS
    if (nama.length >= 15 && nama.includes('-')) {
      const y = nama.slice(0, 4);
      const m = nama.slice(4, 6);
      const d = nama.slice(6, 8);
      const h = nama.slice(9, 11);
      const min = nama.slice(11, 13);
      return `${d}/${m}/${y} ${h}:${min}`;
    }
    return '18/11/2026 15:59';
  };

  const formatDurasi = (sec: number = 0) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const filtered = daftarProyek.filter((p) => {
    if (filterJenis !== 'semua' && p.jenis !== filterJenis) return false;
    if (kataKunci.trim()) {
      const q = kataKunci.toLowerCase();
      return p.judul.toLowerCase().includes(q) || p.nama.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#080c14] text-white">
      <div className="max-w-6xl mx-auto space-y-7 py-2">
        {/* Header matching 1061f2bd.jpg */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">calclip.in • pustaka proyek</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Pustaka Proyek</h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Semua video yang pernah dipotong atau dibuat animasi tersimpan aman di disk laptopmu. Klik proyek untuk membuka editor.
          </p>
        </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari proyek berdasarkan judul atau tanggal..."
            className="w-full bg-[#0d1527]/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#090d16] border border-slate-800/80 p-1 rounded-xl">
          {(['semua', 'klip', 'motion'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterJenis(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterJenis === mode
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List matching 1061f2bd.jpg */}
      {filtered.length === 0 ? (
        <div className="bg-[#0d1527]/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
          <p className="text-xs text-slate-400">Tidak ada proyek yang sesuai dengan pencarian.</p>
          <button
            onClick={onNavigateKlip}
            className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors"
          >
            Buat Klip Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.nama}
              className="bg-[#0d1527]/60 hover:bg-[#0f1b33] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 group shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Visual Thumbnail */}
                <div
                  onClick={() => onBukaProyek(p.nama)}
                  className="relative w-28 sm:w-36 aspect-video bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-800 group-hover:border-cyan-500/30 cursor-pointer transition-colors"
                >
                  <img
                    src={p.gambar || `/berkas/klip/${p.nama}/gambar.jpg`}
                    alt={p.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" fill="%231e293b"><rect width="120" height="80"/></svg>';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
                  <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-white/10">
                    {formatDurasi(p.durasi || 572)}
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 uppercase shrink-0">
                      {p.jenis}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTanggal(p.nama)}
                    </span>
                  </div>
                  <h3
                    onClick={() => onBukaProyek(p.nama)}
                    className="text-sm font-bold text-white group-hover:text-cyan-300 cursor-pointer transition-colors line-clamp-1 truncate"
                  >
                    {p.judul}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono flex flex-wrap items-center gap-2">
                    <span>{p.jumlah} klip terpotong</span>
                    <span>•</span>
                    <span>Durasi {formatDurasi(p.durasi || 572)}</span>
                    <span>•</span>
                    <span className="capitalize">{p.ai || 'lokal'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onBukaProyek(p.nama)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Buka proyek</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleBukaFolder(p)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Buka folder</span>
                </button>
                <button
                  onClick={() => handleHapus(p)}
                  className="p-2 rounded-xl hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-900/40 transition-colors"
                  title="Hapus proyek"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
