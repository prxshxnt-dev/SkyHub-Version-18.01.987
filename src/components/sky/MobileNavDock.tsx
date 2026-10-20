'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  AnimatedHome,
  AnimatedSmartphone,
  AnimatedLayers,
  AnimatedUsers,
  AnimatedSearch,
} from '@/components/icons';
import { usePerformanceTier } from '@/context/PerformanceContext';
import { Crown, Shield } from 'lucide-react';

interface MobileNavDockProps {
  onOpenSearch?: () => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

export const MobileNavDock: React.FC<MobileNavDockProps> = ({
  onOpenSearch,
  isAdmin,
  isSuperAdmin,
}) => {
  const pathname = usePathname();
  const { tier } = usePerformanceTier();
  const dockBgClass =
    'bg-gradient-to-t from-[#FAF3DD] to-[#F4ECDC] dark:from-[#181712] dark:to-[#151410] shadow-lg shadow-black/5 dark:shadow-black/20';

  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', href: '/', icon: AnimatedHome },
    { id: 'device', label: 'Device', href: '/#device', icon: AnimatedSmartphone },
    { id: 'roms', label: 'ROMs', href: '/#roms', icon: AnimatedLayers },
    { id: 'team', label: 'Team', href: '/#team', icon: AnimatedUsers },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 md:hidden pointer-events-none"
        >
          <div
            className={dockBgClass + " pointer-events-auto flex items-center justify-between gap-1 px-3 py-2 rounded-full border border-[#EBE4CF] dark:border-[#2C2A22] backdrop-blur-xl max-w-sm w-full mx-auto"}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveTab(item.id)}
                  className="relative flex-1 flex flex-col items-center justify-center py-1 text-center group"
                >
                  <div
                    className={"p-1.5 rounded-full transition-colors " + (
                      isActive
                        ? "text-[#121212] dark:text-[#FDE694] bg-[#FDE694]/30"
                        : "text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]"
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={"text-[9px] font-bold tracking-tight mt-0.5 " + (
                      isActive
                        ? "text-[#121212] dark:text-[#FDE694]"
                        : "text-[#787567] dark:text-[#8E8A7A]"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={onOpenSearch || (() => (window.location.href = '/search'))}
              className="relative flex-1 flex flex-col items-center justify-center py-1 text-center group text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]"
            >
              <div className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <AnimatedSearch size={20} />
              </div>
              <span className="text-[9px] font-bold tracking-tight mt-0.5 text-[#787567] dark:text-[#8E8A7A]">
                Search
              </span>
            </button>

            {(isAdmin || isSuperAdmin) && (
              <Link
                href="/dashboard"
                className="relative flex flex-col items-center justify-center py-1 px-1.5 text-center"
              >
                <div className="p-1.5 rounded-full bg-red-500/20 text-red-500">
                  {isSuperAdmin ? <Crown size={18} /> : <Shield size={18} />}
                </div>
                <span className="text-[9px] font-black uppercase text-red-500 tracking-tighter mt-0.5">
                  Admin
                </span>
              </Link>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
