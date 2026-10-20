'use client';

import React, { useState } from 'react';
import { SPEC_CATEGORIES } from '@/lib/sky-data';
import { 
  Smartphone, 
  Cpu, 
  Camera, 
  Battery, 
  HardDrive, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollReveal } from './ScrollReveal';

export function DeviceSection() {
  const [activeTab, setActiveTab] = useState<string>(SPEC_CATEGORIES[0]?.id || 'display');
  const selectedCategory = SPEC_CATEGORIES.find((c) => c.id === activeTab) || SPEC_CATEGORIES[0];

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'display': return <Smartphone className="w-4 h-4" />;
      case 'performance': return <Cpu className="w-4 h-4" />;
      case 'camera': return <Camera className="w-4 h-4" />;
      case 'battery': return <Battery className="w-4 h-4" />;
      case 'storage': return <HardDrive className="w-4 h-4" />;
      case 'protection': return <ShieldCheck className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  if (!selectedCategory) return null;

  return (
    <section id="device" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 scroll-mt-24">
      <ScrollReveal distance={16}>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#121212] bg-[#FDE694] px-3.5 py-1 rounded-full inline-block mb-3 border border-[#EBE4CF] dark:border-transparent">
            Hardware Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1C1B17] dark:text-[#F4EFE6] mb-3">
            Qualcomm Snapdragon 4 Gen 2
          </h2>
          <p className="text-sm text-[#787567] dark:text-[#BDB8A4]">
            Xiaomi Redmi 12 5G & POCO M6 Pro 5G technical specifications and kernel optimization target.
          </p>
        </div>
      </ScrollReveal>

      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {SPEC_CATEGORIES.map((category) => {
          const isActive = activeTab === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveTab(category.id)}
              className={"flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer " + (
                isActive
                  ? "bg-[#FDE694] text-[#121212] shadow-sm"
                  : "bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A]"
              )}
            >
              {getCategoryIcon(category.id)}
              <span>{category.title}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          <div className="bg-[#FAF3DD] dark:bg-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] p-6 sm:p-8 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#EBE4CF] dark:border-[#36342A]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#9C9888]">
                  Category Highlight
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1C1B17] dark:text-[#F4EFE6]">
                  {selectedCategory.title}
                </h3>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-[#FFF8E1] dark:bg-[#141416] border border-[#EBE4CF] dark:border-[#36342A] text-xs font-mono font-bold text-[#49473E] dark:text-[#FDE694] self-start sm:self-auto">
                {selectedCategory.tagline}
              </div>
            </div>

            <p className="text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed mb-6">
              {selectedCategory.details}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedCategory.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFF8E1] dark:bg-[#151410] border border-[#EBE4CF] dark:border-[#2C2A22] p-4 rounded-2xl"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#787567] dark:text-[#8E8A7A] block mb-1">
                    {highlight.label}
                  </span>
                  <div className="text-base font-black text-[#1C1B17] dark:text-[#F4EFE6] mb-1">
                    {highlight.value}
                  </div>
                  <p className="text-[11px] text-[#787567] dark:text-[#9C9888] leading-normal">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
