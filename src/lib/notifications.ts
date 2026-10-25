import { collection, addDoc, serverTimestamp, Timestamp, Firestore } from 'firebase/firestore';

export type NotificationType = 'rom' | 'recovery' | 'module' | 'apk' | 'guide' | 'root' | 'announcement';

export interface PublishNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  resourceId?: string;
  category?: string;
  link?: string;
  imageUrl?: string;
  author?: string;
  duration?: number;
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

    const docRef = await addDoc(notificationsRef, {
      title: params.title.trim(),
      message: params.message.trim(),
      type: params.type,
      resourceId: params.resourceId || null,
      category: params.category || getDefaultCategory(params.type),
      link: params.link || getDefaultLink(params.type),
      imageUrl: params.imageUrl || null,
      author: params.author || 'SKY Maintainer',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(thirtyDaysFromNow),
      duration: params.duration || 8000,
      priority: params.type === 'rom' || params.type === 'recovery' ? 'high' : 'normal',
    });

    return docRef.id;
  } catch (error) {
    console.error("Failed to publish real-time notification:", error);
    return null;
  }
}

function getDefaultCategory(type: NotificationType): string {
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

function getDefaultLink(type: NotificationType): string {
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
 * using Web Audio API without needing external asset files.
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
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
