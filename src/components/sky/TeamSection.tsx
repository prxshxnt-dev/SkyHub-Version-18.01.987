'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TEAM_MEMBERS } from '@/lib/sky-data';
import { 
  Github, 
  Send, 
  Sparkles, 
  Terminal, 
  Wrench, 
  ShieldCheck, 
  FlaskConical, 
  History, 
  UserCheck, 
  Users, 
  RotateCcw,
  Pencil,
  Trash2,
  Plus,
  Upload,
  Loader2,
  Check,
  Settings2,
  ExternalLink,
  Briefcase,
  Globe,
  Code2,
  Layers,
  Cpu,
  Award,
  ChevronRight,
  BookmarkCheck,
  Compass,
  FolderGit2
} from 'lucide-react';
import { useFirestore, useCollection, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, orderBy, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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
  DialogDescription,
} from '@/components/ui/dialog';
import Link from 'next/link';

const TeamAvatar: React.FC<{ name: string; avatarUrl?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  name, 
  avatarUrl,
  size = 'md' 
}) => {
  const initials = (name || 'SK')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || name.slice(0, 2).toUpperCase();

  const sizeClasses = {
    sm: 'w-12 h-12 rounded-2xl text-base',
    md: 'w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-3xl text-lg sm:text-xl',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl text-2xl',
  }[size];

  return (
    <div className={`${sizeClasses} bg-gradient-to-br from-[#FFF8E1] to-[#FAF3DD] dark:from-[#151410] dark:to-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs overflow-hidden shrink-0 relative flex items-center justify-center`}>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextEl) nextEl.style.display = 'flex';
          }}
          className="w-full h-full object-cover"
        />
      )}
      <div 
        className="w-full h-full bg-[#FAF3DD] dark:bg-[#1F1E18] items-center justify-center font-extrabold text-[#49473E] dark:text-[#F4EFE6] select-none"
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        {initials}
      </div>
    </div>
  );
};

type FilterType = 'all' | 'developer' | 'maintainer' | 'community';

