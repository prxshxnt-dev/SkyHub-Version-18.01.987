'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Maximize2,
  Pencil,
  Sparkles,
  Upload,
  Loader2,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AnimatedChevronLeft, AnimatedChevronRightCar } from '@/components/icons';
import { usePerformanceTier } from '@/context/PerformanceContext';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { compressImage } from '@/lib/image-upload';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

interface ShowcaseSlide {
  id: string | number;
  docId?: string;
  src?: string;
  alt: string;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentBg: string;
  renderScreen: () => React.ReactNode;
}

// Fallback slides used if Firestore collection is empty
const defaultSlides: ShowcaseSlide[] = [
  {
    id: 1,
    docId: 'default_1_axion_aosp',
    src: '/screenshots/AxionOS.jpg',
    alt: 'Axion AOSP Screenshot',
    title: 'Axion AOSP',
    subtitle: 'Custom ROM Showcase',
    description: 'High-performance AOSP custom ROM with advanced customization, pure fluidity, and battery optimizations for sky / sm4450.',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-sky-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">Axion AOSP</div>
  },
  {
    id: 2,
    docId: 'default_2_axionos_settings',
    src: '/screenshots/AxionOS2.jpg',
    alt: 'AxionOS Settings',
    title: 'AxionOS Settings',
    subtitle: 'Customization Hub',
    description: 'Granular controls for status bar, quick settings, and theming.',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-sky-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">AxionOS 2</div>
  },
  {
    id: 3,
    docId: 'default_3_infinityx',
    src: '/screenshots/InfinityX.jpg',
    alt: 'InfinityX Screenshot',
    title: 'InfinityX',
    subtitle: 'Sleek Experience',
    description: 'Feature-rich custom ROM focused on stability and modern UI aesthetics.',
    themeColor: '#8B5CF6',
    accentBg: 'from-purple-500/20 to-indigo-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">InfinityX</div>
  },
  {
    id: 4,
    docId: 'default_4_infinityx_features',
    src: '/screenshots/InfinityX2.jpg',
    alt: 'InfinityX Features',
    title: 'InfinityX Features',
    subtitle: 'Advanced Tweaks',
    description: 'Extensive customization options and optimized battery performance.',
    themeColor: '#8B5CF6',
    accentBg: 'from-purple-500/20 to-indigo-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">InfinityX 2</div>
  },
  {
    id: 5,
    docId: 'default_5_mistos',
    src: '/screenshots/MistOS.jpg',
    alt: 'MistOS Screenshot',
    title: 'MistOS',
    subtitle: 'Minimalist & Fast',
    description: 'Clean, bloatware-free Android experience with lightning-fast response times.',
    themeColor: '#06B6D4',
    accentBg: 'from-cyan-500/20 to-teal-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">MistOS</div>
  },
  {
    id: 6,
    docId: 'default_6_mistos_ui',
    src: '/screenshots/MistOS2.jpg',
    alt: 'MistOS UI',
    title: 'MistOS UI',
    subtitle: 'Refined Design',
    description: 'Carefully crafted interface elements for a distraction-free workflow.',
    themeColor: '#06B6D4',
    accentBg: 'from-cyan-500/20 to-teal-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">MistOS 2</div>
  },
  {
    id: 7,
    docId: 'default_7_ascp_os',
    src: '/screenshots/ascp.jpg',
    alt: 'ASCP OS Screenshot',
    title: 'ASCP OS',
    subtitle: 'Community Build',
    description: 'Specialized community build optimized for maximum efficiency and device longevity.',
    themeColor: '#10B981',
    accentBg: 'from-emerald-500/20 to-green-500/10',
    renderScreen: () => <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">ASCP OS</div>
  },
];

