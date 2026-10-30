'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ExternalLink, 
  Package, 
  ShieldAlert, 
  Smartphone, 
  Zap, 
  BookOpen, 
  Radio, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Music,
  Maximize2,
  X,
  Volume2,
  Paperclip,
  Download,
  FileText,
  Play
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  getReadNotificationIds, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  NotificationType,
  AttachmentType
} from '@/lib/notifications';
import Link from 'next/link';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: string;
  link?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  attachmentType?: AttachmentType;
  attachmentUrl?: string;
  attachmentName?: string;
  author?: string;
  createdAt?: any;
}

interface MediaModalState {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  title: string;
  name?: string;
  category?: string;
  message?: string;
}

const TYPE_ICONS: Record<string, any> = {
  rom: Package,
  recovery: ShieldAlert,
  module: Smartphone,
  apk: Zap,
  guide: BookOpen,
  announcement: Radio,
};

/**
 * Robustly detects and normalizes media attachments from notification documents
 */
export function resolveNotificationMedia(item: NotificationItem): {
  type: 'image' | 'video' | 'audio' | 'file' | 'none';
  url?: string;
  name?: string;
} {
  const name = item.attachmentName || undefined;

  // 1. Check direct video/audio/image properties
  if (item.videoUrl) {
    return { type: 'video', url: item.videoUrl, name };
  }
  if (item.audioUrl) {
    return { type: 'audio', url: item.audioUrl, name };
  }
  if (item.imageUrl) {
    return { type: 'image', url: item.imageUrl, name };
  }

  // 2. Check attachmentUrl & attachmentType
  if (item.attachmentUrl) {
    const raw = item.attachmentUrl.trim();
    if (item.attachmentType === 'video' || raw.startsWith('data:video/') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(raw)) {
      return { type: 'video', url: raw, name };
    }
    if (item.attachmentType === 'audio' || raw.startsWith('data:audio/') || /\.(mp3|wav|ogg|aac|m4a|flac)(\?.*)?$/i.test(raw)) {
      return { type: 'audio', url: raw, name };
    }
    if (item.attachmentType === 'image' || raw.startsWith('data:image/') || /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(raw)) {
      return { type: 'image', url: raw, name };
    }
    
    // Check attachmentName extension as fallback
    if (item.attachmentName) {
      if (/\.(jpeg|jpg|png|webp|gif|svg)$/i.test(item.attachmentName)) {
        return { type: 'image', url: raw, name };
      }
      if (/\.(mp4|webm|ogg|mov)$/i.test(item.attachmentName)) {
        return { type: 'video', url: raw, name };
      }
      if (/\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(item.attachmentName)) {
        return { type: 'audio', url: raw, name };
      }
    }

    if (item.attachmentType && item.attachmentType !== 'none') {
      return { type: item.attachmentType as any, url: raw, name };
    }

    return { type: 'file', url: raw, name };
  }

  return { type: 'none' };
}

