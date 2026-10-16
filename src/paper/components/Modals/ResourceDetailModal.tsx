'use client';

import React, { useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, Terminal, Shield, Calendar, HardDrive, Cpu, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTerminalBlip, playCheckmarkChime } from '../../utils/soundManager';

interface ResourceDetailModalProps {
  item: any | null;
  onClose: () => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    playCheckmarkChime();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fastbootSnippet = item.fastbootCommand || (
    item.type === 'TWRP' || item.type === 'OrangeFox'
      ? `fastboot flash recovery ${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.img\nfastboot reboot recovery`
      : item.installCommand || `fastboot flash boot boot_patched.img`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--c-border-hover)] bg-[var(--c-header-bg, #EFE6D5)] shadow-2xl p-6 sm:p-8 text-[var(--c-heading)] relative"
          style={{
            backgroundImage: `radial-gradient(var(--c-border) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Top Tape Decal */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-32 h-5 bg-[#d4c5a9]/80 rotate-1 border border-black/10 shadow-sm pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              playTerminalBlip(440, 0.03);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-input-bg)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header & Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0]">
              {item.status || 'VERIFIED ARTIFACT'}
            </span>
            {item.androidVersion && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)]">
                Android {item.androidVersion}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)]">
              SM4450 / 4 Gen 2
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-handwriting font-bold mb-2">
            {item.name || item.title}
          </h2>

          <p className="text-sm font-mono text-[var(--c-body)] mb-6 leading-relaxed">
            {item.description || 'Engineered and tuned specifically for the Snapdragon 4 Gen 2 architecture with verified hardware stability.'}
          </p>

          {/* Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] text-xs font-mono">
            {item.maintainer && (
              <div>
                <span className="text-[10px] text-[var(--c-muted)] uppercase block">Maintainer</span>
                <span className="font-bold flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-[var(--c-muted)]" />
                  {item.maintainer}
                </span>
              </div>
            )}
            {item.releaseDate && (
              <div>
                <span className="text-[10px] text-[var(--c-muted)] uppercase block">Build Date</span>
                <span className="font-bold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-[var(--c-muted)]" />
                  {item.releaseDate}
                </span>
              </div>
            )}
            {item.selinuxStatus && (
              <div>
                <span className="text-[10px] text-[var(--c-muted)] uppercase block">SELinux</span>
                <span className="font-bold flex items-center gap-1 mt-0.5 text-emerald-800 dark:text-emerald-400">
                  <Shield className="w-3 h-3" />
                  {item.selinuxStatus}
                </span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-[var(--c-muted)] uppercase block">Platform</span>
              <span className="font-bold flex items-center gap-1 mt-0.5">
                <Cpu className="w-3 h-3 text-[var(--c-muted)]" />
                Snapdragon 4 Gen 2
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--c-muted)] uppercase block">Partitions</span>
              <span className="font-bold flex items-center gap-1 mt-0.5">
                <HardDrive className="w-3 h-3 text-[var(--c-muted)]" />
                Dynamic / EROFS
              </span>
            </div>
          </div>

          {/* Fastboot / Flashing Terminal Snippet */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Flashing Instructions
              </span>
              <button
                onClick={() => handleCopyCommand(fastbootSnippet)}
                className="text-[11px] font-mono flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-input-bg)] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0] font-mono text-xs overflow-x-auto whitespace-pre">
              {fastbootSnippet}
            </pre>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[var(--c-border)]">
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-input-bg)] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source Code
              </a>
            )}
            {item.downloadUrl && (
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-lg bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                Direct Download
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
