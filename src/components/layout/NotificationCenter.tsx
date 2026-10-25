'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Bell, CheckCheck, Clock, ExternalLink, Package, ShieldAlert, Smartphone, Zap, BookOpen, Radio, Sparkles } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  getReadNotificationIds, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
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
  imageUrl?: string;
  author?: string;
  createdAt?: any;
}

const TYPE_ICONS: Record<string, any> = {
  rom: Package,
  recovery: ShieldAlert,
  module: Smartphone,
  apk: Zap,
  guide: BookOpen,
  announcement: Radio,
};

export function NotificationCenter() {
  const db = useFirestore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Sync read status
  useEffect(() => {
    setReadIds(getReadNotificationIds());
    const handler = () => setReadIds(getReadNotificationIds());
    window.addEventListener('notifications-read-updated', handler);
    return () => window.removeEventListener('notifications-read-updated', handler);
  }, []);

  // Listen to Firestore notifications in real time
  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as NotificationItem);
      });
      setNotifications(items);
    }, (error) => {
      console.error("Notification center listener error:", error);
    });

    return () => unsubscribe();
  }, [db]);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleMarkAll = () => {
    markAllNotificationsAsRead(notifications.map(n => n.id));
  };

  const handleItemClick = (id: string) => {
    markNotificationAsRead(id);
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="View notifications"
          className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#787567] dark:text-[#BDB8A4] hover:text-[#1C1B17] dark:hover:text-[#F4EFE6] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-black shadow-xs ring-2 ring-[#FAF3DD] dark:ring-[#181714] animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        sideOffset={12} 
        className="w-80 sm:w-96 rounded-3xl p-0 bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#2C2A22] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#EBE4CF] dark:border-[#2C2A22] flex items-center justify-between bg-[#FFFDF7] dark:bg-[#14130F]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600 dark:text-[#FDE694]" />
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1C1B17] dark:text-[#F4EFE6]">
              Transmissions
            </h4>
            {unreadCount > 0 && (
              <Badge className="bg-[#FDE694] text-[#121212] font-black text-[9px] px-1.5 py-0 h-4">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[10px] font-bold text-amber-700 dark:text-[#FDE694] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark read</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#EBE4CF]/60 dark:divide-[#2C2A22]/60 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                No transmissions yet
              </p>
              <p className="text-[10px] text-muted-foreground">
                You will be notified here whenever new ROMs are published.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isRead = readIds.includes(item.id);
              const Icon = TYPE_ICONS[item.type || 'rom'] || Radio;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "p-3.5 hover:bg-[#FAF5E6] dark:hover:bg-[#201F18] transition-colors cursor-pointer flex gap-3 relative",
                    !isRead && "bg-[#FDE694]/10 dark:bg-[#FDE694]/5"
                  )}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FDE694]/20 border border-[#FDE694]/40 flex items-center justify-center shrink-0 text-amber-700 dark:text-[#FDE694] mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase text-amber-700 dark:text-[#FDE694] truncate">
                        {item.category || item.type || 'Broadcast'}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                        {formatTimestamp(item.createdAt)}
                      </span>
                    </div>

                    <h5 className={cn(
                      "text-xs uppercase tracking-tight truncate mb-1",
                      isRead ? "font-bold text-[#49473E] dark:text-[#C5BFAD]" : "font-black text-[#1C1B17] dark:text-[#F4EFE6]"
                    )}>
                      {item.title}
                    </h5>

                    <p className="text-[11px] text-[#787567] dark:text-[#9A9583] line-clamp-2 leading-relaxed mb-2">
                      {item.message}
                    </p>

                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item.id);
                        }}
                        className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 dark:text-[#FDE694] hover:underline"
                      >
                        <span>View Release</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>

                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-amber-500 self-center shrink-0 shadow-xs" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Link to full section */}
        <div className="p-3 bg-[#FAF5E6] dark:bg-[#161511] border-t border-[#EBE4CF] dark:border-[#2C2A22] text-center">
          <Link
            href="/#notifications"
            onClick={() => setIsOpen(false)}
            className="text-[10px] font-black uppercase tracking-wider text-[#1C1B17] dark:text-[#F4EFE6] hover:text-amber-600 dark:hover:text-[#FDE694] inline-flex items-center gap-1.5"
          >
            <span>View Full Live Dispatch Feed</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
