'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Package, 
  ShieldAlert, 
  Smartphone, 
  Zap, 
  BookOpen, 
  Radio, 
  ExternalLink, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  Search, 
  Clock, 
  User, 
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  getReadNotificationIds, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  isNotificationRead,
  playNotificationChime,
  NotificationType
} from '@/lib/notifications';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: string;
  link?: string;
  resourceId?: string;
  imageUrl?: string;
  author?: string;
  createdAt?: any;
  priority?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; badgeBg: string; icon: any }> = {
  rom: {
    label: 'Custom ROM',
    color: 'text-amber-500 dark:text-[#FDE694]',
    badgeBg: 'bg-[#FDE694]/20 border-[#FDE694]/50 text-[#1C1B17] dark:text-[#FDE694]',
    icon: Package,
  },
  recovery: {
    label: 'Custom Recovery',
    color: 'text-orange-500',
    badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
    icon: ShieldAlert,
  },
  module: {
    label: 'Magisk Module',
    color: 'text-blue-500',
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
    icon: Smartphone,
  },
  apk: {
    label: 'Modded APK',
    color: 'text-red-500',
    badgeBg: 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400',
    icon: Zap,
  },
  guide: {
    label: 'Guide & Protocol',
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    icon: BookOpen,
  },
  root: {
    label: 'Root Package',
    color: 'text-purple-500',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
    icon: Zap,
  },
  announcement: {
    label: 'Announcement',
    color: 'text-yellow-500',
    badgeBg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
    icon: Radio,
  },
};

