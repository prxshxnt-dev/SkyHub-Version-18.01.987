'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Flame, ShieldCheck, Cpu, BookOpen, Image as ImageIcon, ExternalLink, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playTerminalBlip, playCheckmarkChime } from '../../utils/soundManager';

interface SearchItem {
  id: string;
  sectionId: string;
  title: string;
  subtitle: string;
  category: 'ROM' | 'Recovery' | 'Module' | 'Guide' | 'Wallpaper' | 'System';
  tag?: string;
}

interface SiteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
  onSelectResource?: (item: any) => void;
  items?: SearchItem[];
}

const DEFAULT_SEARCH_ITEMS: SearchItem[] = [
  { id: 'evo-x', sectionId: 'roms', title: 'Evolution X 9.8', subtitle: 'Android 15 • Official • HyperOS Base', category: 'ROM', tag: 'A15' },
  { id: 'pixel-os', sectionId: 'roms', title: 'PixelOS 15', subtitle: 'Pure Pixel experience with Snapdragon optimizations', category: 'ROM', tag: 'Pixel' },
  { id: 'lineage-22', sectionId: 'roms', title: 'LineageOS 22.1', subtitle: 'Ultra-clean vanilla AOSP build', category: 'ROM', tag: 'AOSP' },
  { id: 'twrp-37', sectionId: 'recoveries', title: 'TWRP 3.7.1 Recovery', subtitle: 'Full decryption support • FBE v2 • Fastboot flashable', category: 'Recovery', tag: 'TWRP' },
  { id: 'orangefox', sectionId: 'recoveries', title: 'OrangeFox R11.1', subtitle: 'MIUI/AOSP dual-zip support • Password removal', category: 'Recovery', tag: 'Fox' },
  { id: 'ksu-next', sectionId: 'modules', title: 'KernelSU Next Suite', subtitle: 'Systemless kernel-level root with webUI manager', category: 'Module', tag: 'Root' },
  { id: 'thermal-killer', sectionId: 'modules', title: 'Snapdragon 4 Gen 2 Thermal Bypass', subtitle: 'Unlocks Adreno 613 sustained 950MHz frequency', category: 'Module', tag: 'Performance' },
  { id: 'unlock-bootloader', sectionId: 'guides', title: 'How to Unlock Bootloader on SM4450', subtitle: 'Official Mi Unlock tool + 168hr bypass instructions', category: 'Guide', tag: 'Guide' },
  { id: 'root-kernelsu', sectionId: 'guides', title: 'Flashing KernelSU via Fastboot', subtitle: 'Step-by-step patch boot.img guide without TWRP', category: 'Guide', tag: 'Guide' },
  { id: 'wallpaper-neon', sectionId: 'wallpapers', title: 'Snapdragon Circuit Blueprint AMOLED', subtitle: 'High-res 1080x2460 dark aesthetic wallpaper', category: 'Wallpaper', tag: 'Art' },
  { id: 'spec-cluster', sectionId: 'devices', title: 'Cortex-A78 + A55 Cluster Specs', subtitle: '4nm Samsung Foundry node • 2x 2.2GHz + 6x 2.0GHz', category: 'System', tag: 'Hardware' },
];

export const SiteMapModal: React.FC<SiteMapModalProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
  onSelectResource,
  items = DEFAULT_SEARCH_ITEMS,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      playTerminalBlip(720, 0.04);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    const q = query.toLowerCase();
    return items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.tag && item.tag.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [items, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        playCheckmarkChime();
        onClose();
        onNavigateSection(current.sectionId);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ROM': return <Flame className="w-3.5 h-3.5 text-amber-600" />;
      case 'Recovery': return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'Module': return <Cpu className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Guide': return <BookOpen className="w-3.5 h-3.5 text-purple-600" />;
      case 'Wallpaper': return <ImageIcon className="w-3.5 h-3.5 text-pink-600" />;
      default: return <ArrowRight className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-xl rounded-2xl border border-[var(--c-border-hover)] bg-[var(--c-header-bg, #EFE6D5)] shadow-2xl overflow-hidden text-[var(--c-heading)]"
            style={{
              backgroundImage: `radial-gradient(var(--c-border) 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-[var(--c-border)] bg-[var(--c-card)]">
              <Search className="w-5 h-5 text-[var(--c-muted)] mr-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search ROMs, modules, recoveries, guides, or specs..."
                className="w-full bg-transparent text-sm font-mono placeholder:text-[var(--c-muted)] text-[var(--c-heading)] focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-md border border-[var(--c-border)] hover:bg-[var(--c-input-bg)] text-[var(--c-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-10 text-center font-mono text-xs text-[var(--c-muted)]">
                  No matching files or guides found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        playCheckmarkChime();
                        onClose();
                        onNavigateSection(item.sectionId);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--c-input-bg, rgba(255,255,255,0.7))' : 'transparent',
                        border: isSelected ? '1px solid var(--c-border-hover)' : '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold truncate">
                              {item.title}
                            </span>
                            {item.tag && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border border-[var(--c-border)] bg-[var(--c-card)] opacity-80">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-[var(--c-muted)] truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] font-mono opacity-60 ml-2 flex-shrink-0">
                          <span>Jump</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer shortcuts */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--c-border)] bg-[var(--c-card)]/50 text-[10px] font-mono text-[var(--c-muted)]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <span className="uppercase font-bold tracking-widest text-[#8B4513]">
                SkyHub 4 Gen 2
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
