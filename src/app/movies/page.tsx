"use client";

import * as React from "react";
import { ArrowLeft, Calendar, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ARCHIVE_FILMS, type ArchiveFilmItem } from "@/lib/archive-films";
import { CinemaCursor } from "@/components/cinema-cursor";
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle";
import { CinemaFooter } from "@/components/cinema-footer";
import { useCinemaTransition } from "@/components/cinema-page-curtains";
import { FilmModalView } from "@/components/film-modal-view";
import { CinemaLogo } from "@/components/cinema-logo";
import { MagazineScroller, type Poster } from "@/components/ui/magazine-scroller";

export default function MoviesArchivePage() {
  const { navigate } = useCinemaTransition();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [activeFilmForModal, setActiveFilmForModal] = React.useState<ArchiveFilmItem | null>(null);
  const [archiveFilmsList, setArchiveFilmsList] = React.useState<ArchiveFilmItem[]>(ARCHIVE_FILMS);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch live films from server store
  React.useEffect(() => {
    fetch("/api/cinema-data")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json?.data?.films) && json.data.films.length > 0) {
          const mapped: ArchiveFilmItem[] = json.data.films.map((f: any) => ({
            id: f.id,
            title: f.title,
            subtitle: `${f.director || "Archival Master"} · ${f.category || "Theatrical Exhibition"}`,
            meta: f.year ? f.year.toString() : "2026",
            image: f.image,
            category: f.category || "General",
            imdbRating: f.imdbRating || "8.5",
            duration: f.duration || "2h 00m",
            tagline: f.tagline || "Exclusively in theatrical exhibition.",
            synopsis: f.synopsis || "",
            stills: f.stills || [{ url: f.image, caption: `${f.title} Poster` }],
          }));
          setArchiveFilmsList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const categories = React.useMemo(
    () => [
      { id: "all", label: "All Films" },
      { id: "drama", label: "Drama & Classics" },
      { id: "crime", label: "Crime & Thriller" },
      { id: "action", label: "Action & Adventure" },
      { id: "fantasy", label: "Fantasy & Animation" },
    ],
    []
  );

  const filteredFilms = React.useMemo(() => {
    if (selectedCategory === "all") return archiveFilmsList;
    return archiveFilmsList.filter((film) => {
      const cat = (film.category + " " + film.subtitle).toLowerCase();
      if (selectedCategory === "drama") return cat.includes("drama") || cat.includes("classic") || cat.includes("masterpiece");
      if (selectedCategory === "crime") return cat.includes("crime") || cat.includes("thriller") || cat.includes("noir");
      if (selectedCategory === "action") return cat.includes("action") || cat.includes("adventure");
      if (selectedCategory === "fantasy") return cat.includes("fantasy") || cat.includes("animation");
      return true;
    });
  }, [selectedCategory, archiveFilmsList]);

  const magazinePosters: Poster[] = React.useMemo(() => {
    return filteredFilms.map((film) => ({
      id: film.id,
      src: film.image,
      alt: `${film.title} Poster`,
      title: film.title,
      category: film.category,
      imdbRating: film.imdbRating,
      director: film.subtitle?.split("·")[0]?.trim() || "Archival Master",
      year: film.meta,
      duration: film.duration,
      tagline: film.tagline,
      synopsis: film.synopsis,
      stills: (film as any).stills,
    }));
  }, [filteredFilms]);

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveFilmForModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when modal is active
  React.useEffect(() => {
    if (activeFilmForModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeFilmForModal]);

  return (
    <div className="relative w-full min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] antialiased transition-colors duration-300 flex flex-col justify-between">
      {/* Custom Spring Cursor */}
      <CinemaCursor attachToParent={false} />

      {/* Top Header - Zero Clutter */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[var(--color-bg-base)]/98 sm:bg-[var(--color-bg-base)]/85 border-b border-[var(--color-border)] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors shadow-xs">
        {/* Left: Home Navigation */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/", "Works '26 · Index")}
            data-cursor-interactive="true"
            data-cursor-label="Home"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-[var(--color-text-primary)] group cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <CinemaLogo size="md" />
          </button>
        </div>

        {/* Right Actions: Schedule Shortcut & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate("/schedule", "Exhibition Schedule")}
            data-cursor-interactive="true"
            data-cursor-label="Schedule"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all bg-black/[0.02] dark:bg-white/[0.04] cursor-pointer"
          >
            <Calendar className="size-3.5 text-amber-500" />
            <span className="hidden sm:inline">Schedule</span>
          </button>

          <div className="pl-0.5">
            <LandscapeOrbToggle size={30} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col pt-6 sm:pt-10 pb-16">
        {/* Editorial Heading & Filter Strip */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
            <div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase">
                All Films
              </h1>
              <p className="mt-2 text-xs sm:text-base text-[var(--color-text-secondary)] font-serif leading-relaxed max-w-xl">
                Drag or scroll to browse the 3D exhibition gallery. Tap any poster to explore archival stills and showtimes.
              </p>
            </div>

            {/* Category Filter Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-tertiary)] mr-2 shrink-0 hidden sm:flex items-center gap-1">
                <SlidersHorizontal className="size-3" />
                <span>Filter:</span>
              </span>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  data-cursor-interactive="true"
                  data-cursor-label="Filter"
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all shrink-0 cursor-pointer",
                    selectedCategory === cat.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs scale-102"
                      : "border border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)]"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D TACTILE MAGAZINE SCROLLER (Skecher UI Component) */}
        <div className="w-full relative my-auto py-4 overflow-hidden">
          <MagazineScroller
            images={magazinePosters}
            cardWidth={isMobile ? 210 : 260}
            cardHeight={isMobile ? 315 : 390}
            gap={isMobile ? 26 : 38}
            slices={1}
            height={isMobile ? 470 : 560}
            wheelSpeed={1.15}
            dragSpeed={1.2}
            bendStrength={82}
            maxBend={96}
            lockWheel={false}
            onItemClick={(poster) => {
              const fullFilm =
                archiveFilmsList.find((f) => f.id === poster.id || f.title.toLowerCase() === poster.title?.toLowerCase()) ||
                ({
                  id: poster.id ?? 1,
                  title: poster.title || "Film Details",
                  subtitle: `${poster.director || "Archival Master"} · ${poster.category || "Theatrical Exhibition"}`,
                  meta: poster.year || "2026",
                  image: poster.src,
                  category: poster.category || "Theatrical Exhibition",
                  imdbRating: poster.imdbRating || "8.5",
                  duration: poster.duration || "2h 00m",
                  tagline: poster.tagline || "Archival theatrical presentation.",
                  synopsis: poster.synopsis || "",
                  stills: poster.stills || [{ url: poster.src, caption: poster.title }],
                } as ArchiveFilmItem);
              setActiveFilmForModal(fullFilm);
            }}
            className="w-full"
          />
        </div>
      </main>

      {/* Film Detail Modal when card is clicked */}
      {activeFilmForModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveFilmForModal(null);
            }
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--color-bg-base)] border border-[var(--color-border)] shadow-2xl p-5 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-base)]/95 backdrop-blur-md z-30">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-500 font-semibold block">
                  Theatrical Archive
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  {activeFilmForModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveFilmForModal(null)}
                data-cursor-interactive="true"
                data-cursor-label="Close"
                className="px-3.5 py-1.5 rounded-full border border-[var(--color-border)] hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-primary)] transition-all cursor-pointer font-mono text-xs font-semibold flex items-center gap-1.5"
              >
                <span>✕</span>
                <span>Close</span>
              </button>
            </div>

            <FilmModalView
              film={{
                id: activeFilmForModal.id,
                title: activeFilmForModal.title,
                image: activeFilmForModal.image,
                category: activeFilmForModal.category,
                imdbRating: activeFilmForModal.imdbRating,
                director: activeFilmForModal.subtitle?.split("·")[0]?.trim() || "Archival Master",
                year: activeFilmForModal.meta,
                duration: activeFilmForModal.duration,
                tagline: activeFilmForModal.tagline,
                synopsis: activeFilmForModal.synopsis,
                stills: (activeFilmForModal as any).stills,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <CinemaFooter
        onNavigateHome={() => navigate("/", "Works '26 · Index")}
        onNavigateSchedule={() => navigate("/schedule", "Exhibition Schedule")}
      />
    </div>
  );
}