export const ScreenshotCarousel: React.FC = () => {
  const db = useFirestore();
  const { user } = useUser();
  const isSuperAdmin = user?.email?.toLowerCase().trim() === 'meinkxun@gmail.com' || user?.email?.toLowerCase().trim() === 'skyhubowner@gmail.com';

  const screenshotsQuery = useMemoFirebase(
    () => (db ? query(collection(db, 'screenshots'), orderBy('order', 'asc')) : null),
    [db]
  );
  const { data: dbScreenshots } = useCollection(screenshotsQuery);

  const slides: ShowcaseSlide[] = (dbScreenshots && dbScreenshots.length > 0)
    ? dbScreenshots.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        docId: item.id || `slide_${idx + 1}`,
        src: item.imageUrl || item.src || '/screenshots/AxionOS.jpg',
        alt: `${item.title || 'ROM'} Screenshot`,
        title: item.title || 'Custom ROM',
        subtitle: item.subtitle || 'Showcase',
        description: item.description || '',
        themeColor: item.themeColor || '#3B82F6',
        accentBg: item.accentBg || 'from-blue-500/20 to-sky-500/10',
        renderScreen: () => (
          <div className="h-full flex items-center justify-center bg-zinc-900 text-white p-4 text-center font-bold">
            {item.title}
          </div>
        )
      }))
    : defaultSlides;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string | number, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { tier } = usePerformanceTier();
  const isLowEnd = tier === 'low' || tier === 'medium';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  // In-context Quick Edit state for Super Admin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string>('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editThemeColor, setEditThemeColor] = useState('#3B82F6');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Clamp index if slides array length changes dynamically
  useEffect(() => {
    if (index >= slides.length) {
      setIndex(0);
    }
  }, [slides.length, index]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      next();
    } else if (isRightSwipe) {
      prev();
    }
  };

  // Preload adjacent slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const nextIdx = (index + 1) % slides.length;
    const prevIdx = (index - 1 + slides.length) % slides.length;
    [slides[nextIdx], slides[prevIdx]].forEach((slide) => {
      if (slide && slide.src && !imageErrorMap[slide.id]) {
        const img = new Image();
        img.src = slide.src;
      }
    });
  }, [index, imageErrorMap, slides]);

  const currentSlide = slides[index] || slides[0] || defaultSlides[0];

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLightbox) {
        if (e.key === 'Escape') setShowLightbox(false);
      }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, slides.length]);

  // Auto-cycle timer
  useEffect(() => {
    if (isPaused || showLightbox || isEditModalOpen || !isInView || slides.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isPaused, showLightbox, isEditModalOpen, isInView, slides.length]);

  const handleImageError = (id: string | number) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  const openQuickEdit = (slide: ShowcaseSlide, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDocId(slide.docId || `slide_${slide.id}`);
    setEditTitle(slide.title);
    setEditSubtitle(slide.subtitle);
    setEditDescription(slide.description);
    setEditImageUrl(slide.src || '');
    setEditThemeColor(slide.themeColor || '#3B82F6');
    setIsEditModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, 1200, 1920, 0.85);
      setEditImageUrl(compressed);
      toast({
        title: 'Image Ready',
        description: `${file.name} compressed successfully. Click "Save Changes" to publish.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Image Error',
        description: err.message || 'Could not process image file.',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Title Required',
        description: 'Please provide a title for the ROM slide.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const slideId = editingDocId || `slide_${Date.now()}`;
      const slideRef = doc(db, 'screenshots', slideId);

      await setDoc(slideRef, {
        id: slideId,
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || 'Custom ROM Showcase',
        description: editDescription.trim(),
        imageUrl: editImageUrl.trim() || '/screenshots/AxionOS.jpg',
        themeColor: editThemeColor || '#3B82F6',
        accentBg: 'from-blue-500/20 to-sky-500/10',
        order: index + 1,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: 'Showcase Slide Updated!',
        description: `"${editTitle}" image and content have been saved to Firestore.`,
      });

      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Error saving slide quick-edit:', err);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Could not update slide in Firestore.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto select-none px-12 sm:px-16" role="region" aria-label="SKY Interface Showcase">
      {/* Super Admin Quick Actions Bar */}
      {isSuperAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] p-2.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1B17] dark:text-[#F4EFE6]">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Super Admin: <strong className="text-blue-600 dark:text-blue-400">{currentSlide.title}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => openQuickEdit(currentSlide, e)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] transition-all shadow-2xs cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit / Upload Image</span>
            </button>

            <Link
              href="/dashboard?tab=showcase"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/70 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 border border-[#EBE4CF] dark:border-[#36342A] text-[#49473E] dark:text-[#F4EFE6] transition-all"
            >
              <span>All Slides</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* External Left Navigation Button */}
      <button
        aria-label="Previous screenshot"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF8E1] dark:bg-[#1E1D19] border border-[#EBE4CF] dark:border-[#36342A] text-[#1C1B17] dark:text-[#F4EFE6] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer hover:bg-[#FAF3DD] dark:hover:bg-[#282721]"
      >
        <AnimatedChevronLeft size={20} />
      </button>

      {/* External Right Navigation Button */}
      <button
        aria-label="Next screenshot"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF8E1] dark:bg-[#1E1D19] border border-[#EBE4CF] dark:border-[#36342A] text-[#1C1B17] dark:text-[#F4EFE6] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer hover:bg-[#FAF3DD] dark:hover:bg-[#282721]"
      >
        <AnimatedChevronRightCar size={20} />
      </button>

      {/* Main Mockup Card */}
      <div
        className="relative group cursor-pointer"
        onClick={() => setShowLightbox(true)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm aspect-[9/18.5] rounded-[44px] p-3 bg-gradient-to-b from-[#FAF3DD] to-[#F5ECCE] dark:from-[#25241D] dark:to-[#181714] border border-[#EBE4CF] dark:border-[#36342A] shadow-2xl shadow-black/10 dark:shadow-black/40">
          {/* Inner Bezel Screen */}
          <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-black flex flex-col justify-between">
            {/* Screen Image with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={String(currentSlide.id)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: isLowEnd ? 0.15 : 0.25 }}
                className="absolute inset-0 w-full h-full"
              >
                {currentSlide.src && !imageErrorMap[currentSlide.id] ? (
                  <img
                    src={currentSlide.src}
                    alt={currentSlide.alt}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    onError={() => handleImageError(currentSlide.id)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentSlide.renderScreen()
                )}
              </motion.div>
            </AnimatePresence>

            {/* Subtle Gradient Overlay for Text Readability at Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10" />

            {/* Top Speaker Ear-piece */}
            <div className="relative z-20 flex justify-center pt-2">
              <div className="w-16 h-1.5 rounded-full bg-black/60 dark:bg-black/80" />
            </div>

            {/* Bottom Slide Info Overlay */}
            <div className="relative z-20 p-5 text-left text-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md mb-1.5 border border-white/20">
                {currentSlide.subtitle}
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight drop-shadow-sm">
                {currentSlide.title}
              </h3>
              <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed drop-shadow-xs mt-0.5">
                {currentSlide.description}
              </p>
            </div>

            {/* Fullscreen Expand Prompt Icon & Super Admin Pencil */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={(e) => openQuickEdit(currentSlide, e)}
                  title="Upload image / Edit slide"
                  className="bg-blue-600/90 hover:bg-blue-600 text-white p-2 rounded-full backdrop-blur-xs transition-transform hover:scale-110 shadow-md cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white p-2 rounded-full backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-5">
        {slides.map((s, i) => (
          <button
            key={String(s.id)}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}: ${s.title}`}
            className="p-1 cursor-pointer"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === index
                  ? 'w-6 h-2 bg-[#FDE694]'
                  : 'w-2 h-2 bg-[#EBE4CF] dark:bg-[#36342A] hover:bg-[#787567]'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          onClick={() => setShowLightbox(false)}
        >
          <button
            aria-label="Close lightbox"
            onClick={() => setShowLightbox(false)}
            className="absolute top-5 right-5 text-white min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="w-full max-w-xs sm:max-w-sm aspect-[9/18.5] rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {currentSlide.src && !imageErrorMap[currentSlide.id] ? (
              <img
                src={currentSlide.src}
                alt={currentSlide.alt}
                referrerPolicy="no-referrer"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              currentSlide.renderScreen()
            )}
          </div>
        </div>
      )}

      {/* Quick Edit Dialog for Super Admin */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6] flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-500" />
              <span>Edit & Upload: {editTitle}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveQuickEdit} className="space-y-4 mt-3">
            {/* Image Preview & Upload Button */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-white/50 dark:bg-black/30 border border-[#EBE4CF] dark:border-[#36342A]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Screenshot Image (Axion AOSP / ROM)
                </Label>
                {editImageUrl && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Image Loaded
                  </span>
                )}
              </div>

              {editImageUrl && (
                <div className="relative aspect-[9/16] max-h-56 mx-auto rounded-xl overflow-hidden bg-black/60 border border-[#EBE4CF] dark:border-[#36342A]">
                  <img
                    src={editImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x700/222/white?text=Invalid+Image';
                    }}
                  />
                </div>
              )}

              <label className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-[#FDE694] dark:border-[#FDE694]/40 bg-[#FDE694]/20 hover:bg-[#FDE694]/30 text-[#121212] dark:text-[#FDE694] text-xs font-bold cursor-pointer transition-colors w-full">
                {isCompressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isCompressing ? 'Compressing Image...' : 'Upload New Screenshot File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isCompressing}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div>
                <span className="text-[10px] font-bold text-[#787567] dark:text-[#9C9888] block mb-1">
                  Or enter image URL:
                </span>
                <Input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://... or /screenshots/AxionOS.jpg"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                ROM Title
              </Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Axion AOSP"
                required
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Subtitle
              </Label>
              <Input
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                placeholder="Custom ROM Showcase"
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Description
              </Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Details about Axion AOSP or this ROM build..."
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs min-h-[70px]"
              />
            </div>

            <div className="pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isCompressing}
                className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 cursor-pointer shadow-xs"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScreenshotCarousel;
