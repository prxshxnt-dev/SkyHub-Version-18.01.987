'use client';

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Upload, 
  Users, 
  Loader2, 
  Sparkles, 
  Check, 
  RotateCcw,
  UserCheck,
  Terminal,
  Wrench,
  ShieldCheck,
  Github,
  Send,
  Search,
  Settings2,
  Briefcase,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { compressImage } from '@/lib/image-upload';
import { TEAM_MEMBERS } from '@/lib/sky-data';

export function CreditsManager() {
  const db = useFirestore();
  const creditsQuery = useMemoFirebase(
    () => (db ? query(collection(db, 'credits'), orderBy('order', 'asc')) : null),
    [db]
  );
  const { data: credits, isLoading } = useCollection(creditsQuery);

  // Section Header doc
  const headerRef = useMemoFirebase(() => (db ? doc(db, 'settings', 'credits_header') : null), [db]);
  const { data: headerData } = useDoc<any>(headerRef);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHeaderDialogOpen, setIsHeaderDialogOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'developer' | 'maintainer' | 'community'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Header form states
  const [headerTitle, setHeaderTitle] = useState('CREDITS & MAINTAINERS');
  const [headerSubtitle, setHeaderSubtitle] = useState('The developers, device maintainers, and contributors driving the SKY ecosystem.');

  useEffect(() => {
    if (headerData) {
      if (headerData.title) setHeaderTitle(headerData.title);
      if (headerData.subtitle) setHeaderSubtitle(headerData.subtitle);
    }
  }, [headerData]);

  // Form states
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState('Maintainer');
  const [type, setType] = useState<'developer' | 'maintainer' | 'community'>('maintainer');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const openCreateDialog = () => {
    setEditingCredit(null);
    setName('');
    setHandle('');
    setRole('Maintainer');
    setType('maintainer');
    setAvatarUrl('');
    setBio('');
    setGithubUrl('');
    setTelegramUrl('');
    setPortfolioUrl('');
    setOrder((credits?.length || 0) + 1);
    setAvatarPreview(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (credit: any) => {
    setEditingCredit(credit);
    setName(credit.name || '');
    setHandle(credit.handle || '');
    setRole(credit.role || 'Maintainer');
    setType(credit.type || 'maintainer');
    setAvatarUrl(credit.avatarUrl || '');
    setBio(credit.bio || '');
    setGithubUrl(credit.githubUrl || '');
    setTelegramUrl(credit.telegramUrl || '');
    setPortfolioUrl(credit.portfolioUrl || credit.websiteUrl || '');
    setOrder(credit.order ?? 1);
    setAvatarPreview(credit.avatarUrl || null);
    setIsDialogOpen(true);
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      setAvatarUrl(compressedDataUrl);
      setAvatarPreview(compressedDataUrl);
      toast({
        title: 'Avatar Processed',
        description: `${file.name} ready to save.`,
      });
    } catch (err: any) {
      console.error('Avatar compression error:', err);
      toast({
        variant: 'destructive',
        title: 'File Error',
        description: err.message || 'Could not process avatar image.',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'credits_header'), {
        title: headerTitle.trim() || 'CREDITS & MAINTAINERS',
        subtitle: headerSubtitle.trim() || 'The developers, device maintainers, and contributors driving the SKY ecosystem.',
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: 'Credit Section Header Saved',
        description: 'The heading and tagline below wallpapers have been updated.',
      });
      setIsHeaderDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Could not save header.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name is required.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const creditId = editingCredit?.id || `credit_${Date.now()}`;
      const creditRef = doc(db, 'credits', creditId);

      const creditData = {
        id: creditId,
        name: name.trim(),
        handle: handle.trim(),
        role: role.trim() || 'Contributor',
        type: type || 'maintainer',
        avatarUrl: avatarUrl.trim(),
        bio: bio.trim(),
        githubUrl: githubUrl.trim(),
        telegramUrl: telegramUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        order: Number(order) || 1,
        updatedAt: serverTimestamp(),
        createdAt: editingCredit?.createdAt || serverTimestamp(),
      };

      await setDoc(creditRef, creditData, { merge: true });

      toast({
        title: editingCredit ? 'Credit Updated' : 'Credit Member Added',
        description: `"${name}" saved to the credits & team section.`,
      });

      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving credit member:', err);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Could not save member to Firestore.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCredit = async (creditId: string, memberName: string) => {
    if (!db) return;
    if (!confirm(`Are you sure you want to delete "${memberName}" from the credits section?`)) return;

    try {
      await deleteDoc(doc(db, 'credits', creditId));
      toast({
        title: 'Member Removed',
        description: `"${memberName}" removed from credits.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: err.message || 'Could not delete member.',
      });
    }
  };

  const handleSeedTeam = async () => {
    if (!db) return;
    if (!confirm('This will import all existing team members and maintainers into the Firestore "credits" collection so you can edit or delete each one. Continue?')) {
      return;
    }

    setIsSeeding(true);
    try {
      let orderIndex = 1;
      for (const m of TEAM_MEMBERS) {
        const creditId = `team_${m.id || orderIndex}`;
        const creditRef = doc(db, 'credits', creditId);

        let mappedType: 'developer' | 'maintainer' | 'community' = 'maintainer';
        if (m.type === 'core' || m.type === 'developer' || (m.role || '').includes('Developer') || (m.role || '').includes('Founder')) {
          mappedType = 'developer';
        } else if (m.type === 'maintainer' && !(m.role || '').includes('Ex-')) {
          mappedType = 'maintainer';
        } else {
          mappedType = 'community';
        }

        await setDoc(creditRef, {
          id: creditId,
          name: m.name,
          handle: m.handle || '',
          role: m.role || 'Contributor',
          type: mappedType,
          avatarUrl: m.avatarUrl || '',
          bio: m.bio || '',
          githubUrl: m.githubUrl || '',
          telegramUrl: m.telegramUrl || '',
          portfolioUrl: (m as any).portfolioUrl || '',
          order: orderIndex++,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }

      toast({
        title: 'Team Credits Seeded',
        description: `Successfully loaded ${TEAM_MEMBERS.length} team members into Firestore! You can now edit or delete any of them.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: err.message || 'Could not seed team members.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredCredits = credits?.filter((c: any) => {
    if (activeFilter !== 'all' && c.type !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchHandle = (c.handle || '').toLowerCase().includes(q);
      const matchRole = (c.role || '').toLowerCase().includes(q);
      const matchBio = (c.bio || '').toLowerCase().includes(q);
      return matchName || matchHandle || matchRole || matchBio;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FDE694]/30 text-[#121212] dark:text-[#FDE694]">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
              Credits & Team Section
            </h2>
          </div>
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4]">
            Manage the credit section content located directly below the wallpaper section. Add, edit, or delete maintainers, developers, and contributors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsHeaderDialogOpen(true)}
            className="rounded-2xl text-xs font-bold border-[#EBE4CF] dark:border-[#36342A] gap-1.5 cursor-pointer bg-white/70 dark:bg-black/30"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Edit Section Header</span>
          </Button>

          {(!credits || credits.length === 0) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSeedTeam}
              disabled={isSeeding}
              className="rounded-2xl text-xs font-bold border-[#FDE694] text-[#121212] dark:text-[#FDE694] hover:bg-[#FDE694]/20 gap-2 cursor-pointer"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              <span>Import Default Team into Credits</span>
            </Button>
          )}

          <Button
            type="button"
            onClick={openCreateDialog}
            className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credit Member</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787567]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member, handle, or role..."
            className="pl-9 rounded-2xl bg-[#FAF3DD] dark:bg-[#1A1914] border-[#EBE4CF] dark:border-[#36342A] text-xs h-10"
          />
        </div>

        {/* Filter Tabs */}
        {credits && credits.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] w-fit">
            {[
              { id: 'all', label: `All (${credits.length})` },
              { id: 'developer', label: 'Developers' },
              { id: 'maintainer', label: 'Maintainers' },
              { id: 'community', label: 'Community' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#FDE694] text-[#121212] shadow-2xs'
                    : 'text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#FDE694]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#787567]">Loading Credits Registry...</p>
        </div>
      ) : credits && credits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCredits.map((member: any, idx: number) => {
            const initials = (member.name || 'SK')
              .split(' ')
              .filter(Boolean)
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <Card
                key={member.id || idx}
                className="p-5 rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs flex flex-col justify-between group hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFF8E1] to-[#FAF3DD] dark:from-[#202024] dark:to-[#181714] border border-[#EBE4CF] dark:border-[#36342A] overflow-hidden shrink-0 flex items-center justify-center font-black text-sm text-[#49473E] dark:text-[#F4EFE6]">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-black text-[#1C1B17] dark:text-[#F4EFE6] truncate">
                        {member.name}
                      </h4>
                      <span className="text-[10px] font-bold text-[#787567] dark:text-[#8E8A7A]">
                        #{member.order ?? idx + 1}
                      </span>
                    </div>

                    {member.handle && (
                      <span className="text-xs font-mono text-[#787567] dark:text-[#BDB8A4] block">
                        {member.handle}
                      </span>
                    )}

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDE694]/40 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/50">
                        {member.role || 'Maintainer'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-black/5 dark:bg-white/10 text-[#49473E] dark:text-[#BDB8A4]">
                        {member.type}
                      </span>
                    </div>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed line-clamp-2">
                    {member.bio}
                  </p>
                )}

                {/* Footer and Links */}
                <div className="pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {member.portfolioUrl && (
                      <a
                        href={member.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#FDE694]/30 transition-colors"
                        title="View Portfolio"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.githubUrl && (
                      <a
                        href={member.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#787567] hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#EBE4CF]/60 dark:hover:bg-[#2B2A22] transition-colors"
                        title="GitHub"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.telegramUrl && (
                      <a
                        href={member.telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#787567] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="Telegram"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(member)}
                      className="rounded-xl text-xs font-bold gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCredit(member.id, member.name)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-12 border-2 border-dashed border-[#EBE4CF] dark:border-[#36342A] rounded-3xl space-y-4 bg-[#FAF3DD]/40 dark:bg-[#1A1914]/40">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FDE694]/20 flex items-center justify-center text-[#121212] dark:text-[#FDE694]">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1C1B17] dark:text-[#F4EFE6]">
              No Custom Credits in Firestore
            </h3>
            <p className="text-xs text-[#787567] dark:text-[#BDB8A4] max-w-md mx-auto">
              The credits section is currently using the static team list. Click below to load all team members into Firestore so you can edit their roles, links, or delete anyone.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleSeedTeam}
            disabled={isSeeding}
            className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 cursor-pointer shadow-xs"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Import All Existing Team Members into Credits</span>
          </Button>
        </div>
      )}

      {/* Edit Header Dialog */}
      <Dialog open={isHeaderDialogOpen} onOpenChange={setIsHeaderDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
              Edit Credit Section Header
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveHeader} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Section Title
              </Label>
              <Input
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                placeholder="CREDITS & MAINTAINERS"
                required
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Tagline / Description
              </Label>
              <Textarea
                value={headerSubtitle}
                onChange={(e) => setHeaderSubtitle(e.target.value)}
                placeholder="The developers, device maintainers, and contributors driving the SKY ecosystem."
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs min-h-[70px]"
              />
            </div>

            <div className="pt-4 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsHeaderDialogOpen(false)}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 cursor-pointer shadow-xs"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Header</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit / Create Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-3xl bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#1C1B17] dark:text-[#F4EFE6]">
              {editingCredit ? 'Edit Credit Member' : 'Add Credit Member'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCredit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Full Name *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amit, Tushar, Prashant"
                  required
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Telegram / Handle
                </Label>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@username"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Role Title (e.g. Founder + Developer)
                </Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Core Developer + Maintainer"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Section Category
                </Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/40 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium text-[#1C1B17] dark:text-[#F4EFE6] focus:outline-none"
                >
                  <option value="developer">Developer</option>
                  <option value="maintainer">Maintainer</option>
                  <option value="community">Community / Tester</option>
                </select>
              </div>
            </div>

            {/* Avatar upload / link */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-[#EBE4CF] dark:border-[#36342A]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Avatar Picture
                </Label>
                {avatarPreview && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Image Loaded
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#FDE694] dark:border-[#FDE694]/40 bg-[#FDE694]/15 hover:bg-[#FDE694]/25 text-[#121212] dark:text-[#FDE694] text-xs font-bold cursor-pointer transition-colors">
                  {isCompressing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isCompressing ? 'Compressing...' : 'Upload Avatar Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isCompressing}
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#787567] dark:text-[#9C9888] block mb-1">
                  Or enter Avatar URL:
                </span>
                <Input
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setAvatarPreview(e.target.value || null);
                  }}
                  placeholder="https://... or /admins/username/pfp.jpg"
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>

              {avatarPreview && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#EBE4CF] dark:border-[#36342A] bg-black/40">
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/100x100/222/white?text=Avatar';
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#787567] dark:text-[#BDB8A4]">
                    Avatar preview confirmed
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Bio / Contribution Summary
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Core developer maintaining DT/kernel work, custom builds, and device trees..."
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  GitHub Profile Link
                </Label>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                  Telegram Link
                </Label>
                <Input
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Portfolio / Website Link</span>
                </Label>
                <span className="text-[10px] text-[#787567] dark:text-[#8E8A7A]">Optional</span>
              </div>
              <Input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev or https://github.com/..."
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#49473E] dark:text-[#C5C0AF]">
                Display Order Number
              </Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={1}
                max={999}
                className="rounded-xl bg-white/70 dark:bg-black/40 border-[#EBE4CF] dark:border-[#36342A] text-xs"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isCompressing}
                className="rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] gap-2 cursor-pointer shadow-xs"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{editingCredit ? 'Update Member' : 'Add to Credits'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreditsManager;
