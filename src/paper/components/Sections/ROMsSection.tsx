'use client';

import React, { useState, useMemo } from 'react';
import { Download, ExternalLink, Flame, Shield, Calendar, Tag, Info, ArrowUpRight } from 'lucide-react';
import { ROMResource } from '../../types';
import { playTerminalBlip } from '../../utils/soundManager';

interface ROMsSectionProps {
  roms?: ROMResource[];
  onSelectROM: (rom: ROMResource) => void;
}

const DEFAULT_ROMS: ROMResource[] = [
  {
    id: 'evo-x-15',
    name: 'Evolution X 9.8 (A15)',
    androidVersion: '15.0',
    device: 'Redmi 12 5G / POCO M6 Pro 5G',
    codename: 'sky',
    maintainer: 'Prashant & Team Sky',
    developer: 'Joeyhuab',
    version: '9.8-Snowy',
    status: 'Official',
    type: 'AOSP',
    description: 'The pinnacle of customization built on Android 15 with custom thermal profiles, Adreno 613 optimization, and Pixel feature drops.',
    downloadUrl: 'https://sourceforge.net/projects/evolution-x/files/sky/',
    sourceUrl: 'https://github.com/Evolution-X',
    releaseDate: '2026-02-14',
    securityPatch: 'February 2026',
    selinuxStatus: 'Enforcing',
    downloadsCount: 14250,
    featured: true,
  },
  {
    id: 'pixel-os-15',
    name: 'PixelOS Android 15',
    androidVersion: '15.0',
    device: 'Snapdragon 4 Gen 2 (SM4450)',
    codename: 'sky',
    maintainer: 'Aryan & Prashant',
    version: 'v15.1.0',
    status: 'Official',
    type: 'Pixel',
    description: 'Pure Google Pixel user experience ported natively with Leica Camera 5.0, unlimited Google Photos backup spoofing, and smooth 120Hz refresh rate.',
    downloadUrl: 'https://pixelos.net/download/sky',
    sourceUrl: 'https://github.com/PixelOS-AOSP',
    releaseDate: '2026-01-28',
    securityPatch: 'January 2026',
    selinuxStatus: 'Enforcing',
    downloadsCount: 19800,
    featured: true,
  },
  {
    id: 'lineage-22',
    name: 'LineageOS 22.1 Pure AOSP',
    androidVersion: '15.0',
    device: 'Redmi 12 5G / POCO M6 Pro 5G',
    codename: 'sky',
    maintainer: 'Prashant',
    version: '22.1-UNOFFICIAL',
    status: 'Official',
    type: 'Lineage',
    description: 'Lightweight, minimal battery consumption, zero telemetry. Built directly with Qualcomm CAF audio and display hal drivers.',
    downloadUrl: 'https://github.com/prashant1751-art/prashant-3d-portfolio',
    sourceUrl: 'https://github.com/LineageOS',
    releaseDate: '2026-03-01',
    securityPatch: 'March 2026',
    selinuxStatus: 'Enforcing',
    downloadsCount: 8400,
  },
  {
    id: 'rising-os-6',
    name: 'RisingOS 6.2 Elysium',
    androidVersion: '14.0',
    device: 'Snapdragon 4 Gen 2 Series',
    codename: 'sky',
    maintainer: 'KernelGod',
    version: '6.2-Elysium',
    status: 'Official',
    type: 'AOSP',
    description: 'Feature-loaded gaming ROM with integrated GameSpace, touch sampling boost up to 240Hz, and custom sound profiles.',
    downloadUrl: 'https://risingoss.com/download/sky',
    sourceUrl: 'https://github.com/RisingTechOSS',
    releaseDate: '2025-12-18',
    securityPatch: 'December 2025',
    selinuxStatus: 'Enforcing',
    downloadsCount: 11200,
  },
  {
    id: 'hyperos-port-v2',
    name: 'HyperOS 2.0 Ultra Port',
    androidVersion: '14.0',
    device: 'Redmi 12 5G / Note 12R',
    codename: 'sky',
    maintainer: 'PortLab Global',
    version: 'OS2.0.14.0',
    status: 'Port',
    type: 'MIUI/HyperOS',
    description: 'Xiaomi HyperOS 2.0 ported from flagship Xiaomi 14 with dynamic animations, advanced lockscreen depth wallpaper engine, and debloated bloatware.',
    downloadUrl: 'https://t.me/sky_updates',
    sourceUrl: 'https://xiaomi.com',
    releaseDate: '2025-11-20',
    securityPatch: 'November 2025',
    selinuxStatus: 'Permissive',
    downloadsCount: 9600,
  },
  {
    id: 'venom-kernel-4g2',
    name: 'Venom OC Kernel v4.2',
    androidVersion: '14/15',
    device: 'SM4450 All Variants',
    codename: 'sky',
    maintainer: 'Prashant',
    version: 'v4.2-STABLE',
    status: 'Official',
    type: 'Kernel',
    description: 'Custom kernel with KernelSU Next built-in, BBRv2 TCP congestion control, GPU frequency overclocked to 955MHz, and wireguard support.',
    downloadUrl: 'https://github.com/prashant1751-art',
    sourceUrl: 'https://github.com/prashant1751-art',
    releaseDate: '2026-02-28',
    securityPatch: 'Kernel 5.15.148-android14',
    selinuxStatus: 'Enforcing',
    downloadsCount: 16500,
    featured: true,
  },
];

