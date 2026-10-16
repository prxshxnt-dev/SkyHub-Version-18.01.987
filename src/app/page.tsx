'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PaperState, PaperTheme, ROMResource, RecoveryResource, ModuleResource, WallpaperResource, DonorItem } from '@/paper/types';
import { TactileHeader } from '@/paper/components/Header/TactileHeader';
import { HeroSection } from '@/paper/components/Sections/HeroSection';
import { ROMsSection } from '@/paper/components/Sections/ROMsSection';
import { RecoveriesSection } from '@/paper/components/Sections/RecoveriesSection';
import { ModulesSection } from '@/paper/components/Sections/ModulesSection';
import { GuidesSection } from '@/paper/components/Sections/GuidesSection';
import { DeviceExplorerSection } from '@/paper/components/Sections/DeviceExplorerSection';
import { WallpapersSection } from '@/paper/components/Sections/WallpapersSection';
import { DonorSection } from '@/paper/components/Sections/DonorSection';
import { FooterSection } from '@/paper/components/Sections/FooterSection';
import { ShortcutHUD, triggerShortcutHUD } from '@/paper/components/UI/ShortcutHUD';
import { SiteMapModal } from '@/paper/components/Modals/SiteMapModal';
import { ResourceDetailModal } from '@/paper/components/Modals/ResourceDetailModal';
import { AuthModal } from '@/components/auth/auth-modal';
import { useSound, toggleSound, playTerminalBlip, playCheckmarkChime } from '@/paper/utils/soundManager';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

// Dynamically import 3D Paper Intro and Structure Room to ensure seamless client-only WebGL initialization
const PaperIntro = dynamic(
  () => import('@/paper/components/PaperIntro/PaperIntro').then(m => m.PaperIntro),
  { ssr: false }
);

const StructureRoom = dynamic(
  () => import('@/paper/components/StructureRoom/StructureRoom').then(m => m.StructureRoom),
  { ssr: false }
);

