'use client';

import React, { useState } from 'react';
import { Cpu, Download, Tag, CheckCircle, Zap, Shield, Sparkles } from 'lucide-react';
import { ModuleResource } from '../../types';
import { playTerminalBlip } from '../../utils/soundManager';

interface ModulesSectionProps {
  modules?: ModuleResource[];
  onSelectModule: (mod: ModuleResource) => void;
}

const DEFAULT_MODULES: ModuleResource[] = [
  {
    id: 'ksu-next-suite',
    name: 'KernelSU Next Systemless Suite',
    framework: 'KernelSU',
    version: 'v1.0.4',
    category: 'Root System',
    author: 'tiann & Prashant',
    description: 'Kernel-level root solution hooking system calls directly in the Linux 5.15 kernel. Zero modifications to system partitions and 100% SafetyNet / Play Integrity PASS.',
    downloadUrl: 'https://github.com/tiann/KernelSU',
    features: ['Direct Kernel Call Interception', 'Zero Magisk Hide Detection', 'App Profile Isolation'],
  },
  {
    id: 'thermal-bypass-sm4450',
    name: 'Snapdragon 4 Gen 2 Thermal Breaker',
    framework: 'Universal',
    version: 'v3.2',
    category: 'Gaming & Performance',
    author: 'Prashant',
    description: 'Recalibrates thermal mitigation thresholds in thermal-engine.conf. Stops aggressive 45°C throttling during Genshin Impact, BGMI, and Warzone Mobile gaming sessions.',
    downloadUrl: 'https://github.com/prashant1751-art',
    features: ['Sustained 955MHz Adreno Clock', 'Touch Sampling 240Hz Lock', 'CPU A78 Throttle Delay'],
  },
  {
    id: 'adreno-boost-gl',
    name: 'Adreno 613 Vulkan & OpenGL Optimizer',
    framework: 'Magisk',
    version: 'v2.8-Turbo',
    category: 'Graphics',
    author: 'VulkanMod Team',
    description: 'Injects Qualcomm Turnip & KGSL driver tweaks to force Vulkan 1.3 rendering pipeline in supported 3D gaming titles, boosting 1% low frame rates by 22%.',
    downloadUrl: 'https://github.com/prashant1751-art',
    features: ['Vulkan 1.3 Pipeline Force', 'Frame Drop Reducer', 'GPU Shader Cache Preload'],
  },
  {
    id: 'dolby-atmos-axon',
    name: 'Dolby Atmos Spatial Audio Port',
    framework: 'Universal',
    version: 'v7.1',
    category: 'Audio',
    author: 'ReiRyuki & Prashant',
    description: 'Ported ZTE Axon 10 Dolby Atmos engine with custom DSP equalization profiles tuned for SM4450 mono and stereo speakers, including wired Hi-Res DAC bypass.',
    downloadUrl: 'https://github.com/prashant1751-art',
    features: ['Hi-Res DAC 24-bit/192kHz', 'Dynamic Virtualizer', 'Voice Clarity Enhancer'],
  },
  {
    id: 'refresh-rate-lock',
    name: '120Hz Constant Display Lock',
    framework: 'Universal',
    version: 'v1.5',
    category: 'Display',
    author: 'Team Sky',
    description: 'Eliminates adaptive 60Hz drop-down in YouTube, Google Chrome, and camera viewfinders. Keeps the panel at buttery smooth 120Hz/90Hz refresh rate indefinitely.',
    downloadUrl: 'https://github.com/prashant1751-art',
    features: ['Force 120Hz in All Apps', 'Touch Latency Reducer', 'Jank Elimination'],
  },
  {
    id: 'battery-deep-sleep',
    name: 'Ultra Idle Sleep Governor',
    framework: 'KernelSU',
    version: 'v2.1',
    category: 'Battery',
    author: 'PowerSaver Labs',
    description: 'Suspends background wakelocks, enforces DOZE standby mode 30 seconds after screen-off, reducing overnight battery drain to less than 1% per 8 hours.',
    downloadUrl: 'https://github.com/prashant1751-art',
    features: ['Deep C-State Core Powerdown', '<1% Overnight Drain', 'Smart Alarm Wakelock Passing'],
  },
];

export const ModulesSection: React.FC<ModulesSectionProps> = ({
  modules = DEFAULT_MODULES,
  onSelectModule,
}) => {
  const [filter, setFilter] = useState<string>('All');

  const displayList = modules && modules.length > 0 ? modules : DEFAULT_MODULES;

  const filtered = filter === 'All' 
    ? displayList 
    : displayList.filter(m => m.category?.toLowerCase().includes(filter.toLowerCase()) || m.framework === filter);

  return (
    <section id="modules" className="py-12 sm:py-16 border-t border-[var(--c-border)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
              SECTION 03
            </span>
            <span className="text-xs font-mono uppercase text-[var(--c-muted)]">
              Hardware Tweaks & Systemless Extensions
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-handwriting font-bold text-[var(--c-heading)]">
            KernelSU & Magisk Modules
          </h2>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]">
          {['All', 'KernelSU', 'Magisk', 'Gaming', 'Audio', 'Battery'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                playTerminalBlip(620, 0.03);
                setFilter(cat);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer"
              style={{
                backgroundColor: filter === cat ? 'var(--c-btn-bg, #241F1A)' : 'transparent',
                color: filter === cat ? 'var(--c-btn-text, #F4EDE0)' : 'var(--c-subtle)',
                fontWeight: filter === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(mod => (
          <div
            key={mod.id}
            className="group relative rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 shadow-xs flex flex-col justify-between"
            style={{
              backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.06))',
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] text-[var(--c-heading)]">
                  {mod.framework || 'Universal'}
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--c-muted)]">
                  {mod.version}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-handwriting font-bold text-[var(--c-heading)] mb-2">
                {mod.name}
              </h3>

              <p className="text-xs font-mono text-[var(--c-body)] leading-relaxed mb-4">
                {mod.description}
              </p>

              {mod.features && mod.features.length > 0 && (
                <div className="space-y-1.5 mb-5 p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]/60">
                  {mod.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--c-subtle)]">
                      <Zap className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--c-border)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--c-muted)]">
                By: {mod.author || 'Sky Developer'}
              </span>

              <a
                href={mod.downloadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] text-xs font-mono font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Get Zip</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
