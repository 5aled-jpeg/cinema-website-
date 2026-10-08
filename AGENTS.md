# Murdjadjo Cinema — Agent Guidelines, User Preferences & Design System

This file is automatically loaded by Antigravity in every conversation. It defines the project's design philosophy, component patterns, user preferences, and prompt handling guidelines so you do not need to re-explain them.

---

## 1. User Communication & Prompt Handling
- **Casual / Fast Typo Tolerance**:
  - The user communicates quickly and informally (e.g., "work whell" = 3D Works Wheel, "curser" = cursor, "foooter" = footer, "catygories" = categories, "desing" = design, "versel" = Vercel).
  - Understand the intent immediately, do not ask trivial clarifying questions or correct spelling. Execute the solution directly.
- **Workflow & Verification**:
  - Always verify changes with `npm run build` (ensure 0 TypeScript or lint errors).
  - When finished, commit and push to `origin main` to trigger automatic Vercel deployment.
  - Keep responses concise, clean, and formatted with markdown file links.

---

## 2. Design System & Aesthetic Principles
- **Atmospheric Minimalist & High-Prestige Editorial**:
  - Dark mode by default (`#060608`), paired with a warm amber/gold accent (`amber-500` / `#f59e0b`).
  - Border treatments: Subtle hairline borders (`border-black/10 dark:border-white/12`).
  - Cards & Overlays: Ultra-refined backdrop blurs (`backdrop-blur-xl`, `backdrop-blur-2xl`), smooth spring physics.
- **Mouse Cursor Rules**:
  - **Exhibition Site** (`/`, `/movies`, `/schedule`): Sleek custom spring cursor with an ultra-minimal center dot and a trailing ring that morphs into a pill reading `+ More` or contextual interaction labels (`Showtimes`, `Close`).
  - **Admin Deck** (`/admin`, `/admin/login`): **NEVER show custom cursor**. Use native OS cursor (`cursor: default` / `auto`) for maximum control precision.
- **No Clutter**:
  - Remove dead UI elements that don't serve a clear function (e.g., removed redundant "Featured" and "Curations" tabs, unrendered critic quotes, and unused technical specs).

---

## 3. Architecture & Component Hierarchy

### 3.1 Core Client Pages
- **Home (`src/app/page.tsx`)**:
  - Unified single-timeline experience combining:
    1. Hero Section (Liquid WebGL canvas with 3D Monolith, `t = 0`).
    2. Works Wheel (`src/registry/crafterui/ui/works-wheel.tsx`, `t = 1..10`): 3D cylindrical drum presenting 10 curated films.
    3. Cinema Footer (`src/components/cinema-footer.tsx`, `t = 11`): Smooth curtain reveal underneath.
  - Floating Nav Menu (`src/components/cinema-floating-nav.tsx`):
    - Hidden on Hero (`turn < 0.45`).
    - Visible on Works Wheel (`0.45 <= turn <= 10.35`).
    - Hidden when reaching Footer (`turn > 10.35`).
- **Archive (`src/app/movies/page.tsx`)**:
  - Uses `SuperHoverList` (`src/registry/crafterui/ui/super-hover-list.tsx`). Hovering any title displays a floating poster preview. Clicking opens `FilmModalView`.
- **Schedule (`src/app/schedule/page.tsx`)**:
  - 3D perspective stage (`src/components/schedule-3d-stage.tsx`) with date switcher, auditorium filter, seat tags (`Available`, `Selling Fast`, `Few Seats Left`).
- **Admin Console (`src/app/admin/page.tsx` & `src/app/admin/login/page.tsx`)**:
  - Luxury passcode authentication portal with tactile keypad.
  - Protected behind Next.js Middleware (`src/middleware.ts`) and HMAC session cookie (`cenima_admin_session`).
  - 1-Click IMDb scraper (`/api/admin/fetch-imdb`): Takes any IMDb URL and auto-populates title, poster, rating, runtime, director, and synopsis.
  - Wheel Ordering: Set which 10 films appear on the 3D Works Wheel and in what exact sequence.
  - Screenings Manager: Add/remove showtimes across the 4 auditoriums.

---

## 4. Data Models & Store Management
- **Film Interface (`src/lib/cinema-data.ts`)**:
  ```ts
  export interface FilmStill {
    url: string;
    caption?: string;
    aspectRatio?: string;
  }

  export interface CinemaFilm {
    id: number;
    slug: string;
    title: string;
    image: string;
    category: string;
    imdbRating: string;
    director: string;
    year: number;
    duration: string;
    tagline: string;
    synopsis: string;
    stills: FilmStill[];
  }
  ```
- **Store Engine (`src/lib/server-cinema-store.ts`)**:
  - Primary store: `data/cinema-store.json`.
  - Serverless resilience (Vercel): Reads/writes to `os.tmpdir()/cinema-store.json` + `memoryStore` in-memory cache to handle read-only serverless filesystems safely.
  - Public endpoint: `GET /api/cinema-data` returns all films, wheel films, halls, and showtimes to the client.

---

## 5. Deployment & Git Rules
- Main Git branch: `main` (`https://github.com/5aled-jpeg/cinema-website-`).
- Any push to `main` automatically triggers Vercel CI/CD production build and deployment.
- Never push broken builds; always run `npm run build` first.
