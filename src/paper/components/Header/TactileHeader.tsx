'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PaperTheme } from '../../types';
import { 
  Volume2, 
  VolumeX, 
  Search, 
  Layers, 
  Menu, 
  X, 
  Compass, 
  Smartphone, 
  Cpu, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Flame,
  ShieldCheck,
  Heart,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSwipeToDismiss } from '../../hooks/useSwipeToDismiss';
import { useSound, isSoundMuted, toggleSound } from '../../utils/soundManager';
import { useActiveSection } from '../../hooks/useActiveSection';
import { triggerShortcutHUD } from '../UI/ShortcutHUD';

export interface TactileHeaderProps {
  theme: PaperTheme;
  setTheme?: (theme: PaperTheme) => void;
  onRecrumple: () => void;
  onOpenStructureRoom: () => void;
  onOpenSearch: () => void;
  onNavigateSection: (id: string) => void;
  onOpenAuth?: () => void;
}

export const NAV_ITEMS = [
  { id: 'hero', label: 'Top', icon: Sparkles, subtitle: 'Overview & Stats' },
  { id: 'roms', label: 'ROMs & Kernels', icon: Flame, subtitle: 'Official, Ports & Gaming' },
  { id: 'recoveries', label: 'Recovery', icon: ShieldCheck, subtitle: 'TWRP & OrangeFox' },
  { id: 'modules', label: 'Modules & KSU', icon: Cpu, subtitle: 'Thermal & Performance Mods' },
  { id: 'guides', label: 'Field Manual', icon: BookOpen, subtitle: 'Rooting & Flashing Guides' },
  { id: 'wallpapers', label: 'Wallpapers', icon: ImageIcon, subtitle: 'Static & Live Collection' },
  { id: 'devices', label: 'Snapdragon Specs', icon: Smartphone, subtitle: 'SM4450 Architecture' },
  { id: 'donors', label: 'Patrons', icon: Heart, subtitle: 'Supporters & Credits' },
];

