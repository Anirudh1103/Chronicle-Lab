# Chronicle Lab 🏛️⚡
> **"Where History Meets Technology"**

Chronicle Lab is a premium, production-grade digital sanctuary designed for deep-dive storytelling and technical explorations. It bridges the gap between the untold narratives of national security and the complex internals of modern engineering.

Built with a focus on cinematic motion, editorial typography, and high-security standards.

---

## ✨ Signature Features

### 🖋️ Modern Block-Based Editor
A "Notion-inspired" writing experience that treats content as modular blocks.
- **Modular Content**: Support for 12+ block types including Headings (H2-H4), Rich Text, Code (with syntax highlighting), Image Galleries, Timelines, FAQs, and Citations.
- **Drag & Drop**: Seamlessly reorder sections using a vertical navigation rail.
- **Auto-Save & Revisions**: Never lose a thought with background saving and version history snapshots.

### 🧭 Hierarchical Reading Navigator
An interactive, vertical navigation rail that follows the reader.
- **Visual Progress**: Real-time scroll tracking that fills the rail as you read.
- **Structural Tree**: Displays H2 and H3 hierarchy, allowing readers to jump to specific "chapters."
- **Completion State**: Subtle "Trophy" celebration when a chronicle is fully explored.

### 🎬 Cinematic Experience
- **Premium Splash Screen**: A high-performance canvas-based particle system with a "Lift-Reveal" transition.
- **The Story Section**: An immersive "About" experience using ambient aura glows and scroll-revealed narrative.
- **Editorial Typography**: A sophisticated mix of **Playfair Display** (for storytelling) and **Inter** (for technical readability).

### 🛡️ Secure Gateway
A cybersecurity-themed administrative entry point.
- **Restricted Access**: Strict admin-only permissions (Specifically tuned for Anirudh CM).
- **Handshake Protocol**: A terminal-style login interface with typing animations and "Root Access" status probes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS (Glassmorphism & Custom Design System)
- **Motion**: Framer Motion (60 FPS cinematic transitions)
- **State Management**: Zustand
- **Editor Core**: TipTap & dnd-kit

### Backend
- **Server**: Node.js + Express
- **Database**: SQLite (via Prisma ORM)
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
   # Root
   npm install
   
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd ../backend && npm install
   ```

3. Setup the Database:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx ts-node prisma/seed.ts
   ```

4. Run the Project:
   ```bash
   # From the root folder
   npm run dev
   ```

---

## 👨‍💻 Author
**Anirudh CM**  
*Software Engineer | Android Internals | Security Enthusiast*

- **GitHub**: [@Anirudh1103](https://github.com/Anirudh1103)
- **LinkedIn**: [Anirudh CM](https://www.linkedin.com/in/anirudh-c-m-01931624a/)

---

*"Curiosity is where every Chronicle begins."*
