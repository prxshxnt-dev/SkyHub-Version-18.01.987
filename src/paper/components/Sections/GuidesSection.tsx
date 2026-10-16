'use client';

import React, { useState } from 'react';
import { BookOpen, Terminal, CheckCircle2, AlertTriangle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { GuideResource } from '../../types';
import { playCheckmarkChime } from '../../utils/soundManager';

interface GuidesSectionProps {
  guides?: any[];
}

const DEFAULT_GUIDES: GuideResource[] = [
  {
    id: 'guide-unlock',
    title: 'Unlocking Snapdragon 4 Gen 2 Bootloader',
    category: 'Essential',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    summary: 'The prerequisite for any custom ROM or recovery installation on Xiaomi & POCO SM4450 devices.',
    prerequisites: ['Mi Account active for >30 days', 'Fastboot driver installed on Windows/Linux', 'Original USB Type-C Cable'],
    steps: [
      {
        title: 'Step 1: Developer Options & OEM Unlock',
        instruction: 'Go to Settings > About Phone > Tap "OS Version" 7 times. Go to Additional Settings > Developer Options > Enable "OEM Unlocking" and "USB Debugging".',
      },
      {
        title: 'Step 2: Bind Account in Mi Community',
        instruction: 'In Developer Options, tap "Mi Unlock Status". Ensure mobile data is connected (do NOT use Wi-Fi) and tap "Add account and device".',
      },
      {
        title: 'Step 3: Fastboot Mode & MiFlash Unlock',
        instruction: 'Power off device. Hold Volume Down + Power until FASTBOOT logo appears. Connect to PC and launch MiFlash Unlock.',
        command: 'fastboot devices',
      },
    ],
  },
  {
    id: 'guide-flash-rom',
    title: 'Clean Flashing Custom ROMs via Recovery',
    category: 'Flashing',
    difficulty: 'Intermediate',
    estimatedMinutes: 20,
    summary: 'Proper clean-flash methodology preventing bootloops, encryption corruption, and partition mismatch.',
    prerequisites: ['TWRP or OrangeFox installed', 'Backup of WhatsApp/Photos', 'ROM .zip transferred to micro-SD or USB OTG'],
    steps: [
      {
        title: 'Step 1: Reboot to Custom Recovery',
        instruction: 'Hold Volume Up + Power until TWRP or OrangeFox logo appears. Enter your lockscreen PIN if prompted to decrypt userdata.',
      },
      {
        title: 'Step 2: Wipe & Format Data',
        instruction: 'Go to Wipe > Advanced Wipe > Select Dalvik, Metadata, Cache. Then go to "Format Data" and type "yes" (Required when switching ROMs).',
        warning: 'Format Data will wipe internal storage! Make sure your data is backed up externally.',
      },
      {
        title: 'Step 3: Flash ROM & Firmware',
        instruction: 'Select Install > Choose ROM zip file > Swipe to flash. Do NOT reboot yet if installing KernelSU or custom kernel.',
      },
      {
        title: 'Step 4: Reboot to System',
        instruction: 'Tap Reboot System. The first boot on Android 15 typically takes 2 to 3 minutes while ART compilation completes.',
      },
    ],
  },
  {
    id: 'guide-kernelsu',
    title: 'Installing KernelSU Next via Fastboot Boot',
    category: 'Rooting',
    difficulty: 'Advanced',
    estimatedMinutes: 10,
    summary: 'Direct kernel patch injection without touching system partition, maintaining 100% Play Integrity integrity.',
    prerequisites: ['Unlocked bootloader', 'Stock or Custom boot.img matching current build', 'KernelSU Manager app installed'],
    steps: [
      {
        title: 'Step 1: Extract boot.img',
        instruction: 'Extract boot.img from your current installed ROM zip package using payload-dumper-go or 7-Zip.',
      },
      {
        title: 'Step 2: Fastboot Flash Patched Boot',
        instruction: 'Reboot to fastboot mode and flash the KernelSU-integrated boot image directly to boot partition.',
        command: 'fastboot flash boot venom_ksu_boot.img\nfastboot reboot',
      },
      {
        title: 'Step 3: Verify Superuser Privilege',
        instruction: 'Open KernelSU app. Status should report "Working: LKM (Loadable Kernel Module)" or "Kernel: Built-in". Grant root to your desired apps.',
      },
    ],
  },
];

export const GuidesSection: React.FC<GuidesSectionProps> = ({ guides }) => {
  const [expandedId, setExpandedId] = useState<string>('guide-unlock');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const displayGuides = DEFAULT_GUIDES;

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    playCheckmarkChime();
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section id="guides" className="py-12 sm:py-16 border-t border-[var(--c-border)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)]">
            SECTION 04
          </span>
          <span className="text-xs font-mono uppercase text-[var(--c-muted)]">
            Engineering Documentation & Protocols
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-handwriting font-bold text-[var(--c-heading)]">
          Field Manual & Flashing Guides
        </h2>
        <p className="text-xs sm:text-sm font-mono text-[var(--c-body)] max-w-2xl mt-1">
          Tactical step-by-step procedures verified on actual Redmi 12 5G & POCO M6 Pro 5G hardware.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {displayGuides.map(guide => {
          const isExpanded = expandedId === guide.id;
          return (
            <div
              key={guide.id}
              className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden transition-all shadow-xs"
            >
              {/* Header Accordion Button */}
              <button
                onClick={() => setExpandedId(isExpanded ? '' : guide.id)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer hover:bg-[var(--c-input-bg)]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-[var(--c-heading)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0]">
                        {guide.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--c-muted)]">
                        ~{guide.estimatedMinutes} mins
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-handwriting font-bold text-[var(--c-heading)]">
                      {guide.title}
                    </h3>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-muted)] ml-3 flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-[var(--c-border)] bg-[var(--c-card)]/50 space-y-6">
                  <p className="text-xs sm:text-sm font-mono text-[var(--c-body)]">
                    {guide.summary}
                  </p>

                  {/* Prerequisites */}
                  {guide.prerequisites && (
                    <div className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)]">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--c-muted)] block mb-2">
                        Prerequisites & Preparation:
                      </span>
                      <ul className="space-y-1.5">
                        {guide.prerequisites.map((p, i) => (
                          <li key={i} className="text-xs font-mono text-[var(--c-body)] flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="space-y-4">
                    {guide.steps.map((st, i) => (
                      <div key={i} className="p-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)]">
                        <h4 className="text-sm font-mono font-bold text-[var(--c-heading)] mb-1.5">
                          {st.title}
                        </h4>
                        <p className="text-xs font-mono text-[var(--c-body)] leading-relaxed mb-2">
                          {st.instruction}
                        </p>

                        {st.warning && (
                          <div className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs font-mono mb-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{st.warning}</span>
                          </div>
                        )}

                        {st.command && (
                          <div className="relative mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono uppercase text-[var(--c-muted)] flex items-center gap-1">
                                <Terminal className="w-3 h-3" /> Terminal Command
                              </span>
                              <button
                                onClick={() => handleCopy(st.command!)}
                                className="text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--c-border)] bg-[var(--c-input-bg)] cursor-pointer"
                              >
                                {copiedCmd === st.command ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedCmd === st.command ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="p-2.5 rounded-lg border border-[var(--c-border)] bg-[#241F1A] text-[#F4EDE0] font-mono text-xs overflow-x-auto whitespace-pre">
                              {st.command}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
