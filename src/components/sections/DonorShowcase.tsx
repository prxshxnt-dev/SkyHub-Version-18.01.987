'use client';

import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { useRef } from 'react';
import { Heart, User, Quote, Sparkles } from 'lucide-react';
import { SiteSettings } from '@/lib/store';
import { cn } from '@/lib/utils';

export function DonorShowcase() {
  const db = useFirestore();
  const donorsRef = useMemoFirebase(() => collection(db, 'donors'), [db]);
  const donorsQuery = useMemoFirebase(() => query(donorsRef, where('visible', '==', true), orderBy('priority', 'desc')), [donorsRef]);
  const { data: donors } = useCollection(donorsQuery);

  const settingsRef = useMemoFirebase(() => doc(db, 'settings', 'global'), [db]);
  const { data: globalSettings } = useDoc<SiteSettings>(settingsRef);

  const showcaseSettings = globalSettings?.donorShowcase || {
    enabled: true,
    speed: 30,
    pauseOnHover: true,
    style: 'glassmorphism',
    showParticles: true
  };

  if (!showcaseSettings.enabled || !donors || donors.length === 0) return null;

  // Double the donors for seamless looping
  const loopedDonors = [...donors, ...donors, ...donors];

  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FAF5E6] to-[#FAF3DD] dark:from-[#181712] dark:via-[#14130F] dark:to-[#12110D] border-y border-[#EBE4CF] dark:border-[#2C2A22] transition-colors duration-300">
      {showcaseSettings.showParticles && <ParticlesBackground />}
      
      <div className="container mx-auto px-4 mb-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDE694]/40 dark:bg-[#FDE694]/20 border border-[#FDE694]/60 dark:border-[#FDE694]/40 text-[#1C1B17] dark:text-[#FDE694] text-xs font-black mb-5 uppercase tracking-widest shadow-2xs"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>WALL OF GRATITUDE</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight uppercase text-[#1C1B17] dark:text-[#F4EFE6]">
          Our Special <span className="text-amber-600 dark:text-[#FDE694]">Donors</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] max-w-2xl mx-auto leading-relaxed">
          Honoring the community members and supporters fueling the continuous research, device bringup, and kernel optimization for the SKY ecosystem.
        </p>
      </div>

      <div className="relative flex overflow-hidden py-6">
        <div 
          className="flex whitespace-nowrap animate-marquee hover:pause-marquee"
          style={{ 
            animationDuration: `${showcaseSettings.speed}s`,
            animationPlayState: showcaseSettings.pauseOnHover ? undefined : 'running'
          }}
        >
          {loopedDonors.map((donor, idx) => (
            <DonorCard 
              key={`${donor.id}-${idx}`} 
              donor={donor} 
              style={showcaseSettings.style || 'glassmorphism'} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DonorCard({ donor, style }: { donor: any, style: string }) {
  const isNeon = style === 'neon';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "flex-shrink-0 mx-3 w-72 rounded-3xl p-5 sm:p-6 transition-all duration-300 relative group flex flex-col items-start gap-3.5 shadow-xs hover:shadow-xl",
        "bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#1F1E18] dark:to-[#151410] border border-[#EBE4CF] dark:border-[#36342A] hover:border-[#FDE694] dark:hover:border-[#FDE694]/60",
        isNeon && "hover:shadow-[0_0_25px_rgba(253,230,148,0.25)]"
      )}
    >
      <div className="flex items-center gap-3.5 w-full">
        <div className="relative shrink-0">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-[#EBE4CF] dark:border-[#36342A] group-hover:border-[#FDE694] bg-[#FFF8E1] dark:bg-[#201F18] transition-colors flex items-center justify-center">
            {donor.avatarUrl ? (
              <img 
                src={donor.avatarUrl} 
                alt={donor.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-[#FAF3DD] dark:bg-[#201F18] flex items-center justify-center font-black text-sm text-[#49473E] dark:text-[#F4EFE6]">
                {((donor.name || 'DN').slice(0, 2)).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#FDE694] text-[#121212] rounded-full p-1 shadow-md ring-2 ring-[#FAF5E6] dark:ring-[#1F1E18]">
            <Heart className="w-2.5 h-2.5 fill-[#121212] text-[#121212]" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-sm sm:text-base text-[#1C1B17] dark:text-[#F4EFE6] truncate group-hover:text-amber-700 dark:group-hover:text-[#FDE694] transition-colors">
            {donor.name}
          </h4>
          {donor.username && (
            <p className="text-xs font-mono text-[#787567] dark:text-[#BDB8A4] truncate">
              @{donor.username}
            </p>
          )}
        </div>
      </div>

      {donor.message && (
        <div className="relative mt-1 w-full">
          <Quote className="w-3.5 h-3.5 text-amber-600/50 dark:text-[#FDE694]/50 absolute -top-1 -left-1.5 rotate-180" />
          <p className="text-xs text-[#787567] dark:text-[#BDB8A4] leading-relaxed pl-3 italic line-clamp-3">
            {donor.message}
          </p>
        </div>
      )}

      {/* Subtle gold glow on hover */}
      <div className="absolute inset-0 rounded-3xl bg-[#FDE694]/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10 pointer-events-none" />
    </motion.div>
  );
}

function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-[#FDE694] rounded-full blur-[0.5px]"
          initial={{
            x: `${(i * 5.5) % 100}%`,
            y: "100%",
            scale: 0.6 + (i % 5) * 0.15,
          }}
          animate={{
            y: ["100%", "-20%"],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 12 + (i % 6) * 2,
            repeat: Infinity,
            ease: "linear",
            delay: (i * 0.7) % 6,
          }}
        />
      ))}
    </div>
  );
}
