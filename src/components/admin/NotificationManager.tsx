'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  Edit3, 
  Search, 
  Plus, 
  Radio, 
  Package, 
  ShieldAlert, 
  Smartphone, 
  Zap, 
  BookOpen, 
  Volume2, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Check, 
  RotateCcw, 
  Upload, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Filter,
  Eye
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
  serverTimestamp, 
  limit 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from '@/hooks/use-toast';
import { 
  publishNotification, 
  playNotificationChime, 
  NotificationType 
} from '@/lib/notifications';
import { compressImage } from '@/lib/image-upload';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: string;
  link?: string;
  imageUrl?: string;
  author?: string;
  createdAt?: any;
  priority?: string;
  version?: string;
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
  const currentUser = useUser();

  const userProfileRef = useMemoFirebase(() => 
    (currentUser && db) ? doc(db, 'users', currentUser.uid) : null
  , [db, currentUser]);
  const { data: profile } = useDoc(userProfileRef);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');

  // Push Composer State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType>('rom');
  const [link, setLink] = useState('/#roms');
  const [customCategory, setCustomCategory] = useState('');
  const [versionTag, setVersionTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<NotificationRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirm Modal State
  const [itemToDelete, setItemToDelete] = useState<NotificationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Live Firestore subscription
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

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file, 800, 800, 0.85);
      setImageUrl(compressed);
      toast({
        title: "Thumbnail Processed",
        description: "Image compressed and attached to transmission.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Image Upload Failed",
        description: err.message || "Failed to process image.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Dispatch Notification to all users
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please specify both a title and message for the broadcast.",
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
        imageUrl: imageUrl.trim() || undefined,
        author: authorName,
      });

      if (publishedId) {
        // Also play local chime to confirm sound
        playNotificationChime();

        toast({
          title: "Transmission Broadcasted",
          description: "All online users have received the live alert and bell badge.",
        });

        // Reset form fields
        setTitle('');
        setMessage('');
        setImageUrl('');
        setCustomCategory('');
        setVersionTag('');
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

  // Duplicate / Prefill into Composer
  const handleDuplicateToComposer = (item: NotificationRecord) => {
    setTitle(item.title);
    setMessage(item.message);
    setSelectedType(item.type);
    setLink(item.link || '/#notifications');
    setImageUrl(item.imageUrl || '');
    setCustomCategory(item.category || '');
    
    // Smooth scroll to top composer
    window.scrollTo({ top: 200, behavior: 'smooth' });

    toast({
      title: "Transmission Loaded",
      description: "Data copied into the broadcast composer.",
    });
  };

  // Save Edits to an Existing Notification
  const handleSaveEdit = async () => {
    if (!editingItem || !db) return;
    setIsSavingEdit(true);

    try {
      const ref = doc(db, 'notifications', editingItem.id);
      await updateDoc(ref, {
        title: editingItem.title.trim(),
        message: editingItem.message.trim(),
        type: editingItem.type,
        link: editingItem.link?.trim() || null,
        category: editingItem.category?.trim() || null,
        imageUrl: editingItem.imageUrl || null,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Transmission Updated",
        description: "The historical record has been updated in Firestore.",
      });
      setEditingItem(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "Could not update notification.",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete || !db) return;
    setIsDeleting(true);

    try {
      const ref = doc(db, 'notifications', itemToDelete.id);
      await deleteDoc(ref);

      toast({
        title: "Transmission Deleted",
        description: "Removed from registry and user feeds.",
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
      // Type filter
      if (activeFilter !== 'all' && item.type !== activeFilter) return false;

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
      apks: notifications.filter(n => n.type === 'apk').length,
      announcements: notifications.filter(n => n.type === 'announcement').length,
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
              Broadcast instant transmissions to online users & manage feed history
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={playNotificationChime}
            className="h-11 rounded-2xl border-border text-xs font-black uppercase tracking-wider px-4 hover:bg-muted"
          >
            <Volume2 className="w-4 h-4 mr-2 text-amber-500" />
            <span>Test Sound Chime</span>
          </Button>
          <a
            href="/#notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 inline-flex items-center rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider px-4 hover:bg-primary/20 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            <span>Preview User Feed</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
        <Card className="p-4 rounded-2xl bg-emerald-500/5 border-emerald-500/20">
          <p className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Modules</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.modules}</p>
        </Card>
        <Card className="p-4 rounded-2xl bg-cyan-500/5 border-cyan-500/20">
          <p className="text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest">Mod APKs</p>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{stats.apks}</p>
        </Card>
        <Card className="p-4 rounded-2xl bg-rose-500/5 border-rose-500/20">
          <p className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-widest">Announcements</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.announcements}</p>
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
                Triggers live toast alert, audio chime & navbar unread badge
              </p>
            </div>
          </div>

          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-black text-[9px] px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            LIVE MULTICAST
          </Badge>
        </div>

        <form onSubmit={handlePublish} className="mt-8 space-y-6">
          {/* Category / Type Selector */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
              Select Release Type
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
                placeholder="e.g. PixelOS Android 15 Official Port"
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
              <span>Notification Message / Changelog Summary *</span>
              <span className="text-[8px] text-muted-foreground">{message.length}/300</span>
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide a concise release breakdown, highlights, or community bulletin that will be delivered directly to all users."
              maxLength={300}
              required
              rows={3}
              className="bg-muted/50 rounded-2xl border-border text-xs leading-relaxed"
            />
          </div>

          {/* Optional Image & Custom Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                Visual Thumbnail / Icon (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... image URL or upload below"
                  className="h-12 bg-muted/50 rounded-2xl border-border text-xs flex-1 font-mono"
                />
                <label className="h-12 px-4 rounded-2xl bg-muted/70 hover:bg-muted border border-border flex items-center justify-center cursor-pointer text-xs font-black uppercase tracking-wider shrink-0 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  {isUploadingImage ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </span>
                  )}
                </label>
              </div>

              {imageUrl && (
                <div className="relative inline-block mt-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]"
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                Custom Tag or Version (Optional)
              </Label>
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Official v2.4, Security Patch"
                className="h-12 bg-muted/50 rounded-2xl border-border text-xs"
              />
              <p className="text-[9px] text-muted-foreground uppercase">
                Overrides the default category badge if specified.
              </p>
            </div>
          </div>

          {/* Real-Time Preview Card */}
          {(title || message) && (
            <div className="space-y-2 pt-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Live Toast Preview
              </Label>
              <div className="bg-[#FAF3DD] dark:bg-[#181714] text-[#1C1B17] dark:text-[#F4EFE6] p-4 rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] max-w-md shadow-lg flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FDE694]/30 dark:bg-[#FDE694]/15 border border-[#FDE694]/50 flex items-center justify-center shrink-0 text-amber-700 dark:text-[#FDE694] mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-amber-700 dark:text-[#FDE694]">
                    LIVE TRANSMISSION • {customCategory || TYPE_CONFIG[selectedType].label}
                  </p>
                  <h5 className="font-black text-xs uppercase tracking-tight truncate mt-0.5">
                    {title || 'Transmission Title Preview'}
                  </h5>
                  <p className="text-[11px] text-[#787567] dark:text-[#BDB8A4] leading-relaxed line-clamp-2 mt-0.5">
                    {message || 'Your transmission message will appear here for all online users.'}
                  </p>
                  {link && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-[#FDE694] mt-1.5">
                      <span>Inspect Release</span>
                      <ExternalLink className="w-3 h-3" />
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
              Live records persisted in Firestore ({filteredNotifications.length} displayed)
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
            className="rounded-full text-[10px] font-black uppercase px-3 h-7"
          >
            All ({notifications.length})
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
                className="rounded-full text-[10px] font-black uppercase px-3 h-7 gap-1"
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
              Synchronizing Transmission Log...
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
              const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
              const Icon = config.icon;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-5 rounded-3xl bg-card border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center border", config.bg, config.border)}>
                          <Icon className={cn("w-3.5 h-3.5", config.color)} />
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", config.border, config.color)}>
                          {item.category || config.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <Clock className="w-3 h-3 opacity-60" />
                        <span>{formatTimestamp(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-border/70"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-sm uppercase tracking-tight text-foreground line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                          {item.message}
                        </p>
                      </div>
                    </div>
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
                          title="Open Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDuplicateToComposer(item)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Re-broadcast / Duplicate to Composer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit Transmission"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Transmission"
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

      {/* Edit Notification Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-card rounded-[2.5rem] p-8 max-w-lg border-border">
          <DialogHeader>
            <DialogTitle className="uppercase font-black flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Edit Transmission
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the headline, message, or link for this historical record.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Title</Label>
                <Input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="h-12 bg-muted rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Message</Label>
                <Textarea
                  value={editingItem.message}
                  onChange={(e) => setEditingItem({ ...editingItem, message: e.target.value })}
                  rows={3}
                  className="bg-muted rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Target Link</Label>
                <Input
                  value={editingItem.link || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                  className="h-12 bg-muted rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase">Thumbnail URL</Label>
                <Input
                  value={editingItem.imageUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="h-12 bg-muted rounded-xl font-mono text-xs"
                />
              </div>

              <DialogFooter className="mt-6 flex justify-end gap-2">
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
                  disabled={isSavingEdit}
                  className="rounded-xl font-black uppercase text-xs bg-primary text-primary-foreground"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
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
