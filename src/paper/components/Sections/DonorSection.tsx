'use client';

import React from 'react';
import { Heart, Award, Shield, Sparkles } from 'lucide-react';
import { DonorItem } from '../../types';

interface DonorSectionProps {
  donors?: DonorItem[];
}

const DEFAULT_DONORS: DonorItem[] = [
  { id: 'd1', name: 'Alex M.', tier: 'Legend', amount: '$50.00', message: 'Thanks for keeping the Snapdragon 4 Gen 2 scene alive with reliable builds!' },
  { id: 'd2', name: 'Vikram Patel', tier: 'Sponsor', amount: '$25.00', message: 'Best KernelSU experience on Redmi 12 5G.' },
  { id: 'd3', name: 'David K.', tier: 'Patron', amount: '$15.00', message: 'Awesome work on Evolution X port and thermal tweaks.' },
  { id: 'd4', name: 'Liam S.', tier: 'Supporter', amount: '$10.00', message: 'OrangeFox recovery worked smoothly without any encryption hassle.' },
];

export const DonorSection: React.FC<DonorSectionProps> = ({ donors = DEFAULT_DONORS }) => {
  const displayDonors = donors && donors.length > 0 ? donors : DEFAULT_DONORS;

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'Legend': return 'bg-amber-800 text-amber-100 border-amber-900';
      case 'Sponsor': return 'bg-purple-800 text-purple-100 border-purple-900';
      case 'Patron': return 'bg-blue-800 text-blue-100 border-blue-900';
      default: return 'bg-stone-800 text-stone-100 border-stone-900';
    }
  };

  return (
    <section id="donors" className="py-12 sm:py-16 border-t border-[var(--c-border)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
            SECTION 07
          </span>
          <span className="text-xs font-mono uppercase text-[var(--c-muted)]">
            Community Patrons & Server Sustainers
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-handwriting font-bold text-[var(--c-heading)]">
          Patron Ledger & Donor Honors
        </h2>
        <p className="text-xs sm:text-sm font-mono text-[var(--c-body)] max-w-2xl mt-1">
          Immense gratitude to the community members funding compilation build servers and testing hardware devices.
        </p>
      </div>

      {/* Donor Certificate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayDonors.map(donor => (
          <div
            key={donor.id}
            className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-5 relative overflow-hidden flex flex-col justify-between shadow-xs hover:border-[var(--c-border-hover)] transition-all"
            style={{
              backgroundImage: `radial-gradient(var(--c-border) 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {/* Wax Seal Stamp in Corner */}
            <div className="w-8 h-8 rounded-full border border-red-800/30 bg-red-900/10 flex items-center justify-center mb-3">
              <Heart className="w-4 h-4 text-red-700 dark:text-red-400 fill-red-700/20" />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="text-lg font-handwriting font-bold text-[var(--c-heading)]">
                  {donor.name}
                </h4>
                <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${getTierBadge(donor.tier)}`}>
                  {donor.tier || 'Patron'}
                </span>
              </div>

              {donor.message && (
                <p className="text-xs font-mono text-[var(--c-body)] italic mb-4 leading-relaxed">
                  &ldquo;{donor.message}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--c-border)] flex items-center justify-between text-[11px] font-mono text-[var(--c-muted)]">
              <span>Contribution:</span>
              <span className="font-bold text-[var(--c-heading)]">{donor.amount || 'Verified'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
