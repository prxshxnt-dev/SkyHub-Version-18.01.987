'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Download, ExternalLink, Sparkles, Eye } from 'lucide-react';
import { WallpaperResource } from '../../types';
import { playTerminalBlip } from '../../utils/soundManager';

interface WallpapersSectionProps {
  wallpapers?: WallpaperResource[];
}

const DEFAULT_WALLPAPERS: WallpaperResource[] = [
  {
    id: 'wp-circuit',
    title: 'Snapdragon Silicon Circuit AMOLED',
    category: 'Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    resolution: '1080 x 2460 FHD+',
    author: 'Sky Lab Design',
  },
  {
    id: 'wp-cyber',
    title: 'Warm Kraft Aesthetic Grid',
    category: 'Minimalist',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1080&q=80',
    resolution: '1080 x 2460 AMOLED',
    author: 'Prashant',
  },
  {
    id: 'wp-dark-fluid',
    title: 'Midnight Fluid Topography',
    category: 'Abstract',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1080&q=80',
    resolution: '1080 x 2460 OLED',
    author: 'Studio Nocturne',
  },
  {
    id: 'wp-neon-cyber',
    title: 'HyperOS 2.0 Super Wallpaper Flare',
    category: 'Super Wallpaper',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80',
    resolution: '1080 x 2460 Dynamic',
    author: 'PortLab',
  },
];

export const WallpapersSection: React.FC<WallpapersSectionProps> = ({
  wallpapers = DEFAULT_WALLPAPERS,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<WallpaperResource | null>(null);

  const displayList = wallpapers && wallpapers.length > 0 ? wallpapers : DEFAULT_WALLPAPERS;

  return (
    <section id="wallpapers" className="py-12 sm:py-16 border-t border-[var(--c-border)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
            SECTION 06
          </span>
          <span className="text-xs font-mono uppercase text-[var(--c-muted)]">
            Display & AMOLED Media
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-handwriting font-bold text-[var(--c-heading)]">
          Curated Wallpapers & Aesthetic Plates
        </h2>
        <p className="text-xs sm:text-sm font-mono text-[var(--c-body)] max-w-2xl mt-1">
          Hand-crafted 1080x2460 pixel backgrounds color-graded for the 120Hz IPS/AMOLED panels on SM4450.
        </p>
      </div>

      {/* Polaroid Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayList.map(wp => (
          <div
            key={wp.id}
            className="group relative rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-3 pb-4 hover:border-[var(--c-border-hover)] transition-all duration-300 hover:-translate-y-1.5 shadow-xs flex flex-col justify-between"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
            }}
          >
            {/* Top Tape Corner Accent */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-[#e4d8c2]/80 -rotate-1 border border-black/10 shadow-xs pointer-events-none" />

            {/* Image Preview Container */}
            <div className="relative aspect-[9/16] w-full rounded-xl overflow-hidden mb-3 border border-[var(--c-border)] bg-[#241F1A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wp.imageUrl}
                alt={wp.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-[10px] font-mono text-white/90">
                  {wp.resolution}
                </span>
              </div>
            </div>

            {/* Info & Download Button */}
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-0.5">
                {wp.category || 'Wallpaper'}
              </span>
              <h4 className="text-sm font-handwriting font-bold text-[var(--c-heading)] truncate mb-3">
                {wp.title}
              </h4>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--c-border)]">
                <span className="text-[10px] font-mono text-[var(--c-muted)]">
                  {wp.author || 'SkyHub'}
                </span>

                <a
                  href={wp.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  onClick={() => playTerminalBlip(750, 0.03)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] text-[10px] font-mono font-bold flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all shadow-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