export default function Home() {
  const [paperState, setPaperState] = useState<PaperState>('opened');
  const [theme, setTheme] = useState<PaperTheme>('kraft');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [isStructureRoomOpen, setIsStructureRoomOpen] = useState(false);
  const [showMoodGame, setShowMoodGame] = useState(false);

  // Firestore live collections
  const db = useFirestore();
  const romsQuery = useMemoFirebase(() => (db ? query(collection(db, 'roms'), orderBy('name', 'asc')) : null), [db]);
  const recoveriesQuery = useMemoFirebase(() => (db ? query(collection(db, 'recoveries')) : null), [db]);
  const modulesQuery = useMemoFirebase(() => (db ? query(collection(db, 'modules')) : null), [db]);
  const wallpapersQuery = useMemoFirebase(() => (db ? query(collection(db, 'wallpapers')) : null), [db]);
  const tutorialsQuery = useMemoFirebase(() => (db ? query(collection(db, 'tutorials')) : null), [db]);
  const donorsQuery = useMemoFirebase(() => (db ? query(collection(db, 'donors')) : null), [db]);

  const { data: firestoreRoms } = useCollection<any>(romsQuery);
  const { data: firestoreRecoveries } = useCollection<any>(recoveriesQuery);
  const { data: firestoreModules } = useCollection<any>(modulesQuery);
  const { data: firestoreWallpapers } = useCollection<any>(wallpapersQuery);
  const { data: firestoreTutorials } = useCollection<any>(tutorialsQuery);
  const { data: firestoreDonors } = useCollection<any>(donorsQuery);

  // Smooth scroll helper
  const scrollToSection = useCallback((id: string) => {
    if (paperState !== 'opened') {
      setPaperState('opened');
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [paperState]);

  // Recrumple handler to re-enter 3D paper stage
  const handleRecrumple = useCallback(() => {
    playTerminalBlip(400, 0.05);
    setPaperState('crumpled');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSelectedResource(null);
        setIsStructureRoomOpen(false);
      } else if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsStructureRoomOpen(prev => !prev);
        triggerShortcutHUD({
          title: 'BLUEPRINT DOSSIER',
          badge: '[S]',
          icon: 'Layers',
        });
      } else if (e.key.toLowerCase() === 'u' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleRecrumple();
      } else if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const next = toggleSound();
        triggerShortcutHUD({
          title: next ? 'SOUND MUTED' : 'SOUND ACTIVE',
          badge: next ? 'OFF' : 'ON',
          icon: next ? 'VolumeX' : 'Volume2',
        });
      } else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        scrollToSection('roms');
        triggerShortcutHUD({ title: 'CUSTOM ROMS', badge: '[R]' });
      } else if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        scrollToSection('guides');
        triggerShortcutHUD({ title: 'FIELD GUIDES', badge: '[G]' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRecrumple, scrollToSection]);

  return (
    <div data-theme={theme} className="min-h-screen bg-[var(--c-bg,#EFE6D5)] text-[var(--c-heading,#241F1A)] transition-colors duration-500 font-mono relative selection:bg-[#241F1A] selection:text-[#F4EDE0]">
      {/* 3D WebGL Paper Intro Experience (Active when crumpled or opening) */}
      {paperState !== 'opened' ? (
        <div className="fixed inset-0 z-50">
          <PaperIntro
            paperState={paperState}
            setPaperState={setPaperState}
            theme={theme}
            setTheme={setTheme}
            showMoodGame={showMoodGame}
            setShowMoodGame={setShowMoodGame}
            onMoodUnlocked={() => {}}
            onOpenComplete={() => {
              playCheckmarkChime();
              setPaperState('opened');
            }}
          />
        </div>
      ) : (
        <>
          {/* Tactile Header Bar */}
          <TactileHeader
            theme={theme}
            setTheme={setTheme}
            onRecrumple={handleRecrumple}
            onOpenStructureRoom={() => setIsStructureRoomOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onNavigateSection={scrollToSection}
            onOpenAuth={() => setIsAuthOpen(true)}
          />

          {/* Physical Kraft Paper Sheet Container */}
          <main className="w-full pt-20 sm:pt-24 pb-16 px-3 sm:px-6 md:px-8">
            <div
              id="physical-paper-sheet"
              className="max-w-7xl mx-auto p-5 sm:p-10 md:p-12 lg:p-14 paper-grain animate-content-fade"
            >
              {/* Top Kraft Corner Tapes */}
              <div className="absolute -top-3 left-8 w-20 h-5 bg-[#d9cbb2]/85 rotate-[-2deg] border border-black/10 shadow-xs pointer-events-none" />
              <div className="absolute -top-3 right-8 w-20 h-5 bg-[#d9cbb2]/85 rotate-[2deg] border border-black/10 shadow-xs pointer-events-none" />

              {/* Sections */}
              <HeroSection
                onExploreROMs={() => scrollToSection('roms')}
                onExploreRecoveries={() => scrollToSection('recoveries')}
                onExploreModules={() => scrollToSection('modules')}
                onOpenStructureRoom={() => setIsStructureRoomOpen(true)}
                romsCount={firestoreRoms?.length || 18}
                modulesCount={firestoreModules?.length || 24}
                recoveriesCount={firestoreRecoveries?.length || 6}
              />

              <ROMsSection
                roms={firestoreRoms}
                onSelectROM={rom => setSelectedResource(rom)}
              />

              <RecoveriesSection
                recoveries={firestoreRecoveries}
                onSelectRecovery={rec => setSelectedResource(rec)}
              />

              <ModulesSection
                modules={firestoreModules}
                onSelectModule={mod => setSelectedResource(mod)}
              />

              <GuidesSection guides={firestoreTutorials} />

              <DeviceExplorerSection />

              <WallpapersSection wallpapers={firestoreWallpapers} />

              <DonorSection donors={firestoreDonors} />

              <FooterSection
                onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                onOpenStructureRoom={() => setIsStructureRoomOpen(true)}
              />
            </div>
          </main>
        </>
      )}

      {/* Global Shortcut HUD Floating Toasts */}
      <ShortcutHUD />

      {/* Command Palette / Search Modal */}
      <SiteMapModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateSection={scrollToSection}
        onSelectResource={item => setSelectedResource(item)}
      />

      {/* Resource Detail & Flashing Instruction Modal */}
      <ResourceDetailModal
        item={selectedResource}
        onClose={() => setSelectedResource(null)}
      />

      {/* Blueprint Structure Room Dossier */}
      {isStructureRoomOpen && (
        <StructureRoom
          theme={theme}
          setTheme={setTheme}
          onExit={() => setIsStructureRoomOpen(false)}
        />
      )}

      {/* Admin Terminal Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onOpenChange={setIsAuthOpen}
      />
    </div>
  );
}
