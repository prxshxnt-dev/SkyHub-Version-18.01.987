"use client";

import React from 'react';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { DEFAULT_DONATION_CONFIG, SiteSettings } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Unlock, 
  Code, 
  Github, 
  Send, 
  MessageSquare, 
  Heart, 
  ArrowUpRight,
  Shield
} from 'lucide-react';

export function Footer() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, 'donation', 'settings'), [db]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);

  const globalSettingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: globalSettings } = useDoc<SiteSettings>(globalSettingsRef);

  const activeConfig = settings || DEFAULT_DONATION_CONFIG;
  const telegramChannel = globalSettings?.socialLinks?.telegramChannel || DEFAULT_DONATION_CONFIG.telegramChannelUrl;
  const telegramDiscussion = globalSettings?.socialLinks?.discussion || DEFAULT_DONATION_CONFIG.telegramDiscussionUrl;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FFF8E1] dark:bg-[#12110D] border-t border-[#EBE4CF] dark:border-[#2C2A22] pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Main Footer Columns */}
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          {/* Brand & Manifesto Column */}
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
                SKY
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FDE694]" />
              <span className="ml-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#787567] dark:text-[#9C9888] bg-white/50 dark:bg-black/20">
                OPEN SOURCE
              </span>
            </div>

            <p className="font-bold text-lg text-[#1C1B17] dark:text-[#F4EFE6]">
              POCO M6 Pro 5G & Redmi 12 5G Ecosystem
            </p>

            <p className="text-sm text-[#787567] dark:text-[#9C9888] leading-relaxed">
              Official custom ROMs, kernels, recoveries, and firmware hub for Xiaomi Redmi 12 5G and POCO M6 Pro 5G (sky / sm4450).
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#49473E] dark:text-[#A8A8A8] bg-[#FAF3DD] dark:bg-[#1A1914]">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                Zero Telemetry
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#49473E] dark:text-[#A8A8A8] bg-[#FAF3DD] dark:bg-[#1A1914]">
                <Unlock className="w-3.5 h-3.5 text-[#FDE694]" />
                Unlocked Bootloader
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#EBE4CF] dark:border-[#36342A] rounded-full text-[#49473E] dark:text-[#A8A8A8] bg-[#FAF3DD] dark:bg-[#1A1914]">
                <Code className="w-3.5 h-3.5 text-blue-500" />
                GPLv2 & Apache 2.0
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-bold tracking-widest text-[#49473E] dark:text-[#A8A8A8] mb-4 uppercase">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-sm text-[#787567] dark:text-[#BDB8A4]">
                <li>
                  <Link href="/#roms" className="hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors">
                    Custom ROMs
                  </Link>
                </li>
                <li>
                  <Link href="/#device" className="hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors">
                    Device Specs
                  </Link>
                </li>
                <li>
                  <Link href="/#team" className="hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors">
                    Maintainers
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors">
                    Guides & Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="/wallpapers" className="hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors">
                    Wallpapers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-widest text-[#49473E] dark:text-[#A8A8A8] mb-4 uppercase">
                Community
              </h4>
              <ul className="space-y-2.5 text-sm text-[#787567] dark:text-[#BDB8A4]">
                <li>
                  <a
                    href={telegramChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram Updates</span>
                  </a>
                </li>
                <li>
                  <a
                    href={telegramDiscussion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discussion Group</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/sm4450-development"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#121212] dark:hover:text-[#FDE694] transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub Organization</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-widest text-[#49473E] dark:text-[#A8A8A8] mb-4 uppercase">
                Hardware
              </h4>
              <ul className="space-y-2 text-xs text-[#787567] dark:text-[#BDB8A4] font-mono">
                <li>Xiaomi Redmi 12 5G</li>
                <li>POCO M6 Pro 5G</li>
                <li>Snapdragon 4 Gen 2</li>
                <li>Qualcomm SM4450</li>
                <li>Codename: sky</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lead Architect / Maintainer Showcase Card (Preserving Admin Data) */}
        {activeConfig.adminName && (
          <div className="bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#2C2A22] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <Avatar className="w-20 h-20 rounded-2xl border-2 border-[#EBE4CF] dark:border-[#36342A]">
              <AvatarImage src={activeConfig.adminAvatarUrl} className="object-cover" />
              <AvatarFallback className="bg-[#FDE694] text-[#121212] font-black text-xl">
                {activeConfig.adminName[0] || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#787567] dark:text-[#9C9888]">
                  Lead Architect
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FDE694]" />
                <h3 className="text-lg font-black text-[#1C1B17] dark:text-[#F4EFE6]">
                  {activeConfig.adminName}
                </h3>
              </div>
              <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed max-w-2xl">
                {activeConfig.adminBio || 'Guiding device tree development, kernel performance, and verified builds.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212]">
                <Heart className="w-3.5 h-3.5 fill-current text-rose-600" />
                Verified
              </span>
            </div>
          </div>
        )}

        {/* Operational Status & Bottom Bar */}
        <div className="pt-8 border-t border-[#EBE4CF] dark:border-[#2C2A22] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#787567] dark:text-[#8E8A7A]">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-semibold text-[#49473E] dark:text-[#C5C0AF]">
              All Build Nodes Operational
            </span>
          </div>

          <div className="flex items-center gap-6">
            <p>© {new Date().getFullYear()} SKY Ecosystem. Open-source development.</p>
            <button
              type="button"
              onClick={scrollToTop}
              className="text-[#49473E] dark:text-[#FDE694] font-bold hover:underline"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
