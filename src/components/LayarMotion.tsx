import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Loader2,
  Check,
  Film,
  Palette,
  FolderOpen
} from 'lucide-react';

export interface MotionScene {
  judul: string;
  teks: string;
  kunci: string[];
  ikon: string;
}

export interface MotionTemplate {
  id: string;
  label: string;
  category: 'Ilustrasi' | 'Tipografi' | 'Editorial' | 'UI/UX' | 'Sosial' | 'Teknologi' | 'Bisnis' | 'Edukasi';
  catGroup: 'ilustrasi' | 'modern';
  tag: string;
  accent: string;
  bgGradient: string;
  previewBg: string;
  textColor: string;
  iconBg: string;
  renderPreview: (active: boolean) => React.ReactNode;
}

export const TEMPLATES_24: MotionTemplate[] = [
  // ── 10 GAYA ILUSTRASI & SENI ──
  {
    id: 'piksel',
    label: 'Pixel Art',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Retro 8-Bit • Laser Grid',
    accent: '#ffd65a',
    bgGradient: 'from-purple-950/70 via-indigo-950/50 to-slate-950',
    previewBg: '#1b0d2b',
    textColor: '#ffffff',
    iconBg: '#4a1575',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 font-mono bg-gradient-to-b from-[#180929] to-[#0a0414]">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:8px_8px]" />
        <div className="z-10 text-[7px] text-amber-300 font-bold tracking-widest uppercase">PIXEL 8-BIT</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-8 h-8 rounded bg-purple-600/40 border border-purple-400/50 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(255,214,90,0.4)]">
            👾
          </div>
          <span className="text-[8px] font-black text-white mt-1 bg-black/60 px-1 py-0.5 rounded border border-amber-400/40">
            RETRO ARCADE
          </span>
        </div>
        <div className="z-10 h-1.5 w-full bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 rounded-full" />
      </div>
    ),
  },
  {
    id: 'kapur',
    label: 'Papan Kapur',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Chalkboard • Sketsa Hijau',
    accent: '#ffe27a',
    bgGradient: 'from-emerald-950/80 via-slate-950 to-slate-950',
    previewBg: '#0f241a',
    textColor: '#f4f1e6',
    iconBg: '#1a4030',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#0d2218] border border-emerald-900/40 font-serif">
        <div className="z-10 text-[7px] text-emerald-300/80 tracking-wider">CHALK CLASSROOM</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-8 h-8 rounded-full border border-dashed border-amber-200/60 flex items-center justify-center text-sm">
            ✏️
          </div>
          <span className="text-[8px] text-amber-100 font-bold mt-1 tracking-wider border-b border-amber-200/40">
            Sketsa Kapur
          </span>
        </div>
        <div className="z-10 flex gap-1">
          <span className="w-2 h-1 bg-white/40 rounded-sm" />
          <span className="w-4 h-1 bg-amber-200/50 rounded-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'emas',
    label: 'Sketsa Emas',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Luxury Gold • Neon Outline',
    accent: '#f7c46a',
    bgGradient: 'from-yellow-950/70 via-amber-950/40 to-slate-950',
    previewBg: '#120d04',
    textColor: '#fff6e0',
    iconBg: '#362308',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-[#140f06] to-[#080602] border border-amber-500/20">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-amber-500/15 rounded-full blur-xl" />
        <div className="z-10 text-[7px] text-amber-400 font-bold tracking-widest uppercase">GOLD PRESTIGE</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300/30 to-amber-700/20 border border-amber-400 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(247,196,106,0.35)]">
            ✨
          </div>
          <span className="text-[8px] font-bold text-amber-200 mt-1 drop-shadow-[0_0_8px_rgba(247,196,106,0.5)]">
            Garis Emas Mewah
          </span>
        </div>
        <div className="z-10 h-0.5 w-12 mx-auto bg-amber-400/80 rounded-full" />
      </div>
    ),
  },
  {
    id: 'ps2',
    label: 'Low-poly PS2',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Retro 3D • Dusk Sky',
    accent: '#ffcf4a',
    bgGradient: 'from-indigo-950/80 via-purple-950/60 to-slate-950',
    previewBg: '#140c24',
    textColor: '#ffffff',
    iconBg: '#3a1e5c',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-[#1c0f33] via-[#35164d] to-[#0a0512]">
        <div className="z-10 text-[7px] text-indigo-300 font-mono tracking-wider">PS2 GEOMETRIC</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-8 h-8 bg-purple-600/30 border border-purple-300/60 transform rotate-12 flex items-center justify-center text-sm shadow-md">
            🎮
          </div>
          <span className="text-[8px] font-black text-amber-300 mt-1 uppercase tracking-wider">
            POLYGON RETRO
          </span>
        </div>
        <div className="z-10 w-full h-2 bg-gradient-to-t from-purple-900/60 to-transparent" />
      </div>
    ),
  },
  {
    id: 'komik',
    label: 'Komik Pop-Art',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Pop Art • Halftone Burst',
    accent: '#e83a3a',
    bgGradient: 'from-amber-600/30 via-yellow-950/50 to-slate-950',
    previewBg: '#2a1a04',
    textColor: '#111111',
    iconBg: '#facc15',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#facc15] text-slate-950">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] bg-[size:6px_6px]" />
        <div className="z-10 text-[7px] font-black uppercase tracking-tighter bg-red-600 text-white px-1 py-0.5 rounded-sm inline-block self-start">
          POW! ACTION
        </div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-9 h-9 rounded-lg bg-white border-2 border-black flex items-center justify-center text-base shadow-[2px_2px_0px_#000]">
            💥
          </div>
          <span className="text-[8px] font-black text-slate-950 mt-1 bg-white px-1 border border-black uppercase tracking-tight">
            GAYA KOMIK
          </span>
        </div>
        <div className="z-10 text-[7px] font-bold bg-black text-yellow-300 text-center py-0.5 rounded">
          BOOM EFFECT
        </div>
      </div>
    ),
  },
  {
    id: 'flat',
    label: 'Flat Vector',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Modern Vector • Sunset',
    accent: '#ffb347',
    bgGradient: 'from-sky-950/80 via-blue-950/60 to-slate-950',
    previewBg: '#08172e',
    textColor: '#ffffff',
    iconBg: '#153b66',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-[#0a1e3b] via-[#102e54] to-[#040d1a]">
        <div className="z-10 text-[7px] text-sky-300 font-sans font-medium">CLEAN VECTOR</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-sm shadow-sm">
            🌙
          </div>
          <span className="text-[8px] font-bold text-white mt-1">Vektor Modern</span>
        </div>
        <div className="z-10 w-full h-2 rounded-t-full bg-sky-400/30" />
      </div>
    ),
  },
  {
    id: 'stickman',
    label: 'Stickman Minimalis',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Blackboard Outline • Viral',
    accent: '#ffffff',
    bgGradient: 'from-slate-900/90 via-black to-slate-950',
    previewBg: '#05070a',
    textColor: '#ffffff',
    iconBg: '#1f2937',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-black border border-slate-800">
        <div className="z-10 text-[7px] text-slate-400 font-mono">STICKMAN STORY</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm">
            🧍
          </div>
          <span className="text-[8px] font-mono text-white mt-1">Sketsa Coretan</span>
        </div>
        <div className="z-10 h-0.5 w-full bg-white/40" />
      </div>
    ),
  },
  {
    id: 'cgi',
    label: 'CGI Mengilap',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: '3D Render • Glossy Neon',
    accent: '#38c6ff',
    bgGradient: 'from-cyan-950/80 via-blue-900/40 to-slate-950',
    previewBg: '#071626',
    textColor: '#eaf6ff',
    iconBg: '#10375c',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-[#0b1d33] to-[#040912]">
        <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-400/20 rounded-full blur-lg" />
        <div className="z-10 text-[7px] text-cyan-400 font-mono tracking-wider">CGI REFLECTION</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-sm shadow-[0_0_16px_rgba(56,198,255,0.4)]">
            💎
          </div>
          <span className="text-[8px] font-black text-cyan-200 mt-1 uppercase tracking-wider">
            3D GLOSSY
          </span>
        </div>
        <div className="z-10 h-1 w-full bg-cyan-400/50 rounded-full" />
      </div>
    ),
  },
  {
    id: 'bata',
    label: 'Bata Mainan',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Lego Bricks • Warna Cerah',
    accent: '#e8443a',
    bgGradient: 'from-blue-900/40 via-yellow-950/30 to-slate-950',
    previewBg: '#1e3a5f',
    textColor: '#13233a',
    iconBg: '#e8443a',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-sky-400 to-sky-200 text-slate-900">
        <div className="z-10 text-[7px] font-black text-blue-950 uppercase">BLOCK BRICK</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white text-sm shadow-md">
            🧱
          </div>
          <span className="text-[8px] font-black text-red-900 mt-1 uppercase">BATA MAINAN</span>
        </div>
        <div className="z-10 flex gap-0.5 justify-center">
          <span className="w-3 h-2 bg-red-600 rounded-t-sm" />
          <span className="w-3 h-2 bg-yellow-400 rounded-t-sm" />
          <span className="w-3 h-2 bg-blue-600 rounded-t-sm" />
        </div>
      </div>
    ),
  },
  {
    id: 'clay',
    label: 'Clay 3D',
    category: 'Ilustrasi',
    catGroup: 'ilustrasi',
    tag: 'Soft Pastel • Tanah Liat',
    accent: '#e2683c',
    bgGradient: 'from-amber-900/40 via-orange-950/30 to-slate-950',
    previewBg: '#2b1b11',
    textColor: '#5a3a24',
    iconBg: '#e2683c',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-[#fbf1e2] to-[#ead7bd] text-[#5a3a24]">
        <div className="z-10 text-[7px] font-bold text-amber-900">CLAY DOUGH</div>
        <div className="z-10 flex flex-col items-center my-auto">
          <div className="w-8 h-8 rounded-2xl bg-orange-400/80 shadow-[0_4px_10px_rgba(226,104,60,0.4)] flex items-center justify-center text-sm text-white">
            🧸
          </div>
          <span className="text-[8px] font-extrabold text-amber-950 mt-1">Clay 3D Lembut</span>
        </div>
        <div className="z-10 h-1.5 w-10 mx-auto bg-amber-800/20 rounded-full" />
      </div>
    ),
  },

  // ── 14 GAYA TIPOGRAFI, MODERN & EDITORIAL ──
  {
    id: 'garis',
    label: 'Garis Blueprint',
    category: 'Tipografi',
    catGroup: 'modern',
    tag: 'Technical Grid • Cyan Line',
    accent: '#4FC3F7',
    bgGradient: 'from-sky-950/80 to-slate-950',
    previewBg: '#0B1B2B',
    textColor: '#E8F1FA',
    iconBg: '#1e3f5c',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#0B1B2B] text-sky-300 font-mono border border-sky-500/20">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#4fc3f7_1px,transparent_1px),linear-gradient(to_bottom,#4fc3f7_1px,transparent_1px)] bg-[size:10px_10px]" />
        <div className="z-10 text-[7px]">BLUEPRINT [01]</div>
        <div className="z-10 text-center my-auto">
          <div className="text-[10px] font-bold text-white">GARIS TEKNO</div>
          <div className="text-[7px] text-sky-400 mt-0.5">X: 540 | Y: 960</div>
        </div>
        <div className="z-10 text-[6px] text-slate-400">FPS: 30 • RES: 1080x1920</div>
      </div>
    ),
  },
  {
    id: 'neon',
    label: 'Neon Cyber',
    category: 'Tipografi',
    catGroup: 'modern',
    tag: 'Cyberpunk • Magenta Glow',
    accent: '#FF3EA5',
    bgGradient: 'from-fuchsia-950/80 via-purple-950/60 to-slate-950',
    previewBg: '#1a0524',
    textColor: '#FFFFFF',
    iconBg: '#4d0b38',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-[#1a0524] to-[#08020d] border border-pink-500/30">
        <div className="z-10 text-[7px] text-pink-400 font-bold uppercase tracking-widest">CYBER NEON</div>
        <div className="z-10 text-center my-auto">
          <div className="text-[11px] font-black text-pink-400 drop-shadow-[0_0_10px_rgba(255,62,165,0.8)]">
            NEON POP
          </div>
          <div className="text-[7px] text-cyan-300 mt-0.5">KINETIC PULSE</div>
        </div>
        <div className="z-10 h-1 w-full bg-gradient-to-r from-pink-500 to-cyan-400 shadow-[0_0_8px_#ff3ea5]" />
      </div>
    ),
  },
  {
    id: 'kertas',
    label: 'Kertas Vintage',
    category: 'Tipografi',
    catGroup: 'modern',
    tag: 'Ruled Paper • Red Margin',
    accent: '#E4572E',
    bgGradient: 'from-amber-950/30 via-slate-900 to-slate-950',
    previewBg: '#F2EBDD',
    textColor: '#1D1A16',
    iconBg: '#E4572E',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#f4ece0] text-slate-800 font-serif">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-red-400/60" />
        <div className="z-10 text-[7px] text-amber-900 pl-3">NOTEBOOK SERIF</div>
        <div className="z-10 pl-3 my-auto">
          <div className="text-[9px] font-bold text-amber-950">Kertas Catatan</div>
          <div className="text-[7px] text-slate-600 mt-0.5">Tulisan rapi & klasik</div>
        </div>
        <div className="z-10 pl-3 text-[6px] text-slate-500">Hal. 01 / 05</div>
      </div>
    ),
  },
  {
    id: 'sinematik',
    label: 'Panggung Sinematik',
    category: 'Editorial',
    catGroup: 'modern',
    tag: 'Minimal Gallery • Giant Type',
    accent: '#1b1b1b',
    bgGradient: 'from-slate-800/40 to-slate-950',
    previewBg: '#ecebe7',
    textColor: '#1b1b1b',
    iconBg: '#1b1b1b',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-b from-[#fbfbf9] to-[#dcdcd8] text-slate-900 font-sans">
        <div className="z-10 text-[7px] font-bold tracking-widest uppercase text-slate-500">MUSEUM ARCHIVE</div>
        <div className="z-10 text-center my-auto">
          <div className="text-[12px] font-black tracking-tighter text-slate-900 uppercase">SINEMATIK</div>
          <div className="text-[7px] font-medium text-slate-600 mt-0.5">Ruang Galeri Mewah</div>
        </div>
        <div className="z-10 text-[6px] text-slate-400 text-center">EPISODE 01</div>
      </div>
    ),
  },
  {
    id: 'minimal',
    label: 'Kata Kunci Minimal',
    category: 'Editorial',
    catGroup: 'modern',
    tag: 'Pure White • Green Aura',
    accent: '#3fae3f',
    bgGradient: 'from-emerald-950/30 to-slate-950',
    previewBg: '#ffffff',
    textColor: '#111111',
    iconBg: '#3fae3f',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-white text-slate-900 font-sans">
        <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-full border-4 border-emerald-400/30 blur-sm" />
        <div className="z-10 text-[7px] text-emerald-600 font-bold">FOCUS MINIMAL</div>
        <div className="z-10 text-center my-auto">
          <div className="text-[10px] font-black text-slate-900">Kata Kunci</div>
          <div className="text-[7px] text-emerald-600 font-semibold mt-0.5">Highlight Cerdas</div>
        </div>
        <div className="z-10 h-1 w-6 bg-emerald-500 rounded-full" />
      </div>
    ),
  },
  {
    id: 'kolase',
    label: 'Kolase Kertas',
    category: 'Editorial',
    catGroup: 'modern',
    tag: 'Torn Kraft Paper • Vox Style',
    accent: '#f5d23a',
    bgGradient: 'from-amber-950/40 via-yellow-950/30 to-slate-950',
    previewBg: '#efe5cf',
    textColor: '#1b1b1b',
    iconBg: '#c9a46b',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#efe5cf] text-slate-900 font-serif">
        <div className="absolute top-0 inset-x-0 h-4 bg-[#c9a46b] opacity-80" />
        <div className="z-10 text-[7px] font-bold text-amber-950 mt-2">VOX COLLAGE</div>
        <div className="z-10 my-auto text-center">
          <span className="text-[9px] font-bold bg-[#f5d23a] px-1 py-0.5 shadow-sm">KOLASE TERTATA</span>
        </div>
        <div className="z-10 text-[6px] text-slate-600">Sobekan Kertas Alami</div>
      </div>
    ),
  },
  {
    id: 'hangat',
    label: 'Editorial Hangat',
    category: 'Editorial',
    catGroup: 'modern',
    tag: 'Peach Sunset • Leaf Shadow',
    accent: '#a5512a',
    bgGradient: 'from-orange-950/40 via-amber-950/30 to-slate-950',
    previewBg: '#f8e3d0',
    textColor: '#2a1a12',
    iconBg: '#a5512a',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-br from-[#f8e3d0] to-[#e7b48d] text-[#2a1a12]">
        <div className="z-10 text-[7px] font-serif uppercase tracking-wider text-amber-900">EDITORIAL</div>
        <div className="z-10 my-auto text-center">
          <div className="text-[10px] font-serif italic text-amber-950 font-bold">Hangat Elegan</div>
          <div className="text-[7px] text-amber-800/80 mt-0.5">Cahaya Senja</div>
        </div>
        <div className="z-10 h-0.5 w-8 bg-amber-800/40" />
      </div>
    ),
  },
  {
    id: 'kaca',
    label: 'UI Aplikasi Kaca',
    category: 'UI/UX',
    catGroup: 'modern',
    tag: 'Glassmorphism • Frosted Pill',
    accent: '#4f8cff',
    bgGradient: 'from-blue-950/60 to-slate-950',
    previewBg: '#eef1f7',
    textColor: '#0f172a',
    iconBg: '#4f8cff',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#eef1f7] text-slate-800 font-sans">
        <div className="absolute top-2 right-2 w-10 h-10 bg-blue-400/30 rounded-full blur-md" />
        <div className="z-10 text-[7px] text-blue-600 font-semibold">GLASS UI [iOS]</div>
        <div className="z-10 my-auto">
          <div className="bg-white/70 backdrop-blur-md p-1 rounded-lg border border-white/80 shadow-sm text-center">
            <div className="text-[8px] font-bold text-slate-900">Efek Kaca Tempar</div>
            <div className="text-[6px] text-slate-500">Mulus & Bersih</div>
          </div>
        </div>
        <div className="z-10 flex justify-between items-center text-[6px] text-slate-400">
          <span>Tab 1</span>
          <span className="w-4 h-1 bg-blue-500 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 'bicara',
    label: 'Bicara + Sisipan',
    category: 'Sosial',
    catGroup: 'modern',
    tag: 'Podcast Chat • Warm Bubble',
    accent: '#7c5cff',
    bgGradient: 'from-indigo-950/60 to-slate-950',
    previewBg: '#fbe2d6',
    textColor: '#1e1630',
    iconBg: '#7c5cff',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#fbe2d6] text-slate-900 font-sans">
        <div className="z-10 text-[7px] text-indigo-900 font-bold">DIALOG PODCAST</div>
        <div className="z-10 space-y-1 my-auto">
          <div className="bg-white/80 p-1 rounded-lg text-[7px] font-semibold text-slate-800 shadow-xs">
            "Ini poin utamanya..."
          </div>
          <div className="bg-purple-600/20 p-1 rounded-lg text-[6px] text-purple-900 text-right">
            Sisipan tanggapan
          </div>
        </div>
        <div className="z-10 text-[6px] text-indigo-800 font-medium">Bicara Mengalir</div>
      </div>
    ),
  },
  {
    id: 'retro',
    label: 'Dokumenter Retro',
    category: 'Editorial',
    catGroup: 'modern',
    tag: 'Color Panels • Monogram',
    accent: '#f2c230',
    bgGradient: 'from-yellow-950/40 via-red-950/30 to-slate-950',
    previewBg: '#f2f2f2',
    textColor: '#111111',
    iconBg: '#f2c230',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#f2f2f2] text-slate-900 font-sans">
        <div className="z-10 text-[7px] font-mono text-slate-600">ARCHIVE 1980</div>
        <div className="z-10 my-auto text-center">
          <div className="text-[14px] font-black text-red-600 leading-none">RETRO</div>
          <div className="text-[7px] font-bold text-slate-800 mt-0.5 bg-yellow-400 px-1 py-0.2 inline-block">
            DOKUMENTER
          </div>
        </div>
        <div className="z-10 text-[6px] text-slate-500">Panel Berwarna Rata</div>
      </div>
    ),
  },
  {
    id: 'tekno',
    label: 'Tekno Gelap Oranye',
    category: 'Teknologi',
    catGroup: 'modern',
    tag: 'Dark Stage • Amber Arc',
    accent: '#ffb36b',
    bgGradient: 'from-orange-950/70 via-stone-950 to-slate-950',
    previewBg: '#1b1410',
    textColor: '#f4f1ee',
    iconBg: '#ffb36b',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#140e0b] border border-orange-500/20 text-orange-200 font-mono">
        <div className="z-10 text-[7px] text-orange-400">CYBER STAGE</div>
        <div className="z-10 my-auto text-center">
          <div className="w-8 h-8 rounded-full border-2 border-orange-400 mx-auto flex items-center justify-center text-xs shadow-[0_0_12px_#ffb36b]">
            ⚡
          </div>
          <div className="text-[8px] font-bold text-white mt-1">Tekno Oranye</div>
        </div>
        <div className="z-10 h-0.5 w-full bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
      </div>
    ),
  },
  {
    id: 'iklan',
    label: 'Iklan Jasa Krem',
    category: 'Bisnis',
    catGroup: 'modern',
    tag: 'Swiss Grid • Barcode Accent',
    accent: '#d62839',
    bgGradient: 'from-stone-900/60 to-slate-950',
    previewBg: '#faf6ef',
    textColor: '#0b0b0b',
    iconBg: '#d62839',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#faf6ef] text-slate-900 font-sans">
        <div className="z-10 flex justify-between items-center text-[6px] font-mono text-slate-500">
          <span>PROMO.01</span>
          <span className="text-red-600 font-bold">SWISS</span>
        </div>
        <div className="z-10 my-auto">
          <div className="text-[9px] font-black text-slate-900 leading-tight">Jasa Profesional</div>
          <div className="text-[7px] text-red-600 font-bold mt-0.5">Penawaran Menarik</div>
        </div>
        <div className="z-10 flex items-center justify-between">
          <span className="text-[6px] font-mono">||||||||||||||</span>
          <span className="w-2 h-2 rounded-full bg-red-600" />
        </div>
      </div>
    ),
  },
  {
    id: 'sorot',
    label: 'Grid Lampu Sorot',
    category: 'Editorial',
    catGroup: 'modern',
    tag: 'Paper Texture • Spotlight Beam',
    accent: '#b8241c',
    bgGradient: 'from-red-950/30 to-slate-950',
    previewBg: '#fbfbf8',
    textColor: '#141414',
    iconBg: '#b8241c',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#fbfbf8] text-slate-900 font-serif">
        <div className="absolute top-0 right-0 w-16 h-28 bg-amber-300/20 [clip-path:polygon(50%_0%,100%_0%,100%_100%,0%_100%)] pointer-events-none" />
        <div className="z-10 text-[7px] font-sans text-slate-500">SPOTLIGHT</div>
        <div className="z-10 my-auto text-center">
          <div className="text-[10px] font-bold italic text-slate-900">Lampu Sorot</div>
          <div className="text-[7px] text-red-700 mt-0.5 font-sans font-semibold">Fokus Tajam</div>
        </div>
        <div className="z-10 h-0.5 w-10 bg-slate-900" />
      </div>
    ),
  },
  {
    id: 'daftar',
    label: 'Daftar Sumber',
    category: 'Edukasi',
    catGroup: 'modern',
    tag: 'Checklist Grid • Teal Accent',
    accent: '#f07a2b',
    bgGradient: 'from-teal-950/40 to-slate-950',
    previewBg: '#f6f7f4',
    textColor: '#1d2a2b',
    iconBg: '#f07a2b',
    renderPreview: () => (
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-2 bg-[#f6f7f4] text-slate-900 font-sans">
        <div className="z-10 text-[7px] text-teal-700 font-mono font-bold">SUMMARY LIST</div>
        <div className="z-10 space-y-1 my-auto">
          <div className="flex items-center gap-1 text-[7px] font-semibold text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>Poin Ke-1 Penting</span>
          </div>
          <div className="flex items-center gap-1 text-[7px] font-semibold text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Poin Ke-2 Solusi</span>
          </div>
        </div>
        <div className="z-10 text-[6px] text-slate-500">Rangkuman Sumber Resmi</div>
      </div>
    ),
  },
];

