'use client';

import React from 'react';
import { Smartphone, Cpu, Gauge, Zap, Radio, Layers, CheckCircle2 } from 'lucide-react';

export const DeviceExplorerSection: React.FC = () => {
  return (
    <section id="devices" className="py-12 sm:py-16 border-t border-[var(--c-border)]">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
            SECTION 05
          </span>
          <span className="text-xs font-mono uppercase text-[var(--c-muted)]">
            Qualcomm Hardware Schematics
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-handwriting font-bold text-[var(--c-heading)]">
          Snapdragon 4 Gen 2 (SM4450) Technical Blueprint
        </h2>
        <p className="text-xs sm:text-sm font-mono text-[var(--c-body)] max-w-2xl mt-1">
          Detailed silicon layout, supported board codenames, and hardware capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          className="lg:col-span-2 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-6 sm:p-8 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(var(--c-border) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="absolute top-0 right-10 -translate-y-2 w-24 h-4 bg-[#e2d6bf]/80 -rotate-1 border border-black/10 shadow-xs pointer-events-none" />

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--c-border)]">
            <div>
              <span className="text-xs font-mono uppercase text-[var(--c-muted)] block">Die Architecture</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--c-heading)]">
                Qualcomm SM4450 (Clifftown)
              </span>
            </div>
            <div className="px-3 py-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-input-bg)] font-mono text-xs font-bold text-[#8B4513]">
              4nm LPP Node
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-heading)] flex items-center gap-1.5 mb-2">
                <Cpu className="w-4 h-4 text-amber-700" />
                Octa-Core CPU Complex
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-200">2x Performance Cores</span>
                  <span className="opacity-80">Cortex-A78 @ 2.2 GHz</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">6x Efficiency Cores</span>
                  <span className="opacity-80">Cortex-A55 @ 2.0 GHz</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--c-heading)] flex items-center gap-1.5 mb-2">
                <Gauge className="w-4 h-4 text-blue-700" />
                GPU & Memory Bus
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-between">
                  <span className="font-bold">Adreno 613 GPU</span>
                  <span className="opacity-80">955 MHz Max Clock</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--c-card)] border border-[var(--c-border)] flex items-center justify-between">
                  <span className="font-bold">LPDDR4X / UFS 2.2</span>
                  <span className="opacity-80">Dual-channel 2133MHz</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-700" />
              <span>Snapdragon X61 5G Sub-6GHz (Up to 2.5 Gbps)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Qualcomm Quick Charge 4+ (Up to 33W Fast Charging)</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-[var(--c-heading)]" />
              <h3 className="text-xl font-handwriting font-bold text-[var(--c-heading)]">
                Supported Devices
              </h3>
            </div>
            <p className="text-xs font-mono text-[var(--c-body)] mb-4">
              All artifacts and ROM packages in SkyHub are strictly validated on these target board variants:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--c-heading)] block">Xiaomi Redmi 12 5G</span>
                  <span className="text-[10px] text-[var(--c-muted)]">Global & India Editions</span>
                </div>
                <span className="px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[10px] font-bold text-[#8B4513]">
                  codename: sky
                </span>
              </div>

              <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--c-heading)] block">POCO M6 Pro 5G</span>
                  <span className="text-[10px] text-[var(--c-muted)]">Global & India Editions</span>
                </div>
                <span className="px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[10px] font-bold text-[#8B4513]">
                  codename: sky
                </span>
              </div>

              <div className="p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--c-heading)] block">Redmi Note 12R</span>
                  <span className="text-[10px] text-[var(--c-muted)]">China Edition</span>
                </div>
                <span className="px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[10px] font-bold text-[#8B4513]">
                  codename: sky
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--c-border)] text-[11px] font-mono text-[var(--c-muted)] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unified Device Tree (vendor_sky)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
