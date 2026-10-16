'use client';

import React from 'react';
import { ArrowUp, Terminal, Shield, Cpu, Heart, Layers } from 'lucide-react';
import { WATERMARKED_NAME, WATERMARKED_COPYRIGHT } from '../../utils/watermark';
import { playTerminalBlip } from '../../utils/soundManager';

interface FooterSectionProps {
  onScrollToTop: () => void;
  onOpenStructureRoom: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  onScrollToTop,
  onOpenStructureRoom,
}) => {
  return (
    <footer className="mt-20 pt-12 pb-16 border-t-2 border-dashed border-[var(--c-border)] font-mono text-xs text-[var(--c-muted)]">
      {/* Top Footer Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-handwriting font-bold text-[var(--c-heading)]">
              SkyHub Platform
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[#8B4513] font-bold">
              SM4450 4 Gen 2
            </span>
          </div>
          <p className="text-xs text-[var(--c-body)] max-w-lg leading-relaxed">
            Engineered with WebGL Three.js procedural paper physics, Web Audio synthesizer, and tactile ink brutalism. Built for Android enthusiasts, kernel engineers, and custom ROM flashers.
          </p>
        </div>

        {/* Back to top button */}
        <button
          onClick={() => {
            playTerminalBlip(880, 0.04);
            onScrollToTop();
          }}
          className="px-4 py-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-input-bg)] text-[var(--c-heading)] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Top of Paper Sheet</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Palette Bar */}
      <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] mb-8">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--c-heading)] block mb-2">
          Global Tactile Shortcuts & Keybindings
        </span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[var(--c-body)]">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] text-[var(--c-heading)] font-bold text-[10px]">
              ⌘K
            </kbd>
            <span>Search Catalog</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] text-[var(--c-heading)] font-bold text-[10px]">
              [S]
            </kbd>
            <span>Open Blueprint Dossier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] text-[var(--c-heading)] font-bold text-[10px]">
              [U]
            </kbd>
            <span>Recrumple 3D Paper</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] text-[var(--c-heading)] font-bold text-[10px]">
              [M]
            </kbd>
            <span>Mute / Unmute Audio</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Provenance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--c-border)] text-[11px]">
        <div className="flex items-center gap-3">
          <span>{WATERMARKED_COPYRIGHT}</span>
          <span className="opacity-40">•</span>
          <button
            onClick={onOpenStructureRoom}
            className="hover:underline text-[var(--c-heading)] cursor-pointer"
          >
            System Architecture
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>Qualcomm & Android are trademarks of their respective owners.</span>
        </div>
      </div>
    </footer>
  );
};
