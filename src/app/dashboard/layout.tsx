"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Shield, Key, ArrowLeft, LogIn, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

export const HARDCODED_SUPERADMIN_EMAIL = 'meinkxun@gmail.com';
export const HUB_OWNERS = [HARDCODED_SUPERADMIN_EMAIL, 'skyhubowner@gmail.com'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailInput, setEmailInput] = useState(HARDCODED_SUPERADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(() => 
    user ? doc(db, 'users', user.uid) : null
  , [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const userEmail = user?.email?.toLowerCase().trim();
  const isSuperAdmin = (userEmail === HARDCODED_SUPERADMIN_EMAIL) || (userEmail && HUB_OWNERS.includes(userEmail)) || profile?.role === 'super_admin';
  const isAdminRole = profile?.role === 'admin';
  const isDeveloperRole = profile?.role === 'developer';
  const hasAccess = isSuperAdmin || isAdminRole || isDeveloperRole;

  // Sync cookies whenever user state changes
  useEffect(() => {
    if (user?.email) {
      const normalized = user.email.toLowerCase().trim();
      document.cookie = `skyhub_auth_email=${encodeURIComponent(normalized)}; path=/; max-age=2592000; SameSite=Lax`;
      if (normalized === HARDCODED_SUPERADMIN_EMAIL || HUB_OWNERS.includes(normalized)) {
        document.cookie = `skyhub_admin_session=active; path=/; max-age=2592000; SameSite=Lax`;
      }
    }
  }, [user]);

  const grantSuperAdminSession = async (firebaseUser: any) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const isOwner = (firebaseUser.email?.toLowerCase().trim() === HARDCODED_SUPERADMIN_EMAIL) || HUB_OWNERS.includes(firebaseUser.email?.toLowerCase().trim());

      const updateData: Record<string, any> = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName || 'Super Admin',
        lastLogin: serverTimestamp(),
      };

      if (isOwner) {
        updateData.role = 'super_admin';
        updateData.canManageRoms = true;
        updateData.canManageModules = true;
        updateData.canManageApks = true;
        updateData.canManageWallpapers = true;
        updateData.canManageGuides = true;
      }

      await setDoc(userRef, updateData, { merge: true });

      const normalized = (firebaseUser.email || '').toLowerCase().trim();
      document.cookie = `skyhub_auth_email=${encodeURIComponent(normalized)}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `skyhub_admin_session=active; path=/; max-age=2592000; SameSite=Lax`;

      toast({
        title: "Clearance Granted",
        description: `Welcome, ${firebaseUser.email}. Administrative privileges active.`
      });
    } catch (err: any) {
      console.error("Error setting up superadmin document:", err);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await grantSuperAdminSession(result.user);
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      setAuthError(err.message || 'Google authentication failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !emailInput || !passwordInput) return;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      await grantSuperAdminSession(result.user);
    } catch (err: any) {
      console.error("Email sign in failed:", err);
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8E1] dark:bg-[#121212] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-3 border-[#FDE694]/30 border-t-[#FDE694] rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#787567] dark:text-[#BDB8A4] animate-pulse">
            Verifying Admin Bio-Signatures...
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated or lacks permission, show Clearance Terminal
  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-[#FFF8E1] dark:bg-[#121212] flex items-center justify-center p-4 sm:p-6 text-[#1C1B17] dark:text-[#F4EFE6]">
        <div className="w-full max-w-md bg-[#FAF3DD] dark:bg-[#1A1914] border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#FDE694]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FDE694]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FDE694]/20 border border-[#FDE694]/40 flex items-center justify-center text-[#121212] dark:text-[#FDE694] mb-4 shadow-sm">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              SKY Admin Terminal
            </h1>
            <p className="text-xs text-[#787567] dark:text-[#BDB8A4] mt-1.5 leading-relaxed">
              Elevated access required for administrative controls and ecosystem configuration.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FDE694]/30 text-[#121212] dark:text-[#FDE694] border border-[#FDE694]/40">
              <Sparkles className="w-3 h-3" />
              <span>Super Admin: {HARDCODED_SUPERADMIN_EMAIL}</span>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Primary Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSigningIn ? (
                <div className="w-4 h-4 border-2 border-[#121212]/30 border-t-[#121212] rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#EBE4CF] dark:border-[#36342A]" />
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#9C9888]">
                or Email Access
              </span>
              <div className="flex-grow border-t border-[#EBE4CF] dark:border-[#36342A]" />
            </div>

            {/* Email & Password Fallback */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#49473E] dark:text-[#C5C0AF] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="meinkxun@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FDE694]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#49473E] dark:text-[#C5C0AF] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/60 dark:bg-black/30 border border-[#EBE4CF] dark:border-[#36342A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FDE694]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#49473E] dark:bg-[#2B2921] text-[#FAF3DD] hover:bg-[#121212] dark:hover:bg-[#36342A] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Verify Credentials</span>
              </button>
            </form>

            <div className="pt-3 border-t border-[#EBE4CF] dark:border-[#36342A] flex justify-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-xs font-semibold text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#FDE694] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Site</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and cleared
  return (
    <div className="min-h-screen bg-[#FFF8E1] dark:bg-[#121212] pt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Main Site</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[#49473E] dark:text-[#BDB8A4]">
            Cleared: <span className="text-[#121212] dark:text-[#FDE694]">{user.email}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FDE694] text-[#121212]">
            {isSuperAdmin ? 'Super Admin' : (profile?.role || 'Admin')}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto pb-16 px-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