const RenderRoleBadges: React.FC<{ role?: string; type?: string }> = ({ role = '' }) => {
  const parts = (role || '').split('+').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border shadow-2xs bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-500/30 font-bold">
        <Sparkles className="w-3 h-3" />
        <span>Contributor</span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {parts.map((part, idx) => {
        let badgeStyle = 'bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-500/30';
        let icon = <Sparkles className="w-3 h-3" />;

        if (part.includes('Founder')) {
          badgeStyle = 'bg-amber-500/30 text-amber-950 dark:text-amber-200 border-amber-500/60 font-black tracking-wide';
          icon = <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
        } else if (part.includes('Owner')) {
          badgeStyle = 'bg-amber-500/25 text-amber-950 dark:text-amber-200 border-amber-500/50 font-extrabold';
          icon = <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
        } else if (part.includes('Core Developer')) {
          badgeStyle = 'bg-amber-500/20 text-amber-950 dark:text-amber-300 border-amber-500/40 font-extrabold';
          icon = <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
        } else if (part.includes('Developer')) {
          badgeStyle = 'bg-sky-500/20 text-sky-950 dark:text-sky-300 border-sky-500/40 font-bold';
          icon = <Terminal className="w-3 h-3 text-sky-600 dark:text-sky-400" />;
        } else if (part.includes('Maintainer') && !part.includes('Ex-')) {
          badgeStyle = 'bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border-emerald-500/40 font-bold';
          icon = <Wrench className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
        } else if (part.includes('Moderator')) {
          badgeStyle = 'bg-purple-500/20 text-purple-950 dark:text-purple-300 border-purple-500/40 font-bold';
          icon = <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />;
        } else if (part.includes('Tester')) {
          badgeStyle = 'bg-rose-500/20 text-rose-950 dark:text-rose-300 border-rose-500/40 font-bold';
          icon = <FlaskConical className="w-3 h-3 text-rose-600 dark:text-rose-400" />;
        } else if (part.includes('Coordinator')) {
          badgeStyle = 'bg-indigo-500/20 text-indigo-950 dark:text-indigo-300 border-indigo-500/40 font-bold';
          icon = <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />;
        } else if (part.includes('Ex-')) {
          badgeStyle = 'bg-zinc-500/20 text-zinc-800 dark:text-zinc-400 border-zinc-500/30 font-semibold';
          icon = <History className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />;
        }

        return (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border shadow-2xs ${badgeStyle}`}
          >
            {icon}
            <span>{part}</span>
          </span>
        );
      })}
    </div>
  );
};

interface PortfolioProject {
  title: string;
  description: string;
  tag: string;
  link?: string;
}

interface MemberPortfolioDetails {
  headline: string;
  focusArea: string;
  projects: PortfolioProject[];
  skills: string[];
  stats: { label: string; value: string }[];
}

/**
 * Returns tailored portfolio data for a given team member.
 * Supports preset custom portfolios for core developers & dynamic fallbacks.
 */
function getMemberPortfolioData(member: any): MemberPortfolioDetails {
  const handle = (member.handle || '').toLowerCase();
  const id = (member.id || '').toLowerCase();
  const name = (member.name || '').toLowerCase();

  // 1. Amit (Founder)
  if (id.includes('amit') || handle.includes('amitsharma') || name.includes('amit')) {
    return {
      headline: 'Founder & Lead Platform Architect',
      focusArea: 'Device Tree Architecture, AOSPA, and Ecosystem Bringup',
      projects: [
        {
          title: 'sm4450-sky Main Device Tree Source',
          description: 'Pioneered the open-source device tree architecture and established vendor blobs for Xiaomi Redmi 12 5G / POCO M6 Pro 5G.',
          tag: 'Core Tree'
        },
        {
          title: 'AOSPA (Paranoid Android) Adaptation',
          description: 'Spearheaded community crowdfunding initiatives and kernel bringup for the initial Paranoid Android builds on Qualcomm SM4450.',
          tag: 'Custom ROM'
        },
        {
          title: 'Ecosystem Foundation & Developer Coordination',
          description: 'Recruited maintainers, coordinated continuous integration, and unified recovery tree developments for the community.',
          tag: 'Leadership'
        }
      ],
      skills: ['Qualcomm SM4450', 'Device Tree Bringup', 'AOSP Architecture', 'Community Funding', 'Vendor Blobs', 'Git Workflow'],
      stats: [
        { label: 'Role', value: 'Founder & Architect' },
        { label: 'Platform', value: 'SKY (sm4450)' },
        { label: 'Focus', value: 'Hardware Bringup' }
      ]
    };
  }

  // 2. Sachit (someone3_124) - Web & Platform Builder
  if (id.includes('sachit') || handle.includes('someone3') || name.includes('sachit')) {
    return {
      headline: 'Platform Creator & Lead Full-Stack Interface Architect',
      focusArea: 'SKY Web Hub, Interactive ROM Showcases, Dynamic Wallpaper Engine & UX',
      projects: [
        {
          title: 'SKY Next.js Digital Platform & Ecosystem Hub',
          description: 'Architected and built the full web application with App Router, interactive device specifications, responsive typography, and dark mode.',
          tag: 'Web Platform',
          link: member.portfolioUrl || 'https://github.com/sachit1751-art'
        },
        {
          title: 'Axion AOSP & Screenshot Showcase Engine',
          description: 'Engineered real-time carousel, image compression pipelines, and super admin inline live editing capabilities.',
          tag: 'Interactive UI'
        },
        {
          title: 'Dynamic Wallpaper Gallery & OTA Guides',
          description: 'Developed downloadable multi-tier wallpaper gallery with instant search, category filters, and step-by-step flashing guides.',
          tag: 'UX / Motion'
        }
      ],
      skills: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Motion / Framer', 'Firebase Firestore', 'UI/UX Design', 'Performance Optimization'],
      stats: [
        { label: 'Role', value: 'Platform Architect' },
        { label: 'Stack', value: 'Next.js & React' },
        { label: 'Projects', value: 'SKY Web & Hub' }
      ]
    };
  }

  // 3. Tushar Bharti (lostark13)
  if (id.includes('lostark') || handle.includes('lostark13') || name.includes('tushar')) {
    return {
      headline: 'Core Kernel Architect & Lineage / BlissROM Maintainer',
      focusArea: 'Upstream Linux Kernel, CPU Frequency Governors, LineageOS & Bliss builds',
      projects: [
        {
          title: 'SM4450 OSS Kernel Source',
          description: 'Maintains open-source kernel with upstream stable Linux patches, memory management enhancements, and battery profiles.',
          tag: 'Kernel Architecture'
        },
        {
          title: 'Official LineageOS & BlissROM Ports',
          description: 'Continuous delivery of stable releases with official safety net pass, banking apps readiness, and hardware acceleration.',
          tag: 'Custom ROM'
        },
        {
          title: 'Audio, Display & Biometrics HAL Integration',
          description: 'Tuned low-latency audio HAL, 90Hz AdaptiveSync display drivers, and power-key fingerprint sensor drivers.',
          tag: 'Hardware HAL'
        }
      ],
      skills: ['Linux Kernel', 'Qualcomm SM4450', 'C/C++', 'LineageOS', 'BlissROM', 'Device Tree', 'Git'],
      stats: [
        { label: 'Role', value: 'Core Developer' },
        { label: 'Specialty', value: 'Kernel & DT' },
        { label: 'Status', value: 'Official Lead' }
      ]
    };
  }

  // 4. Sushmit (redducc)
  if (id.includes('redducc') || handle.includes('redducc') || name.includes('sushmit')) {
    return {
      headline: 'Core Developer & PenguinOS / AOSPA Maintainer',
      focusArea: 'Device Trees, Kernel Maintenance, and Performance Governors',
      projects: [
        {
          title: 'PenguinOS & Paranoid Android Maintainership',
          description: 'Primary builder and maintainer for daily-driver stability on Xiaomi Redmi 12 5G / POCO M6 Pro 5G.',
          tag: 'Custom ROM'
        },
        {
          title: 'Thermal & Power Profiling',
          description: 'Engineered custom thermal throttle limits to ensure zero lag under intense gaming and daily multitasking.',
          tag: 'Optimization'
        }
      ],
      skills: ['AOSP', 'PenguinOS', 'Device Tree', 'Thermal Profiles', 'C++'],
      stats: [
        { label: 'Role', value: 'Core Developer' },
        { label: 'Target', value: 'PenguinOS / AOSPA' },
        { label: 'Status', value: 'Active Maintainer' }
      ]
    };
  }

  // 5. Sarim Rasool (TopexGuy)
  if (id.includes('topex') || handle.includes('topex') || name.includes('sarim')) {
    return {
      headline: 'Kernel Engineer & Multi-ROM Maintainer',
      focusArea: 'MGLRU Memory Management, PixelOS, VoltageOS, and iode',
      projects: [
        {
          title: 'Multi-Gen LRU (MGLRU) Kernel Port',
          description: 'Implemented modern memory paging algorithms to minimize memory thrashing and improve app retention.',
          tag: 'Memory Subsystem'
        },
        {
          title: 'PixelOS & VoltageOS Releases',
          description: 'Delivered Pixel UI features, extreme customizability, and battery endurance tuning.',
          tag: 'Custom ROM'
        }
      ],
      skills: ['MGLRU', 'OSS Kernel', 'PixelOS', 'VoltageOS', 'Memory Tuning'],
      stats: [
        { label: 'Role', value: 'Developer & Maintainer' },
        { label: 'Focus', value: 'MGLRU & Kernel' },
        { label: 'Status', value: 'Official' }
      ]
    };
  }

  // 6. Arrowsploit
  if (id.includes('arrowsploit') || handle.includes('arrowsploit')) {
    return {
      headline: 'Official AxionAOSP Maintainer',
      focusArea: 'AxionAOSP Releases, OTA Pipeline, System Stability',
      projects: [
        {
          title: 'Official AxionAOSP for SKY',
          description: 'Clean, lightning-fast Android Open Source Project firmware optimized for Qualcomm SM4450 hardware.',
          tag: 'Axion AOSP'
        },
        {
          title: 'Automated OTA Delivery Pipeline',
          description: 'Engineered update validation and OTA delivery channels for seamless device updates.',
          tag: 'DevOps / OTA'
        }
      ],
      skills: ['AxionAOSP', 'AOSP Building', 'OTA Infrastructure', 'System Tuning'],
      stats: [
        { label: 'Role', value: 'Official Maintainer' },
        { label: 'Project', value: 'AxionAOSP' },
        { label: 'Status', value: 'Active' }
      ]
    };
  }

  // 7. Dhanush (solocaptainblaze)
  if (id.includes('solocaptain') || handle.includes('solocaptain') || name.includes('dhanush')) {
    return {
      headline: 'Official EverestOS Maintainer',
      focusArea: 'EverestOS, Custom Haptics, and Audio Tweaks',
      projects: [
        {
          title: 'EverestOS Official Builds',
          description: 'Fine-tuned EverestOS firmware featuring rich customization, smooth animations, and solid battery life.',
          tag: 'EverestOS'
        }
      ],
      skills: ['EverestOS', 'Device Porting', 'ROM Maintenance', 'Android HAL'],
      stats: [
        { label: 'Role', value: 'Maintainer' },
        { label: 'System', value: 'EverestOS' },
        { label: 'Status', value: 'Official' }
      ]
    };
  }

  // 8. Lua (@C8_XD)
  if (id.includes('lua') || handle.includes('c8_xd') || name.includes('lua')) {
    return {
      headline: 'Official LunarisAOSP Maintainer',
      focusArea: 'LunarisAOSP on Redmi 12 5G / POCO M6 Pro 5G',
      projects: [
        {
          title: 'LunarisAOSP Official SKY Releases',
          description: 'Maintains LunarisAOSP with high stability, fast gaming response, and custom Treble overlays.',
          tag: 'LunarisAOSP'
        }
      ],
      skills: ['LunarisAOSP', 'Device Tree', 'Kernel Tuning', 'Bug Triaging'],
      stats: [
        { label: 'Role', value: 'Maintainer' },
        { label: 'Project', value: 'LunarisAOSP' },
        { label: 'Status', value: 'Official' }
      ]
    };
  }

  // Generic Dynamic Fallback
  return {
    headline: member.role || 'SKY Contributor & Maintainer',
    focusArea: member.bio || 'Contributing to custom ROMs, device tree maintenance, testing, and community support.',
    projects: [
      {
        title: `${member.name} - ${member.role || 'Contributor'}`,
        description: member.bio || 'Active maintainer contributing to device compatibility, stability updates, and community support for SKY (SM4450).',
        tag: member.type ? member.type.toUpperCase() : 'COMMUNITY'
      },
      {
        title: 'Device Tree & Platform Support',
        description: 'Ongoing work ensuring compatibility and bug fixes for Xiaomi Redmi 12 5G & POCO M6 Pro 5G.',
        tag: 'Hardware'
      }
    ],
    skills: ['SM4450 (SKY)', 'Custom Firmware', 'Device Bringup', 'Android AOSP', 'Community QA'],
    stats: [
      { label: 'Role', value: member.role || 'Contributor' },
      { label: 'Handle', value: member.handle || 'Community' },
      { label: 'Ecosystem', value: 'SKY SM4450' }
    ]
  };
}

export const TeamSection: React.FC = () => {
  const db = useFirestore();
  const { user } = useUser();
  const isSuperAdmin = user?.email?.toLowerCase().trim() === 'meinkxun@gmail.com' || user?.email?.toLowerCase().trim() === 'skyhubowner@gmail.com';

  // Firestore queries for dynamic credits and header
  const creditsQuery = useMemoFirebase(
    () => (db ? query(collection(db, 'credits'), orderBy('order', 'asc')) : null),
    [db]
  );
  const { data: dbCredits, isLoading: isCreditsLoading } = useCollection(creditsQuery);

  const headerRef = useMemoFirebase(() => (db ? doc(db, 'settings', 'credits_header') : null), [db]);
  const { data: headerData } = useDoc<any>(headerRef);

  const sectionTitle = headerData?.title || 'CREDITS & MAINTAINERS';
  const sectionSubtitle = headerData?.subtitle || 'The developers, device maintainers, and contributors driving the SKY ecosystem.';

  const [filter, setFilter] = useState<FilterType>('all');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Portfolio Viewer Modal State
  const [selectedPortfolioMember, setSelectedPortfolioMember] = useState<any | null>(null);

  // Edit Member Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editRole, setEditRole] = useState('Maintainer');
  const [editType, setEditType] = useState<'developer' | 'maintainer' | 'community'>('maintainer');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editTelegramUrl, setEditTelegramUrl] = useState('');
  const [editPortfolioUrl, setEditPortfolioUrl] = useState('');
  const [editOrder, setEditOrder] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Edit Header Modal State
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [editHeaderTitle, setEditHeaderTitle] = useState(sectionTitle);
  const [editHeaderSubtitle, setEditHeaderSubtitle] = useState(sectionSubtitle);

  // Determine active members list
  const rawMembers = (dbCredits && dbCredits.length > 0)
    ? dbCredits
    : TEAM_MEMBERS;

  const humanMembers = rawMembers.filter((m: any) => {
    const handle = (m.handle || '').toLowerCase();
    const id = (m.id || '').toLowerCase();
    const name = (m.name || '').toLowerCase();
    const role = (m.role || '').toLowerCase();
    const isBot = handle.includes('bot') || id.includes('bot') || name.includes('bot') || role.includes('bot') || role === 'lady';
    return !isBot;
  });

  const filteredMembers = humanMembers.filter((m: any) => {
    const role = (m.role || '');
    if (filter === 'all') return true;
    if (filter === 'developer') {
      return m.type === 'core' || m.type === 'developer' || role.includes('Developer') || role.includes('Founder');
    }
    if (filter === 'maintainer') {
      return m.type === 'maintainer' || (role.includes('Maintainer') && !role.includes('Ex-'));
    }
    if (filter === 'community') {
      return (
        m.type === 'moderator' ||
        m.type === 'tester' ||
        m.type === 'community' ||
        m.type === 'ex' ||
        role.includes('Moderator') ||
        role.includes('Tester') ||
        role.includes('Ex-')
      );
    }
    return true;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  const openAddMemberDialog = () => {
    setEditingMember(null);
    setEditName('');
    setEditHandle('');
    setEditRole('Maintainer');
    setEditType('maintainer');
    setEditAvatarUrl('');
    setEditBio('');
    setEditGithubUrl('');
    setEditTelegramUrl('');
    setEditPortfolioUrl('');
    setEditOrder(humanMembers.length + 1);
    setIsEditModalOpen(true);
  };

  const openEditMemberDialog = (member: any) => {
    setEditingMember(member);
    setEditName(member.name || '');
    setEditHandle(member.handle || '');
    setEditRole(member.role || 'Maintainer');
    setEditType(member.type || 'maintainer');
    setEditAvatarUrl(member.avatarUrl || '');
    setEditBio(member.bio || '');
    setEditGithubUrl(member.githubUrl || '');
    setEditTelegramUrl(member.telegramUrl || '');
    setEditPortfolioUrl(member.portfolioUrl || member.websiteUrl || '');
    setEditOrder(member.order ?? 1);
    setIsEditModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file, 400, 400, 0.85);
      setEditAvatarUrl(compressed);
      toast({
        title: 'Avatar Processed',
        description: `${file.name} ready to save.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: err.message || 'Could not process avatar image.',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name Required',
        description: 'Please provide a name for this contributor.',
      });
      return;
    }

    setIsSaving(true);
    try {
      // If dbCredits is empty, seed everything first to prevent losing initial team members
      if (!dbCredits || dbCredits.length === 0) {
        let seedOrder = 1;
        for (const tm of TEAM_MEMBERS) {
          const sId = `team_${tm.id || seedOrder}`;
          await setDoc(doc(db, 'credits', sId), {
            id: sId,
            name: tm.name,
            handle: tm.handle || '',
            role: tm.role || 'Contributor',
            type: tm.type || 'maintainer',
            avatarUrl: tm.avatarUrl || '',
            bio: tm.bio || '',
            githubUrl: tm.githubUrl || '',
            telegramUrl: tm.telegramUrl || '',
            portfolioUrl: (tm as any).portfolioUrl || '',
            order: seedOrder++,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      }

      const memberId = editingMember?.id || `credit_${Date.now()}`;
      const memberRef = doc(db, 'credits', memberId);

      await setDoc(memberRef, {
        id: memberId,
        name: editName.trim(),
        handle: editHandle.trim(),
        role: editRole.trim() || 'Contributor',
        type: editType || 'maintainer',
        avatarUrl: editAvatarUrl.trim(),
        bio: editBio.trim(),
        githubUrl: editGithubUrl.trim(),
        telegramUrl: editTelegramUrl.trim(),
        portfolioUrl: editPortfolioUrl.trim(),
        order: Number(editOrder) || 1,
        updatedAt: serverTimestamp(),
        createdAt: editingMember?.createdAt || serverTimestamp(),
      }, { merge: true });

      toast({
        title: editingMember ? 'Member Updated' : 'Member Added to Credits',
        description: `"${editName}" has been successfully saved.`,
      });

      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Error saving credit member:', err);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Could not save member to Firestore.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (member: any) => {
    if (!db) return;
    if (!confirm(`Are you sure you want to delete "${member.name}" from the credits section?`)) return;

    try {
      // If dbCredits is empty, seed first so we only delete this one
      if (!dbCredits || dbCredits.length === 0) {
        let seedOrder = 1;
        for (const tm of TEAM_MEMBERS) {
          const sId = `team_${tm.id || seedOrder}`;
          if (tm.name === member.name || tm.handle === member.handle) continue; // skip deleted one
          await setDoc(doc(db, 'credits', sId), {
            id: sId,
            name: tm.name,
            handle: tm.handle || '',
            role: tm.role || 'Contributor',
            type: tm.type || 'maintainer',
            avatarUrl: tm.avatarUrl || '',
            bio: tm.bio || '',
            githubUrl: tm.githubUrl || '',
            telegramUrl: tm.telegramUrl || '',
            portfolioUrl: (tm as any).portfolioUrl || '',
            order: seedOrder++,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      } else {
        await deleteDoc(doc(db, 'credits', member.id));
      }

      toast({
        title: 'Member Removed',
        description: `"${member.name}" has been removed from credits.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: err.message,
      });
    }
  };

  const handleSeedAllToFirestore = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      let seedOrder = 1;
      for (const tm of TEAM_MEMBERS) {
        const sId = `team_${tm.id || seedOrder}`;
        await setDoc(doc(db, 'credits', sId), {
          id: sId,
          name: tm.name,
          handle: tm.handle || '',
          role: tm.role || 'Contributor',
          type: tm.type || 'maintainer',
          avatarUrl: tm.avatarUrl || '',
          bio: tm.bio || '',
          githubUrl: tm.githubUrl || '',
          telegramUrl: tm.telegramUrl || '',
          portfolioUrl: (tm as any).portfolioUrl || '',
          order: seedOrder++,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      toast({
        title: 'Team Synced to Firestore',
        description: `${TEAM_MEMBERS.length} members loaded into the credits database.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: err.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'credits_header'), {
        title: editHeaderTitle.trim() || 'CREDITS & MAINTAINERS',
        subtitle: editHeaderSubtitle.trim() || 'The developers, device maintainers, and contributors driving the SKY ecosystem.',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: 'Section Header Updated',
        description: 'New title & tagline saved.',
      });
      setIsHeaderModalOpen(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const categories: { id: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      label: 'All Members',
      icon: <UserCheck className="w-4 h-4" />,
      count: humanMembers.length,
    },
    {
      id: 'developer',
      label: 'Developers',
      icon: <Terminal className="w-4 h-4" />,
      count: humanMembers.filter((m: any) => m.type === 'core' || m.type === 'developer' || (m.role || '').includes('Developer') || (m.role || '').includes('Founder')).length,
    },
    {
      id: 'maintainer',
      label: 'Maintainers',
      icon: <Wrench className="w-4 h-4" />,
      count: humanMembers.filter((m: any) => m.type === 'maintainer' || ((m.role || '').includes('Maintainer') && !(m.role || '').includes('Ex-'))).length,
    },
    {
      id: 'community',
      label: 'Community & QA',
      icon: <ShieldCheck className="w-4 h-4" />,
      count: humanMembers.filter(
        (m: any) =>
          m.type === 'moderator' ||
          m.type === 'tester' ||
          m.type === 'community' ||
          m.type === 'ex' ||
          (m.role || '').includes('Moderator') ||
          (m.role || '').includes('Tester') ||
          (m.role || '').includes('Ex-')
      ).length,
    },
  ];

  const activePortfolioDetails = selectedPortfolioMember 
    ? getMemberPortfolioData(selectedPortfolioMember)
    : null;

  return (
    <section ref={sectionRef} className="py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4 border-b border-[#EBE4CF] dark:border-[#36342A]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FDE694]/40 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/50">
            <Users className="w-3.5 h-3.5" />
            <span>COMMUNITY ACKNOWLEDGEMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
            {sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] max-w-2xl leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Super Admin Top Actions */}
        {isSuperAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={openAddMemberDialog}
              className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditHeaderTitle(sectionTitle);
                setEditHeaderSubtitle(sectionSubtitle);
                setIsHeaderModalOpen(true);
              }}
              className="rounded-2xl text-xs font-bold border-[#EBE4CF] dark:border-[#36342A] gap-1.5 cursor-pointer bg-[#FAF3DD] dark:bg-[#1A1914]"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Edit Header</span>
            </Button>

            {(!dbCredits || dbCredits.length === 0) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSeedAllToFirestore}
                disabled={isSeeding}
                className="rounded-2xl text-xs font-bold border-amber-500/40 text-amber-900 dark:text-amber-300 gap-1.5 cursor-pointer"
              >
                {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Sync Team to Firestore</span>
              </Button>
            )}

            <Link
              href="/dashboard?tab=credits"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] text-[#1C1B17] dark:text-[#F4EFE6] hover:bg-[#FDE694]/20 transition-colors"
            >
              <span>Full Manager</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Role Category Toggles */}
      <div className="flex justify-start md:justify-center items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center justify-center min-h-[44px] gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] shrink-0 ${
              filter === cat.id
                ? 'bg-[#FDE694] text-[#121212] border-[#EBE4CF] dark:border-transparent shadow-xs scale-102 font-extrabold'
                : 'bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] hover:border-[#FDE694] border-[#EBE4CF] dark:border-[#2C2A22]'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
            <span
              className={`ml-0.5 px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-extrabold ${
                filter === cat.id
                  ? 'bg-[#121212]/10 text-[#121212]'
                  : 'bg-[#EBE4CF] dark:bg-[#2B2921] text-[#49473E] dark:text-[#BDB8A4]'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Members Grid Container */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 sm:py-20 px-6 bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] shadow-xs flex flex-col items-center justify-center space-y-5">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#FDE694]/20 rounded-full blur-xl transform scale-125" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#FFF8E1] to-[#FAF0CF] dark:from-[#1C1A14] dark:to-[#151410] border border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-center text-[#121212] dark:text-[#FDE694] shadow-sm relative z-10">
              <Users size={40} className="stroke-[1.5]" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight">
              No Members Found
            </h3>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
              We couldn&apos;t find any team members or maintainers matching the selected filter. Try resetting your filter to view the entire core team.
            </p>
          </div>

          <button
            onClick={() => setFilter('all')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Show All Team Members</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
          {filteredMembers.map((member: any) => (
            <div
              key={member.id || member.handle || member.name}
              style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 250px' }}
              className="bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] rounded-3xl p-5 sm:p-6 border border-[#EBE4CF] dark:border-[#2C2A22] hover:border-[#FDE694]/60 dark:hover:border-[#FDE694]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out flex flex-col justify-between group"
            >
              <div>
                <div className="flex gap-4 items-start">
                  <TeamAvatar name={member.name} avatarUrl={member.avatarUrl} />
                  <div className="flex flex-col flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] break-words line-clamp-1">
                        {member.name}
                      </h3>

                      {/* Super Admin Quick Actions on Card */}
                      {isSuperAdmin && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openEditMemberDialog(member)}
                            className="p-1.5 rounded-lg bg-[#FAF3DD] dark:bg-[#201F1A] hover:bg-[#FDE694] text-[#121212] dark:text-[#F4EFE6] hover:text-[#121212] border border-[#EBE4CF] dark:border-[#36342A] transition-colors cursor-pointer"
                            title="Edit Member Content"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <RenderRoleBadges role={member.role} type={member.type} />
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#787567] dark:text-[#BDB8A4] mt-1 truncate">
                      {member.handle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#EBE4CF]/60 dark:border-[#36342A]/60 text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                  {member.bio || 'Core contributor to the SKY smartphone project.'}
                </div>
              </div>

              {/* Card Footer & Links - With prominent Option to View Portfolio */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#EBE4CF]/40 dark:border-[#36342A]/40">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Option to View Portfolio */}
                  <button
                    type="button"
                    onClick={() => setSelectedPortfolioMember(member)}
                    className="inline-flex items-center justify-center min-h-[40px] gap-2 px-3.5 py-1.5 rounded-xl bg-[#FDE694]/25 hover:bg-[#FDE694] text-xs font-bold text-[#1C1B17] dark:text-[#FDE694] hover:text-[#121212] border border-[#FDE694]/50 dark:border-[#FDE694]/30 shadow-2xs transition-all duration-200 active:scale-95 cursor-pointer group/pf"
                    title={`View ${member.name}'s Portfolio & Contributions`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300 group-hover/pf:text-[#121212] group-hover/pf:scale-110 transition-transform" />
                    <span>View Portfolio</span>
                  </button>

                  {/* Direct Portfolio Website Link (if configured) */}
                  {(member.portfolioUrl || member.websiteUrl) && (
                    <a
                      href={member.portfolioUrl || member.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-[40px] gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8E1] dark:bg-[#1C1A14] text-xs font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#FDE694]/30 border border-[#EBE4CF] dark:border-[#2C2A22] transition-colors active:scale-95"
                      title="Visit Portfolio Website"
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="hidden sm:inline">Portfolio Site</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {member.githubUrl && (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-[40px] gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF8E1] dark:bg-[#1C1A14] text-xs font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#FDE694]/30 border border-[#EBE4CF] dark:border-[#2C2A22] transition-colors active:scale-95"
                      title="GitHub Profile"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {member.telegramUrl && (
                    <a
                      href={member.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-[40px] gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF8E1] dark:bg-[#1C1A14] text-xs font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#FDE694]/30 border border-[#EBE4CF] dark:border-[#2C2A22] transition-colors active:scale-95"
                      title="Telegram Contact"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                  )}
                </div>

                {/* Direct edit button for mobile/touch */}
                {isSuperAdmin && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditMemberDialog(member)}
                      className="text-xs font-bold gap-1 rounded-xl h-8 text-[#787567] hover:text-[#121212] dark:hover:text-[#FDE694]"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Content</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member)}
                      className="text-xs font-bold gap-1 rounded-xl h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Portfolio Showcase Modal */}
      <Dialog 
        open={!!selectedPortfolioMember} 
        onOpenChange={(open) => !open && setSelectedPortfolioMember(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] border border-[#EBE4CF] dark:border-[#36342A] p-6 sm:p-8 shadow-2xl">
          {selectedPortfolioMember && activePortfolioDetails && (
            <div className="space-y-6">
              <DialogHeader className="space-y-3">
                <div className="flex items-start gap-4">
                  <TeamAvatar 
                    name={selectedPortfolioMember.name} 
                    avatarUrl={selectedPortfolioMember.avatarUrl} 
                    size="lg" 
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-xl sm:text-2xl font-black text-[#1C1B17] dark:text-[#F4EFE6] tracking-tight">
                        {selectedPortfolioMember.name}
                      </DialogTitle>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FDE694]/40 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/50">
                        <Award className="w-3 h-3" />
                        <span>Verified Contributor</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#787567] dark:text-[#BDB8A4]">
                      {selectedPortfolioMember.handle} • {activePortfolioDetails.headline}
                    </p>

                    <div className="pt-1">
                      <RenderRoleBadges 
                        role={selectedPortfolioMember.role} 
                        type={selectedPortfolioMember.type} 
                      />
                    </div>
                  </div>
                </div>

                <DialogDescription className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed pt-2">
                  {selectedPortfolioMember.bio || activePortfolioDetails.focusArea}
                </DialogDescription>
              </DialogHeader>

              {/* External Portfolio Banner (if configured) */}
              {(selectedPortfolioMember.portfolioUrl || selectedPortfolioMember.websiteUrl) ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF8E1] to-[#FAF3DD] dark:from-[#211F17] dark:to-[#1A1914] border border-[#FDE694]/60 dark:border-[#FDE694]/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Live Portfolio & Showcase</span>
                    </div>
                    <p className="text-xs text-[#787567] dark:text-[#BDB8A4] truncate max-w-md">
                      {selectedPortfolioMember.portfolioUrl || selectedPortfolioMember.websiteUrl}
                    </p>
                  </div>

                  <a
                    href={selectedPortfolioMember.portfolioUrl || selectedPortfolioMember.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] text-xs font-black uppercase tracking-wider shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0"
                  >
                    <span>Visit Live Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#EBE4CF] dark:border-[#2C2A22] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#787567] dark:text-[#BDB8A4]">
                    <Briefcase className="w-4 h-4 text-[#FDE694]" />
                    <span>Official SKY Ecosystem Profile & Contributions Portfolio</span>
                  </div>
                  {isSuperAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const m = selectedPortfolioMember;
                        setSelectedPortfolioMember(null);
                        openEditMemberDialog(m);
                      }}
                      className="text-xs font-bold text-amber-800 dark:text-amber-300 gap-1 h-7 rounded-lg"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add External Link</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Stats overview pills */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {activePortfolioDetails.stats.map((st, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-black/40 border border-[#EBE4CF] dark:border-[#36342A] text-center space-y-0.5"
                  >
                    <span className="text-[10px] uppercase font-bold text-[#787567] dark:text-[#8E8A7A] block">
                      {st.label}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#1C1B17] dark:text-[#F4EFE6] block truncate">
                      {st.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Key Contributions & Projects */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1C1B17] dark:text-[#F4EFE6]">
                    Key Works & Contributions
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {activePortfolioDetails.projects.map((proj, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-2xl bg-white/80 dark:bg-black/30 border border-[#EBE4CF] dark:border-[#36342A] space-y-1.5 hover:border-[#FDE694]/60 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs sm:text-sm font-bold text-[#1C1B17] dark:text-[#F4EFE6]">
                          {proj.title}
                        </h5>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                          {proj.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                        {proj.description}
                      </p>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline pt-0.5"
                        >
                          <span>Explore Project</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Skills & Specializations */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1C1B17] dark:text-[#F4EFE6]">
                    Specializations & Competencies
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activePortfolioDetails.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#FFF8E1] dark:bg-[#1C1A14] text-[#49473E] dark:text-[#D5D0BE] border border-[#EBE4CF] dark:border-[#2C2A22]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer & Direct Contact Actions */}
              <div className="pt-4 border-t border-[#EBE4CF] dark:border-[#36342A] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(selectedPortfolioMember.portfolioUrl || selectedPortfolioMember.websiteUrl) && (
                    <a
                      href={selectedPortfolioMember.portfolioUrl || selectedPortfolioMember.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] transition-colors shadow-2xs"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Portfolio Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {selectedPortfolioMember.githubUrl && (
                    <a
                      href={selectedPortfolioMember.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF8E1] dark:bg-[#1C1A14] text-[#49473E] dark:text-[#F4EFE6] hover:bg-[#FDE694]/30 border border-[#EBE4CF] dark:border-[#2C2A22] transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Profile</span>
                    </a>
                  )}

                  {selectedPortfolioMember.telegramUrl && (
                    <a
                      href={selectedPortfolioMember.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF8E1] dark:bg-[#1C1A14] text-[#49473E] dark:text-[#F4EFE6] hover:bg-[#FDE694]/30 border border-[#EBE4CF] dark:border-[#2C2A22] transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                  )}
                </div>

                {isSuperAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const m = selectedPortfolioMember;
                      setSelectedPortfolioMember(null);
                      openEditMemberDialog(m);
                    }}
                    className="text-xs font-bold gap-1.5 rounded-xl border-[#EBE4CF] dark:border-[#36342A]"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Portfolio Details</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Header Modal */}
      <Dialog open={isHeaderModalOpen} onOpenChange={setIsHeaderModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
              Edit Credit Section Header
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveHeader} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Section Title
              </Label>
              <Input
                value={editHeaderTitle}
                onChange={(e) => setEditHeaderTitle(e.target.value)}
                placeholder="CREDITS & MAINTAINERS"
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-black uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Section Subtitle / Tagline
              </Label>
              <Textarea
                value={editHeaderSubtitle}
                onChange={(e) => setEditHeaderSubtitle(e.target.value)}
                placeholder="The developers, device maintainers, and contributors driving the SKY ecosystem."
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs min-h-[80px]"
              />
            </div>

            <div className="pt-4 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsHeaderModalOpen(false)}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 cursor-pointer shadow-xs"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Header</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit / Add Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
              {editingMember ? `Edit Member: ${editingMember.name}` : 'Add New Credit Member'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveMember} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Full Name *
                </Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Amit, Tushar, Dhanush..."
                  required
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Telegram / Handle
                </Label>
                <Input
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  placeholder="@username"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Role Title (e.g. Core Developer + Maintainer)
                </Label>
                <Input
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="Core Developer + Maintainer"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Category Filter
                </Label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/40 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium text-[#1C1B17] dark:text-[#F4EFE6] focus:outline-none"
                >
                  <option value="developer">Developer</option>
                  <option value="maintainer">Maintainer</option>
                  <option value="community">Community / QA</option>
                </select>
              </div>
            </div>

            {/* Avatar upload / link */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-[#EBE4CF] dark:border-[#36342A]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Avatar Image
                </Label>
                {editAvatarUrl && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Avatar Ready
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#FDE694] dark:border-[#FDE694]/40 bg-[#FDE694]/15 hover:bg-[#FDE694]/25 text-[#121212] dark:text-[#FDE694] text-xs font-bold cursor-pointer transition-colors">
                  {isCompressing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isCompressing ? 'Compressing...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isCompressing}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#787567] dark:text-[#9C9888] block mb-1">
                  Or enter direct URL:
                </span>
                <Input
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://... or /admins/username/pfp.jpg"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>

              {editAvatarUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#EBE4CF] dark:border-[#36342A] bg-black/40">
                    <img
                      src={editAvatarUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100/222/white?text=Avatar';
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#787567] dark:text-[#BDB8A4]">
                    Avatar preview confirmed
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Bio / Contribution Details
              </Label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Core developer maintaining DT/kernel work, custom builds, and device trees..."
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs min-h-[70px]"
              />
            </div>

            {/* Portfolio / Website Link Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Portfolio / Personal Website URL</span>
                </Label>
                <span className="text-[10px] text-[#787567] dark:text-[#8E8A7A]">Optional</span>
              </div>
              <Input
                type="url"
                value={editPortfolioUrl}
                onChange={(e) => setEditPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev or https://github.com/username"
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
              />
              <span className="text-[10px] text-[#787567] dark:text-[#8E8A7A] block">
                Link to their personal portfolio, resume, or project showcase website.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  GitHub Profile Link
                </Label>
                <Input
                  value={editGithubUrl}
                  onChange={(e) => setEditGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Telegram Link
                </Label>
                <Input
                  value={editTelegramUrl}
                  onChange={(e) => setEditTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Display Order Number
              </Label>
              <Input
                type="number"
                value={editOrder}
                onChange={(e) => setEditOrder(Number(e.target.value))}
                min={1}
                max={999}
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
              />
            </div>

            <div className="pt-4 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-end gap-2">
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
                <span>{editingMember ? 'Update Member' : 'Add to Credits'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TeamSection;