export const ROMsSection: React.FC<ROMsSectionProps> = ({
  roms = DEFAULT_ROMS,
  onSelectROM,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'AOSP' | 'Pixel' | 'MIUI/HyperOS' | 'Kernel'>('All');

  const displayList = roms && roms.length > 0 ? roms : DEFAULT_ROMS;

  const filteredRoms = useMemo(() => {
    if (activeFilter === 'All') return displayList;
    return displayList.filter(r => (r.type === activeFilter) || (activeFilter === 'AOSP' && (r.type === 'AOSP' || r.type === 'Lineage')));
  }, [displayList, activeFilter]);

  return (
    <section id="roms" className="py-12 sm:py-16 border-t border-[var(--c-border)]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
              SECTION 01
            </span>
            <span className="text-xs font-mono uppercase text-[var(--c-muted)]">
              Snapdragon 4 Gen 2 Catalog
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-handwriting font-bold text-[var(--c-heading)]">
            Custom ROMs & Performance Kernels
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]">
          {(['All', 'AOSP', 'Pixel', 'MIUI/HyperOS', 'Kernel'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                playTerminalBlip(600, 0.03);
                setActiveFilter(tab);
              }}
              className="px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer"
              style={{
                backgroundColor: activeFilter === tab ? 'var(--c-btn-bg, #241F1A)' : 'transparent',
                color: activeFilter === tab ? 'var(--c-btn-text, #F4EDE0)' : 'var(--c-subtle)',
                fontWeight: activeFilter === tab ? 600 : 400,
              }}
            >
              {tab === 'MIUI/HyperOS' ? 'HyperOS' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ROMs Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredRoms.map(rom => (
          <div
            key={rom.id}
            className="group relative rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md flex flex-col justify-between"
            style={{
              backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.05))',
            }}
          >
            {/* Top Tape Corner Accent */}
            <div className="absolute -top-2.5 right-6 w-14 h-4 bg-[#d8ccb4]/80 -rotate-2 border border-black/10 shadow-xs pointer-events-none" />

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0]">
                  {rom.status || 'Official'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] text-[var(--c-heading)] font-semibold">
                  Android {rom.androidVersion}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-handwriting font-bold text-[var(--c-heading)] mb-2 group-hover:text-[#8B4513] transition-colors">
                {rom.name}
              </h3>

              <p className="text-xs font-mono text-[var(--c-body)] line-clamp-3 mb-4 leading-relaxed">
                {rom.description}
              </p>

              {/* Specs pill row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5 text-[10px] font-mono text-[var(--c-muted)]">
                {rom.maintainer && (
                  <span className="px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)]">
                    By: {rom.maintainer}
                  </span>
                )}
                {rom.selinuxStatus && (
                  <span className="px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)]">
                    SELinux: {rom.selinuxStatus}
                  </span>
                )}
                {rom.downloadsCount && (
                  <span className="px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)]">
                    {rom.downloadsCount.toLocaleString()} Flashes
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[var(--c-border)] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  playTerminalBlip(680, 0.04);
                  onSelectROM(rom);
                }}
                className="text-xs font-mono font-medium text-[var(--c-subtle)] hover:text-[var(--c-heading)] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Specs & Flashing</span>
              </button>

              <a
                href={rom.downloadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] text-xs font-mono font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Get ROM</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
