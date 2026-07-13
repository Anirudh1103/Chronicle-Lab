# Chronicle Lab 🏛️⚡
> **"Where History Meets Technology"**

Chronicle Lab is a premium, production-grade digital sanctuary designed for deep-dive storytelling and technical explorations. It bridges the gap between the untold narratives of national security and the complex internals of modern engineering.

Built with a focus on cinematic motion, editorial typography, and high-security standards.

---

## ✨ Signature Features

### 🖋️ Modern Block-Based Editor
A "Notion-inspired" writing experience that treats content as modular blocks.
- **Modular Content**: Support for 12+ block types including Headings (with subheadings), Rich Text, Code (with syntax highlighting), Image Galleries, Timelines, FAQs, and Citations.
- **Premium Styling**: Universal support for **Bold**, *Italic*, <u>Underline</u>, and a soothing **Primary Highlight** across all blocks.
- **Drag & Drop**: Seamlessly reorder sections using a vertical navigation rail.
- **Direct Table Uploads**: Attach images and technical assets directly into research grids from your device.

### 🧭 Hierarchical Reading Navigator
An interactive, full-length vertical navigation rail that follows the reader.
- **Precision Tracking**: Real-time scroll tracking that dynamically recalibrates based on content depth.
- **Interactive Chronicle Map**: Displays H2 and H3 hierarchy with "Chapter Dots" that glow and scale as you progress.
- **Completion State**: Subtle "Trophy" celebration when a chronicle is fully explored.

### 🎬 Cinematic Experience
- **Premium Splash Screen**: A high-performance canvas-based particle system with a "Lift-Reveal" transition.
- **The Story Section**: An immersive "About" experience using ambient aura glows and scroll-revealed narrative.
- **Editorial Typography**: A sophisticated mix of **Playfair Display** (for storytelling) and **Inter** (for technical readability).

### 🛡️ Secure Gateway & Admin Dashboard
A cybersecurity-themed administrative environment for total platform control.
- **Restricted Access**: Strict admin-only permissions and a terminal-style login interface.
- **Lifecycle Management**: One-click **Visibility Toggles** to Publish, Hide, or Archive chronicles without data loss.
- **Quotes Library**: A dedicated module to broadcast historical wisdom and technical insights to the home screen.
- **System Settings**: Live control over platform identity, including footer taglines and contact signals.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS (Glassmorphism & Custom Design System)
- **Motion**: Framer Motion (60 FPS cinematic transitions)
- **Data Management**: TanStack Query & Axios
- **State Management**: Zustand
- **Editor Core**: TipTap & dnd-kit

### Backend
- **Server**: Node.js + Express
- **Database**: SQLite / PostgreSQL (via Prisma ORM)
- **Security**: JWT (HttpOnly Cookies), Bcrypt, and Custom Identity Middleware

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Anirudh1103/Chronicle-Lab.git
   cd Chronicle-Lab
   ```

2. Install dependencies for both parts:
   ```bash
   # From root
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Setup the Database:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

4. Run the Project:
   ```bash
   # In backend terminal
   npm run dev
   
   # In frontend terminal
   npm run dev
   ```

---

## ⚖️ License & Notice

This project is dual-licensed under your choice of either the **MIT License** or the **Apache License, Version 2.0**.

- See [LICENSE-MIT](LICENSE-MIT) for details.
- See [LICENSE-APACHE](LICENSE-APACHE) for details.

Refer to the [NOTICE](NOTICE) file for additional copyright and third-party attribution information.

---

## 👨‍💻 Author
**Anirudh CM**  
*Software Engineer | Android Internals | Security Enthusiast*

- **GitHub**: [@Anirudh1103](https://github.com/Anirudh1103)
- **LinkedIn**: [Anirudh CM](https://www.linkedin.com/in/anirudh-c-m-01931624a/)

---

*"Curiosity is where every Chronicle begins."*