export function NotificationSection() {
  const db = useFirestore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  // Sync read status from localStorage
  useEffect(() => {
    setReadIds(getReadNotificationIds());
    const handler = () => setReadIds(getReadNotificationIds());
    window.addEventListener('notifications-read-updated', handler);
    return () => window.removeEventListener('notifications-read-updated', handler);
  }, []);

  // Real-time Firestore snapshot listener
  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: NotificationItem[] = [];
      let hasNewPublication = false;

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !isFirstLoad) {
          hasNewPublication = true;
        }
      });

      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as NotificationItem);
      });

      setNotifications(items);

      if (hasNewPublication && soundEnabled && !isFirstLoad) {
        playNotificationChime();
      }

      setIsFirstLoad(false);
    }, (error) => {
      console.error("Notifications listener error:", error);
    });

    return () => unsubscribe();
  }, [db, isFirstLoad, soundEnabled]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (item.title || '').toLowerCase().includes(q) ||
        (item.message || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.author || '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [notifications, selectedType, searchQuery]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readIds.includes(n.id)).length;
  }, [notifications, readIds]);

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    markAllNotificationsAsRead(allIds);
  };

  const handleItemClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <section id="notifications" className="py-24 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDE694]/30 dark:bg-[#FDE694]/15 border border-[#FDE694]/50 text-[#1C1B17] dark:text-[#FDE694] text-xs font-black uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-600 dark:text-[#FDE694]" />
            <span>LIVE DISPATCH REGISTRY</span>
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
            SYSTEM <span className="text-amber-600 dark:text-[#FDE694]">TRANSMISSIONS</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] max-w-2xl leading-relaxed">
            Real-time notifications whenever new Custom ROMs, kernel modules, recoveries, or system updates are published.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="rounded-full h-9 px-3.5 text-xs font-black uppercase tracking-wider border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FDE694] hover:text-[#121212] transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              <span>Mark all read</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-full h-9 px-3 text-xs text-[#787567] dark:text-[#BDB8A4] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#25241D]"
            title={soundEnabled ? "Disable notification chime" : "Enable notification chime"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-8 pb-6 border-b border-[#EBE4CF] dark:border-[#2C2A22]">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Feeds', count: notifications.length },
            { id: 'rom', label: 'ROMs', count: notifications.filter(n => n.type === 'rom').length },
            { id: 'recovery', label: 'Recoveries', count: notifications.filter(n => n.type === 'recovery').length },
            { id: 'module', label: 'Modules', count: notifications.filter(n => n.type === 'module').length },
            { id: 'apk', label: 'APKs', count: notifications.filter(n => n.type === 'apk').length },
            { id: 'guide', label: 'Guides', count: notifications.filter(n => n.type === 'guide').length },
          ].map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                  isActive
                    ? "bg-[#FDE694] text-[#121212] shadow-xs scale-102"
                    : "bg-[#EBE4CF]/50 dark:bg-[#201F18] text-[#787567] dark:text-[#BDB8A4] hover:bg-[#EBE4CF] dark:hover:bg-[#2A2922]"
                )}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    isActive ? "bg-black/20 text-[#121212]" : "bg-black/10 dark:bg-white/10"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter transmissions..."
            className="pl-9 h-10 rounded-full bg-[#FAF5E6] dark:bg-[#1A1914] border-[#EBE4CF] dark:border-[#2C2A22] text-xs font-medium focus-visible:ring-[#FDE694]"
          />
        </div>
      </div>

      {/* Notifications Feed Grid */}
      {filteredNotifications.length === 0 ? (
        <Card className="rounded-[2.5rem] bg-[#FAF5E6]/60 dark:bg-[#181712]/60 border border-dashed border-[#EBE4CF] dark:border-[#2C2A22] p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FDE694]/20 flex items-center justify-center mx-auto mb-4 text-[#1C1B17] dark:text-[#FDE694]">
            <Bell className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-lg font-black uppercase text-[#1C1B17] dark:text-[#F4EFE6] mb-1">
            No Transmissions in Buffer
          </h3>
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4] max-w-sm mx-auto">
            {searchQuery 
              ? "No notifications matched your search query. Try broadening your terms."
              : "Whenever new custom ROMs, recoveries, or modules are published by the maintainers, they will appear here in real-time."
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((item) => {
              const isRead = readIds.includes(item.id);
              const config = TYPE_CONFIG[item.type || 'rom'] || TYPE_CONFIG.announcement;
              const Icon = config.icon;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={cn(
                      "group relative rounded-[2rem] p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between h-full border hover:shadow-xl cursor-pointer",
                      "bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#1F1E18] dark:to-[#151410]",
                      isRead 
                        ? "border-[#EBE4CF] dark:border-[#2C2A22] opacity-85 hover:opacity-100" 
                        : "border-[#FDE694] dark:border-[#FDE694]/50 shadow-md ring-1 ring-[#FDE694]/30"
                    )}
                    onClick={() => handleItemClick(item)}
                  >
                    <div>
                      {/* Top Bar: Category Badge + Time + Unread indicator */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <Badge 
                          variant="outline" 
                          className={cn("text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border", config.badgeBg)}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          <span>{item.category || config.label}</span>
                        </Badge>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3 opacity-60" />
                            {formatTimestamp(item.createdAt)}
                          </span>

                          {!isRead && (
                            <span 
                              className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" 
                              title="Unread notification"
                            />
                          )}
                        </div>
                      </div>

                      {/* Optional Thumbnail or Image Preview */}
                      {item.imageUrl && (
                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 mb-3.5 border border-[#EBE4CF] dark:border-[#36342A]">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Notification Title */}
                      <h4 className="text-base font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6] mb-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-[#FDE694] transition-colors">
                        {item.title}
                      </h4>

                      {/* Notification Message */}
                      <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed line-clamp-3 mb-4">
                        {item.message}
                      </p>
                    </div>

                    {/* Footer: Publisher credit & Action Link */}
                    <div className="pt-3.5 border-t border-[#EBE4CF] dark:border-[#2C2A22] flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                        <User className="w-3 h-3 opacity-60" />
                        <span className="truncate max-w-[120px]">{item.author || 'Maintainer'}</span>
                      </div>

                      {item.link ? (
                        <Link
                          href={item.link}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-[#FDE694] hover:underline"
                        >
                          <span>Inspect Release</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Logged
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
