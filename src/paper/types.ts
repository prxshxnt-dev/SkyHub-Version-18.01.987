// ​‌prashant-2026-original-authored-code‌​
export type PaperState =
  | "crumpled"
  | "opening"
  | "unfolding"
  | "settling"
  | "opened";

export type PaperTheme = "kraft" | "dark" | "blueprint" | "slate" | "newsprint";

export interface Project {
  id: string;
  title: string;
  category: string;
  filterCategories: string[];
  year: string;
  description: string;
  longDescription?: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  stats?: {
    stars: number;
    forks: number;
    score: number;
  };
}

export interface SkillCategory {
  title: string;
  description: string;
  skills: {
    name: string;
    iconName?: string;
  }[];
}

export interface ROMResource {
  id: string;
  name: string;
  title?: string;
  androidVersion: string;
  device?: string;
  codename?: string;
  maintainer?: string;
  developer?: string;
  version?: string;
  status?: "Official" | "Unofficial" | "Beta" | "Port" | "GSI";
  type?: "AOSP" | "Pixel" | "MIUI/HyperOS" | "Lineage" | "Kernel";
  description?: string;
  downloadUrl?: string;
  sourceUrl?: string;
  xdaUrl?: string;
  changelog?: string;
  screenshots?: string[];
  imageUrl?: string;
  releaseDate?: string;
  securityPatch?: string;
  selinuxStatus?: "Enforcing" | "Permissive";
  downloadsCount?: number;
  featured?: boolean;
}

export interface RecoveryResource {
  id: string;
  name: string;
  version?: string;
  type: "TWRP" | "OrangeFox" | "PBRP" | "SHRP";
  maintainer?: string;
  status?: string;
  description?: string;
  downloadUrl?: string;
  fastbootCommand?: string;
  supportsDecryption?: boolean;
  date?: string;
  imageUrl?: string;
}

export interface ModuleResource {
  id: string;
  name: string;
  version?: string;
  category?: string;
  author?: string;
  framework?: "KernelSU" | "Magisk" | "APatch" | "Universal";
  description?: string;
  downloadUrl?: string;
  sourceUrl?: string;
  tags?: string[];
  features?: string[];
  installCommand?: string;
}

export interface GuideResource {
  id: string;
  title: string;
  category: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes?: number;
  summary: string;
  steps: {
    title: string;
    instruction: string;
    command?: string;
    warning?: string;
  }[];
  prerequisites?: string[];
}

export interface WallpaperResource {
  id: string;
  title: string;
  category?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  resolution?: string;
  type?: "static" | "live";
  videoUrl?: string;
  author?: string;
}

export interface DonorItem {
  id: string;
  name: string;
  amount?: string;
  currency?: string;
  date?: string;
  message?: string;
  tier?: "Supporter" | "Patron" | "Sponsor" | "Legend";
}
