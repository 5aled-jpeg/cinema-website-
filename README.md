# Murdjadjo Cinema — Works '26 🎬

> A boutique, archival cinema web platform inspired by Apple Human Interface Guidelines, Criterion Collection, and A24 aesthetics. Built with Next.js 15, React 19, Tailwind CSS, Framer Motion, and CrafterUI.

![Murdjadjo Cinema Preview](https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80)

---

## ✨ Features

- **🎞️ Interactive Works Wheel (`/`):**
  - Continuous 3D cylindrical film carousel powered by custom physics and GSAP/Framer Motion.
  - Front card metadata reveal: IMDb ratings, runtime, format specifications, and upcoming screenings.
  - Word-by-word blur typography reveal via Velora `TextReveal`.
  - Floating `MercuryMenu` docked to the viewport stage.

- **🍿 Super Hover Archive (`/movies`):**
  - Complete archival repository featuring 30+ curated 35mm, 70mm, and 4K digital masterworks.
  - Built with CrafterUI's `SuperHoverList` with continuous hit-testing and instant film poster art reveal.
  - Dynamic genre filters (Crime & Noir, Sci-Fi & Cyberpunk, Horror & Midnight, Drama, 70mm & IMAX).
  - Mode toggle: Super Hover vs. Native hover, plus an Autoplay reel mode.
  - Full-screen film detail dossier on row click.

- **📅 Curated Exhibition Schedule (`/schedule`):**
  - Interactive multi-day calendar date picker (September 28, September 29, September 30).
  - Categorized auditorium screenings (VIP Salon 4K, Kids Matinee, Midnight 35mm Archival, 70mm IMAX Laser).
  - Real-time seat availability indicators (*Available*, *Selling Fast*, *Few Seats Left*).

- **🎭 Cinematic Stage Transitions (`CinemaPageCurtains`):**
  - Smooth double-curtain wipe transition between routes without flash or delay.
  - Apple HIG-compliant glassmorphism and obsidian black (`#08080a`) color system with warm amber highlights.

- **✨ Boutique Details:**
  - Custom spring-animated magnetic mouse cursor (`CinemaCursor`).
  - Interactive day/night landscape orb theme toggle (`LandscapeOrbToggle`).
  - Interactive animated footer links (`CenterUnderline`).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://motion.dev/) & [GSAP](https://gsap.com/)
- **UI Components:** [CrafterUI](https://crafterui.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **Typography:** Serif & Monospace tabular numeral pairings

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/5aled-jpeg/cinema-website-.git
cd cinema-website-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the cinema experience.

### 4. Build for production
```bash
npm run build
npm run start
```

---

## 🌐 Deploy to Vercel

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com):

1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import `cinema-website-`.
3. Click **Deploy**. Vercel will automatically build and deploy your project with a live `.vercel.app` URL.

---

## 📄 License

MIT © [5aled-jpeg](https://github.com/5aled-jpeg)