export function NotificationCenter() {
  const db = useFirestore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState<MediaModalState | null>(null);

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
      limit(25)
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
    <>
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
          className="w-[340px] sm:w-[440px] rounded-3xl p-0 bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#2C2A22] shadow-2xl overflow-hidden"
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
          <div className="max-h-[500px] sm:max-h-[540px] overflow-y-auto divide-y divide-[#EBE4CF]/60 dark:divide-[#2C2A22]/60 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  No transmissions yet
                </p>
                <p className="text-[10px] text-muted-foreground">
                  You will be notified here whenever new ROMs, recoveries, or announcements are broadcast.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = readIds.includes(item.id);
                const Icon = TYPE_ICONS[item.type || 'rom'] || Radio;
                const media = resolveNotificationMedia(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "p-4 hover:bg-[#FAF5E6] dark:hover:bg-[#201F18] transition-colors cursor-pointer flex gap-3 relative",
                      !isRead && "bg-[#FDE694]/10 dark:bg-[#FDE694]/5"
                    )}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#FDE694]/20 border border-[#FDE694]/40 flex items-center justify-center shrink-0 text-amber-700 dark:text-[#FDE694] mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Meta header */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[9px] font-black uppercase text-amber-700 dark:text-[#FDE694] truncate">
                            {item.category || item.type || 'Broadcast'}
                          </span>

                          {media.type !== 'none' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-[#FDE694] text-[8px] font-black uppercase tracking-wider">
                              {media.type === 'image' && <ImageIcon className="w-2.5 h-2.5" />}
                              {media.type === 'video' && <Video className="w-2.5 h-2.5" />}
                              {media.type === 'audio' && <Music className="w-2.5 h-2.5" />}
                              {media.type === 'file' && <Paperclip className="w-2.5 h-2.5" />}
                              <span>{media.type}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                          {formatTimestamp(item.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className={cn(
                        "text-xs sm:text-sm uppercase tracking-tight line-clamp-2 mb-1.5",
                        isRead ? "font-bold text-[#49473E] dark:text-[#C5BFAD]" : "font-black text-[#1C1B17] dark:text-[#F4EFE6]"
                      )}>
                        {item.title}
                      </h5>

                      {/* Message */}
                      <p className="text-[11px] text-[#787567] dark:text-[#9A9583] line-clamp-3 leading-relaxed mb-2.5">
                        {item.message}
                      </p>

                      {/* MULTIMEDIA ATTACHMENT DISPLAY: AUDIO, VIDEO, IMAGE, OR FILE */}
                      {media.type !== 'none' && media.url && (
                        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                          {/* Image Attachment with Thumbnail & Full View */}
                          {media.type === 'image' && (
                            <div className="space-y-1">
                              {media.name && (
                                <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground truncate mb-1">
                                  <Paperclip className="w-2.5 h-2.5 text-amber-600 dark:text-[#FDE694]" />
                                  <span className="truncate">{media.name}</span>
                                </div>
                              )}
                              <div 
                                onClick={() => {
                                  handleItemClick(item.id);
                                  setModalMedia({
                                    type: 'image',
                                    url: media.url!,
                                    title: item.title,
                                    name: media.name,
                                    category: item.category || item.type,
                                    message: item.message,
                                  });
                                }}
                                className="relative rounded-2xl overflow-hidden border border-[#EBE4CF] dark:border-[#2C2A22] bg-black/10 dark:bg-black/30 group cursor-zoom-in shadow-sm aspect-video max-h-48"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={media.url} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-full bg-black/80 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                                    <Maximize2 className="w-3 h-3 text-amber-400" /> View Image
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Video Attachment with Direct Player & Theater Modal */}
                          {media.type === 'video' && (
                            <div className="rounded-2xl overflow-hidden border border-[#EBE4CF] dark:border-[#2C2A22] bg-black shadow-md space-y-0">
                              <video 
                                src={media.url} 
                                controls 
                                playsInline 
                                preload="metadata"
                                className="w-full max-h-52 object-contain bg-black"
                              />
                              <div className="px-3 py-2 bg-[#FAF5E6] dark:bg-[#161511] flex items-center justify-between text-[10px] border-t border-[#EBE4CF] dark:border-[#2C2A22]">
                                <span className="font-bold text-[#787567] dark:text-[#9A9583] flex items-center gap-1.5 truncate">
                                  <Video className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="truncate">{media.name || 'Video Broadcast'}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleItemClick(item.id);
                                    setModalMedia({
                                      type: 'video',
                                      url: media.url!,
                                      title: item.title,
                                      name: media.name,
                                      category: item.category || item.type,
                                      message: item.message,
                                    });
                                  }}
                                  className="text-amber-700 dark:text-[#FDE694] font-black uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer text-[9px] shrink-0 ml-2"
                                >
                                  <Maximize2 className="w-3 h-3" /> Theater
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Audio Attachment with Live Player & Popout */}
                          {media.type === 'audio' && (
                            <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/10 space-y-2 shadow-sm">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-black uppercase tracking-wider text-amber-800 dark:text-[#FDE694] flex items-center gap-1.5 truncate">
                                  <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-[#FDE694] shrink-0" />
                                  <span className="truncate">{media.name || 'Audio Transmission'}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleItemClick(item.id);
                                    setModalMedia({
                                      type: 'audio',
                                      url: media.url!,
                                      title: item.title,
                                      name: media.name,
                                      category: item.category || item.type,
                                      message: item.message,
                                    });
                                  }}
                                  className="text-[9px] font-black uppercase tracking-wider text-amber-800 dark:text-[#FDE694] hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                                >
                                  <Maximize2 className="w-2.5 h-2.5" /> Full Player
                                </button>
                              </div>
                              <audio 
                                src={media.url} 
                                controls 
                                preload="none"
                                className="w-full h-8 accent-amber-500"
                              />
                            </div>
                          )}

                          {/* Generic Attached File */}
                          {media.type === 'file' && (
                            <div className="p-2.5 rounded-2xl border border-[#EBE4CF] dark:border-[#2C2A22] bg-black/5 dark:bg-black/20 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-amber-600 dark:text-[#FDE694] shrink-0" />
                                <span className="text-[10px] font-mono text-[#1C1B17] dark:text-[#F4EFE6] truncate">
                                  {media.name || 'Attached File'}
                                </span>
                              </div>
                              <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-[#FDE694] text-[9px] font-black uppercase tracking-wider hover:bg-amber-500/25 flex items-center gap-1 shrink-0"
                              >
                                <Download className="w-2.5 h-2.5" /> Open
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Release link */}
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item.id);
                            setIsOpen(false);
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

      {/* MULTIMEDIA INSPECTION DIALOG (Lightbox / Theater Preview) */}
      <Dialog open={!!modalMedia} onOpenChange={(open) => !open && setModalMedia(null)}>
        <DialogContent className="max-w-3xl rounded-3xl p-6 bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#2C2A22] text-[#1C1B17] dark:text-[#F4EFE6] shadow-2xl">
          {modalMedia && (
            <div className="space-y-4">
              <DialogHeader className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#FDE694] text-[#121212] font-black text-[9px] uppercase tracking-wider px-2 py-0.5">
                    {modalMedia.category || modalMedia.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                    {modalMedia.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-amber-600" />}
                    {modalMedia.type === 'video' && <Video className="w-3.5 h-3.5 text-amber-600" />}
                    {modalMedia.type === 'audio' && <Music className="w-3.5 h-3.5 text-amber-600" />}
                    {modalMedia.type === 'file' && <FileText className="w-3.5 h-3.5 text-amber-600" />}
                    {modalMedia.type} Attachment
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
                  {modalMedia.title}
                </DialogTitle>
                {modalMedia.name && (
                  <p className="text-[10px] font-mono text-muted-foreground">
                    File: {modalMedia.name}
                  </p>
                )}
                {modalMedia.message && (
                  <DialogDescription className="text-xs text-[#787567] dark:text-[#9A9583] line-clamp-2">
                    {modalMedia.message}
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Media Content Display */}
              <div className="rounded-2xl overflow-hidden bg-black/90 border border-[#EBE4CF] dark:border-[#2C2A22] flex items-center justify-center min-h-[240px] max-h-[65vh]">
                {modalMedia.type === 'image' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={modalMedia.url} 
                    alt={modalMedia.title}
                    className="max-h-[65vh] w-auto max-w-full object-contain mx-auto"
                  />
                )}

                {modalMedia.type === 'video' && (
                  <video 
                    src={modalMedia.url} 
                    controls 
                    autoPlay 
                    playsInline 
                    className="max-h-[65vh] w-full object-contain"
                  />
                )}

                {modalMedia.type === 'audio' && (
                  <div className="w-full p-8 flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-[#2B2A22] to-[#181714] text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                      <Music className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase text-amber-200">
                        Now Playing: {modalMedia.name || modalMedia.title}
                      </h4>
                      <p className="text-[11px] text-amber-300/70">
                        Direct transmission audio stream
                      </p>
                    </div>
                    <audio 
                      src={modalMedia.url} 
                      controls 
                      autoPlay 
                      className="w-full max-w-md accent-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={modalMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black uppercase text-amber-700 dark:text-[#FDE694] hover:underline inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open raw attachment in new tab</span>
                </a>

                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setModalMedia(null)}
                  className="font-bold text-xs uppercase rounded-xl border-[#EBE4CF] dark:border-[#2C2A22]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
