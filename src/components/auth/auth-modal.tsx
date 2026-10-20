
'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Loader2, Chrome, Mail, Key, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const HUB_OWNERS = ['meinkxun@gmail.com', 'skyhubowner@gmail.com'];

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const auth = useAuth();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'google' | 'email'>('email');
  const [email, setEmail] = useState('meinkxun@gmail.com');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const syncUserProfile = async (firebaseUser: any) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userEmail = (firebaseUser.email || '').toLowerCase().trim();
    const isOwner = HUB_OWNERS.includes(userEmail) || userEmail === 'meinkxun@gmail.com';

    const syncData: Record<string, any> = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || (isOwner ? 'Prashant' : 'Sky User'),
      profileImageUrl: firebaseUser.photoURL || '',
      lastLogin: serverTimestamp(),
    };

    if (isOwner) {
      syncData.role = 'super_admin';
      syncData.canManageRoms = true;
      syncData.canManageModules = true;
      syncData.canManageApks = true;
      syncData.canManageWallpapers = true;
      syncData.canManageGuides = true;
    }

    // Always merge so role and super_admin privileges are active immediately
    await setDoc(userRef, syncData, { merge: true });

    // Set cookie for Next.js authentication middleware inspection
    if (typeof document !== 'undefined' && firebaseUser.email) {
      const normalizedEmail = firebaseUser.email.toLowerCase().trim();
      document.cookie = `skyhub_auth_email=${encodeURIComponent(normalizedEmail)}; path=/; max-age=2592000; SameSite=Lax`;
      if (isOwner) {
        document.cookie = `skyhub_admin_session=active; path=/; max-age=2592000; SameSite=Lax`;
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserProfile(result.user);
      const isOwner = (result.user.email || '').toLowerCase().trim() === 'meinkxun@gmail.com';
      toast({ 
        title: "Access Granted", 
        description: isOwner ? "Welcome Owner (meinkxun@gmail.com). Clearance verified." : "Google identity synchronized." 
      });
      onOpenChange(false);
      if (isOwner) {
        router.push('/dashboard');
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "Protocol Error", description: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Required Fields", description: "Please enter your email and password." });
      return;
    }

    setIsLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        try {
          userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (signInErr: any) {
          // If user doesn't exist yet, attempt automatic creation
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          } else {
            throw signInErr;
          }
        }
      }

      await syncUserProfile(userCredential.user);
      const isOwner = (userCredential.user.email || '').toLowerCase().trim() === 'meinkxun@gmail.com';
      toast({ 
        title: "Access Authorized", 
        description: isOwner ? "Verified Hub Owner (meinkxun@gmail.com) - SuperAdmin Clearance Granted." : "Identity verified." 
      });
      onOpenChange(false);
      if (isOwner) {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Authentication Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentSuperAdmin = currentUser?.email && (HUB_OWNERS.includes(currentUser.email.toLowerCase()) || currentUser.email.toLowerCase() === 'meinkxun@gmail.com');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border rounded-[2.5rem] p-0 overflow-hidden max-w-md shadow-2xl">
        <div className="p-8 sm:p-10 space-y-6 flex flex-col items-center">
          <DialogHeader className="w-full">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-center">
              Admin & Terminal Entry
            </DialogTitle>
            <DialogDescription className="text-center text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Sign in with authorized credentials (meinkxun@gmail.com) to access the control terminal.
            </DialogDescription>
          </DialogHeader>

          {isCurrentSuperAdmin ? (
            <div className="w-full space-y-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Logged in as {currentUser.email} (SuperAdmin)
              </p>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  router.push('/dashboard');
                }}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono uppercase text-xs font-bold gap-2"
              >
                Launch Admin Terminal <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex rounded-xl bg-muted p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                    authMode === 'email' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('google')}
                  className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                    authMode === 'google' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Google Sync
                </button>
              </div>

              {authMode === 'google' ? (
                <div className="space-y-4 pt-2">
                  <Button 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full h-14 rounded-2xl border border-border bg-card hover:bg-muted font-mono uppercase text-xs tracking-wider gap-3 flex items-center justify-center transition-all text-foreground"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Chrome className="w-5 h-5 text-blue-500" /> Google Identity Sync</>}
                  </Button>
                  <p className="text-[11px] font-mono text-muted-foreground text-center">
                    Authorized hub owner email <span className="font-bold text-foreground">meinkxun@gmail.com</span> will automatically receive SuperAdmin access.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                    </Label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="meinkxun@gmail.com"
                      required
                      className="h-12 rounded-xl bg-background border-border font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-primary" /> Password
                    </Label>
                    <Input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="h-12 rounded-xl bg-background border-border font-mono text-sm"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-mono uppercase text-xs tracking-wider font-bold gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        {isSignUp ? 'Create Admin Account' : 'Authenticate & Enter'}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors underline"
                    >
                      {isSignUp ? 'Already registered? Sign In' : 'First time? Create Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmail('meinkxun@gmail.com')}
                      className="text-[11px] font-mono text-primary hover:underline font-bold"
                    >
                      Use meinkxun@gmail.com
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

