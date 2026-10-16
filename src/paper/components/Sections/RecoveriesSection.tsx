'use client';

import React, { useState } from 'react';
import { ShieldCheck, Download, Copy, Check, Terminal, ExternalLink, HardDrive } from 'lucide-react';
import { RecoveryResource } from '../../types';
import { playTerminalBlip, playCheckmarkChime } from '../../utils/soundManager';

interface RecoveriesSectionProps {
  recoveries?: RecoveryResource[];
  onSelectRecovery: (rec: RecoveryResource) => void;
}

const DEFAULT_RECOVERIES: RecoveryResource[] = [
  {
    id: 'twrp-37',
    name: 'TWRP 3.7.1 Official (FBE v2)',
    type: 'TWRP',
    version: '3.7.1_12-0',
    maintainer: 'TeamWin & Prashant',
    status: 'Official Stable',
    description: 'Official TeamWin recovery build with dynamic partition resizing, Android 14/15 FBE v2 user decryption, and integrated MTP & ADB sideload.',
    downloadUrl: 'https://dl.twrp.me/sky/',
    fastbootCommand: 'fastboot flash recovery twrp-3.7.1_12-0-sky.img\nfastboot reboot recovery',
    supportsDecryption: true,
    date: '2026-01-15',
  },
  {
    id: 'orangefox-r11',
    name: 'OrangeFox Recovery R11.1',
    type: 'OrangeFox',
    version: 'R11.1_6-Stable',
    maintainer: 'DarthJCop & Team Sky',
    status: 'Recommended',
    description: 'Fox Recovery engine designed for dual MIUI/HyperOS and AOSP ROM compatibility. Built-in Magisk survival, password remover, and flashlight support.',
    downloadUrl: 'https://orangefox.download/device/sky',
    fastbootCommand: 'fastboot flash recovery OrangeFox-R11.1_6-Stable-sky.img\nfastboot reboot recovery',
    supportsDecryption: true,
    date: '2026-02-02',
  },
  {
    id: 'pbrp-40',
    name: 'PitchBlack Recovery 4.0',
    type: 'PBRP',
    version: 'PBRP-v4.0-Official',
    maintainer: 'PitchBlack Project',
    status: 'Official',
    description: 'Dark-themed tactical touch recovery with forced encryption bypass, AppLock remover, and comprehensive Aroma installer compatibility.',
    downloadUrl: 'https://pbrp.site/download/sky',
    fastbootCommand: 'fastboot flash recovery PBRP-v4.0-sky.img\nfastboot reboot recovery',
    supportsDecryption: true,
    date: '2025-11-10',
  },
];

export const RecoveriesSection: React.FC<RecoveriesSectionProps> = ({
  recoveries = DEFAULT_RECOVERIES,
  onSelectRecovery,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayList = recoveries && recoveries.length > 0 ? recoveries : DEFAULT_RECOVERIES;

  const handleCopy = (id: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    playCheckmarkChime();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="recoveries" className="py-12 sm:py-16 border-t border-[var(--c-border)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
            SECTION 02
          </span>
          <span className="text-xs font-mono uppercase text-[var(--c-muted)]">
            Custom Boot & Fastboot Tools
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-handwriting font-bold text-[var(--c-heading)]">
          Custom Recoveries (TWRP & OrangeFox)
        </h2>
        <p className="text-xs sm:text-sm font-mono text-[var(--c-body)] max-w-2xl mt-1">
          Essential custom recovery environments configured for SM4450 dynamic partitions (`system`, `system_ext`, `product`, `vendor`, `odm`).
        </p>
      </div>

      {/* Recoveries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map(rec => (
          <div
            key={rec.id}
            className="group relative rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] hover:border-[var(--c-border-hover)] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 shadow-xs flex flex-col justify-between"
            style={{
              backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.35), rgba(255,255,255,0.08))',
            }}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0]">
                    {rec.type}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--c-muted)]">
                  {rec.status || 'Stable'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-handwriting font-bold text-[var(--c-heading)] mb-2">
                {rec.name}
              </h3>

              <p className="text-xs font-mono text-[var(--c-body)] leading-relaxed mb-4">
                {rec.description}
              </p>

              {/* Fastboot terminal block */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--c-muted)] flex items-center gap-1">
                    <Terminal className="w-3 h-3" />
                    Fastboot Flash Command
                  </span>
                  <button
                    onClick={() => handleCopy(rec.id, rec.fastbootCommand || '')}
                    className="text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] hover:bg-[var(--c-card)] transition-colors cursor-pointer"
                  >
                    {copiedId === rec.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === rec.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0] font-mono text-[11px] overflow-x-auto whitespace-pre">
                  {rec.fastbootCommand || `fastboot flash recovery ${rec.name.toLowerCase()}.img`}
                </pre>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[var(--c-border)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> FBE v2 Supported
              </span>

              <a
                href={rec.downloadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] text-xs font-mono font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Download .IMG</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
