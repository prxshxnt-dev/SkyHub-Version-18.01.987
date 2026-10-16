'use client';

import React from 'react';
import { ArrowDown, Flame, ShieldCheck, Cpu, Sparkles, Layers, Download, CheckCircle2 } from 'lucide-react';
import { DepthFlipText } from '../UI/DepthFlipText';
import { TypewriterEffect } from '../UI/TypewriterEffect';
import { ScrollTextPath } from '../UI/ScrollTextPath';
import { playTerminalBlip } from '../../utils/soundManager';

interface HeroSectionProps {
  onExploreROMs: () => void;
  onExploreRecoveries: () => void;
  onExploreModules: () => void;
  onOpenStructureRoom: () => void;
  romsCount?: number;
  modulesCount?: number;
  recoveriesCount?: number;
}

const CAPABILITY_PHRASES = [
  'Android 15 Custom ROMs',
  'KernelSU & Magisk Modules',
  'TWRP & OrangeFox Recoveries',
  'Adreno 613 GPU Overclocks',
  'Thermal Throttling Bypass',
  'Snapdragon 4 Gen 2 Tuning',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreROMs,
  onExploreRecoveries,
  onExploreModules,
  onOpenStructureRoom,
  romsCount = 18,
  modulesCount = 24,
  recoveriesCount = 6,
}) => {
  return (
    <section id="hero" className="relative pt-8 sm:pt-14 pb-12 sm:pb-16">
      {/* Top Dossier Stamp Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--c-border)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--c-muted)] font-bold">
            ARCHIVE STATUS: ONLINE • SM4450 LAB
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-subtle)] uppercase">
            EST. 2024-2026
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0] uppercase font-bold">
            VERIFIED BUILDS
          </span>
        </div>
      </div>

      {/* Main Headline with Tactile Handwriting and Monospace */}
      <div className="max-w-4xl">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-handwriting font-bold leading-[1.08] tracking-tight mb-4 text-[var(--c-heading)]">
          The Premier Platform for <span className="underline decoration-[#8B4513]/40 underline-offset-8">Custom ROMs</span> & Performance Mods.
        </h1>

        {/* Dynamic Typewriter / DepthFlip Capability */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-base sm:text-xl font-mono text-[var(--c-body)] mb-8 min-h-[38px]">
          <span className="opacity-70">Built exclusively for:</span>
          <div className="inline-block px-3 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] shadow-xs">
            <DepthFlipText phrases={CAPABILITY_PHRASES} interval={2800} />
          </div>
        </div>

        <p className="text-sm sm:text-base font-mono text-[var(--c-body)] max-w-2xl leading-relaxed mb-8">
          Curated, benchmarked, and verified artifacts for the Qualcomm Snapdragon 4 Gen 2 (SM4450) SoC ecosystem. High-performance kernels, KernelSU modules, and zero-bloat vanilla Android distributions.
        </p>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-12">
          <button
            onClick={() => {
              playTerminalBlip(520, 0.04);
              onExploreROMs();
            }}
            className="px-5 py-3 rounded-xl bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Explore ROMs ({romsCount})
          </button>

          <button
            onClick={() => {
              playTerminalBlip(580, 0.04);
              onExploreRecoveries();
            }}
            className="px-5 py-3 rounded-xl border border-[var(--c-border-hover)] bg-[var(--c-card)] hover:bg-[var(--c-input-bg)] text-[var(--c-heading)] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Recoveries ({recoveriesCount})
          </button>

          <button
            onClick={() => {
              playTerminalBlip(640, 0.04);
              onExploreModules();
            }}
            className="px-5 py-3 rounded-xl border border-[var(--c-border-hover)] bg-[var(--c-card)] hover:bg-[var(--c-input-bg)] text-[var(--c-heading)] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-emerald-600" />
            KSU Modules ({modulesCount})
          </button>

          <button
            onClick={() => {
              playTerminalBlip(700, 0.04);
              onOpenStructureRoom();
            }}
            className="px-4 py-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-input-bg)] text-[var(--c-subtle)] font-mono text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Blueprint [S]</span>
          </button>
        </div>

        {/* Tactile Hardware Specs Quick Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)]">
          <div className="border-r border-[var(--c-border)] pr-2 last:border-r-0">
            <span className="text-[10px] font-mono text-[var(--c-muted)] uppercase tracking-wider block">Process Node</span>
            <span className="text-base sm:text-lg font-mono font-bold text-[var(--c-heading)]">4nm Samsung</span>
          </div>
          <div className="border-r border-[var(--c-border)] pr-2 last:border-r-0">
            <span className="text-[10px] font-mono text-[var(--c-muted)] uppercase tracking-wider block">CPU Cluster</span>
            <span className="text-base sm:text-lg font-mono font-bold text-[var(--c-heading)]">2x A78 + 6x A55</span>
          </div>
          <div className="border-r border-[var(--c-border)] pr-2 last:border-r-0">
            <span className="text-[10px] font-mono text-[var(--c-muted)] uppercase tracking-wider block">GPU Architecture</span>
            <span className="text-base sm:text-lg font-mono font-bold text-[var(--c-heading)]">Adreno 613</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-[var(--c-muted)] uppercase tracking-wider block">Root Integrity</span>
            <span className="text-base sm:text-lg font-mono font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 inline" /> KSU Next
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Animated Scroll Text Path */}
      <div className="mt-10 overflow-hidden">
        <ScrollTextPath text="Snapdragon 4 Gen 2 • Custom ROMs • TWRP • KernelSU • Thermal Bypass • Adreno Boost" className="py-2" />
      </div>
    </section>
  );
};