export const TactileHeader: React.FC<TactileHeaderProps> = memo(({
  theme,
  setTheme,
  onRecrumple,
  onOpenStructureRoom,
  onOpenSearch,
  onNavigateSection,
  onOpenAuth,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isMuted, toggleMute } = useSound();
  const activeSectionId = useActiveSection();
  const [currentActive, setCurrentActive] = useState('hero');

  useEffect(() => {
    if (activeSectionId) {
      setCurrentActive(activeSectionId);
    }
  }, [activeSectionId]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((id: string) => {
    setMobileMenuOpen(false);
    setCurrentActive(id);
    onNavigateSection(id);
  }, [onNavigateSection]);

  const {
    bind: swipeDrawerBind,
    style: swipeDrawerStyle,
  } = useSwipeToDismiss({
    onDismiss: () => setMobileMenuOpen(false),
    direction: 'up',
    threshold: 45,
    velocityThreshold: 0.35,
    enabled: mobileMenuOpen,
    onlyTouch: true,
  });

  const handleSoundClick = () => {
    const next = toggleSound();
    triggerShortcutHUD({
      title: next ? 'SOUND MUTED' : 'SOUND ENABLED',
      badge: next ? 'OFF' : 'ON',
      icon: next ? 'VolumeX' : 'Volume2',
    });
  };

  const handleRecrumpleClick = () => {
    triggerShortcutHUD({
      title: '3D PAPER RECRUMPLED',
      badge: '[U]',
      icon: 'RotateCcw',
    });
    onRecrumple();
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 26,
          mass: 0.8,
        }}
        className="fixed top-0 left-0 right-0 z-40 transition-colors duration-300"
        style={{
          backgroundColor: (scrolled || mobileMenuOpen) ? 'var(--c-header-bg, #EFE6D5)' : 'rgba(239, 230, 213, 0.92)',
          borderBottom: '1px solid var(--c-border, rgba(36, 31, 26, 0.12))',
          boxShadow: (scrolled || mobileMenuOpen) ? '0 4px 16px rgba(36, 31, 26, 0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between h-[64px] sm:h-[70px]">
          {/* Brand Logo & Tactile Seal */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('hero')}
              className="flex items-center gap-2.5 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#241F1A] rounded p-1"
              aria-label="SkyHub Home"
            >
              <div className="w-8 h-8 rounded-full border border-[var(--c-border-hover)] bg-[var(--c-card)] flex items-center justify-center shadow-inner relative overflow-hidden group">
                <span className="font-mono text-xs font-black tracking-tighter" style={{ color: 'var(--c-heading)' }}>
                  SK
                </span>
                <div className="absolute inset-0 bg-[#241F1A]/5 rounded-full" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xl sm:text-2xl font-bold font-handwriting leading-none tracking-tight"
                    style={{ color: 'var(--c-heading, #241F1A)' }}
                  >
                    SkyHub
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] text-[var(--c-muted)] font-bold">
                    SM4450
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--c-muted)] -mt-0.5 hidden xs:block">
                  Snapdragon 4 Gen 2
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs (Center) */}
          <nav
            className="hidden lg:flex items-center gap-0.5 relative justify-center px-2 py-1 rounded-full border border-[var(--c-border)] bg-[var(--c-card)]"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map(({ id, label }) => {
              const isActive = currentActive === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className="relative px-3 py-1.5 text-xs font-mono tracking-wider transition-colors cursor-pointer rounded-full whitespace-nowrap"
                  style={{
                    color: isActive ? 'var(--c-heading, #241F1A)' : 'var(--c-subtle, #544C40)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeHeaderNavUnderline"
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: 'var(--c-input-bg, rgba(255, 255, 255, 0.55))',
                        border: '1px solid var(--c-border-hover, rgba(36, 31, 26, 0.25))',
                        boxShadow: '0 1px 3px rgba(36, 31, 26, 0.06)',
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                        mass: 0.8,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Search / Command Palette Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--c-border)] hover:border-[var(--c-border-hover)] bg-[var(--c-card)] text-xs font-mono transition-all cursor-pointer active:scale-95"
              style={{ color: 'var(--c-heading)' }}
              title="Search catalog (Cmd+K)"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 text-[var(--c-subtle)]" />
              <span className="hidden sm:inline text-[11px] font-mono opacity-80">Search</span>
              <kbd className="hidden md:inline text-[9px] font-mono px-1 py-0.2 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] opacity-70">
                ⌘K
              </kbd>
            </button>

            {/* Recrumple 3D Paper Button */}
            <button
              onClick={handleRecrumpleClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--c-border)] hover:border-[var(--c-border-hover)] bg-[var(--c-card)] text-xs font-mono transition-all cursor-pointer active:scale-95"
              style={{ color: 'var(--c-heading)' }}
              title="Recrumple 3D Paper Experience"
              aria-label="Recrumple 3D Paper"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--c-subtle)]" />
              <span className="hidden sm:inline text-[11px]">Recrumple</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleSoundClick}
              className="p-2 rounded-lg border border-[var(--c-border)] hover:border-[var(--c-border-hover)] bg-[var(--c-card)] transition-all cursor-pointer active:scale-95"
              style={{ color: 'var(--c-heading)' }}
              title={isMuted ? "Sound Muted (Click to enable)" : "Sound Active (Click to mute)"}
              aria-label="Toggle Sound"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[var(--c-muted)]" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              )}
            </button>

            {/* Structure Room / Blueprint Dossier */}
            <button
              onClick={onOpenStructureRoom}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--c-border)] hover:border-[var(--c-border-hover)] bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] text-xs font-mono transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Open System Blueprint Dossier [S]"
              aria-label="Blueprint Structure Room"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">Blueprint</span>
            </button>

            {/* Admin Terminal Entry */}
            <button
              onClick={() => {
                if (user?.email && (user.email.toLowerCase() === 'meinkxun@gmail.com' || user.email.toLowerCase() === 'skyhubowner@gmail.com')) {
                  router.push('/dashboard');
                } else if (onOpenAuth) {
                  onOpenAuth();
                } else {
                  router.push('/dashboard');
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--c-border)] hover:border-amber-600/50 bg-[var(--c-card)] text-[var(--c-heading)] text-xs font-mono transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Admin Terminal & Authentication"
              aria-label="Admin Terminal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-[11px] hidden md:inline">Admin</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg border border-[var(--c-border)] hover:border-[var(--c-border-hover)] bg-[var(--c-card)] transition-all cursor-pointer active:scale-95"
              style={{ color: 'var(--c-heading)' }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 top-[64px] sm:top-[70px] z-30 lg:hidden border-b shadow-2xl p-4 sm:p-6 max-h-[calc(100vh-70px)] overflow-y-auto overscroll-contain"
            style={{
              backgroundColor: 'var(--c-header-bg, #EFE6D5)',
              borderColor: 'var(--c-border, rgba(36, 31, 26, 0.12))',
              ...swipeDrawerStyle,
            }}
            
          >
            <div className="flex flex-col space-y-2">
              {NAV_ITEMS.map(({ id, label, icon: Icon, subtitle }) => {
                const isActive = currentActive === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left cursor-pointer active:scale-[0.99]"
                    style={{
                      backgroundColor: isActive ? 'var(--c-input-bg, rgba(255,255,255,0.6))' : 'var(--c-card, rgba(255,255,255,0.2))',
                      border: isActive ? '1px solid var(--c-border-hover)' : '1px solid var(--c-border)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-[var(--c-border)] flex items-center justify-center bg-[var(--c-card)]">
                        <Icon className="w-4 h-4 text-[var(--c-heading)]" />
                      </div>
                      <div className="flex flex-col">
                        <span 
                          className="text-base font-handwriting font-bold tracking-wide"
                          style={{ color: isActive ? 'var(--c-heading)' : 'var(--c-body)' }}
                        >
                          {label}
                        </span>
                        {subtitle && (
                          <span className="text-[11px] font-mono opacity-70 tracking-wider">
                            {subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#241F1A] flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-[var(--c-border)] flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenStructureRoom();
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] font-mono text-xs font-semibold cursor-pointer active:scale-98"
                >
                  <Layers className="w-4 h-4" />
                  <span>Blueprint Dossier</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user?.email && (user.email.toLowerCase() === 'meinkxun@gmail.com' || user.email.toLowerCase() === 'skyhubowner@gmail.com')) {
                      router.push('/dashboard');
                    } else if (onOpenAuth) {
                      onOpenAuth();
                    } else {
                      router.push('/dashboard');
                    }
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-heading)] font-mono text-xs font-semibold cursor-pointer active:scale-98"
                >
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Admin Terminal</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 flex items-center justify-center">
              <span className="text-[10px] font-mono text-[var(--c-muted)] uppercase tracking-widest">
                Swipe up or tap item to close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

TactileHeader.displayName = 'TactileHeader';
