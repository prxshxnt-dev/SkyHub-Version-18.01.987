"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LogIn, 
  LogOut, 
  Crown, 
  Shield, 
  Code,
  Heart, 
  Copy, 
  Check, 
  Send, 
  MessageSquare,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Bell
} from 'lucide-react';
import { 
  AnimatedHome,
  AnimatedSmartphone,
  AnimatedLayers,
  AnimatedUsers,
  AnimatedMessageCircle,
  AnimatedSearch,
  AnimatedSunMoon,
  AnimatedMenuX
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useSearch } from '@/context/SearchContext';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_DONATION_CONFIG, SiteSettings } from '@/lib/store';
import { AuthModal } from '@/components/auth/auth-modal';
import { NotificationCenter } from './NotificationCenter';

const HUB_OWNERS = ['meinkxun@gmail.com', 'skyhubowner@gmail.com'];

export function Navbar() {
  const { user, auth, firestore: db } = useFirebase();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const userProfileRef = useMemoFirebase(() => 
    (user && db) ? doc(db, 'users', user.uid) : null
  , [db, user]);
  const { data: profile } = useDoc(userProfileRef);

  const settingsRef = useMemoFirebase(() => db ? doc(db, 'donation', 'settings') : null, [db]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);

  const globalSettingsRef = useMemoFirebase(() => db ? doc(db, 'settings', 'global') : null, [db]);
  const { data: globalSettings } = useDoc<SiteSettings>(globalSettingsRef);

  const upiId = settings?.upiId || DEFAULT_DONATION_CONFIG.upiId;
  const upiAmount = settings?.upiAmount || DEFAULT_DONATION_CONFIG.upiAmount;
  const qrUrl = settings?.qrImageUrl || DEFAULT_DONATION_CONFIG.qrImageUrl;
  const qrLink = globalSettings?.supportLinks?.qrLink || qrUrl;
  const brandName = globalSettings?.brandName || 'SKY';
  const logoUrl = settings?.logoUrl || DEFAULT_DONATION_CONFIG.logoUrl;
  const telegramChannel = globalSettings?.socialLinks?.telegramChannel || DEFAULT_DONATION_CONFIG.telegramChannelUrl;
  const telegramDiscussion = globalSettings?.socialLinks?.discussion || DEFAULT_DONATION_CONFIG.telegramDiscussionUrl;

  const isSuperAdmin = user?.email && HUB_OWNERS.includes(user.email.toLowerCase());
  const isAdminRole = profile?.role === 'admin';
  const isDeveloperRole = profile?.role === 'developer';

  useEffect(() => {
    const savedTheme = localStorage.getItem('skyhub-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    localStorage.setItem('skyhub-theme', nextTheme);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Session Terminated", description: "Logged out of Sky Hub." });
    } catch (error) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Logout failed." });
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

  const { searchQuery, setSearchQuery } = useSearch();

  // Keyboard shortcut listener for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: AnimatedHome },
    { name: 'Device', href: '/#device', icon: AnimatedSmartphone },
    { name: 'ROMs', href: '/#roms', icon: AnimatedLayers },
    { name: 'Feeds', href: '/#notifications', icon: Bell },
    { name: 'Team', href: '/#team', icon: AnimatedUsers },
    { name: 'Community', href: '/#community', icon: AnimatedMessageCircle },
    { name: 'Guides', href: '/guides', icon: BookOpen },
    { name: 'Wallpapers', href: '/wallpapers', icon: ImageIcon },
  ];

  const getWorkspaceInfo = () => {
    if (isSuperAdmin) return { label: 'Super Admin', icon: Crown, color: 'text-amber-800 dark:text-[#FDE694] bg-[#FDE694]/20 border border-[#FDE694]/40' };
    if (isAdminRole) return { label: 'Admin', icon: Shield, color: 'text-amber-700 dark:text-[#FDE694] bg-[#FDE694]/15 border border-[#FDE694]/30' };
    if (isDeveloperRole) return { label: 'Developer', icon: Code, color: 'text-blue-600 bg-blue-500/10 border border-blue-500/30' };
    return null;
  };

  const workspace = getWorkspaceInfo();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-3 sm:p-5 pointer-events-none transition-all duration-300">
        {/* Desktop Navbar */}
        <nav
          className={cn(
            "hidden md:flex items-center gap-1 px-3 py-2 rounded-full pointer-events-auto transition-all duration-300 shadow-md",
            scrolled
              ? "bg-[#FAF3DD]/90 dark:bg-[#181714]/90 backdrop-blur-xl border border-[#EBE4CF] dark:border-[#2C2A22] shadow-lg shadow-black/5 dark:shadow-black/25"
              : "bg-[#FAF3DD]/80 dark:bg-[#1F1E18]/80 backdrop-blur-md border border-[#EBE4CF]/80 dark:border-[#36342A]/80"
          )}
        >
          {/* Brand Logo */}
          <Link href="/" className="ml-2 mr-3 flex items-center gap-2 group cursor-pointer">
            {logoUrl ? (
              <img src={logoUrl} className="h-7 w-auto object-contain" alt="SKY" />
            ) : (
              <span className="font-black text-lg tracking-tighter text-[#1C1B17] dark:text-[#F4EFE6] flex items-center gap-1.5">
                SKY
                <span className="w-2 h-2 rounded-full bg-[#FDE694] group-hover:scale-125 transition-transform" />
              </span>
            )}
          </Link>

          <div className="w-px h-4 bg-[#EBE4CF] dark:bg-[#36342A] mx-1" />

          {/* Navigation Links */}
          <div className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-[#FDE694] text-[#121212] font-bold shadow-xs"
                      : "text-[#787567] dark:text-[#BDB8A4] hover:text-[#1C1B17] dark:hover:text-[#F4EFE6] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22]"
                  )}
                >
                  <Icon size={15} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="w-px h-4 bg-[#EBE4CF] dark:bg-[#36342A] mx-1" />

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-full bg-[#EBE4CF]/60 dark:bg-[#25241D] hover:bg-[#EBE4CF] dark:hover:bg-[#2F2E24] text-[#787567] dark:text-[#9C9888] text-xs transition-colors cursor-pointer border border-transparent hover:border-[#EBE4CF] dark:hover:border-[#36342A]"
          >
            <AnimatedSearch size={14} />
            <span className="hidden lg:inline text-[11px] font-medium">Search...</span>
            <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/30 text-[#49473E] dark:text-[#BDB8A4] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Center */}
          <NotificationCenter />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#787567] dark:text-[#BDB8A4] hover:text-[#1C1B17] dark:hover:text-[#F4EFE6] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22] transition-colors cursor-pointer"
          >
            <AnimatedSunMoon size={16} />
          </button>

          {/* Support / Donate Heart */}
          <button
            type="button"
            onClick={handleSupportClick}
            aria-label="Support SKY"
            className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>

          {/* Admin Workspace / Terminal Link */}
          {workspace ? (
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer",
                workspace.color
              )}
            >
              <workspace.icon className="w-3.5 h-3.5" />
              <span>{workspace.label}</span>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              title="Admin Terminal"
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-full text-xs font-bold text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22] transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          )}

          {/* Auth Button */}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#787567] dark:text-[#BDB8A4] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] hover:bg-[#fbdc70] transition-colors cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </nav>

        {/* Mobile Navbar Header */}
        <div
          className={cn(
            "md:hidden w-full flex items-center justify-between px-4 py-2.5 rounded-full pointer-events-auto transition-all duration-300",
            "bg-[#FAF3DD]/95 dark:bg-[#181714]/95 backdrop-blur-xl border border-[#EBE4CF] dark:border-[#2C2A22] shadow-md shadow-black/5"
          )}
        >
          <Link href="/" className="flex items-center gap-2 group">
            {logoUrl ? (
              <img src={logoUrl} className="h-7 w-auto object-contain" alt="SKY" />
            ) : (
              <span className="font-black text-lg tracking-tight text-[#1C1B17] dark:text-[#F4EFE6] flex items-center gap-1.5">
                SKY
                <span className="w-2 h-2 rounded-full bg-[#FDE694]" />
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1">
            <NotificationCenter />

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#787567] dark:text-[#BDB8A4] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22]"
            >
              <AnimatedSearch size={18} />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#787567] dark:text-[#BDB8A4] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22]"
            >
              <AnimatedSunMoon size={18} />
            </button>

            <button
              type="button"
              onClick={handleSupportClick}
              aria-label="Support Hub"
              className="w-9 h-9 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500/10"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#49473E] dark:text-[#F4EFE6] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22]"
            >
              <AnimatedMenuX size={20} isOpen={mobileMenuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 p-4 md:hidden"
          >
            <div className="bg-[#FAF3DD] dark:bg-[#181714] border border-[#EBE4CF] dark:border-[#2C2A22] rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF8E1] dark:bg-[#202024] border border-[#EBE4CF] dark:border-[#303035] text-xs font-bold text-[#49473E] dark:text-[#f3f3f6] hover:border-[#FDE694]"
                    >
                      <Icon size={16} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FDE694] text-[#121212] font-extrabold text-xs"
                >
                  <Shield className="w-4 h-4" />
                  <span>{workspace ? `${workspace.label} Dashboard` : 'Admin Terminal'}</span>
                </Link>

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 text-red-500 font-extrabold text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FDE694] text-[#121212] font-extrabold text-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Hub</span>
                  </button>
                )}

                <div className="flex gap-2 pt-2">
                  <a
                    href={telegramChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500/10 text-blue-500 text-[11px] font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                  <a
                    href={telegramDiscussion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500/10 text-green-500 text-[11px] font-bold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </a>
                </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Dialog Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#2C2A22] rounded-3xl p-6 max-w-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#1C1B17] dark:text-[#F4EFE6] flex items-center gap-2">
              <AnimatedSearch size={20} />
              <span>Search SKY Ecosystem</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search ROMs, modules, recoveries, guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchOpen(false);
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="w-full h-12 pl-4 pr-12 rounded-2xl bg-[#FFF8E1] dark:bg-[#202024] border border-[#EBE4CF] dark:border-[#303035] text-sm text-[#49473E] dark:text-[#f3f3f6] placeholder-[#989484] focus:outline-none focus:border-[#FDE694]"
              />
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                }}
                className="absolute right-2 top-2 h-8 px-3 rounded-xl bg-[#FDE694] text-[#121212] font-bold text-xs"
              >
                Go
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-[#787567] dark:text-[#8E8A7A] self-center">Quick Links:</span>
              <Link
                href="/#roms"
                onClick={() => setIsSearchOpen(false)}
                className="px-2.5 py-1 rounded-full bg-[#EBE4CF] dark:bg-[#25241D] text-[#49473E] dark:text-[#BDB8A4] hover:bg-[#FDE694] hover:text-[#121212]"
              >
                ROMs
              </Link>
              <Link
                href="/#device"
                onClick={() => setIsSearchOpen(false)}
                className="px-2.5 py-1 rounded-full bg-[#EBE4CF] dark:bg-[#25241D] text-[#49473E] dark:text-[#BDB8A4] hover:bg-[#FDE694] hover:text-[#121212]"
              >
                Device Specs
              </Link>
              <Link
                href="/#team"
                onClick={() => setIsSearchOpen(false)}
                className="px-2.5 py-1 rounded-full bg-[#EBE4CF] dark:bg-[#25241D] text-[#49473E] dark:text-[#BDB8A4] hover:bg-[#FDE694] hover:text-[#121212]"
              >
                Team
              </Link>
              <Link
                href="/guides"
                onClick={() => setIsSearchOpen(false)}
                className="px-2.5 py-1 rounded-full bg-[#EBE4CF] dark:bg-[#25241D] text-[#49473E] dark:text-[#BDB8A4] hover:bg-[#FDE694] hover:text-[#121212]"
              >
                Guides
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support / Donation Dialog */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#2C2A22] rounded-[2.5rem] p-8 max-w-sm flex flex-col items-center text-center gap-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-[#1C1B17] dark:text-[#F4EFE6] flex items-center justify-center gap-2">
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
                Direct UPI ID
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
              Donations directly fund Snapdragon 4 Gen 2 build servers, kernel testing, and high-bandwidth hosting.
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

      {/* Auth Modal for Email/Password & Google Sign In */}
      <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
}
