"use client";

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { DonorShowcase } from '@/components/sections/DonorShowcase';
import { 
  ROMGrid, 
  ModuleGrid, 
  GuideGrid, 
  RequestROM, 
  RootGrid, 
  ModApkGrid, 
  RecoveryGrid, 
  CustomGrid, 
  LiveWallpaperGrid 
} from '@/components/sections/content-grid';
import { Wallpapers } from '@/components/sections/wallpapers';
import { Slideshow } from '@/components/sections/slideshow';
import { Footer } from '@/components/sections/footer';
import { 
  ScreenshotCarousel, 
  DeviceSection, 
  TeamSection, 
  CommunityFAQSection,
  ScrollReveal 
} from '@/components/sky';
import { useCollection, useMemoFirebase, useFirestore, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { SiteSettings } from '@/lib/store';
import { FloatingKitten } from '@/components/ui/floating-kitten';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const highlightWords = (text: string, highlights: any[] = []) => {
  if (!highlights || highlights.length === 0) return text;
  let parts: (string | React.ReactNode)[] = [text];
  highlights.forEach((hw: any) => {
    if (!hw.word) return;
    const escapedWord = hw.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedWord})`, 'gi');
    parts = parts.flatMap((p: any, pIdx: number) => {
      if (typeof p === 'string') {
        const split = p.split(regex);
        return split.map((s, i) => i % 2 !== 0 ? <span key={`${hw.word}-${pIdx}-${i}`} style={{ color: hw.color, textShadow: `0 0 10px ${hw.color}80` }}>{s}</span> : s);
      }
      return p;
    });
  });
  return parts;
};

export default function Home() {
  const db = useFirestore();

  const romsQuery = useMemoFirebase(() => query(collection(db, 'roms'), orderBy('createdAt', 'desc')), [db]);
  const recoveriesQuery = useMemoFirebase(() => query(collection(db, 'recoveries'), orderBy('createdAt', 'desc')), [db]);
  const modulesQuery = useMemoFirebase(() => query(collection(db, 'modules'), orderBy('createdAt', 'desc')), [db]);
  const apksQuery = useMemoFirebase(() => query(collection(db, 'mod-apks'), orderBy('createdAt', 'desc')), [db]);
  const wallpapersQuery = useMemoFirebase(() => query(collection(db, 'wallpapers'), orderBy('createdAt', 'desc')), [db]);
  const liveWallpapersQuery = useMemoFirebase(() => query(collection(db, 'live-wallpapers'), orderBy('createdAt', 'desc')), [db]);
  const guidesQuery = useMemoFirebase(() => query(collection(db, 'tutorials'), orderBy('createdAt', 'desc')), [db]);
  const rootPackagesQuery = useMemoFirebase(() => query(collection(db, 'root-packages'), orderBy('createdAt', 'desc')), [db]);
  const navLinksQuery = useMemoFirebase(() => query(collection(db, 'navigation-links'), orderBy('order', 'asc')), [db]);
  const customResourcesQuery = useMemoFirebase(() => query(collection(db, 'custom-resources'), orderBy('createdAt', 'desc')), [db]);
  const globalSettingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);

  const { data: roms, isLoading: romsLoading } = useCollection(romsQuery);
  const { data: recoveries, isLoading: recoveriesLoading } = useCollection(recoveriesQuery);
  const { data: modules, isLoading: modulesLoading } = useCollection(modulesQuery);
  const { data: apks, isLoading: apksLoading } = useCollection(apksQuery);
  const { data: wallpapers, isLoading: wallpapersLoading } = useCollection(wallpapersQuery);
  const { data: liveWallpapers, isLoading: liveLoading } = useCollection(liveWallpapersQuery);
  const { data: guides, isLoading: guidesLoading } = useCollection(guidesQuery);
  const { data: rootPackages, isLoading: rootLoading } = useCollection(rootPackagesQuery);
  const { data: customLinks } = useCollection(navLinksQuery);
  const { data: customResources, isLoading: customLoading } = useCollection(customResourcesQuery);
  const { data: globalSettings } = useDoc<SiteSettings>(globalSettingsRef);

  const defaultLayout = [
    { id: 'slideshow', order: 0, visible: true },
    { id: 'hero', order: 1, visible: true },
    { id: 'screenshots', order: 1.2, visible: true },
    { id: 'device', order: 1.4, visible: true },
    { id: 'donors', order: 1.6, visible: true },
    { id: 'roms', order: 2, visible: true, columns: 3, gap: 4 },
    { id: 'recoveries', order: 2.5, visible: true, columns: 3, gap: 4 },
    { id: 'modules', order: 3, visible: true, columns: 3, gap: 4 },
    { id: 'apks', order: 4, visible: true, columns: 3, gap: 4 },
    { id: 'root', order: 5, visible: true, columns: 3, gap: 4 },
    { id: 'guides', order: 6, visible: true, columns: 3, gap: 4 },
    { id: 'liveWallpapers', order: 7, visible: true, columns: 3, gap: 4 },
    { id: 'wallpapers', order: 8, visible: true, columns: 3, gap: 4 },
    { id: 'team', order: 9, visible: true },
    { id: 'community', order: 10, visible: true },
  ];

  const layout = globalSettings?.layoutConfig || defaultLayout;
  
  const mergedLayout = defaultLayout.map(defaultSection => {
    const customSection = layout.find((s: any) => s.id === defaultSection.id);
    return customSection || defaultSection;
  });
  
  const sortedLayout = [...mergedLayout].sort((a, b) => a.order - b.order);

  const contentSections = customLinks?.filter(link => link.type === 'section') || [];

  const renderSection = (section: any) => {
    if (!section.visible) return null;
    
    switch (section.id) {
      case 'slideshow': 
        if (!globalSettings?.slideshowImages || globalSettings.slideshowImages.length === 0) return null;
        return <Slideshow slideshowImages={globalSettings?.slideshowImages || []} rounding={globalSettings?.slideshowRounding} />;
      case 'hero': 
        return <Hero />;
      case 'screenshots':
        return (
          <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto py-8">
            <ScreenshotCarousel />
          </section>
        );
      case 'device':
        return <DeviceSection />;
      case 'donors': 
        return <DonorShowcase />;
      case 'roms': 
        return (
          <div id="roms" className="scroll-mt-24">
            <ROMGrid roms={roms || []} isLoading={romsLoading} />
          </div>
        );
      case 'recoveries': 
        return (
          <div id="recoveries" className="scroll-mt-24">
            <RecoveryGrid recoveries={recoveries || []} isLoading={recoveriesLoading} />
          </div>
        );
      case 'modules': 
        return (
          <div id="modules" className="scroll-mt-24">
            <ModuleGrid modules={modules || []} isLoading={modulesLoading} />
          </div>
        );
      case 'apks': 
        return (
          <div id="rooted-apks" className="scroll-mt-24">
            <ModApkGrid apks={apks || []} isLoading={apksLoading} />
          </div>
        );
      case 'root': 
        return (
          <div id="root" className="scroll-mt-24">
            <RootGrid packages={rootPackages || []} isLoading={rootLoading} />
          </div>
        );
      case 'guides': 
        return (
          <section id="guides" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <GuideGrid guides={guides || []} isLoading={guidesLoading} />
              </div>
              <RequestROM />
            </div>
          </section>
        );
      case 'liveWallpapers': 
        return <LiveWallpaperGrid wallpapers={liveWallpapers || []} isLoading={liveLoading} />;
      case 'wallpapers': 
        return (
          <div id="wallpapers" className="scroll-mt-24">
            <Wallpapers wallpapers={wallpapers || []} isLoading={wallpapersLoading} />
          </div>
        );
      case 'team':
        return (
          <section id="team" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
            <TeamSection />
          </section>
        );
      case 'community':
        return (
          <section id="community" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
            <CommunityFAQSection />
          </section>
        );
      default: 
        return null;
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navbar />
      <FloatingKitten />
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}>
          <div className="space-y-12 sm:space-y-20 pb-32">
            {sortedLayout.map(section => (
              <motion.div key={section.id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
                {renderSection(section)}
              </motion.div>
            ))}
            
            {globalSettings?.customSections?.map((section: any, idx: number) => (
              <motion.div key={`custom-${idx}`} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-6">
                    {highlightWords(section.title, section.highlights || [])}
                  </h2>
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <p className="whitespace-pre-line">{highlightWords(section.content, section.highlights || [])}</p>
                  </div>
                </section>
              </motion.div>
            ))}

            {contentSections.map((section) => (
              <motion.div key={section.id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={sectionVariants}>
                <CustomGrid 
                  section={section} 
                  items={customResources?.filter(item => item.sectionId === section.id) || []} 
                  isLoading={customLoading}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <Footer />
    </main>
  );
}
