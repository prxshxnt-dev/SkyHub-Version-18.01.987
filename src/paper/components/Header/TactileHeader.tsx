'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
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
  Shield,
  LogIn,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSound, isSoundMuted, toggleSound, playTerminalBlip } from '../../utils/soundManager';
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
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isMuted, toggleMute } = useSound();
  const activeSectionId = useActiveSection();
  const [currentActive, setCurrentActive] = useState('hero');

  useEffect(() => {
    setMounted(true);
  }, []);

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
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
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
              suppressHydrationWarning
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

            {/* Admin Panel or Login Button */}
            {mounted && user ? (
              <div suppressHydrationWarning className="flex items-center gap-1.5">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-600/50 hover:border-amber-600 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono transition-all cursor-pointer active:scale-95 shadow-xs font-semibold"
                  title="Go to Admin Panel"
                  aria-label="Admin Panel"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] hidden md:inline">Admin Panel</span>
                </button>
                <button
                  onClick={async () => {
                    if (auth) await signOut(auth);
                    if (typeof document !== 'undefined') {
                      document.cookie = 'skyhub_auth_email=; path=/; max-age=0';
                      document.cookie = 'skyhub_admin_session=; path=/; max-age=0';
                    }
                  }}
                  className="p-1.5 rounded-lg border border-[var(--c-border)] hover:border-red-500/40 text-muted-foreground hover:text-red-500 transition-colors"
                  title={`Sign Out (${user.email})`}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                suppressHydrationWarning
                onClick={() => onOpenAuth ? onOpenAuth() : router.push('/dashboard')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary/40 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono transition-all cursor-pointer active:scale-95 shadow-xs font-semibold"
                title="Login / Sign In (meinkxun@gmail.com)"
                aria-label="Login"
              >
                <LogIn className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] hidden md:inline">Login</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                playTerminalBlip(500, 0.04);
                setMobileMenuOpen(prev => !prev);
              }}
              className="lg:hidden relative z-50 p-2 rounded-lg border border-[var(--c-border)] hover:border-[var(--c-border-hover)] bg-[var(--c-card)] transition-all cursor-pointer active:scale-95 shadow-2xs"
              style={{ color: 'var(--c-heading)' }}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-700 dark:text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay to focus menu and dismiss on outside tap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />

            {/* Slide-down Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-x-0 top-[64px] sm:top-[70px] z-50 lg:hidden border-b shadow-2xl p-4 sm:p-5 max-h-[calc(100vh-70px)] overflow-y-auto overscroll-contain"
              style={{
                backgroundColor: 'var(--c-modal-bg, #FAF5EB)',
                color: 'var(--c-heading, #241F1A)',
                borderColor: 'var(--c-border, rgba(36, 31, 26, 0.16))',
              }}
            >
              <div className="flex flex-col space-y-2.5">
                {/* 1. Dedicated Authentication & Admin Panel Option in Hamburger Menu */}
                {mounted && user ? (
                  <div 
                    suppressHydrationWarning
                    className="p-3.5 rounded-2xl border-2 border-amber-600/60 bg-amber-500/15 shadow-sm space-y-2.5 mb-1"
                    style={{ borderColor: 'rgba(217, 119, 6, 0.6)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                          {user.email?.toLowerCase().trim() === 'meinkxun@gmail.com' ? 'Super Admin Verified' : 'Logged In'}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          setMobileMenuOpen(false);
                          if (auth) await signOut(auth);
                          if (typeof document !== 'undefined') {
                            document.cookie = 'skyhub_auth_email=; path=/; max-age=0';
                            document.cookie = 'skyhub_admin_session=; path=/; max-age=0';
                          }
                        }}
                        className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/dashboard');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all text-left cursor-pointer active:scale-[0.99] shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-black/25 flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-mono font-bold tracking-wide uppercase">
                            Go to Admin Panel
                          </span>
                          <span className="text-[10px] font-mono opacity-90 truncate max-w-[210px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold shrink-0">
                        OPEN <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="mb-1">
                    {/* Logged-Out State: Prominent Login Button */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenAuth) onOpenAuth();
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-primary/50 bg-primary/10 hover:bg-primary/20 transition-all text-left cursor-pointer active:scale-[0.99] shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
                          <LogIn className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-handwriting font-bold tracking-wide" style={{ color: 'var(--c-heading, #241F1A)' }}>
                              Login / Sign In
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-primary text-primary-foreground uppercase">
                              Admin Access
                            </span>
                          </div>
                          <span className="text-[11px] font-mono opacity-90" style={{ color: 'var(--c-muted, #686053)' }}>
                            Sign in with meinkxun@gmail.com
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-primary shrink-0 flex items-center gap-1">
                        LOGIN <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>
                )}

                {/* 2. Primary Navigation Options */}
                <div className="space-y-1.5 pt-1">
                  {NAV_ITEMS.map(({ id, label, icon: Icon, subtitle }) => {
                    const isActive = currentActive === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          playTerminalBlip(550, 0.04);
                          handleNavClick(id);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer active:scale-[0.98] ${
                          isActive
                            ? 'bg-amber-600/15 border-2 border-amber-600 shadow-xs'
                            : 'bg-[var(--c-card)] hover:bg-[var(--c-btn-bg)]/10 border border-[var(--c-border)] shadow-2xs'
                        }`}
                        style={{
                          color: 'var(--c-heading, #241F1A)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg border border-[var(--c-border)] flex items-center justify-center shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: isActive ? '#b45309' : 'var(--c-input-bg, rgba(255,255,255,0.7))',
                              color: isActive ? '#ffffff' : 'var(--c-heading, #241F1A)',
                            }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-mono font-bold tracking-tight" style={{ color: 'var(--c-heading, #241F1A)' }}>
                              {label}
                            </span>
                            {subtitle && (
                              <span className="text-[10px] font-mono tracking-normal" style={{ color: 'var(--c-muted, #686053)' }}>
                                {subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                        {isActive ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                        ) : (
                          <span className="text-xs font-mono font-bold opacity-60" style={{ color: 'var(--c-muted)' }}>→</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 3. Quick Action Utilities */}
                <div className="pt-2 border-t border-[var(--c-border)] grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenStructureRoom();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[var(--c-btn-bg, #241F1A)] text-[var(--c-btn-text, #F4EDE0)] font-mono text-xs font-semibold cursor-pointer active:scale-98 shadow-xs"
                    title="Open System Blueprint Dossier [S]"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Blueprint Dossier</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSearch();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-heading)] font-mono text-xs font-semibold cursor-pointer active:scale-98 shadow-xs"
                    title="Search Resources [Ctrl+K]"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search [Ctrl+K]</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[var(--c-border)] text-[10px] font-mono" style={{ color: 'var(--c-muted)' }}>
                <span>SM4450 SKY HUB • v4.2</span>
                <button
                  suppressHydrationWarning
                  onClick={() => {
                    handleSoundClick();
                  }}
                  className="hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  {isMuted ? <VolumeX className="w-3 h-3 text-red-500" /> : <Volume2 className="w-3 h-3 text-emerald-600" />}
                  Sound {isMuted ? 'Muted' : 'Active'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

TactileHeader.displayName = 'TactileHeader';