export const LayarMotion: React.FC = () => {
  const [tabIsi, setTabIsi] = useState<'topik' | 'json' | 'adegan'>('topik');
  const [filterKategori, setFilterKategori] = useState<'semua' | 'ilustrasi' | 'modern'>('semua');
  const [topikInput, setTopikInput] = useState('3 kebiasaan pagi yang bikin produktif');
  const [jsonInput, setJsonInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('piksel');
  const [isAiDrawing, setIsAiDrawing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusTeks, setStatusTeks] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Scenes state for interactive live playback
  const [scenes, setScenes] = useState<MotionScene[]>([
    {
      judul: 'Pernah Lelah Saat Bangun?',
      teks: 'Pernah gak sih baru bangun tidur tapi badan udah capek banget?',
      kunci: ['capek', 'bangun'],
      ikon: '⏰',
    },
    {
      judul: 'Jangan Sentuh Layar HP',
      teks: 'Langkah pertama, jangan pernah buka HP selama tiga puluh menit pertama.',
      kunci: ['jangan', 'layar'],
      ikon: '📱',
    },
    {
      judul: 'Segelas Air Hangat',
      teks: 'Minum segelas air putih hangat langsung merehidrasi otak dan energimu.',
      kunci: ['air', 'otak'],
      ikon: '💧',
    },
    {
      judul: 'Sinar Matahari 5 Menit',
      teks: 'Dapatkan sinar matahari pagi untuk mengunci fokus sepanjang hari.',
      kunci: ['matahari', 'fokus'],
      ikon: '☀️',
    },
    {
      judul: 'Simpan & Terapkan!',
      teks: 'Simpan video ini sekarang dan rasakan perbedaannya besok pagi!',
      kunci: ['simpan', 'sekarang'],
      ikon: '🔥',
    },
  ]);

  // Live Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'live' | 'mp4'>('live');
  const [lastProyekNama, setLastProyekNama] = useState<string | null>(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<'id-ID-GadisNeural' | 'id-ID-ArdiNeural'>('id-ID-GadisNeural');

  const activeTmpl = TEMPLATES_24.find((t) => t.id === selectedTemplate) || TEMPLATES_24[0];
  const filteredTemplates =
    filterKategori === 'semua'
      ? TEMPLATES_24
      : TEMPLATES_24.filter((t) => t.catGroup === filterKategori);

  // Playback timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            // Next scene
            setCurrentSceneIdx((curr) => {
              const next = (curr + 1) % scenes.length;
              if (next === 0) {
                setIsPlaying(false);
                return 0;
              }
              return next;
            });
            return 0;
          }
          return prev + 4; // ~2.5 seconds per scene
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, scenes.length]);

  // Speak text using Web Speech API when scene changes during playback
  useEffect(() => {
    if (isPlaying && isSpeechEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const current = scenes[currentSceneIdx];
      if (current?.teks) {
        const u = new SpeechSynthesisUtterance(current.teks);
        u.lang = 'id-ID';
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      }
    }
    if (!isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentSceneIdx, isPlaying, isSpeechEnabled, scenes]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (playbackProgress >= 100 && currentSceneIdx === scenes.length - 1) {
        setCurrentSceneIdx(0);
        setPlaybackProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const handleResetPlayer = () => {
    setIsPlaying(false);
    setCurrentSceneIdx(0);
    setPlaybackProgress(0);
  };

  // Smart Contextual Script Generator (Bahasa Indonesia Alami)
  const buatNaskahDariTopik = (input: string): MotionScene[] => {
    const raw = (input || '').trim();
    const clean = raw.replace(/[.,?!]+$/, '');
    const lower = clean.toLowerCase();

    // 1. Topik Game / PC Gaming / Mabar / Esports
    if (lower.includes('game') || lower.includes('gaming') || lower.includes('pc') || lower.includes('mabar') || lower.includes('esport')) {
      return [
        {
          judul: '3 Game PC Terpopuler',
          teks: 'Ini dia tiga game PC paling ramai dan bikin ketagihan di Indonesia saat ini!',
          kunci: ['game', 'indonesia'],
          ikon: '🎮',
        },
        {
          judul: '1. Valorant & Point Blank',
          teks: 'Game tembak-menembak taktis legendaris dengan jutaan pemain aktif setiap harinya.',
          kunci: ['taktis', 'pemain'],
          ikon: '🎯',
        },
        {
          judul: '2. Dota 2 & Steam',
          teks: 'Komunitas esports terbesar dengan strategi pertempuran tim tiada tanding.',
          kunci: ['esports', 'komunitas'],
          ikon: '⚡',
        },
        {
          judul: '3. GTA V Roleplay',
          teks: 'Server kota virtual Indonesia yang selalu seru, viral, dan penuh drama seru.',
          kunci: ['virtual', 'viral'],
          ikon: '🚀',
        },
        {
          judul: 'Apa Game Favoritmu?',
          teks: 'Tulis game jagoanmu di kolom komentar dan bagikan ke teman mabar kamu sekarang!',
          kunci: ['komentar', 'bagikan'],
          ikon: '🔥',
        },
      ];
    }

    // 2. Fakta Sains / Alam Semesta
    if (lower.includes('sains') || lower.includes('alam') || lower.includes('semesta') || lower.includes('fisika') || lower.includes('antariksa')) {
      return [
        {
          judul: 'Fakta Sains Menakjubkan',
          teks: 'Pernahkah kamu membayangkan keajaiban luar biasa yang ada di alam semesta kita?',
          kunci: ['sains', 'semesta'],
          ikon: '💡',
        },
        {
          judul: '1. Kecepatan Cahaya',
          teks: 'Cahaya mampu mengitari bumi hingga tujuh setengah kali hanya dalam satu detik.',
          kunci: ['cahaya', 'bumi'],
          ikon: '⚡',
        },
        {
          judul: '2. Misteri Laut Dalam',
          teks: 'Lebih dari delapan puluh persen kedalaman lautan bumi belum pernah terjamah manusia.',
          kunci: ['lautan', 'misteri'],
          ikon: '🌊',
        },
        {
          judul: '3. Waktu di Antariksa',
          teks: 'Gravitasi masif dapat memperlambat jalannya waktu nyata sesuai teori relativitas.',
          kunci: ['gravitasi', 'waktu'],
          ikon: '🪐',
        },
        {
          judul: 'Keren Banget Kan?',
          teks: 'Simpan video ini sekarang dan ikuti untuk fakta sains luar biasa berikutnya!',
          kunci: ['simpan', 'sains'],
          ikon: '🔥',
        },
      ];
    }

    // 3. Tips Produktivitas Pagi / Kebiasaan
    if (lower.includes('pagi') || lower.includes('produktivitas') || lower.includes('kebiasaan') || lower.includes('fokus') || lower.includes('rutinitas')) {
      return [
        {
          judul: '3 Tips Produktivitas Pagi',
          teks: 'Lakukan tiga kebiasaan ini agar harimu penuh energi dan fokus sepanjang hari.',
          kunci: ['kebiasaan', 'fokus'],
          ikon: '⏰',
        },
        {
          judul: '1. Jangan Sentuh Ponsel',
          teks: 'Hindari membuka ponsel selama tiga puluh menit pertama setelah kamu bangun tidur.',
          kunci: ['hindari', 'ponsel'],
          ikon: '📱',
        },
        {
          judul: '2. Hidrasi Segelas Air',
          teks: 'Minum air putih hangat langsung merehidrasi organ tubuh dan mengaktifkan energimu.',
          kunci: ['air', 'energi'],
          ikon: '💧',
        },
        {
          judul: '3. Sinar Matahari 5 Menit',
          teks: 'Dapatkan paparan sinar matahari pagi untuk mengunci ritme sirkadian dan konsentrasi.',
          kunci: ['matahari', 'konsentrasi'],
          ikon: '☀️',
        },
        {
          judul: 'Mulai Besok Pagi!',
          teks: 'Simpan video ini sekarang dan buktikan hasilnya di pagi harimu besok!',
          kunci: ['simpan', 'sekarang'],
          ikon: '🔥',
        },
      ];
    }

    // 4. Komunikasi / Psikologi
    if (lower.includes('komunikasi') || lower.includes('psikologi') || lower.includes('bicara') || lower.includes('hipnotik') || lower.includes('ngobrol')) {
      return [
        {
          judul: 'Trik Komunikasi Hipnotik',
          teks: 'Gunakan tiga trik psikologi ini agar perkataanmu selalu didengarkan dan diingat.',
          kunci: ['psikologi', 'didengarkan'],
          ikon: '💡',
        },
        {
          judul: '1. Sebut Nama Lawan Bicara',
          teks: 'Menyebut nama seseorang secara natural langsung mengaktifkan rasa percaya diri mereka.',
          kunci: ['percaya', 'bicara'],
          ikon: '🧠',
        },
        {
          judul: '2. Jeda Dua Detik',
          teks: 'Berikan jeda sebelum menjawab untuk menunjukkan wibawa dan pemikiran yang matang.',
          kunci: ['jeda', 'matang'],
          ikon: '⏳',
        },
        {
          judul: '3. Samakan Tempo Bicara',
          teks: 'Secara halus ikuti ritme bicara lawan bicaramu untuk membangun koneksi instan.',
          kunci: ['ritme', 'koneksi'],
          ikon: '⚡',
        },
        {
          judul: 'Coba Hari Ini!',
          teks: 'Simpan tips ini sekarang dan praktikkan langsung di obrolanmu hari ini!',
          kunci: ['simpan', 'sekarang'],
          ikon: '🔥',
        },
      ];
    }

    // 5. Finansial / Mindset Uang
    if (lower.includes('finansial') || lower.includes('uang') || lower.includes('investasi') || lower.includes('gaji') || lower.includes('kaya') || lower.includes('usia 20')) {
      return [
        {
          judul: 'Mindset Finansial Cerdas',
          teks: 'Hindari jebakan keuangan ini sebelum menyesal di kemudian hari!',
          kunci: ['keuangan', 'cerdas'],
          ikon: '💰',
        },
        {
          judul: '1. Stop Utang Konsumtif',
          teks: 'Jangan membeli barang mahal hanya demi gengsi semu di media sosial.',
          kunci: ['gengsi', 'utang'],
          ikon: '⚠️',
        },
        {
          judul: '2. Bangun Dana Darurat',
          teks: 'Amankan tabungan minimal tiga sampai enam bulan pengeluaran untuk proteksi hidupmu.',
          kunci: ['tabungan', 'darurat'],
          ikon: '🛡️',
        },
        {
          judul: '3. Upgrade Skill Berharga',
          teks: 'Investasi ilmu dan keahlian adalah aset terbaik yang terus menghasilkan nilai tinggi.',
          kunci: ['investasi', 'keahlian'],
          ikon: '📈',
        },
        {
          judul: 'Mulai Amankan Masa Depan!',
          teks: 'Simpan video ini sekarang dan mulailah kelola keuanganmu dengan bijak!',
          kunci: ['simpan', 'bijak'],
          ikon: '🔥',
        },
      ];
    }

    // 6. Generic Contextual Extraction untuk topik bebas
    const kata = clean.split(/\s+/).filter(Boolean);
    const k1 = kata[0] || 'rahasia';
    const judulHook = kata.slice(0, 4).join(' ');

    return [
      {
        judul: `Tahukah Kamu Soal ${judulHook}?`,
        teks: `Pernah gak sih kamu kepikiran hal paling krusial tentang ${clean}?`,
        kunci: [k1, 'rahasia'],
        ikon: '💡',
      },
      {
        judul: '1. Fondasi Paling Utama',
        teks: `Langkah pertama yang paling menentukan adalah memahami esensi dasar dari ${clean}.`,
        kunci: ['mendasar', 'utama'],
        ikon: '⚡',
      },
      {
        judul: '2. Konsistensi Eksekusi',
        teks: `Kuncinya bukan pada motivasi sesaat, melainkan kebiasaan kecil teratur setiap hari.`,
        kunci: ['kebiasaan', 'fokus'],
        ikon: '🎯',
      },
      {
        judul: '3. Hasil Yang Nyata',
        teks: `Saat kamu konsisten, perubahan drastis akan mulai tampak nyata dan memuaskan.`,
        kunci: ['nyata', 'perubahan'],
        ikon: '🚀',
      },
      {
        judul: 'Simpan Video Ini!',
        teks: `Simpan video ini sekarang dan bagikan ke teman terdekatmu!`,
        kunci: ['simpan', 'sekarang'],
        ikon: '🔥',
      },
    ];
  };

  // Smart AI Script Generator trigger
  const handleGenerateScriptAI = () => {
    const newScenes = buatNaskahDariTopik(topikInput);
    setScenes(newScenes);
    setJsonInput(
      JSON.stringify(
        {
          judul: topikInput.trim() || 'CalClip Motion Video',
          gaya: selectedTemplate,
          handle: 'calclip.in',
          adegan: newScenes,
        },
        null,
        2
      )
    );
    setTabIsi('adegan');
    handleResetPlayer();
  };

  const handleCopyPrompt = () => {
    const promptText = `Kamu penulis naskah video pendek berbahasa Indonesia. Topik: [TOPIK]. Tulis 4–7 adegan; adegan 1 hook; satu kalimat narasi per adegan maks 14 kata; judul layar 2–5 kata; jangan mengarang angka; adegan terakhir ajakan. Balas HANYA JSON: {"judul":"...","adegan":[{"judul":"2-5 kata","teks":"kalimat narasi","kunci":["kata"],"ikon":"🔥"}]}`;
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleBukaFolder = () => {
    if (!lastProyekNama) return;
    fetch('/api/buka-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jenis: 'motion', nama: lastProyekNama }),
    }).catch(() => {});
  };

  const handleBuatVideo = async () => {
    setIsGenerating(true);
    setStatusTeks('Mengirim permintaan ke Remotion Backend...');
    setRenderedVideoUrl(null);

    // Pastikan adegan sesuai dengan topik yang diketik user jika di tab topik
    let targetScenes = scenes;
    if (tabIsi === 'topik') {
      targetScenes = buatNaskahDariTopik(topikInput);
      setScenes(targetScenes);
    }

    const naskahFinal = {
      judul: topikInput.trim() || 'CalClip Motion Video',
      gaya: selectedTemplate,
      handle: 'calclip.in',
      adegan: targetScenes,
    };

    try {
      const res = await fetch('/api/motion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topik: topikInput.trim(),
          naskah: JSON.stringify(naskahFinal),
          gaya: selectedTemplate,
          suara_id: selectedVoice,
          ai: 'lokal',
          gambar: isAiDrawing,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const proyekNama = data.proyek || data.nama;
        const targetJobId = data.id;
        if (proyekNama) setLastProyekNama(proyekNama);
        setStatusTeks('Memulai render Remotion Engine...');
        
        let secondsElapsed = 0;
        const interval = setInterval(async () => {
          secondsElapsed += 1;
          try {
            const stRes = await fetch('/api/status');
            if (!stRes.ok) return;
            const st = await stRes.json();
            
            // Tunggu jika server masih melaporkan status job sebelumnya
            if (targetJobId && st.id < targetJobId) {
              setStatusTeks(`Menyiapkan antrean render... (${secondsElapsed}s)`);
              return;
            }

            if (st.status === 'jalan') {
              const logs: string[] = st.log || [];
              const akhir = logs.filter((l) => l.startsWith('•')).pop() || '';
              const stepLabel = akhir.replace(/^•\s*/, '').slice(0, 50);
              setStatusTeks(stepLabel ? `${stepLabel} (${secondsElapsed}s)` : `Sedang merender video MP4... (${secondsElapsed}s)`);
              return;
            }

            if (st.status === 'selesai') {
              clearInterval(interval);
              setIsGenerating(false);
              setStatusTeks('');
              const vUrl = st.hasil?.video || (proyekNama ? `/stream/motion/${proyekNama}/video` : null);
              if (vUrl) {
                setRenderedVideoUrl(vUrl);
                setPreviewMode('mp4');
              }
              return;
            }

            if (st.status === 'gagal' || st.status === 'batal') {
              clearInterval(interval);
              setIsGenerating(false);
              const logs: string[] = st.log || [];
              const err = logs.find((l) => l.toLowerCase().includes('galat') || l.toLowerCase().includes('error')) 
                || (st.status === 'batal' ? 'Render dibatalkan.' : 'Proses render gagal.');
              setStatusTeks(`Gagal: ${err}`);
              return;
            }
          } catch {
            // teruskan polling jika ada gangguan jaringan sementara
          }

          if (secondsElapsed > 240) { // batas timeout 4 menit
            clearInterval(interval);
            setIsGenerating(false);
            setStatusTeks('Waktu render melebihi 4 menit.');
          }
        }, 1200);
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.galat || 'Gagal memproses render backend');
      }
    } catch (err: any) {
      setIsGenerating(false);
      setStatusTeks(`Galat: ${err?.message || 'Gagal terhubung ke backend'}`);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#070b12] text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span className="font-bold uppercase tracking-wider text-[11px]">CALCLIP.IN • MOTION AI STUDIO 9:16</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full font-sans">
                v2.1 Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Dari Satu Topik Jadi Video Animasi 9:16
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Tulis topik atau susun naskah adegan. AI membuat naskah, narator suara, dan animasi kinetik 1080×1920 siap upload.
            </p>
          </div>

          {/* Quick Stats / Badge */}
          <div className="flex items-center gap-2 bg-[#0d1424] border border-cyan-500/20 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Film className="w-4 h-4 text-cyan-400" />
            <span>24 Template Resmi</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-cyan-400 font-bold">1080×1920 Vertikal</span>
          </div>
        </div>

        {/* 3-Column Studio Grid: Left (Input & Script) | Middle (Live Interactive 9:16 Player) | Right (24 Templates) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT COLUMN (5 Cols): Input & Script Generator ── */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Box Input Naskah */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Sumber Naskah Video</span>
                </div>
                <div className="flex items-center gap-1 bg-[#060a12] p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setTabIsi('topik')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      tabIsi === 'topik'
                        ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Topik (AI)
                  </button>
                  <button
                    onClick={() => setTabIsi('adegan')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      tabIsi === 'adegan'
                        ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Adegan ({scenes.length})
                  </button>
                  <button
                    onClick={() => setTabIsi('json')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      tabIsi === 'json'
                        ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              {/* Tab 1: Topik */}
              {tabIsi === 'topik' && (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={topikInput}
                    onChange={(e) => setTopikInput(e.target.value)}
                    placeholder="mis. 3 kebiasaan pagi yang bikin produktif..."
                    className="w-full bg-[#060a12] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
                  />

                  {/* Preset Cepat Topik */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Rekomendasi Topik Viral:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '3 Tips Produktivitas Pagi',
                        '3 Game PC Terpopuler di Indonesia',
                        'Fakta Sains Menakjubkan',
                        'Trik Komunikasi Hipnotik',
                        'Mindset Finansial Usia 20',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setTopikInput(preset);
                            const generated = buatNaskahDariTopik(preset);
                            setScenes(generated);
                            setJsonInput(
                              JSON.stringify(
                                {
                                  judul: preset,
                                  gaya: selectedTemplate,
                                  handle: 'calclip.in',
                                  adegan: generated,
                                },
                                null,
                                2
                              )
                            );
                            handleResetPlayer();
                          }}
                          className="text-[10px] bg-[#10192e] hover:bg-cyan-950 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700/60 text-slate-300 px-2 py-1 rounded-lg transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateScriptAI}
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>⚡ Susun Naskah 5 Adegan Otomatis</span>
                  </button>
                </div>
              )}

              {/* Tab 2: Visual Scene Inspector */}
              {tabIsi === 'adegan' && (
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {scenes.map((sc, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentSceneIdx(idx);
                        setPlaybackProgress(0);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        currentSceneIdx === idx
                          ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/40 shadow-sm'
                          : 'bg-[#060a12] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-cyan-300">
                          <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[9px] font-mono">
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[170px]">{sc.judul}</span>
                        </span>
                        <span className="text-base">{sc.ikon}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {sc.teks}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {sc.kunci.map((k, ki) => (
                          <span
                            key={ki}
                            className="text-[9px] font-mono bg-[#142038] text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-900/40"
                          >
                            #{k}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setTabIsi('topik')}
                    className="w-full text-center text-xs text-cyan-400 hover:underline pt-1"
                  >
                    + Ubah Topik & Susun Ulang
                  </button>
                </div>
              )}

              {/* Tab 3: JSON Raw */}
              {tabIsi === 'json' && (
                <div className="space-y-2">
                  <textarea
                    rows={8}
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      try {
                        const parsed = JSON.parse(e.target.value);
                        if (parsed.adegan && Array.isArray(parsed.adegan)) {
                          setScenes(parsed.adegan);
                        }
                      } catch {
                        // ignore parsing error during typing
                      }
                    }}
                    placeholder='{"judul": "Tips", "adegan": [{"judul": "Hook", "teks": "...", "kunci": ["kata"], "ikon": "🔥"}]}'
                    className="w-full bg-[#060a12] border border-slate-800 rounded-xl p-3 text-[11px] text-cyan-300 placeholder:text-slate-600 resize-none focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    onClick={handleCopyPrompt}
                    className="text-[10px] text-slate-400 hover:text-cyan-300 underline font-mono"
                  >
                    {copiedPrompt ? '✓ Prompt Tersalin ke Clipboard' : '📋 Salin Format Prompt JSON'}
                  </button>
                </div>
              )}
            </div>

            {/* AI Drawing & Voice Controls */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Suara Audio Narator (TTS)</div>
                  <div className="text-[10px] text-cyan-400/90 font-medium">Natural Neural AI Bahasa Indonesia (Edge-TTS)</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    isSpeechEnabled ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      isSpeechEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isSpeechEnabled && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-sans">Karakter Suara:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedVoice('id-ID-GadisNeural')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        selectedVoice === 'id-ID-GadisNeural'
                          ? 'bg-cyan-400 text-slate-950 shadow-sm'
                          : 'bg-[#10192e] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      👩 Gadis (Natural Cewek)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedVoice('id-ID-ArdiNeural')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        selectedVoice === 'id-ID-ArdiNeural'
                          ? 'bg-cyan-400 text-slate-950 shadow-sm'
                          : 'bg-[#10192e] text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      👨 Ardi (Natural Cowok)
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">AI Menggambar Objek Tiap Adegan</div>
                  <div className="text-[10px] text-slate-400">Filter SVG bergaya ilustrasi per template</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiDrawing(!isAiDrawing)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                    isAiDrawing ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      isAiDrawing ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tombol Utama Buat Video */}
            <div className="space-y-2">
              <button
                onClick={handleBuatVideo}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{statusTeks || 'Sedang Memproses...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>RENDER VIDEO MOTION 9:16 (MP4)</span>
                  </>
                )}
              </button>

              {renderedVideoUrl && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Video Selesai Dirender!</span>
                  </span>
                  <a
                    href={`${renderedVideoUrl}?unduh=1&nama=CalClip-${selectedTemplate}.mp4`}
                    download={`CalClip-${selectedTemplate}.mp4`}
                    className="text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh MP4</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── MIDDLE COLUMN (3 Cols): Live Interactive 9:16 Video Player Mockup ── */}
          <div className="lg:col-span-3 flex flex-col items-center">
            
            <div className="w-full bg-[#0c1322] border border-slate-800 rounded-2xl p-4 flex flex-col items-center space-y-3 shadow-xl">
              <div className="w-full flex items-center justify-between text-xs font-mono text-cyan-400 pb-1 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('live')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      previewMode === 'live'
                        ? 'bg-cyan-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📱 Live 9:16
                  </button>
                  {renderedVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mp4')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        previewMode === 'mp4'
                          ? 'bg-emerald-400 text-slate-950 shadow-sm'
                          : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      <Film className="w-3 h-3" />
                      <span>Hasil MP4</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {previewMode === 'live' ? `Adegan ${currentSceneIdx + 1}/${scenes.length}` : '1080×1920 MP4'}
                </span>
              </div>

              {/* 9:16 Phone Device Mockup Container */}
              <div className="relative w-[210px] sm:w-[220px] aspect-[9/16] rounded-[28px] p-2 bg-[#05080e] border-2 border-slate-700 shadow-[0_12px_36px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
                {/* Phone Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-30" />

                {previewMode === 'mp4' && renderedVideoUrl ? (
                  <div className="w-full h-full rounded-[20px] relative overflow-hidden bg-black flex items-center justify-center">
                    <video
                      src={renderedVideoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover rounded-[20px]"
                    />
                  </div>
                ) : (
                  /* Video Scene Screen */
                  <div
                    className="w-full h-full rounded-[20px] relative overflow-hidden flex flex-col justify-between p-3 select-none"
                    style={{
                      backgroundColor: activeTmpl.previewBg,
                      color: activeTmpl.textColor,
                    }}
                  >
                    {/* Top 5-Segment Story Bars */}
                    <div className="z-30 pt-3 px-1 flex items-center gap-1 w-full">
                      {scenes.map((_, sIdx) => {
                        const isPast = sIdx < currentSceneIdx;
                        const isCurrent = sIdx === currentSceneIdx;
                        return (
                          <div key={sIdx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full transition-all duration-75"
                              style={{
                                width: isPast ? '100%' : isCurrent ? `${playbackProgress}%` : '0%',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Scene Title (Animasi Kinetik Masuk) */}
                    <div className="z-20 pt-1 text-center">
                      <span className="text-[7px] font-mono uppercase tracking-widest opacity-60">
                        CALCLIP MOTION • {activeTmpl.label}
                      </span>
                      <h3 className="text-[11px] sm:text-xs font-extrabold tracking-tight mt-0.5 line-clamp-2 drop-shadow-md">
                        {scenes[currentSceneIdx]?.judul || 'Judul Adegan'}
                      </h3>
                    </div>

                    {/* Center Floating Icon / Illustration */}
                    <div className="z-20 my-auto flex flex-col items-center justify-center">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl transform transition-transform duration-500 hover:scale-105"
                        style={{
                          backgroundColor: activeTmpl.iconBg,
                          borderColor: activeTmpl.accent,
                          boxShadow: `0 0 20px ${activeTmpl.accent}40`,
                        }}
                      >
                        {scenes[currentSceneIdx]?.ikon || '✨'}
                      </div>
                    </div>

                    {/* Bottom Subtitle / Narration */}
                    <div className="z-20 pb-2 space-y-2 text-center">
                      <p className="text-[9px] font-bold leading-tight px-1.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs border border-white/10 text-white shadow-md">
                        {scenes[currentSceneIdx]?.teks || 'Teks narasi adegan'}
                      </p>

                      {/* Brand & Audio Waves Indicator */}
                      <div className="flex items-center justify-between px-1 text-[8px] font-mono text-cyan-300">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>@calclip.in</span>
                        </div>
                        <div className="flex items-end gap-0.5 h-2.5">
                          <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isPlaying ? 'h-2.5' : 'h-1'}`} />
                          <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isPlaying ? 'h-3.5' : 'h-2'}`} />
                          <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isPlaying ? 'h-2' : 'h-1'}`} />
                        </div>
                      </div>
                    </div>

                    {/* Background Ambient Art */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      {activeTmpl.renderPreview(true)}
                    </div>
                  </div>
                )}
              </div>

              {/* Player Controls */}
              {previewMode === 'mp4' && renderedVideoUrl ? (
                <div className="w-full flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-center gap-2">
                    <a
                      href={`${renderedVideoUrl}?unduh=1&nama=CalClip-${selectedTemplate}.mp4`}
                      download={`CalClip-${selectedTemplate}.mp4`}
                      className="flex-1 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh MP4</span>
                    </a>
                    {lastProyekNama && (
                      <button
                        type="button"
                        onClick={handleBukaFolder}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Buka Folder di File Explorer Windows"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Folder</span>
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('live')}
                    className="text-[10px] text-cyan-400 hover:underline text-center cursor-pointer"
                  >
                    ← Kembali ke Pratinjau Live
                  </button>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResetPlayer}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Mulai Ulang"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePlayToggle}
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Putar Live</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Info Text */}
              <div className="text-[10px] text-slate-400 text-center font-mono">
                {previewMode === 'live' ? (
                  <span>Audio Narasi: {isSpeechEnabled ? 'Aktif (id-ID)' : 'Mute'} • 1080×1920</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Video MP4 Siap Diputar & Diunduh</span>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (5 Cols): 24 Full Motion Templates ── */}
          <div className="lg:col-span-5 space-y-3">
            
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              
              {/* Category Filter Pills */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Katalog 24 Gaya Motion</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilterKategori('semua')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                      filterKategori === 'semua'
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-[#080d1a] text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua (24)
                  </button>
                  <button
                    onClick={() => setFilterKategori('ilustrasi')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                      filterKategori === 'ilustrasi'
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-[#080d1a] text-slate-400 hover:text-white'
                    }`}
                  >
                    Seni (10)
                  </button>
                  <button
                    onClick={() => setFilterKategori('modern')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                      filterKategori === 'modern'
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-[#080d1a] text-slate-400 hover:text-white'
                    }`}
                  >
                    Modern (14)
                  </button>
                </div>
              </div>

              {/* 24 Cards Grid with Rich Phone Mockups */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[510px] overflow-y-auto pr-1">
                {filteredTemplates.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplate(tmpl.id);
                        handleResetPlayer();
                      }}
                      className={`group rounded-xl p-2 flex flex-col justify-between cursor-pointer border transition-all aspect-[9/15] relative overflow-hidden motion-template-card ${
                        isSelected ? 'is-selected scale-[1.02]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      {/* Selected Badge Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-30 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      {/* Mockup Preview Area */}
                      <div className="w-full h-36 rounded-lg overflow-hidden border border-white/10 shadow-inner relative">
                        {tmpl.renderPreview(isSelected)}
                      </div>

                      {/* Info Label */}
                      <div className="pt-2 space-y-1">
                        <div className="text-[11px] font-bold card-title leading-tight">
                          {tmpl.label}
                        </div>
                        <div className="flex items-center justify-between text-[9px] card-desc">
                          <span className="text-[8px] font-mono text-cyan-400 font-bold bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded shrink-0">
                            {tmpl.category}
                          </span>
                          <span className="truncate max-w-[70px]" title={tmpl.tag}>
                            {tmpl.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800/80">
                Pilih gaya untuk langsung mengubah tampilan dan animasi pada pratinjau live.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
