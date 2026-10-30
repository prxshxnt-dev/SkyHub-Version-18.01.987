import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  Timestamp, 
  Firestore, 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';

export type NotificationType = 'rom' | 'recovery' | 'module' | 'apk' | 'guide' | 'root' | 'announcement';
export type AttachmentType = 'none' | 'image' | 'video' | 'audio';

export interface NotificationAttachment {
  type: AttachmentType;
  url: string;
  name?: string;
  mimeType?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: string;
  link?: string;
  resourceId?: string;
  // Attachments
  attachmentType?: AttachmentType;
  attachmentUrl?: string;
  attachmentName?: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  version?: string;
  createdAt?: any;
  updatedAt?: any;
  priority?: 'normal' | 'high';
  duration?: number;
}

export interface PublishNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  resourceId?: string;
  category?: string;
  link?: string;
  version?: string;
  // Attachment fields
  attachmentType?: AttachmentType;
  attachmentUrl?: string;
  attachmentName?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  author?: string;
  duration?: number;
  priority?: 'normal' | 'high';
}

export interface NotificationSettings {
  soundEnabled: boolean;
  bannerPopupEnabled: boolean;
  bannerDuration: number; // in milliseconds, e.g. 7000
  autoNotifyOnPublish: boolean;
  defaultPriority: 'normal' | 'high';
  allowedTypes: NotificationType[];
  customChimeUrl?: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  bannerPopupEnabled: true,
  bannerDuration: 7000,
  autoNotifyOnPublish: true,
  defaultPriority: 'normal',
  allowedTypes: ['rom', 'recovery', 'module', 'apk', 'guide', 'root', 'announcement'],
  customChimeUrl: '',
};

/**
 * Fetches global notification system settings from Firestore (settings/notifications)
 */
export async function getNotificationSettings(db: Firestore): Promise<NotificationSettings> {
  if (!db) return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const snap = await getDoc(doc(db, 'settings', 'notifications'));
    if (snap.exists()) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...snap.data() } as NotificationSettings;
    }
  } catch (err) {
    console.warn("Could not fetch notification settings from Firestore:", err);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Saves/updates global notification system settings in Firestore
 */
export async function updateNotificationSettings(
  db: Firestore, 
  settings: Partial<NotificationSettings>
): Promise<void> {
  if (!db) throw new Error("Firestore instance required");
  const ref = doc(db, 'settings', 'notifications');
  await setDoc(ref, {
    ...settings,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Publishes a new real-time notification to the Firestore 'notifications' collection.
 * All connected users will immediately receive this notification in their feed,
 * unread bell badge, and banner alert.
 */
export async function publishNotification(
  db: Firestore,
  params: PublishNotificationParams
): Promise<string | null> {
  if (!db) {
    console.warn("Cannot publish notification: Firestore db is not initialized.");
    return null;
  }

  try {
    const notificationsRef = collection(db, 'notifications');
    
    // Set 30 days retention so notifications remain available in history
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Normalize attachment type & URLs
    let resolvedType: AttachmentType = params.attachmentType || 'none';
    let resolvedUrl: string | null = params.attachmentUrl || null;

    if (!resolvedUrl) {
      if (params.imageUrl) {
        resolvedType = 'image';
        resolvedUrl = params.imageUrl;
      } else if (params.videoUrl) {
        resolvedType = 'video';
        resolvedUrl = params.videoUrl;
      } else if (params.audioUrl) {
        resolvedType = 'audio';
        resolvedUrl = params.audioUrl;
      }
    }

    const payload: Record<string, any> = {
      title: params.title.trim(),
      message: params.message.trim(),
      type: params.type,
      resourceId: params.resourceId || null,
      category: params.category || getDefaultCategory(params.type),
      link: params.link || getDefaultLink(params.type),
      
      // Multimedia attachments
      attachmentType: resolvedType,
      attachmentUrl: resolvedUrl,
      attachmentName: params.attachmentName || null,
      
      // Backward-compatible individual fields
      imageUrl: resolvedType === 'image' ? resolvedUrl : (params.imageUrl || null),
      videoUrl: resolvedType === 'video' ? resolvedUrl : (params.videoUrl || null),
      audioUrl: resolvedType === 'audio' ? resolvedUrl : (params.audioUrl || null),

      author: params.author || 'SKY Maintainer',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(thirtyDaysFromNow),
      duration: params.duration || 7000,
      priority: params.priority || (params.type === 'rom' || params.type === 'recovery' ? 'high' : 'normal'),
    };

    const docRef = await addDoc(notificationsRef, payload);
    return docRef.id;
  } catch (error) {
    console.error("Failed to publish real-time notification:", error);
    return null;
  }
}

export function getDefaultCategory(type: NotificationType): string {
  switch (type) {
    case 'rom': return 'Custom ROM';
    case 'recovery': return 'Recovery Protocol';
    case 'module': return 'Magisk Module';
    case 'apk': return 'Rooted APK';
    case 'guide': return 'Tutorial Protocol';
    case 'root': return 'Root Tool';
    default: return 'Announcement';
  }
}

export function getDefaultLink(type: NotificationType): string {
  switch (type) {
    case 'rom': return '/#roms';
    case 'recovery': return '/#recoveries';
    case 'module': return '/#modules';
    case 'apk': return '/#rooted-apks';
    case 'guide': return '/guides';
    case 'root': return '/#root';
    default: return '/#notifications';
  }
}

const READ_STORAGE_KEY = 'skyhub_read_notifications_v1';

export function getReadNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const current = getReadNotificationIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated.slice(-200)));
      window.dispatchEvent(new Event('notifications-read-updated'));
    }
  } catch (e) {
    console.error('Failed to mark notification as read:', e);
  }
}

export function markAllNotificationsAsRead(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = new Set(getReadNotificationIds());
    ids.forEach(id => current.add(id));
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(current).slice(-200)));
    window.dispatchEvent(new Event('notifications-read-updated'));
  } catch (e) {
    console.error('Failed to mark all as read:', e);
  }
}

export function isNotificationRead(id: string): boolean {
  if (typeof window === 'undefined') return false;
  return getReadNotificationIds().includes(id);
}

/**
 * Plays a pleasant, subtle futuristic audio chime for incoming notifications
 * using Web Audio API or custom audio file if provided.
 */
export function playNotificationChime(customAudioUrl?: string): void {
  if (typeof window === 'undefined') return;
  
  if (customAudioUrl) {
    try {
      const audio = new Audio(customAudioUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {
        playDefaultWebAudioChime();
      });
      return;
    } catch {
      // fallback to synth chime
    }
  }

  playDefaultWebAudioChime();
}

function playDefaultWebAudioChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.24); // D6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.4);
  } catch {
    // Audio playback blocked or unsupported, silently ignore
  }
}
