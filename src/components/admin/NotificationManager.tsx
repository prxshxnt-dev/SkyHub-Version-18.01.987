'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  Edit3, 
  Search, 
  Radio, 
  Package, 
  ShieldAlert, 
  Smartphone, 
  Zap, 
  BookOpen, 
  Volume2, 
  VolumeX,
  Sparkles, 
  ExternalLink, 
  Clock, 
  RotateCcw, 
  Upload, 
  X, 
  Image as ImageIcon,
  Video,
  Music,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Play,
  Pause,
  Layers,
  Save,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp, 
  limit 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from '@/hooks/use-toast';
import { 
  publishNotification, 
  playNotificationChime, 
  NotificationType,
  AttachmentType,
  NotificationItem,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  updateNotificationSettings
} from '@/lib/notifications';
import { compressImage } from '@/lib/image-upload';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationRecord extends NotificationItem {
  id: string;
}

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: any; color: string; bg: string; border: string }> = {
  rom: { label: 'Custom ROM', icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  recovery: { label: 'Recovery', icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  module: { label: 'Module', icon: Smartphone, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  apk: { label: 'Mod APK', icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  guide: { label: 'Guide / Tutorial', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  root: { label: 'Root Tool', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  announcement: { label: 'Announcement', icon: Radio, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

const PRESET_LINKS = [
  { label: 'Custom ROMs', value: '/#roms' },
  { label: 'Recoveries', value: '/#recoveries' },
  { label: 'Modules', value: '/#modules' },
  { label: 'Mod APKs', value: '/#rooted-apks' },
  { label: 'Root Protocol', value: '/#root' },
  { label: 'Guides', value: '/guides' },
  { label: 'Wallpapers', value: '/wallpapers' },
  { label: 'Live Feed', value: '/#notifications' },
];

export function NotificationManager() {
  const db = useFirestore();
  const { user: currentUser } = useUser();

  const userProfileRef = useMemoFirebase(() => 
    (currentUser?.uid && db) ? doc(db, 'users', currentUser.uid) : null
  , [db, currentUser?.uid]);
  const { data: profile } = useDoc(userProfileRef);

  // Tab State: 'broadcast' | 'settings'
  const [activeTab, setActiveTab] = useState<'broadcast' | 'settings'>('broadcast');

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType | 'media'>('all');

  // Push Composer State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType>('rom');
  const [link, setLink] = useState('/#roms');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');

  // Attachment Composer State
  const [attachmentType, setAttachmentType] = useState<AttachmentType>('none');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<NotificationRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isProcessingEditMedia, setIsProcessingEditMedia] = useState(false);

  // Delete Confirm Modal State
  const [itemToDelete, setItemToDelete] = useState<NotificationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Audio Preview Player ref
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Live Firestore subscription for notifications
  useEffect(() => {
    if (!db) return;
    setIsLoading(true);

    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: NotificationRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as NotificationRecord);
      });
      setNotifications(items);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading notification history:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Load Settings from Firestore
  useEffect(() => {
    if (!db) return;
    setIsSettingsLoading(true);
    getNotificationSettings(db).then((loaded) => {
      setSettings(loaded);
      setIsSettingsLoading(false);
    }).catch(() => {
      setIsSettingsLoading(false);
    });
  }, [db]);

  // Handle Type Change and auto-set target preset link
  const handleTypeSelect = (type: NotificationType) => {
    setSelectedType(type);
    switch (type) {
      case 'rom': setLink('/#roms'); break;
      case 'recovery': setLink('/#recoveries'); break;
      case 'module': setLink('/#modules'); break;
      case 'apk': setLink('/#rooted-apks'); break;
      case 'guide': setLink('/guides'); break;
      case 'root': setLink('/#root'); break;
      case 'announcement': setLink('/#notifications'); break;
    }
  };

  // Process Media File Upload (Image, Video, Audio)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEditMode) {
      setIsProcessingEditMedia(true);
    } else {
      setIsProcessingMedia(true);
    }

    try {
      const targetType = isEditMode ? (editingItem?.attachmentType || 'image') : attachmentType;

      if (targetType === 'image') {
        const compressed = await compressImage(file, 900, 900, 0.85);
        if (isEditMode && editingItem) {
          setEditingItem({
            ...editingItem,
            attachmentType: 'image',
            attachmentUrl: compressed,
            imageUrl: compressed,
            attachmentName: file.name
          });
        } else {
          setAttachmentUrl(compressed);
          setAttachmentName(file.name);
        }
        toast({
          title: "Image Attached",
          description: `${file.name} compressed and attached to transmission.`,
        });
      } else if (targetType === 'video' || targetType === 'audio') {
        // Enforce max size for direct Firestore storage (750KB)
        const maxBytes = 750 * 1024;
        if (file.size > maxBytes) {
          toast({
            variant: "destructive",
            title: "File Exceeds Firestore Limit",
            description: `${file.name} is ${Math.round(file.size / 1024)}KB. Directly stored files must be under 750KB. Please paste a direct stream URL (e.g., MP4/MP3/YouTube) instead.`,
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          if (isEditMode && editingItem) {
            setEditingItem({
              ...editingItem,
              attachmentType: targetType,
              attachmentUrl: dataUrl,
              videoUrl: targetType === 'video' ? dataUrl : undefined,
              audioUrl: targetType === 'audio' ? dataUrl : undefined,
              attachmentName: file.name
            });
          } else {
            setAttachmentUrl(dataUrl);
            setAttachmentName(file.name);
          }
          toast({
            title: `${targetType === 'video' ? 'Video' : 'Audio'} Attached`,
            description: `${file.name} prepared for transmission.`,
          });
        };
        reader.onerror = () => {
          throw new Error("Failed to read media file.");
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Media Processing Failed",
        description: err.message || "Failed to process media file.",
      });
    } finally {
      if (isEditMode) {
        setIsProcessingEditMedia(false);
      } else {
        setIsProcessingMedia(false);
      }
    }
  };

  // Dispatch Notification to all users
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please specify both a headline and message for the broadcast.",
      });
      return;
    }

    if (!db) return;
    setIsPublishing(true);

    try {
      const authorName = (profile as any)?.username || currentUser?.email?.split('@')[0] || 'Admin';
      
      const publishedId = await publishNotification(db, {
        title: title.trim(),
        message: message.trim(),
        type: selectedType,
        category: customCategory.trim() || undefined,
        link: link.trim() || undefined,
        priority,
        // Attachment
        attachmentType,
        attachmentUrl: attachmentType !== 'none' ? attachmentUrl.trim() : undefined,
        attachmentName: attachmentType !== 'none' ? attachmentName.trim() : undefined,
        author: authorName,
      });

      if (publishedId) {
        // Play sound chime if sound enabled
        if (settings.soundEnabled) {
          playNotificationChime(settings.customChimeUrl || (attachmentType === 'audio' ? attachmentUrl : undefined));
        }

        toast({
          title: "Transmission Broadcasted",
          description: "All online users have received the live alert and notification badge.",
        });

        // Reset form fields
        setTitle('');
        setMessage('');
        setAttachmentType('none');
        setAttachmentUrl('');
        setAttachmentName('');
        setCustomCategory('');
      } else {
        throw new Error("Publish returned null document identifier.");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Transmission Failed",
        description: err.message || "Could not push notification to Firestore.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Save Edits to an Existing Notification
  const handleSaveEdit = async () => {
    if (!editingItem || !db) return;
    setIsSavingEdit(true);

    try {
      const ref = doc(db, 'notifications', editingItem.id);
      
      const attType: AttachmentType = editingItem.attachmentType || 'none';
      const attUrl = attType !== 'none' ? (editingItem.attachmentUrl || null) : null;
      const attName = attType !== 'none' ? (editingItem.attachmentName || null) : null;

      await updateDoc(ref, {
        title: editingItem.title.trim(),
        message: editingItem.message.trim(),
        type: editingItem.type || 'announcement',
        link: editingItem.link?.trim() || null,
        category: editingItem.category?.trim() || null,
        priority: editingItem.priority || 'normal',
        
        // Media Attachment
        attachmentType: attType,
        attachmentUrl: attUrl,
        attachmentName: attName,
        imageUrl: attType === 'image' ? attUrl : null,
        videoUrl: attType === 'video' ? attUrl : null,
        audioUrl: attType === 'audio' ? attUrl : null,

        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Transmission Updated",
        description: "The historical record and attachment have been saved in Firestore.",
      });
      setEditingItem(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Could not update notification record.",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Save Global Notification Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsSavingSettings(true);

    try {
      await updateNotificationSettings(db, settings);
      toast({
        title: "Notification Settings Saved",
        description: "Global sound, toast alert popup, and duration preferences updated.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Settings Save Failed",
        description: err.message || "Could not update settings in Firestore.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Duplicate / Prefill into Composer
  const handleDuplicateToComposer = (item: NotificationRecord) => {
    setTitle(item.title);
    setMessage(item.message);
    setSelectedType(item.type || 'announcement');
    setLink(item.link || '/#notifications');
    setCustomCategory(item.category || '');
    setPriority(item.priority === 'high' ? 'high' : 'normal');
    
    // Resolve attachment
    if (item.attachmentType && item.attachmentType !== 'none') {
      setAttachmentType(item.attachmentType);
      setAttachmentUrl(item.attachmentUrl || '');
      setAttachmentName(item.attachmentName || '');
    } else if (item.imageUrl) {
      setAttachmentType('image');
      setAttachmentUrl(item.imageUrl);
      setAttachmentName('Image Attachment');
    } else if (item.videoUrl) {
      setAttachmentType('video');
      setAttachmentUrl(item.videoUrl);
      setAttachmentName('Video Attachment');
    } else if (item.audioUrl) {
      setAttachmentType('audio');
      setAttachmentUrl(item.audioUrl);
      setAttachmentName('Audio Attachment');
    } else {
      setAttachmentType('none');
      setAttachmentUrl('');
      setAttachmentName('');
    }
    
    setActiveTab('broadcast');
    window.scrollTo({ top: 200, behavior: 'smooth' });

    toast({
      title: "Transmission Loaded",
      description: "Data and attachments copied into broadcast composer.",
    });
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !db) return;
    setIsDeleting(true);

    try {
      const ref = doc(db, 'notifications', itemToDelete.id);
      await deleteDoc(ref);

      toast({
        title: "Transmission Revoked",
        description: "Removed from registry and live user feeds.",
      });
      setItemToDelete(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "Failed to remove notification.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Type / Media filter
      if (activeFilter === 'media') {
        const hasMedia = item.attachmentType === 'image' || 
                         item.attachmentType === 'video' || 
                         item.attachmentType === 'audio' ||
                         Boolean(item.imageUrl || item.videoUrl || item.audioUrl);
        if (!hasMedia) return false;
      } else if (activeFilter !== 'all' && item.type !== activeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(queryLower);
        const inMessage = item.message?.toLowerCase().includes(queryLower);
        const inAuthor = item.author?.toLowerCase().includes(queryLower);
        const inCategory = item.category?.toLowerCase().includes(queryLower);
        return inTitle || inMessage || inAuthor || inCategory;
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      roms: notifications.filter(n => n.type === 'rom').length,
      recoveries: notifications.filter(n => n.type === 'recovery').length,
      modules: notifications.filter(n => n.type === 'module').length,
      withMedia: notifications.filter(n => 
        (n.attachmentType && n.attachmentType !== 'none') || n.imageUrl || n.videoUrl || n.audioUrl
      ).length,
    };
  }, [notifications]);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-10">
      {/* Top Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-inner">
            <Bell className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Push Notification Center
            </h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
              Broadcast transmissions with images, video & audio attachments or configure notification settings
            </p>
          </div>
        </div>

        {/* Global Action & Navigation Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Tab Switcher Buttons */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('broadcast')}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === 'broadcast'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast & Log</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === 'settings'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>Notification Settings</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => playNotificationChime(settings.customChimeUrl)}
            className="h-10 rounded-2xl border-border text-xs font-black uppercase tracking-wider px-3.5 hover:bg-muted"
            title="Test audio alert sound"
          >
            <Volume2 className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            <span>Test Chime</span>
          </Button>

          <a
            href="/#notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 inline-flex items-center rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider px-3.5 hover:bg-primary/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            <span>User Feed</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        </div>
      </div>

      {/* VIEW 1: NOTIFICATION SETTINGS */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border-border border-2 overflow-hidden relative shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Notification Engine Settings
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Configure audio chimes, toast alerts, default duration, and auto-dispatch
                  </p>
                </div>
              </div>

              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-black text-[9px] px-3 py-1">
                SYSTEM CONFIGURATION
              </Badge>
            </div>

            <form onSubmit={handleSaveSettings} className="mt-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sound Chime Toggle */}
                <div className="p-5 rounded-3xl bg-muted/30 border border-border flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-500" />
                      <Label className="text-xs font-black uppercase tracking-wider">
                        Play Audio Chime
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Plays a subtle futuristic sound when a live transmission is broadcasted.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="w-5 h-5 accent-primary rounded cursor-pointer mt-1"
                  />
                </div>

                {/* Floating Toast Popup Banner */}
                <div className="p-5 rounded-3xl bg-muted/30 border border-border flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <Label className="text-xs font-black uppercase tracking-wider">
                        Floating Toast Alert Banner
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Display an animated popup banner in the bottom-right corner when updates arrive.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.bannerPopupEnabled}
                    onChange={(e) => setSettings({ ...settings, bannerPopupEnabled: e.target.checked })}
                    className="w-5 h-5 accent-primary rounded cursor-pointer mt-1"
                  />
                </div>

                {/* Auto-Notify on Release Publication */}
                <div className="p-5 rounded-3xl bg-muted/30 border border-border flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-500" />
                      <Label className="text-xs font-black uppercase tracking-wider">
                        Auto-Notify on Resource Publish
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Automatically broadcast an instant notification when a new ROM or Recovery is published.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={settings.autoNotifyOnPublish}
                    onChange={(e) => setSettings({ ...settings, autoNotifyOnPublish: e.target.checked })}
                    className="w-5 h-5 accent-primary rounded cursor-pointer mt-1"
                  />
                </div>

                {/* Default Priority */}
                <div className="p-5 rounded-3xl bg-muted/30 border border-border flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-rose-500" />
                      <Label className="text-xs font-black uppercase tracking-wider">
                        Default Transmission Priority
                      </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      High priority highlights the transmission with distinctive pulsing rings.
                    </p>
                  </div>

                  <select
                    value={settings.defaultPriority}
                    onChange={(e) => setSettings({ ...settings, defaultPriority: e.target.value as 'normal' | 'high' })}
                    className="h-10 px-3 bg-card border border-border rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Toast Duration Selector */}
              <div className="space-y-3 p-5 rounded-3xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Toast Banner Display Duration</span>
                  </Label>
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {Math.round(settings.bannerDuration / 1000)} Seconds
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Controls how long the live floating alert persists on screen before auto-dismissing.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {[5000, 7000, 10000, 15000].map((durationMs) => (
                    <button
                      key={durationMs}
                      type="button"
                      onClick={() => setSettings({ ...settings, bannerDuration: durationMs })}
                      className={cn(
                        "h-11 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2",
                        settings.bannerDuration === durationMs
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{durationMs / 1000}s ({durationMs === 7000 ? 'Default' : durationMs > 10000 ? 'Long' : 'Brief'})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Audio Chime URL */}
              <div className="space-y-2 p-5 rounded-3xl bg-muted/30 border border-border">
                <Label className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-500" />
                  <span>Custom Notification Chime Audio URL (Optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.customChimeUrl || ''}
                    onChange={(e) => setSettings({ ...settings, customChimeUrl: e.target.value })}
                    placeholder="https://... direct .mp3 / .wav audio URL (leave empty for synthesizer synth chime)"
                    className="h-12 bg-card rounded-2xl border-border font-mono text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => playNotificationChime(settings.customChimeUrl)}
                    className="h-12 px-4 rounded-2xl border-border text-xs font-black uppercase"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Test Sound
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Leave blank to use the built-in zero-latency futuristic Web Audio dual-tone synthesizer.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettings(DEFAULT_NOTIFICATION_SETTINGS)}
                  className="rounded-2xl text-xs font-black uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  Reset to Defaults
                </Button>

                <Button
                  type="submit"
                  disabled={isSavingSettings}
                  className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-lg shadow-primary/25 cursor-pointer"
                >
                  {isSavingSettings ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Saving Preferences...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* VIEW 2: BROADCAST COMPOSER & HISTORY */}
      {activeTab === 'broadcast' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-10"
        >
          {/* Stats Quick Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 rounded-2xl bg-card/40 border-border">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Total Pushes</p>
              <p className="text-2xl font-black text-foreground mt-1">{stats.total}</p>
            </Card>
            <Card className="p-4 rounded-2xl bg-amber-500/5 border-amber-500/20">
              <p className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest">ROM Releases</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.roms}</p>
            </Card>
            <Card className="p-4 rounded-2xl bg-purple-500/5 border-purple-500/20">
              <p className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-widest">Recoveries</p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.recoveries}</p>
            </Card>
            <Card className="p-4 rounded-2xl bg-cyan-500/5 border-cyan-500/20">
              <p className="text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest">Multimedia Releases</p>
              <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{stats.withMedia}</p>
            </Card>
          </div>

          {/* Broadcast Composer */}
          <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-card/60 backdrop-blur-xl border-border border-2 overflow-hidden relative shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Broadcast New Transmission
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Pushes live alert with optional image, video or audio media attachments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-black text-[9px] px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  MULTICAST READY
                </Badge>
              </div>
            </div>

            <form onSubmit={handlePublish} className="mt-8 space-y-6">
              {/* Category / Type Selector */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  Select Release Category
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {(Object.keys(TYPE_CONFIG) as NotificationType[]).map((type) => {
                    const config = TYPE_CONFIG[type];
                    const Icon = config.icon;
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeSelect(type)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer gap-1.5",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                            : "bg-muted/40 border-border/60 hover:border-primary/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isSelected ? "text-primary-foreground" : config.color)} />
                        <span className="text-[9px] font-black uppercase tracking-wider">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Target Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center justify-between">
                    <span>Transmission Headline *</span>
                    <span className="text-[8px] text-muted-foreground">{title.length}/80</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PixelOS Android 15 Official Port Released"
                    maxLength={80}
                    required
                    className="h-12 bg-muted/50 rounded-2xl border-border font-bold text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                    Target Navigation Link
                  </Label>
                  <Input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/#roms or https://..."
                    className="h-12 bg-muted/50 rounded-2xl border-border font-mono text-xs"
                  />
                  {/* Preset Link Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[8px] font-black uppercase text-muted-foreground mr-1">Presets:</span>
                    {PRESET_LINKS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setLink(preset.value)}
                        className={cn(
                          "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border transition-colors",
                          link === preset.value
                            ? "bg-primary/20 text-primary border-primary/40"
                            : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Broadcast Message */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>Notification Message / Summary *</span>
                  <span className="text-[8px] text-muted-foreground">{message.length}/350</span>
                </Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide a concise release breakdown, highlights, or community bulletin delivered instantly to all users."
                  maxLength={350}
                  required
                  rows={3}
                  className="bg-muted/50 rounded-2xl border-border text-xs leading-relaxed"
                />
              </div>

              {/* PRIORITY & CUSTOM TAG ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                    Priority Level
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPriority('normal')}
                      className={cn(
                        "h-12 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer",
                        priority === 'normal'
                          ? "bg-muted text-foreground border-primary/50 shadow-xs"
                          : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50"
                      )}
                    >
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <span>Normal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('high')}
                      className={cn(
                        "h-12 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer",
                        priority === 'high'
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-xs"
                          : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/50"
                      )}
                    >
                      <Zap className="w-4 h-4 text-rose-500" />
                      <span>High Alert</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                    Custom Badge Label (Optional)
                  </Label>
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Official v2.4, Urgent Kernel Patch"
                    className="h-12 bg-muted/50 rounded-2xl border-border text-xs"
                  />
                </div>
              </div>

              {/* MULTIMEDIA ATTACHMENT SECTION (IMAGE, VIDEO, AUDIO) */}
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-primary" />
                      <span>Multimedia Attachment (Image, Video or Audio)</span>
                    </Label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Enrich this notification with a visual graphic, video demo clip, or audio soundbite.
                    </p>
                  </div>

                  {/* Attachment Type Selector */}
                  <div className="flex items-center p-1 rounded-2xl bg-card border border-border shrink-0">
                    <button
                      type="button"
                      onClick={() => { setAttachmentType('none'); setAttachmentUrl(''); setAttachmentName(''); }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                        attachmentType === 'none' ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAttachmentType('image'); if (!attachmentUrl.startsWith('data:image')) setAttachmentUrl(''); }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer",
                        attachmentType === 'image' ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAttachmentType('video'); if (!attachmentUrl.startsWith('data:video')) setAttachmentUrl(''); }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer",
                        attachmentType === 'video' ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Video className="w-3 h-3" />
                      <span>Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAttachmentType('audio'); if (!attachmentUrl.startsWith('data:audio')) setAttachmentUrl(''); }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer",
                        attachmentType === 'audio' ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Music className="w-3 h-3" />
                      <span>Audio</span>
                    </button>
                  </div>
                </div>

                {/* Attachment Controls based on selection */}
                {attachmentType !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2"
                  >
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Input
                          value={attachmentUrl}
                          onChange={(e) => {
                            setAttachmentUrl(e.target.value);
                            setAttachmentName(attachmentType === 'video' ? 'Stream Video' : attachmentType === 'audio' ? 'Stream Audio' : 'Web Image');
                          }}
                          placeholder={
                            attachmentType === 'image'
                              ? "https://... image URL (PNG, JPG, WebP) or upload file"
                              : attachmentType === 'video'
                              ? "https://... direct video URL (.mp4, .webm) or upload short clip (<750KB)"
                              : "https://... direct audio URL (.mp3, .wav, .ogg) or upload clip (<750KB)"
                          }
                          className="h-12 bg-card rounded-2xl border-border text-xs font-mono pr-10"
                        />
                        {attachmentUrl && (
                          <button
                            type="button"
                            onClick={() => { setAttachmentUrl(''); setAttachmentName(''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center text-xs"
                            title="Clear Attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* File Upload Trigger */}
                      <label className="h-12 px-5 rounded-2xl bg-card hover:bg-muted border border-border flex items-center justify-center cursor-pointer text-xs font-black uppercase tracking-wider shrink-0 transition-colors shadow-xs">
                        <input
                          type="file"
                          accept={
                            attachmentType === 'image'
                              ? "image/*"
                              : attachmentType === 'video'
                              ? "video/mp4,video/webm"
                              : "audio/mpeg,audio/wav,audio/ogg"
                          }
                          onChange={(e) => handleFileUpload(e, false)}
                          disabled={isProcessingMedia}
                          className="hidden"
                        />
                        {isProcessingMedia ? (
                          <span className="flex items-center gap-1.5 animate-pulse text-primary">
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-primary" />
                            Upload {attachmentType}
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Interactive Live Media Player Preview */}
                    {attachmentUrl && (
                      <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                          <span className="flex items-center gap-1.5">
                            {attachmentType === 'image' && <ImageIcon className="w-3.5 h-3.5 text-amber-500" />}
                            {attachmentType === 'video' && <Video className="w-3.5 h-3.5 text-purple-500" />}
                            {attachmentType === 'audio' && <Music className="w-3.5 h-3.5 text-cyan-500" />}
                            <span>Live {attachmentType} Preview {attachmentName && `(${attachmentName})`}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => { setAttachmentUrl(''); setAttachmentName(''); }}
                            className="text-red-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>

                        {attachmentType === 'image' && (
                          <div className="relative aspect-[16/9] max-h-56 w-full rounded-xl overflow-hidden bg-black/10 border border-border">
                            <img
                              src={attachmentUrl}
                              alt="Attachment Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {attachmentType === 'video' && (
                          <div className="rounded-xl overflow-hidden bg-black border border-border">
                            <video
                              controls
                              className="w-full max-h-64 object-contain mx-auto"
                              src={attachmentUrl}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}

                        {attachmentType === 'audio' && (
                          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0">
                              <Music className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-mono text-muted-foreground truncate mb-1">
                                {attachmentName || 'Audio Transmission Track'}
                              </p>
                              <audio
                                controls
                                className="w-full h-8"
                                src={attachmentUrl}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Real-Time Live Toast Preview */}
              {(title || message) && (
                <div className="space-y-2 pt-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Live Visitor Toast Alert Preview
                  </Label>
                  <div className="bg-[#FAF3DD] dark:bg-[#181714] text-[#1C1B17] dark:text-[#F4EFE6] p-4 rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] max-w-md shadow-lg flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#FDE694]/30 dark:bg-[#FDE694]/15 border border-[#FDE694]/50 flex items-center justify-center shrink-0 text-amber-700 dark:text-[#FDE694] mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-700 dark:text-[#FDE694]">
                          LIVE TRANSMISSION • {customCategory || TYPE_CONFIG[selectedType].label}
                        </p>
                      </div>
                      <h5 className="font-black text-xs uppercase tracking-tight truncate mt-0.5">
                        {title || 'Transmission Title Preview'}
                      </h5>
                      <p className="text-[11px] text-[#787567] dark:text-[#BDB8A4] leading-relaxed line-clamp-2 mt-0.5">
                        {message || 'Your transmission message will appear here for all online users.'}
                      </p>

                      {/* Attached media indicator in preview */}
                      {attachmentType !== 'none' && attachmentUrl && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[9px] font-mono">
                          {attachmentType === 'image' && <ImageIcon className="w-3 h-3 text-amber-600" />}
                          {attachmentType === 'video' && <Video className="w-3 h-3 text-purple-600" />}
                          {attachmentType === 'audio' && <Music className="w-3 h-3 text-cyan-600" />}
                          <span className="uppercase font-bold">{attachmentType} Attached</span>
                        </div>
                      )}

                      {link && (
                        <span className="block mt-2 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-[#FDE694]">
                          Inspect Release →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isPublishing || !title.trim() || !message.trim()}
                  className="h-13 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-lg shadow-primary/25 hover:opacity-90 transition-all cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Broadcasting Transmission...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Dispatch Transmission to All Users
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Transmission History & Management */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Transmission Log & History
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Live records in Firestore with full edit and revoke authority ({filteredNotifications.length} items)
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transmissions..."
                  className="h-10 pl-9 rounded-xl bg-card border-border text-xs"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Button
                type="button"
                size="sm"
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('all')}
                className="rounded-full text-[10px] font-black uppercase px-3.5 h-8"
              >
                All ({notifications.length})
              </Button>

              <Button
                type="button"
                size="sm"
                variant={activeFilter === 'media' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('media')}
                className="rounded-full text-[10px] font-black uppercase px-3.5 h-8 gap-1 border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
              >
                <Paperclip className="w-3 h-3" />
                <span>With Media ({stats.withMedia})</span>
              </Button>

              {(Object.keys(TYPE_CONFIG) as NotificationType[]).map((type) => {
                const count = notifications.filter(n => n.type === type).length;
                const config = TYPE_CONFIG[type];
                return (
                  <Button
                    key={type}
                    type="button"
                    size="sm"
                    variant={activeFilter === type ? 'default' : 'outline'}
                    onClick={() => setActiveFilter(type)}
                    className="rounded-full text-[10px] font-black uppercase px-3.5 h-8 gap-1"
                  >
                    <span>{config.label}</span>
                    <span className="opacity-70">({count})</span>
                  </Button>
                );
              })}
            </div>

            {/* History List */}
            {isLoading ? (
              <div className="p-12 text-center">
                <RotateCcw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                  Synchronizing Transmission Registry...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="p-12 text-center rounded-[2.5rem] bg-card/30 border-border">
                <Bell className="w-10 h-10 mx-auto text-muted-foreground opacity-30 mb-3" />
                <h4 className="font-black text-sm uppercase">No Transmissions Found</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? 'Try adjusting your search query.' : 'Broadcast your first notification using the composer above.'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotifications.map((item) => {
                  const config = TYPE_CONFIG[item.type || 'announcement'] || TYPE_CONFIG.announcement;
                  const Icon = config.icon;
                  const attType = item.attachmentType || (item.imageUrl ? 'image' : item.videoUrl ? 'video' : item.audioUrl ? 'audio' : 'none');
                  const attUrl = item.attachmentUrl || item.imageUrl || item.videoUrl || item.audioUrl;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "p-5 rounded-3xl bg-card border transition-all flex flex-col justify-between group shadow-sm hover:shadow-md",
                        item.priority === 'high' 
                          ? "border-rose-500/40 bg-gradient-to-b from-card to-rose-500/[0.03]" 
                          : "border-border/80 hover:border-primary/40"
                      )}
                    >
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center border", config.bg, config.border)}>
                              <Icon className={cn("w-3.5 h-3.5", config.color)} />
                            </div>
                            <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", config.border, config.color)}>
                              {item.category || config.label}
                            </Badge>

                            {/* Media Type Badge */}
                            {attType !== 'none' && (
                              <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 flex items-center gap-1">
                                {attType === 'image' && <ImageIcon className="w-2.5 h-2.5" />}
                                {attType === 'video' && <Video className="w-2.5 h-2.5" />}
                                {attType === 'audio' && <Music className="w-2.5 h-2.5" />}
                                <span>{attType}</span>
                              </Badge>
                            )}

                            {item.priority === 'high' && (
                              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[8px] font-black uppercase px-1.5 py-0.5">
                                HIGH
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono shrink-0">
                            <Clock className="w-3 h-3 opacity-60" />
                            <span>{formatTimestamp(item.createdAt)}</span>
                          </div>
                        </div>

                        {/* Title & Message */}
                        <div>
                          <h4 className="font-black text-sm uppercase tracking-tight text-foreground line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                            {item.message}
                          </p>
                        </div>

                        {/* Multimedia Inline Preview */}
                        {attUrl && (
                          <div className="mt-2 pt-2 border-t border-border/40">
                            {attType === 'image' && (
                              <div className="relative aspect-[16/9] max-h-40 w-full rounded-2xl overflow-hidden bg-black/10 border border-border/60">
                                <img
                                  src={attUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {attType === 'video' && (
                              <div className="rounded-2xl overflow-hidden bg-black border border-border/60">
                                <video
                                  controls
                                  preload="metadata"
                                  className="w-full max-h-44 object-contain"
                                  src={attUrl}
                                />
                              </div>
                            )}

                            {attType === 'audio' && (
                              <div className="p-2.5 rounded-2xl bg-muted/30 border border-border/60">
                                <audio
                                  controls
                                  preload="none"
                                  className="w-full h-8"
                                  src={attUrl}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-4 mt-3 border-t border-border/40 flex items-center justify-between gap-2">
                        <div className="text-[9px] font-black uppercase text-muted-foreground truncate">
                          By: <span className="text-foreground">{item.author || 'Admin'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.link && (
                            <Link
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              title="Open Target Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDuplicateToComposer(item)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            title="Duplicate to Composer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Edit Transmission & Attachments"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Revoke / Delete Transmission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* EDIT NOTIFICATION MODAL WITH ATTACHMENT CONTROLS */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-card rounded-[2.5rem] p-6 sm:p-8 max-w-xl border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase font-black flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Edit Transmission & Media Attachment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the headline, message, category, priority, or attached image/video/audio.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 mt-4">
              {/* Category / Type */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase">Category Type</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(TYPE_CONFIG) as NotificationType[]).map((type) => {
                    const isSelected = editingItem.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, type })}
                        className={cn(
                          "px-2 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer",
                          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 border-border text-muted-foreground"
                        )}
                      >
                        {TYPE_CONFIG[type].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase">Headline *</Label>
                <Input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="h-11 bg-muted rounded-xl text-xs font-bold"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase">Message Summary *</Label>
                <Textarea
                  value={editingItem.message}
                  onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                  rows={3}
                  className="bg-muted rounded-xl text-xs"
                />
              </div>

              {/* Target Link & Category Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase">Target Link</Label>
                  <Input
                    value={editingItem.link || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                    className="h-11 bg-muted rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase">Priority</Label>
                  <select
                    value={editingItem.priority || 'normal'}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as 'normal' | 'high' })}
                    className="h-11 px-3 w-full bg-muted border border-border rounded-xl text-xs font-bold uppercase cursor-pointer"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Alert Priority</option>
                  </select>
                </div>
              </div>

              {/* Attachment Editor */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-primary" />
                    <span>Attached Media</span>
                  </Label>

                  {/* Attachment Type Selector */}
                  <div className="flex items-center p-0.5 rounded-xl bg-card border border-border">
                    <button
                      type="button"
                      onClick={() => setEditingItem({ 
                        ...editingItem, 
                        attachmentType: 'none', 
                        attachmentUrl: undefined, 
                        imageUrl: undefined, 
                        videoUrl: undefined, 
                        audioUrl: undefined 
                      })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer",
                        (!editingItem.attachmentType || editingItem.attachmentType === 'none') ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, attachmentType: 'image' })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer",
                        editingItem.attachmentType === 'image' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, attachmentType: 'video' })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer",
                        editingItem.attachmentType === 'video' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, attachmentType: 'audio' })}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer",
                        editingItem.attachmentType === 'audio' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      Audio
                    </button>
                  </div>
                </div>

                {editingItem.attachmentType && editingItem.attachmentType !== 'none' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <Input
                        value={editingItem.attachmentUrl || editingItem.imageUrl || editingItem.videoUrl || editingItem.audioUrl || ''}
                        onChange={(e) => setEditingItem({ 
                          ...editingItem, 
                          attachmentUrl: e.target.value,
                          imageUrl: editingItem.attachmentType === 'image' ? e.target.value : undefined,
                          videoUrl: editingItem.attachmentType === 'video' ? e.target.value : undefined,
                          audioUrl: editingItem.attachmentType === 'audio' ? e.target.value : undefined,
                        })}
                        placeholder={`Direct ${editingItem.attachmentType} URL or upload file below`}
                        className="h-10 bg-card rounded-xl font-mono text-xs flex-1"
                      />
                      <label className="h-10 px-3 rounded-xl bg-card hover:bg-muted border border-border flex items-center justify-center cursor-pointer text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors">
                        <input
                          type="file"
                          accept={
                            editingItem.attachmentType === 'image'
                              ? "image/*"
                              : editingItem.attachmentType === 'video'
                              ? "video/mp4,video/webm"
                              : "audio/mpeg,audio/wav,audio/ogg"
                          }
                          onChange={(e) => handleFileUpload(e, true)}
                          disabled={isProcessingEditMedia}
                          className="hidden"
                        />
                        {isProcessingEditMedia ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            Upload
                          </span>
                        )}
                      </label>
                    </div>

                    {/* Live Preview within edit modal */}
                    {(editingItem.attachmentUrl || editingItem.imageUrl || editingItem.videoUrl || editingItem.audioUrl) && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-border p-2 bg-card">
                        {editingItem.attachmentType === 'image' && (
                          <img
                            src={editingItem.attachmentUrl || editingItem.imageUrl}
                            alt="Edit Preview"
                            className="w-full max-h-40 object-cover rounded-lg"
                          />
                        )}
                        {editingItem.attachmentType === 'video' && (
                          <video
                            controls
                            className="w-full max-h-44 object-contain rounded-lg bg-black"
                            src={editingItem.attachmentUrl || editingItem.videoUrl}
                          />
                        )}
                        {editingItem.attachmentType === 'audio' && (
                          <audio
                            controls
                            className="w-full h-8"
                            src={editingItem.attachmentUrl || editingItem.audioUrl}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl font-black uppercase text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editingItem.title.trim() || !editingItem.message.trim()}
                  className="rounded-xl font-black uppercase text-xs bg-primary text-primary-foreground shadow-md"
                >
                  {isSavingEdit ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="bg-card rounded-[2.5rem] p-8 max-w-md border-border">
          <DialogHeader>
            <DialogTitle className="uppercase font-black text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Revoke Transmission
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
              Are you sure you want to permanently delete <strong className="text-foreground">{itemToDelete?.title}</strong>? It will be removed immediately from the live feed and user notification logs.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemToDelete(null)}
              className="rounded-xl font-black uppercase text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl font-black uppercase text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete Transmission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
