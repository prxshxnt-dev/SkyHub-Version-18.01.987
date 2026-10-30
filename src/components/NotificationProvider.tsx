'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirestore } from '@/firebase';
import { collection, query, onSnapshot, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { Bell, ExternalLink, X, Image as ImageIcon, Video, Music } from 'lucide-react';
import { 
  playNotificationChime, 
  NotificationSettings, 
  DEFAULT_NOTIFICATION_SETTINGS,
  AttachmentType
} from '@/lib/notifications';
import Link from 'next/link';

interface ActiveToast {
  id: string | number;
  title?: string;
  message: string;
  link?: string;
  type?: string;
  attachmentType?: AttachmentType;
  attachmentUrl?: string;
}

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const settingsRef = useRef<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const db = useFirestore();
  const isFirstLoadRef = useRef(true);

  // Sync settings ref
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Listen to global settings from Firestore
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'settings', 'notifications'), (snap) => {
      if (snap.exists()) {
        const loaded = { ...DEFAULT_NOTIFICATION_SETTINGS, ...snap.data() } as NotificationSettings;
        setSettings(loaded);
      }
    }, (err) => {
      console.warn("NotificationProvider settings sync error:", err);
    });
    return () => unsub();
  }, [db]);

  const addNotification = useCallback((
    message: string, 
    duration = 7000, 
    meta?: { 
      title?: string; 
      link?: string; 
      type?: string;
      attachmentType?: AttachmentType;
      attachmentUrl?: string;
    }
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, ...meta }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string | number) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    if (!db) return;

    // Listen to real-time additions in 'notifications'
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Avoid firing toast for historical records on initial page mount
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const currentSettings = settingsRef.current;

          // Sound check
          if (currentSettings.soundEnabled !== false) {
            const customAudio = data.audioUrl || currentSettings.customChimeUrl;
            playNotificationChime(customAudio);
          }

          // Banner Popup check
          if (currentSettings.bannerPopupEnabled !== false) {
            const title = data.title || 'New Release Transmission';
            const message = data.message || 'A new update is now available on SKY Hub.';
            const link = data.link || '/#notifications';
            const type = data.type || 'rom';
            const attType = data.attachmentType || (data.imageUrl ? 'image' : data.videoUrl ? 'video' : data.audioUrl ? 'audio' : 'none');
            const attUrl = data.attachmentUrl || data.imageUrl || data.videoUrl || data.audioUrl;
            const duration = currentSettings.bannerDuration || data.duration || 7000;

            addNotification(message, duration, { 
              title, 
              link, 
              type, 
              attachmentType: attType, 
              attachmentUrl: attUrl 
            });
          }
        }
      });
    }, (error) => {
      console.error("Transmission synchronization error:", error);
    });

    return () => unsubscribe();
  }, [db, addNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {/* Toast Alert Container on Top/Bottom */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#FAF3DD]/95 dark:bg-[#181714]/95 text-[#1C1B17] dark:text-[#F4EFE6] p-4 rounded-3xl shadow-2xl border border-[#EBE4CF] dark:border-[#2C2A22] pointer-events-auto backdrop-blur-xl flex items-start gap-3.5 relative overflow-hidden ring-1 ring-[#FDE694]/40"
            >
              {/* Pulsing indicator */}
              <div className="w-9 h-9 rounded-2xl bg-[#FDE694]/30 dark:bg-[#FDE694]/15 border border-[#FDE694]/50 flex items-center justify-center shrink-0 text-amber-700 dark:text-[#FDE694] mt-0.5">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-[#FDE694]">
                    LIVE TRANSMISSION
                  </p>

                  {/* Multimedia badge if attached */}
                  {toast.attachmentType && toast.attachmentType !== 'none' && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-[#FDE694] border border-amber-500/20">
                      {toast.attachmentType === 'image' && <ImageIcon className="w-2.5 h-2.5" />}
                      {toast.attachmentType === 'video' && <Video className="w-2.5 h-2.5" />}
                      {toast.attachmentType === 'audio' && <Music className="w-2.5 h-2.5" />}
                      <span>{toast.attachmentType}</span>
                    </span>
                  )}
                </div>

                {toast.title && (
                  <h5 className="font-black text-xs uppercase tracking-tight truncate text-[#1C1B17] dark:text-[#F4EFE6] mb-1">
                    {toast.title}
                  </h5>
                )}

                <p className="text-[11px] text-[#787567] dark:text-[#BDB8A4] leading-relaxed line-clamp-2 mb-2">
                  {toast.message}
                </p>

                {toast.link && (
                  <Link
                    href={toast.link}
                    onClick={() => removeToast(toast.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-[#FDE694] hover:underline"
                  >
                    <span>Inspect Release</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
