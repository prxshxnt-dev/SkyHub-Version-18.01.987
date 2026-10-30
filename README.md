<div align="center">

# ⚡ SkyHub (Erroxx)

**"Built for the Sky Community. Powered by Developers."**

A dedicated, community-driven Android development and resource hub engineered for the **Qualcomm Snapdragon 4 Gen 2 (SM4450)** platform.

[![Website](https://img.shields.io/badge/Website-erroxx.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://erroxx.netlify.app/)
[![Platform](https://img.shields.io/badge/Platform-Android_Development-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://erroxx.netlify.app/)
[![SoC](https://img.shields.io/badge/SoC-Snapdragon_4_Gen_2-E60012?style=for-the-badge&logo=qualcomm&logoColor=white)](https://erroxx.netlify.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Database-Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

[🌐 Live Portal](https://erroxx.netlify.app/) • [📱 Supported Devices](#-supported-devices--hardware-specifications) • [🚀 Core Features](#-core-features) • [🛠️ Local Setup](#%EF%B8%8F-getting-started--local-development) • [👥 Maintainers](#-founder--maintainer)

---

</div>

## 📖 Overview

**SkyHub (Erroxx)** is a centralized open-source ecosystem designed to streamline aftermarket firmware distribution, kernel development, recovery testing, and system modifications for the Snapdragon 4 Gen 2 family of smartphones.

By consolidating scattered Telegram channels, forum threads, and decentralized mirrors into a unified, high-performance web platform, SkyHub empowers enthusiasts and developers with direct, verified access to ROM builds, recovery images, root modules, and flashing documentation.

---

## 📱 Supported Devices & Hardware Specifications

SkyHub specializes in the Snapdragon 4 Gen 2 (SM4450) platform, providing tailored firmware builds, boot images, and custom trees.

| Specification | Redmi 12 5G | POCO M6 Pro 5G |
| :--- | :--- | :--- |
| **Device Codename** | `sky` | `sky_pro` |
| **SoC** | Qualcomm Snapdragon 4 Gen 2 (SM4450, 4nm) | Qualcomm Snapdragon 4 Gen 2 (SM4450, 4nm) |
| **CPU Cluster** | 2x 2.2 GHz Cortex-A78 & 6x 1.95 GHz Cortex-A55 | 2x 2.2 GHz Cortex-A78 & 6x 1.95 GHz Cortex-A55 |
| **GPU** | Qualcomm Adreno 613 | Qualcomm Adreno 613 |
| **Architecture** | ARM64-v8a (64-bit) | ARM64-v8a (64-bit) |
| **Default Boot/Recovery** | A/B Dynamic Partitions (VAB) | A/B Dynamic Partitions (VAB) |
| **Target Android Versions** | Android 13 / 14 / 15 (AOSP & HyperOS base) | Android 13 / 14 / 15 (AOSP & HyperOS base) |
| **Support Status** | **Official / Active Tier** | **Official / Active Tier** |

---

## 🚀 Core Features

### 1. 📦 Custom ROM Repository
* Verified builds spanning leading custom ROM distributions (LineageOS, PixelOS, Evolution X, crDroid, Paranoid Android, ArrowOS, and more).
* Detailed build tags: Android version, security patch level, SELinux enforcing/permissive status, GApps inclusion, and maintainer attribution.
* Integrated image galleries with high-resolution screenshot carousels and release changelogs.

### 2. 🛡️ Custom Recoveries
* Official and community recovery images including **TWRP**, **OrangeFox Recovery Project**, and **PBRP (PitchBlack)**.
* Detailed partition flashing commands (`fastboot flash boot`, `fastboot flash vendor_boot`, or `fastboot flash recovery`).
* Checksum integrity verification (MD5 / SHA256) and recovery thumbnails.

### 3. ⚙️ Kernels & Low-Level Resources
* Overclocked, battery-optimized, and upstream Linux-LTS custom kernels.
* Vendor drivers, firmware flashers, and partition fix tools tailored for `sky` and `sky_pro`.

### 4. 🧩 Magisk & KernelSU Ecosystem
* Curated module index for audio enhancement (ViPER4Android, Dolby Atmos), thermal engine tweaks, display refresh rate unlocks, and system font/icon packs.
* Compatibility filters distinguishing between Magisk (Zygisk) and KernelSU / APatch modules.

### 5. 📚 Step-by-Step Installation Guides
* Comprehensive tutorials covering bootloader unlocking, driver configuration, ADB/Fastboot setups, dirty/clean flash procedures, and unbricking methods.
* Platform-specific guidance for Windows, Linux, and macOS terminal environments.

### 6. 🎨 Wallpapers & Community Customization
* Stock wallpapers, curated photography, and custom digital illustrations optimized for high-refresh FHD+ displays.

### 7. 📬 Real-time Notifications & Multimedia Broadcasts
* Instant broadcast notifications for newly published ROM builds, hotfixes, security patches, and community announcements.
* Built-in support for previewing and playing image, audio, and video attachments right inside the notification feed.

### 8. 💡 ROM & Feature Request System
* Community submission pipeline allowing users to vote on and request ports for unreleased distributions and kernel features.

---

## 🏗️ Architecture & Tech Stack

SkyHub is engineered with modern web standards, prioritized for sub-second page loads, responsive interactions, and scalable real-time synchronization.

```
┌────────────────────────────────────────────────────────┐
│                   SkyHub Client (Web)                  │
│       Next.js 15 (App Router) • React 19 • Tailwind CSS │
│            Framer Motion • Lucide React Icons          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Firebase Backend                    │
│      • Cloud Firestore (Realtime collections)          │
│      • Firebase Authentication & Security Rules        │
│      • Firebase Cloud Storage (Firmware / Assets)      │
└────────────────────────────────────────────────────────┘
```

* **Core Framework:** [Next.js 15](https://nextjs.org/) (App Router architecture with server and client components).
* **Language:** [TypeScript](https://www.typescriptlang.org/) for strict type safety and structured data models.
* **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) with custom dark/neon accents.
* **Animation Engine:** [Motion / Framer Motion](https://motion.dev/) for fluid page and tab transitions.
* **Database & Persistence:** [Google Cloud Firestore](https://firebase.google.com/products/firestore) for lightning-fast querying and real-time listeners.
* **Hosting & Delivery:** [Netlify](https://www.netlify.com/) continuous deployment pipeline.

---

## 🛠️ Getting Started & Local Development

Follow these steps to run SkyHub locally for development or testing:

### Prerequisites

* **Node.js:** v18.18.0 or newer (v20+ LTS recommended)
* **Package Manager:** `npm` (v9+) or `pnpm` / `yarn`
* **Git:** Installed and configured

### 1. Clone the Repository

```bash
git clone <insert-github-repo-url>
cd erroxx-skyhub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and populate your Firebase and Gemini credentials:

```bash
cp .env.example .env.local
```

Required keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
GEMINI_API_KEY="your-gemini-server-key"
```

### 4. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the portal.

---

## 🤝 Community Contributions & Guidelines

We welcome contributions from ROM maintainers, kernel developers, module creators, and UI contributors!

### Submitting a ROM or Recovery Build
1. Ensure your build has been boot-tested on either `sky` or `sky_pro`.
2. Provide direct source links (Device Tree, Common Tree, Vendor Tree, and Kernel Source).
3. Include standard metadata:
   - ROM name, version, and release date
   - SELinux status (`Enforcing` or `Permissive`)
   - Known issues and bug reporting guidelines
   - SHA256 checksum and direct mirror link (SourceForge, GitHub Releases, AndroidFileHost, or Mega)

### Submitting Code / Pull Requests
1. Fork the project repository.
2. Create a descriptive feature branch: `git checkout -b feature/awesome-addition`.
3. Verify syntax and linting checks: `npm run lint` and `npm run build`.
4. Commit your changes with conventional commit messages: `git commit -m "feat: add screenshot carousel for recoveries"`.
5. Push to your branch and open a Pull Request.

---

## 👑 Founder & Maintainer

<div align="center">

### **Prashant**
*Founder, Lead Architect & Maintainer of SkyHub (Erroxx)*

Responsible for platform architecture, device tree curation, community management, and firmware verification across the Snapdragon 4 Gen 2 ecosystem.

</div>

---

## 🔗 Official Links & Community Resources

* **Official Portal:** [https://erroxx.netlify.app/](https://erroxx.netlify.app/)
* **Telegram Announcements Channel:** [<insert-telegram-channel-link>](https://t.me/)
* **Community Discussion Group:** [<insert-telegram-group-link>](https://t.me/)
* **Developer Submissions:** Contact through the admin panel on [SkyHub](https://erroxx.netlify.app/) or via [<insert-contact-email>](mailto:example@domain.com)

---

## ⚠️ Disclaimer & Third-Party Credits

### Disclaimer
Custom ROM flashing, bootloader unlocking, and kernel modifications carry inherent risks. While builds indexed on SkyHub are curated and reviewed, **SkyHub and its maintainers assume no responsibility for bricked devices, corrupted boot partitions, lost data, hardware damage, or voided warranties**. Proceed at your own discretion and always create backups before flashing.

### Credits
* **Qualcomm & Xiaomi:** For hardware development and kernel sources.
* **Custom ROM Teams:** The global LineageOS, PixelOS, crDroid, Evolution X, ArrowOS, and AOSP communities.
* **Recovery Developers:** TeamWin (TWRP), OrangeFox Recovery Project, and PBRP team.
* **Root Solution Maintainers:** John Wu (Magisk), the KernelSU development team, and APatch developers.
* **All device tree contributors and testers** in the `sky` and `sky_pro` community.

---

<div align="center">

### 💙 Thank You for Supporting the Sky Ecosystem!

*Built with passion for Android open-source development.*

**[Back to Top ↑](#-skyhub-erroxx)**

</div>
