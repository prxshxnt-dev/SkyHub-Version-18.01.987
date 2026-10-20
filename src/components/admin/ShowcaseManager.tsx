'use client';

import React, { useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Upload, 
  ImageIcon, 
  Loader2, 
  Sparkles, 
  Check, 
  RotateCcw,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { compressImage } from '@/lib/image-upload';

export const DEFAULT_SHOWCASE_SLIDES = [
  {
    title: 'Axion AOSP',
    subtitle: 'Custom ROM Showcase',
    description: 'High-performance AOSP custom ROM with advanced customization, pure fluidity, and battery optimizations for sky / sm4450.',
    imageUrl: '/screenshots/AxionOS.jpg',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-sky-500/10',
    order: 1,
  },
  {
    title: 'AxionOS Settings',
    subtitle: 'Customization Hub',
    description: 'Granular controls for status bar, quick settings, power menu, lock screen, and dynamic system theming.',
    imageUrl: '/screenshots/AxionOS2.jpg',
    themeColor: '#3B82F6',
    accentBg: 'from-blue-500/20 to-sky-500/10',
    order: 2,
  },
  {
    title: 'InfinityX',
    subtitle: 'Sleek Experience',
    description: 'Feature-rich custom ROM focused on daily driver stability, thermal efficiency, and modern UI aesthetics.',
    imageUrl: '/screenshots/InfinityX.jpg',
    themeColor: '#8B5CF6',
    accentBg: 'from-purple-500/20 to-indigo-500/10',
    order: 3,
  },
  {
    title: 'InfinityX Features',
    subtitle: 'Advanced Tweaks',
    description: 'Extensive statusbar icon customization, notch adjustments, sound enhancement, and gaming profiles.',
    imageUrl: '/screenshots/InfinityX2.jpg',
    themeColor: '#8B5CF6',
    accentBg: 'from-purple-500/20 to-indigo-500/10',
    order: 4,
  },
  {
    title: 'MistOS',
    subtitle: 'Minimalist & Fast',
    description: 'Clean, bloatware-free Android experience with lightning-fast response times and zero telemetry.',
    imageUrl: '/screenshots/MistOS.jpg',
    themeColor: '#06B6D4',
    accentBg: 'from-cyan-500/20 to-teal-500/10',
    order: 5,
  },
  {
    title: 'MistOS UI',
    subtitle: 'Refined Design',
    description: 'Carefully crafted interface elements for a distraction-free workflow and seamless animations.',
    imageUrl: '/screenshots/MistOS2.jpg',
    themeColor: '#06B6D4',
    accentBg: 'from-cyan-500/20 to-teal-500/10',
    order: 6,
  },
  {
    title: 'ASCP OS',
    subtitle: 'Community Build',
    description: 'Specialized community build optimized for maximum efficiency, low ram overhead, and long battery life.',
    imageUrl: '/screenshots/ascp.jpg',
    themeColor: '#10B981',
    accentBg: 'from-emerald-500/20 to-green-500/10',
    order: 7,
  },
];

export function ShowcaseManager() {
  const db = useFirestore();
  const screenshotsQuery = useMemoFirebase(
    () => (db ? query(collection(db, 'screenshots'), orderBy('order', 'asc')) : null),
    [db]
  );
  const { data: slides, isLoading } = useCollection(screenshotsQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [quickUploadingAxion, setQuickUploadingAxion] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#3B82F6');
  const [order, setOrder] = useState<number>(1);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Identify Axion AOSP slide if present
  const axionSlide = slides?.find((s: any) => 
    s.title?.toLowerCase().includes('axion') && !s.title?.toLowerCase().includes('settings')
  ) || slides?.find((s: any) => s.title?.toLowerCase().includes('axion')) || DEFAULT_SHOWCASE_SLIDES[0];

  const openCreateDialog = () => {
    setEditingSlide(null);
    setTitle('');
    setSubtitle('Custom ROM Showcase');
    setDescription('');
    setImageUrl('');
    setThemeColor('#3B82F6');
    setOrder((slides?.length || 0) + 1);
    setUploadPreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (slide: any) => {
    setEditingSlide(slide);
    setTitle(slide.title || '');
    setSubtitle(slide.subtitle || '');
    setDescription(slide.description || '');
    setImageUrl(slide.imageUrl || slide.src || '');
    setThemeColor(slide.themeColor || '#3B82F6');
    setOrder(slide.order ?? 1);
    setUploadPreview(slide.imageUrl || slide.src || null);
    setIsDialogOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file, 1200, 1920, 0.82);
      setImageUrl(compressedDataUrl);
      setUploadPreview(compressedDataUrl);
      toast({
        title: 'Image Processed & Ready',
        description: `${file.name} compressed and ready to save.`,
      });
    } catch (err: any) {
      console.error('Image compression error:', err);
      toast({
        variant: 'destructive',
        title: 'Image Load Error',
        description: err.message || 'Could not process image file.',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Quick upload specifically for Axion AOSP
  const handleQuickUploadAxion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !db) return;

    setQuickUploadingAxion(true);
    try {
      const compressed = await compressImage(file, 1200, 1920, 0.85);

      const slideId = axionSlide?.id || 'default_1_axion_aosp';
      const slideRef = doc(db, 'screenshots', slideId);

      await setDoc(slideRef, {
        id: slideId,
        title: axionSlide?.title || 'Axion AOSP',
        subtitle: axionSlide?.subtitle || 'Custom ROM Showcase',
        description: axionSlide?.description || DEFAULT_SHOWCASE_SLIDES[0].description,
        imageUrl: compressed,
        themeColor: axionSlide?.themeColor || '#3B82F6',
        accentBg: 'from-blue-500/20 to-sky-500/10',
        order: axionSlide?.order ?? 1,
        updatedAt: serverTimestamp(),
        createdAt: axionSlide?.createdAt || serverTimestamp(),
      }, { merge: true });

      toast({
        title: 'Axion AOSP Image Uploaded!',
        description: 'New screenshot is now live on the homepage carousel.',
      });
    } catch (err: any) {
      console.error('Error uploading Axion AOSP image:', err);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Could not update Axion AOSP image.',
      });
    } finally {
      setQuickUploadingAxion(false);
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Title is required.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const slideId = editingSlide?.id || `slide_${Date.now()}`;
      const slideRef = doc(db, 'screenshots', slideId);

      const slideData = {
        id: slideId,
        title: title.trim(),
        subtitle: subtitle.trim() || 'Custom ROM Showcase',
        description: description.trim(),
        imageUrl: imageUrl.trim() || '/screenshots/AxionOS.jpg',
        themeColor: themeColor || '#3B82F6',
        accentBg: `from-[${themeColor}]/20 to-black/10`,
        order: Number(order) || 1,
        updatedAt: serverTimestamp(),
        createdAt: editingSlide?.createdAt || serverTimestamp(),
      };

      await setDoc(slideRef, slideData, { merge: true });

      toast({
        title: editingSlide ? 'Showcase Slide Updated' : 'Showcase Slide Created',
        description: `"${title}" has been saved to the ROM carousel.`,
      });

      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving showcase slide:', err);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Could not save slide to Firestore.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = async (slideId: string, slideTitle: string) => {
    if (!db) return;
    if (!confirm(`Are you sure you want to delete "${slideTitle}" from the ROM showcase?`)) return;

    try {
      await deleteDoc(doc(db, 'screenshots', slideId));
      toast({
        title: 'Slide Deleted',
        description: `"${slideTitle}" removed from the showcase.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: err.message || 'Could not delete slide.',
      });
    }
  };

  const handleSeedDefaults = async () => {
    if (!db) return;
    if (!confirm('This will seed the default Axion AOSP, InfinityX, and MistOS showcase slides into Firestore so you can easily edit their images and text. Continue?')) {
      return;
    }

    setIsSeeding(true);
    try {
      for (const item of DEFAULT_SHOWCASE_SLIDES) {
        const slideId = `default_${item.order}_${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const slideRef = doc(db, 'screenshots', slideId);
        await setDoc(slideRef, {
          ...item,
          id: slideId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      toast({
        title: 'Default Showcase Seeded',
        description: 'All 7 ROM slides (Axion AOSP, InfinityX, MistOS, etc.) are now live in Firestore!',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: err.message || 'Could not seed slides.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FDE694]/30 text-[#121212] dark:text-[#FDE694]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
              ROM Showcase & Images
            </h2>
          </div>
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4]">
            Upload the Axion AOSP screenshot and all showcase images, or edit the ROM titles, subtitles, and descriptions displayed on the homepage carousel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(!slides || slides.length === 0) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="rounded-2xl text-xs font-bold border-[#FDE694] text-[#121212] dark:text-[#FDE694] hover:bg-[#FDE694]/20 gap-2 cursor-pointer"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              <span>Import Default Slides to Firestore</span>
            </Button>
          )}

          <Button
            type="button"
            onClick={openCreateDialog}
            className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Showcase Slide</span>
          </Button>
        </div>
      </div>

      {/* Axion AOSP Direct Spotlight Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-[#FDE694]/20 to-sky-500/10 border-2 border-blue-500/30 dark:border-blue-400/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-black/60 border-2 border-blue-500/50 shrink-0 shadow-lg relative group">
            <img
              src={axionSlide?.imageUrl || axionSlide?.src || '/screenshots/AxionOS.jpg'}
              alt="Axion AOSP"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/300x500/222/white?text=Axion+AOSP';
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500 text-white shadow-xs">
                Featured ROM
              </span>
              <span className="text-xs font-bold text-[#787567] dark:text-[#BDB8A4]">
                Hero Carousel Slide #1
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#1C1B17] dark:text-[#F4EFE6] truncate">
              {axionSlide?.title || 'Axion AOSP'}
            </h3>
            <p className="text-xs text-[#787567] dark:text-[#BDB8A4] line-clamp-2 max-w-xl">
              {axionSlide?.description || DEFAULT_SHOWCASE_SLIDES[0].description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-transform hover:scale-102 active:scale-98">
            {quickUploadingAxion ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Upload Axion AOSP Image</span>
            <input
              type="file"
              accept="image/*"
              disabled={quickUploadingAxion}
              onChange={handleQuickUploadAxion}
              className="hidden"
            />
          </label>

          <Button
            type="button"
            variant="outline"
            onClick={() => openEditDialog(axionSlide)}
            className="rounded-2xl border-[#EBE4CF] dark:border-[#36342A] text-xs font-bold gap-1.5 cursor-pointer bg-white/60 dark:bg-black/30"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Axion Content</span>
          </Button>
        </div>
      </div>

      {/* Grid of All Slides */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#FDE694]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#787567]">Loading ROM Slides...</p>
        </div>
      ) : slides && slides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide: any, idx: number) => {
            const previewSrc = slide.imageUrl || slide.src || '/screenshots/AxionOS.jpg';
            const isAxion = slide.title?.toLowerCase().includes('axion');

            return (
              <Card
                key={slide.id || idx}
                className={`overflow-hidden rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border shadow-sm flex flex-col group hover:shadow-md transition-all ${
                  isAxion ? 'border-blue-500/50 ring-1 ring-blue-500/30' : 'border-[#EBE4CF] dark:border-[#36342A]'
                }`}
              >
                {/* Image Preview Box */}
                <div className="relative aspect-[16/10] bg-black/40 overflow-hidden border-b border-[#EBE4CF] dark:border-[#36342A]">
                  <img
                    src={previewSrc}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400/222/white?text=ROM+Image';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/70 text-white backdrop-blur-md">
                      #{slide.order ?? idx + 1}
                    </span>
                    {isAxion && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-600 text-white">
                        Axion
                      </span>
                    )}
                    <span 
                      className="w-3 h-3 rounded-full border border-white/40 shadow-xs" 
                      style={{ backgroundColor: slide.themeColor || '#3B82F6' }} 
                      title={`Theme: ${slide.themeColor}`}
                    />
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => openEditDialog(slide)}
                      className="w-8 h-8 rounded-full bg-white/90 text-black hover:bg-white shadow-md cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteSlide(slide.id, slide.title)}
                      className="w-8 h-8 rounded-full bg-red-600/90 text-white hover:bg-red-600 shadow-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-[#FDE694]">
                        {slide.subtitle || 'Custom ROM'}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-[#1C1B17] dark:text-[#F4EFE6]">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-[#787567] dark:text-[#BDB8A4] line-clamp-2 leading-relaxed">
                      {slide.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-between text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(slide)}
                      className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Content & Image</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSlide(slide.id, slide.title)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-12 border-2 border-dashed border-[#EBE4CF] dark:border-[#36342A] rounded-3xl space-y-4 bg-[#FAF3DD]/40 dark:bg-[#1A1914]/40">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FDE694]/20 flex items-center justify-center text-[#121212] dark:text-[#FDE694]">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1C1B17] dark:text-[#F4EFE6]">
              No Custom ROM Slides in Firestore
            </h3>
            <p className="text-xs text-[#787567] dark:text-[#BDB8A4] max-w-md mx-auto">
              The carousel is currently displaying the local fallback slides. Click below to load them into Firestore so you can upload images for Axion AOSP, InfinityX, MistOS, and customize all displayed text.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 cursor-pointer shadow-xs"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Populate Axion AOSP & ROM Slides into Firestore</span>
          </Button>
        </div>
      )}

      {/* Edit / Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
              {editingSlide ? `Edit "${editingSlide.title}"` : 'Add New Showcase Slide'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSlide} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                ROM Title (e.g. Axion AOSP, InfinityX, MistOS) *
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Axion AOSP"
                required
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Subtitle / Badge
                </Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Custom ROM Showcase"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Display Order
                </Label>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  min={1}
                  max={99}
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Description & Highlights
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-performance custom ROM with fluid animations, battery optimizations..."
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs min-h-[80px]"
              />
            </div>

            {/* Image Upload / URL Input */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-[#EBE4CF] dark:border-[#36342A]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  ROM Screenshot Image
                </Label>
                {uploadPreview && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Image Loaded
                  </span>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-[#FDE694] dark:border-[#FDE694]/40 bg-[#FDE694]/15 hover:bg-[#FDE694]/25 text-[#121212] dark:text-[#FDE694] text-xs font-bold cursor-pointer transition-colors">
                  {isCompressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{isCompressing ? 'Compressing Image...' : 'Upload Image File (Any Size)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isCompressing}
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#787567] dark:text-[#9C9888] block mb-1">
                  Or enter direct Image URL:
                </span>
                <Input
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setUploadPreview(e.target.value || null);
                  }}
                  placeholder="https://... or /screenshots/AxionOS.jpg"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>

              {uploadPreview && (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-[#EBE4CF] dark:border-[#36342A] mt-2">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x350/222/white?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Accent Theme Color */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Theme Color (Hex)
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-[#EBE4CF] dark:border-[#36342A] cursor-pointer bg-transparent"
                  />
                  <Input
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    placeholder="#3B82F6"
                    className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Quick Presets
                </Label>
                <div className="flex items-center gap-1.5">
                  {['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setThemeColor(col)}
                      className="w-6 h-6 rounded-full border border-white/30 transition-transform hover:scale-110 cursor-pointer shadow-xs"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
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
                <span>{editingSlide ? 'Update Slide' : 'Save to Showcase'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ShowcaseManager;
