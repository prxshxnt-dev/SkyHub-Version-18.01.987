"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Sparkles, 
  Heart, 
  Copy, 
  Check, 
  Send, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { 
  AnimatedArrowRight, 
  AnimatedGithub, 
  AnimatedSmartphone, 
  AnimatedUsers, 
  AnimatedLayers, 
  AnimatedMessageCircle 
} from '@/components/icons';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { DEFAULT_DONATION_CONFIG, SiteSettings } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { motion } from 'motion/react';
import { TextLoop, ScrollReveal, SpecCountersSection } from '@/components/sky';

export function Hero() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'donation', 'settings'), [db]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);

  const globalSettingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: globalSettings } = useDoc<SiteSettings>(globalSettingsRef);

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const upiId = settings?.upiId || DEFAULT_DONATION_CONFIG.upiId;
  const upiAmount = settings?.upiAmount || DEFAULT_DONATION_CONFIG.upiAmount;
  const qrUrl = settings?.qrImageUrl || DEFAULT_DONATION_CONFIG.qrImageUrl;
  const telegramChannel = globalSettings?.socialLinks?.telegramChannel || DEFAULT_DONATION_CONFIG.telegramChannelUrl;
  const telegramDiscussion = globalSettings?.socialLinks?.discussion || DEFAULT_DONATION_CONFIG.telegramDiscussionUrl;
  const telegramLogo = settings?.telegramLogoUrl || DEFAULT_DONATION_CONFIG.telegramLogoUrl;
  const qrLink = globalSettings?.supportLinks?.qrLink || qrUrl;

  const rawHeroTitle = globalSettings?.heroTitle || 'SKY';
  const displayTitle = rawHeroTitle.includes("hemlo User's") || rawHeroTitle.includes("REDMI 12") ? 'SKY' : rawHeroTitle;

  const rawHeroSubtitle = globalSettings?.heroSubtitle;

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSupportClick = () => {
    if (!upiId) {
      toast({ title: "Configuration Error", description: "UPI ID has not been set by the admin." });
      return;
    }
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `upi://pay?pa=${upiId}${upiAmount ? `&am=${upiAmount}` : ''}&cu=INR`;
    } else {
      setIsSupportOpen(true);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({ title: "Registry Copied", description: "UPI ID added to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6">
      {/* Brand Hero Container */}
      <div className="max-w-5xl mx-auto z-10 w-full flex flex-col items-center">
        {/* Top Protocol Badge */}
        <ScrollReveal delayMs={0} distance={15}>
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#EBE4CF] dark:border-[#36342A] bg-[#FAF3DD]/80 dark:bg-[#1F1E18]/80 text-[#787567] dark:text-[#BDB8A4] text-xs font-bold tracking-wider mb-8 uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FDE694] animate-pulse" />
            <span>POCO M6 PRO 5G & REDMI 12 5G ECOSYSTEM</span>
          </div>
        </ScrollReveal>

        {/* Brand Name Headline */}
        <ScrollReveal delayMs={100} distance={20}>
          <h1 className="text-7xl xs:text-8xl sm:text-9xl md:text-[140px] font-black tracking-normal sm:tracking-[0.03em] md:tracking-[0.05em] text-[#1C1B17] dark:text-[#F4EFE6] leading-none mb-3 selection:bg-[#FDE694] transition-colors duration-300">
            {displayTitle}
          </h1>
        </ScrollReveal>

        {/* Primary Tagline */}
        <ScrollReveal delayMs={180} distance={16}>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#49473E] dark:text-[#E6E0D5] mb-4 transition-colors duration-300">
            Xiaomi Redmi 12 5G & POCO M6 Pro 5G Hub
          </p>
        </ScrollReveal>

        {/* Subtitle with dynamic animated TextLoop */}
        <ScrollReveal delayMs={240} distance={14}>
          <div className="text-sm sm:text-base text-[#787567] dark:text-[#BDB8A4] max-w-xl mx-auto leading-relaxed mb-8 font-normal transition-colors duration-300">
            {rawHeroSubtitle && !rawHeroSubtitle.includes("hemlo User's") ? (
              <p className="whitespace-pre-line">{rawHeroSubtitle}</p>
            ) : (
              <p>
                A community-driven custom ROM & kernel hub built to be{' '}
                <TextLoop
                  words={['faster.', 'cleaner.', 'more open.', 'customizable.', 'yours.']}
                  className="text-[#1C1B17] dark:text-[#FDE694] font-bold"
                />
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Hero Action Buttons */}
        <ScrollReveal delayMs={300} distance={12}>
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
            <button
              type="button"
              onClick={() => scrollTo('roms')}
              className="min-h-[46px] px-8 py-3 rounded-full text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#EBE4CF] dark:border-transparent shadow-sm group"
            >
              <span>Explore SKY</span>
              <AnimatedArrowRight size={16} className="text-[#121212] group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="https://github.com/sm4450-development"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] px-7 py-3 rounded-full text-xs font-bold text-[#49473E] dark:text-[#F4EFE6] bg-[#FAF3DD] dark:bg-[#202024] border border-[#EBE4CF] dark:border-[#303035] hover:bg-[#EBE4CF] dark:hover:bg-[#2B2B30] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs group"
            >
              <AnimatedGithub size={16} className="text-[#49473E] dark:text-[#FDE694]" />
              <span>GitHub</span>
            </a>

            <button
              type="button"
              onClick={handleSupportClick}
              className="min-h-[46px] px-6 py-3 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Support</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Telegram Channels with Lightning Shimmer */}
        <ScrollReveal delayMs={360} distance={12} className="w-full">
          <div className="w-full max-w-2xl mx-auto mb-16 p-2 rounded-full bg-[#FAF3DD]/80 dark:bg-[#1A1914]/80 border border-[#EBE4CF] dark:border-[#2C2A22] backdrop-blur-md flex flex-col sm:flex-row items-center gap-2.5 shadow-sm">
            <button
              type="button"
              onClick={() => window.open(telegramChannel, '_blank')}
              className="group relative h-12 flex-1 rounded-full bg-[#FFF8E1] dark:bg-[#202024] border border-[#EBE4CF] dark:border-[#303035] flex items-center justify-center gap-2.5 px-6 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider transition-all hover:border-blue-500/50 overflow-hidden w-full"
            >
              <motion.div
                animate={{ x: ['-150%', '150%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent skew-x-[35deg] pointer-events-none"
              />
              <div className="relative z-10 flex items-center gap-2">
                {telegramLogo ? (
                  <img src={telegramLogo} className="w-4 h-4 object-contain rounded-full" alt="TG" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Official Channel</span>
              </div>
              <Zap className="absolute right-4 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
            </button>

            <button
              type="button"
              onClick={() => window.open(telegramDiscussion, '_blank')}
              className="group relative h-12 flex-1 rounded-full bg-[#FFF8E1] dark:bg-[#202024] border border-[#EBE4CF] dark:border-[#303035] flex items-center justify-center gap-2.5 px-6 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wider transition-all hover:border-green-500/50 overflow-hidden w-full"
            >
              <motion.div
                animate={{ x: ['-150%', '150%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent skew-x-[35deg] pointer-events-none"
              />
              <div className="relative z-10 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Discussion Node</span>
              </div>
              <Sparkles className="absolute right-4 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-green-500" />
            </button>
          </div>
        </ScrollReveal>

        {/* Spec Counters Section: 5000mAh, 90Hz, 4nm, 50MP */}
        <div className="w-full max-w-5xl mx-auto mb-16 text-left">
          <SpecCountersSection />
        </div>

        {/* 4 Gateway Overview Cards */}
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <ScrollReveal distance={14}>
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#121212] bg-[#FDE694] px-3 py-1 rounded-full inline-block mb-2 shadow-2xs">
                Ecosystem Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
                Designed with purpose.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Card 1: The Device */}
            <ScrollReveal delayMs={50} distance={16} className="h-full">
              <div
                onClick={() => scrollTo('device')}
                className="group bg-[#FAF3DD] dark:bg-[#1F1E18] p-6 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FDE694] text-[#121212] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-2xs">
                    <AnimatedSmartphone size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#1C1B17] dark:text-[#F4EFE6] mb-2 flex items-center justify-between">
                    <span>The Device</span>
                    <ArrowRight className="w-4 h-4 text-[#787567] group-hover:translate-x-1 group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-all" />
                  </h3>
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                    6.79&quot; FHD+ 90Hz IPS LCD, Snapdragon 4 Gen 2 (4nm), 5000mAh battery, and 50MP sensor.
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-5 pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-between">
                  <span>View Full Specs</span>
                  <span>→</span>
                </span>
              </div>
            </ScrollReveal>

            {/* Card 2: The Team */}
            <ScrollReveal delayMs={100} distance={16} className="h-full">
              <div
                onClick={() => scrollTo('team')}
                className="group bg-[#FAF3DD] dark:bg-[#1F1E18] p-6 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FDE694] text-[#121212] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-2xs">
                    <AnimatedUsers size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#1C1B17] dark:text-[#F4EFE6] mb-2 flex items-center justify-between">
                    <span>The Team</span>
                    <ArrowRight className="w-4 h-4 text-[#787567] group-hover:translate-x-1 group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-all" />
                  </h3>
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                    Meet the admins, core developers, and maintainers driving the SKY smartphone software.
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-5 pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-between">
                  <span>Explore Maintainers</span>
                  <span>→</span>
                </span>
              </div>
            </ScrollReveal>

            {/* Card 3: AOSP ROMs */}
            <ScrollReveal delayMs={150} distance={16} className="h-full">
              <div
                onClick={() => scrollTo('roms')}
                className="group bg-[#FAF3DD] dark:bg-[#1F1E18] p-6 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FDE694] text-[#121212] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-2xs">
                    <AnimatedLayers size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#1C1B17] dark:text-[#F4EFE6] mb-2 flex items-center justify-between">
                    <span>AOSP ROMs</span>
                    <ArrowRight className="w-4 h-4 text-[#787567] group-hover:translate-x-1 group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-all" />
                  </h3>
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                    Browse official and community Android 16 & 17 custom builds, changelogs, and downloads.
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-5 pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-between">
                  <span>Explore Builds</span>
                  <span>→</span>
                </span>
              </div>
            </ScrollReveal>

            {/* Card 4: Community & About */}
            <ScrollReveal delayMs={200} distance={16} className="h-full">
              <div
                onClick={() => scrollTo('community')}
                className="group bg-[#FAF3DD] dark:bg-[#1F1E18] p-6 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FDE694] text-[#121212] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-2xs">
                    <AnimatedMessageCircle size={24} />
                  </div>
                  <h3 className="text-lg font-black text-[#1C1B17] dark:text-[#F4EFE6] mb-2 flex items-center justify-between">
                    <span>Community</span>
                    <ArrowRight className="w-4 h-4 text-[#787567] group-hover:translate-x-1 group-hover:text-[#121212] dark:group-hover:text-[#FDE694] transition-all" />
                  </h3>
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                    Join Telegram discussion groups, view GitHub repos, and participate in development.
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#FDE694] mt-5 pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-between">
                  <span>Join & Learn More</span>
                  <span>→</span>
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Support Dialog */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#2C2A22] rounded-[2.5rem] p-8 max-w-sm flex flex-col items-center text-center gap-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1C1B17] dark:text-[#F4EFE6] flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
              <span>Support SKY Hub</span>
            </DialogTitle>
          </DialogHeader>

          <div className="relative w-full aspect-square bg-white rounded-3xl p-4 border border-[#EBE4CF] overflow-hidden shadow-inner flex items-center justify-center">
            {qrLink ? (
              <img src={qrLink} alt="Payment QR" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground font-mono">No QR Configured</span>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#BDB8A4]">
                Registry UPI ID
              </span>
              <div className="bg-[#FFF8E1] dark:bg-[#202024] p-3 rounded-2xl flex items-center justify-between border border-[#EBE4CF] dark:border-[#303035]">
                <span className="text-xs font-mono text-[#1C1B17] dark:text-[#F4EFE6] truncate">
                  {upiId}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyUpiId}
                  className="h-8 w-8 rounded-xl shrink-0 ml-2 hover:bg-[#FDE694]/30"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-[#787567] dark:text-[#9C9888] leading-relaxed">
              Contributions fund Snapdragon 4 Gen 2 custom kernels, CI builds, and high-speed mirrors.
            </p>
          </div>

          <Button
            onClick={() => setIsSupportOpen(false)}
            className="w-full h-11 rounded-2xl bg-[#FDE694] hover:bg-[#fbdc70] text-[#121212] font-black text-xs uppercase tracking-wider shadow-none"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
