"use client"

import * as React from "react"
import { Calendar, Clapperboard, Film, Home, Sparkles } from "lucide-react"

import {
  WorksWheel,
  type WorksWheelItem,
  type WorksWheelHandle,
} from "@/registry/crafterui/ui/works-wheel"
import {
  MercuryMenu,
  type MercuryMenuItem,
} from "@/registry/crafterui/ui/mercury-menu"
import { CinemaCursor } from "@/components/cinema-cursor"
import { LandscapeOrbToggle } from "@/components/landscape-orb-toggle"
import { CinemaFooter } from "@/components/cinema-footer"
import { Component as ExperienceHero } from "@/components/ui/experience-hero"
import { useCinemaTransition } from "@/components/cinema-page-curtains"

const WORKS: WorksWheelItem[] = [
  {
    id: 1,
    title: "The Godfather",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
    href: "#the-godfather",
    category: "Crime · Drama · Classic",
    imdbRating: "9.2",
    director: "Francis Ford Coppola",
    year: 1972,
    duration: "2h 55m",
    tagline: "An offer you can't refuse.",
    synopsis: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son. Photographed in painterly chiaroscuro by Gordon Willis and restored under the personal supervision of Francis Ford Coppola.",
    stills: [
      {
        url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
        caption: "The study of Don Vito Corleone",
        aspectRatio: "1.85:1 Academy",
      },
      {
        url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80",
        caption: "Michael Corleone in Corleone, Sicily",
        aspectRatio: "1.85:1 Academy",
      },
      {
        url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
        caption: "Opening wedding reception exterior",
        aspectRatio: "1.85:1 Academy",
      },
    ],
    reviews: [
      {
        critic: "Roger Ebert",
        publication: "Chicago Sun-Times",
        quote: "The Godfather is not only a great popular entertainment, but an inspired work of cinematic art. One of the undisputed masterworks of world cinema.",
        rating: "4/4 ★",
      },
      {
        critic: "Pauline Kael",
        publication: "The New Yorker",
        quote: "If ever there was a great example of how the best popular movies come out of a merger of commerce and art, The Godfather is it.",
        rating: "Essential",
      },
      {
        critic: "Sight & Sound",
        publication: "BFI",
        quote: "A monumental tragedy of the American dream, photographed with painterly chiaroscuro by Gordon Willis.",
        rating: "All-Time Top 10",
      },
    ],
    specs: {
      format: "Theatrical Presentation",
      aspectRatio: "1.85:1 Academy Flat",
      sound: "Restored 5.1 DTS-HD Master Audio",
      color: "Technicolor Dye-Transfer Process",
    },
    screenings: [
      "Fri 17:30 — Screen 1",
      "Fri 21:00 — Dolby Atmos",
      "Sat 19:00 — Screen 1",
    ],
    screeningSlots: [
      {
        time: "17:30",
        date: "Fri Sep 28",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Few Seats Left",
      },
      {
        time: "21:00",
        date: "Fri Sep 28",
        format: "Dolby Atmos",
        auditorium: "Auditorium 2",
        availability: "Available",
      },
      {
        time: "19:00",
        date: "Sat Sep 29",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Selling Fast",
      },
    ],
  },
  {
    id: 2,
    title: "Resident Evil",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
    href: "#resident-evil",
    category: "Sci-Fi · Action · Horror",
    imdbRating: "6.7",
    director: "Paul W.S. Anderson",
    year: 2002,
    duration: "1h 40m",
    tagline: "Survive the Hive.",
    synopsis: "A special military unit fights a powerful, out-of-control supercomputer and hundreds of scientists who have mutated into flesh-eating creatures after a laboratory accident. Presented for our Midnight Genre Retrospective.",
    stills: [
      {
        url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
        caption: "Alice in the subterranean Hive corridor",
        aspectRatio: "1.85:1",
      },
      {
        url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
        caption: "Red Queen central mainframe chamber",
        aspectRatio: "1.85:1",
      },
    ],
    reviews: [
      {
        critic: "Peter Travers",
        publication: "Rolling Stone",
        quote: "A kinetic, pulse-pounding techno-horror blast that birthed a modern gaming cinema milestone.",
        rating: "Cult Favorite",
      },
      {
        critic: "Sight & Sound",
        publication: "BFI",
        quote: "Anderson crafts a geometric, claustrophobic industrial labyrinth elevated by Marco Beltrami and Marilyn Manson's visceral score.",
        rating: "Archival Pick",
      },
    ],
    specs: {
      format: "Standard Presentation",
      aspectRatio: "1.85:1 Standard",
      sound: "Dolby Digital 5.1 Discrete",
      color: "Deluxe Color Laboratory",
    },
    screenings: [
      "Fri 18:00 — Dolby Atmos",
      "Fri 21:15 — Screen 2",
      "Sat 23:00 — VIP Salon",
    ],
    screeningSlots: [
      {
        time: "18:00",
        date: "Fri Sep 28",
        format: "Dolby Atmos",
        auditorium: "Auditorium 3",
        availability: "Available",
      },
      {
        time: "21:15",
        date: "Fri Sep 28",
        format: "Standard",
        auditorium: "Screen 2",
        availability: "Few Seats Left",
      },
      {
        time: "23:00",
        date: "Sat Sep 29",
        format: "VIP Salon",
        auditorium: "VIP Screening Lounge",
        availability: "Selling Fast",
      },
    ],
  },
  {
    id: 3,
    title: "Sacrifice",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    href: "#sacrifice",
    category: "Action · Thriller · Satire",
    imdbRating: "8.1",
    director: "Romain Gavras",
    year: 2025,
    duration: "1h 54m",
    tagline: "Faith is the ultimate currency.",
    synopsis: "When a high-society charity gala on a secluded Mediterranean volcanic island is taken hostage by radical purists, an uneasy alliance between an eccentric billionaire and a washed-up stunt performer triggers an explosive battle for survival.",
    stills: [
      {
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
        caption: "Volcanic caldera ridge standoff",
        aspectRatio: "2.39:1 Anamorphic",
      },
      {
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        caption: "Charity gala ballroom siege",
        aspectRatio: "2.39:1 Anamorphic",
      },
    ],
    reviews: [
      {
        critic: "David Ehrlich",
        publication: "IndieWire",
        quote: "Romain Gavras unleashes a ferociously stylized, razor-sharp satire of modern decadence that detonates across the screen.",
        rating: "A-",
      },
      {
        critic: "Cahiers du Cinéma",
        publication: "Paris",
        quote: "Pure visual electricity. Gavras commands large-format cinema with the choreography of an operatic street war.",
        rating: "Critics Pick",
      },
    ],
    specs: {
      format: "Theatrical Presentation",
      aspectRatio: "2.39:1 Scope",
      sound: "Dolby Atmos 64-Channel Immersive",
      color: "Arri Color Science Master Grade",
    },
    screenings: [
      "Fri 19:15 — Screen 1",
      "Fri 22:00 — Dolby Atmos",
      "Sat 18:30 — Screen 1",
    ],
    screeningSlots: [
      {
        time: "19:15",
        date: "Fri Sep 28",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Available",
      },
      {
        time: "22:00",
        date: "Fri Sep 28",
        format: "Dolby Atmos",
        auditorium: "Auditorium 1",
        availability: "Few Seats Left",
      },
      {
        time: "18:30",
        date: "Sat Sep 29",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Selling Fast",
      },
    ],
  },
  {
    id: 4,
    title: "Spider-Man: Brand New Day",
    image: "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1200&q=80",
    href: "#spider-man-brand-new-day",
    category: "Action · Adventure · Sci-Fi",
    imdbRating: "8.8",
    director: "Destin Daniel Cretton",
    year: 2026,
    duration: "2h 28m",
    tagline: "A clean slate. A new shadow.",
    synopsis: "Stripped of his identity, Peter Parker navigates the gritty streets of Manhattan as an anonymous protector, facing the rise of an underground crime syndicate that threatens to tear the city apart.",
    stills: [
      {
        url: "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1200&q=80",
        caption: "Rain-slicked Manhattan skyline descent",
        aspectRatio: "1.90:1",
      },
      {
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        caption: "Chinatown rooftop reconnaissance",
        aspectRatio: "1.90:1",
      },
    ],
    reviews: [
      {
        critic: "Justin Chang",
        publication: "Los Angeles Times",
        quote: "A grounded, emotionally resonant return to street-level heroism with breathtaking aerial cinematography.",
        rating: "Outstanding",
      },
      {
        critic: "Total Film",
        publication: "London",
        quote: "Spectacular in every frame. The tactile action and raw character stakes make this an instant high-water mark.",
        rating: "5/5 ★",
      },
    ],
    specs: {
      format: "Digital Presentation",
      aspectRatio: "1.90:1 / 2.39:1 Scope",
      sound: "12-Channel Immersive Audio",
      color: "HDR10 Exhibition Master",
    },
    screenings: [
      "Fri 16:45 — Screen 1",
      "Fri 20:30 — Screen 1",
      "Sat 14:15 — Screen 1",
    ],
    screeningSlots: [
      {
        time: "16:45",
        date: "Fri Sep 28",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Selling Fast",
      },
      {
        time: "20:30",
        date: "Fri Sep 28",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Few Seats Left",
      },
      {
        time: "14:15",
        date: "Sat Sep 29",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Available",
      },
    ],
  },
  {
    id: 5,
    title: "Weapons",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    href: "#weapons",
    category: "Mystery · Horror · Drama",
    imdbRating: "8.4",
    director: "Zach Cregger",
    year: 2025,
    duration: "2h 08m",
    tagline: "Every secret leaves a trace.",
    synopsis: "An interconnected mystery revolving around the disappearance of high school students in a sleepy coastal community, told through shifting perspectives that reveal a sinister web of paranoia, grief, and generational dread.",
    stills: [
      {
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        caption: "Fog-drenched coastal crossroads at twilight",
        aspectRatio: "2.39:1 Anamorphic",
      },
      {
        url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
        caption: "Municipal archive discovery",
        aspectRatio: "2.39:1 Anamorphic",
      },
    ],
    reviews: [
      {
        critic: "Bilge Ebiri",
        publication: "Vulture",
        quote: "Cregger confirms he is one of the most daring genre architects working today. Relentless, terrifying, and deeply human.",
        rating: "Critic's Pick",
      },
      {
        critic: "The A.V. Club",
        publication: "Chicago",
        quote: "A masterclass in narrative misdirection and sustained dread that keeps audiences breathless until the final second.",
        rating: "A",
      },
    ],
    specs: {
      format: "Panavision Anamorphic",
      aspectRatio: "2.39:1 Anamorphic Scope",
      sound: "Dolby Atmos Immersive",
      color: "Kodak Vision3 5219 Emulsion",
    },
    screenings: [
      "Fri 18:15 — Dolby Atmos",
      "Fri 21:45 — VIP Salon",
      "Sat 20:00 — Dolby Atmos",
    ],
    screeningSlots: [
      {
        time: "18:15",
        date: "Fri Sep 28",
        format: "Dolby Atmos",
        auditorium: "Auditorium 2",
        availability: "Available",
      },
      {
        time: "21:45",
        date: "Fri Sep 28",
        format: "VIP Salon",
        auditorium: "VIP Salon Lounge",
        availability: "Few Seats Left",
      },
      {
        time: "20:00",
        date: "Sat Sep 29",
        format: "Dolby Atmos",
        auditorium: "Auditorium 2",
        availability: "Selling Fast",
      },
    ],
  },
  {
    id: 6,
    title: "Barbarian",
    image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=80",
    href: "#barbarian",
    category: "Horror · Mystery · Thriller",
    imdbRating: "7.0",
    director: "Zach Cregger",
    year: 2022,
    duration: "1h 42m",
    tagline: "Some doors are meant to stay locked.",
    synopsis: "A young woman arriving in Detroit for a job interview finds her rental home double-booked with a strange man. Deciding to stay the night, she soon discovers there's far more to fear than just an unexpected guest.",
    stills: [
      {
        url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=80",
        caption: "476 Barbary Street exterior at nightfall",
        aspectRatio: "2.39:1",
      },
      {
        url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
        caption: "The subterranean hidden corridor",
        aspectRatio: "2.39:1",
      },
    ],
    reviews: [
      {
        critic: "Clarisse Loughrey",
        publication: "The Independent",
        quote: "Brilliant, subversive, and gleefully unpredictable. One of the sharpest horror films in recent memory.",
        rating: "5/5 ★",
      },
      {
        critic: "Rolling Stone",
        publication: "New York",
        quote: "A wild thrill ride that continually pulls the rug out from under the audience with breathtaking skill.",
        rating: "Certified Fresh",
      },
    ],
    specs: {
      format: "Digital Master Presentation",
      aspectRatio: "2.39:1 Scope",
      sound: "5.1 Surround Sound Discrete",
      color: "ACES Precision Color Pipeline",
    },
    screenings: [
      "Fri 20:00 — Dolby Atmos",
      "Fri 23:15 — VIP Salon",
      "Sat 22:30 — Dolby Atmos",
    ],
    screeningSlots: [
      {
        time: "20:00",
        date: "Fri Sep 28",
        format: "Dolby Atmos",
        auditorium: "Auditorium 3",
        availability: "Available",
      },
      {
        time: "23:15",
        date: "Fri Sep 28",
        format: "VIP Salon",
        auditorium: "VIP Salon Lounge",
        availability: "Selling Fast",
      },
      {
        time: "22:30",
        date: "Sat Sep 29",
        format: "Dolby Atmos",
        auditorium: "Auditorium 3",
        availability: "Available",
      },
    ],
  },
  {
    id: 7,
    title: "The Drama",
    image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80",
    href: "#the-drama",
    category: "Dark Comedy · Romance · Drama",
    imdbRating: "8.6",
    director: "Kristoffer Borgli",
    year: 2026,
    duration: "1h 58m",
    tagline: "A wedding without secrets is no wedding at all.",
    synopsis: "In the days leading up to what should be an idyllic Parisian nuptial celebration, an unexpected confession unravels the couple's relationship, spiraling into a razor-sharp, surreal comedy of errors and psychological absurdity.",
    stills: [
      {
        url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80",
        caption: "Rehearsal dinner terrace dialogue",
        aspectRatio: "1.66:1 European",
      },
      {
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        caption: "The Parisian salon evening confession",
        aspectRatio: "1.66:1 European",
      },
    ],
    reviews: [
      {
        critic: "Guy Lodge",
        publication: "Variety",
        quote: "A deliciously uncomfortable satire of modern romance and social performance, directed with precision and wicked humor.",
        rating: "Fest Winner",
      },
      {
        critic: "The Guardian",
        publication: "London",
        quote: "Borgli proves once again to be cinema's most astute chronicler of social self-sabotage.",
        rating: "4/5 ★",
      },
    ],
    specs: {
      format: "Theatrical Presentation",
      aspectRatio: "1.66:1 European Flat",
      sound: "5.1 Surround Sound",
      color: "Kodak Double-X Black & White / Color Reversal",
    },
    screenings: [
      "Fri 17:00 — Screen 2",
      "Fri 19:45 — Dolby Atmos",
      "Sat 21:30 — Screen 1",
    ],
    screeningSlots: [
      {
        time: "17:00",
        date: "Fri Sep 28",
        format: "Standard",
        auditorium: "Screen 2",
        availability: "Few Seats Left",
      },
      {
        time: "19:45",
        date: "Fri Sep 28",
        format: "Dolby Atmos",
        auditorium: "Auditorium 1",
        availability: "Available",
      },
      {
        time: "21:30",
        date: "Sat Sep 29",
        format: "Standard",
        auditorium: "Screen 1",
        availability: "Available",
      },
    ],
  },
]

const glyph = "size-3.5 opacity-70"

export default function WorksWheelDemo() {
  const wheelRef = React.useRef<WorksWheelHandle>(null)
  const [, setActiveTab] = React.useState<string>("films")
  const { navigate } = useCinemaTransition()

  const menuItems: MercuryMenuItem[] = React.useMemo(
    () => [
      {
        label: "Home Page",
        icon: <Home className={glyph} aria-hidden="true" />,
        onSelect: () => {
          setActiveTab("home")
          wheelRef.current?.to(0)
        },
      },
      {
        label: "Featured",
        icon: <Film className={glyph} aria-hidden="true" />,
        onSelect: () => {
          setActiveTab("films")
          wheelRef.current?.to(1)
        },
      },
      {
        label: "All Movies",
        icon: <Clapperboard className={glyph} aria-hidden="true" />,
        onSelect: () => {
          navigate("/movies", "Complete Cinema Archive")
        },
      },
      {
        label: "Schedule",
        icon: <Calendar className={glyph} aria-hidden="true" />,
        onSelect: () => {
          navigate("/schedule", "Exhibition Schedule")
        },
      },
      {
        label: "Curations",
        icon: <Sparkles className={glyph} aria-hidden="true" />,
        onSelect: () => {
          setActiveTab("curations")
          wheelRef.current?.to(5)
        },
      },
    ],
    [navigate],
  )

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Custom Spring Animated Cursor */}
      <CinemaCursor attachToParent={false} />

      {/* Desktop Landscape Orb Dark/Light Theme Toggle (Top-Left Corner - Desktop only) */}
      <div className="fixed top-8 left-8 z-50 hidden md:block">
        <LandscapeOrbToggle size={42} />
      </div>

      {/* Mobile Top Navigation Bar (Mobile only - eliminates floating corner clutter) */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 md:hidden px-4 flex items-center justify-between bg-[var(--color-bg-base)]/92 backdrop-blur-xl border-b border-[var(--color-border)]/60 transition-colors">
        <button
          type="button"
          onClick={() => wheelRef.current?.to(0)}
          className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-[var(--color-text-primary)] cursor-pointer"
        >
          <span className="font-serif italic font-normal text-amber-500 text-base">M</span>
          <span className="font-sans font-bold tracking-tight">Murdjadjo</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/movies", "Complete Cinema Archive")}
            className="px-2.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[var(--color-border)] bg-black/5 dark:bg-white/10 text-[var(--color-text-primary)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Film className="size-3 text-amber-500" />
            <span>Movies</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/schedule", "Exhibition Schedule")}
            className="px-2.5 py-1.5 rounded-full text-xs font-mono font-medium border border-[var(--color-border)] bg-black/5 dark:bg-white/10 text-[var(--color-text-primary)] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="size-3 text-amber-500" />
            <span>Schedule</span>
          </button>

          <div className="pl-0.5">
            <LandscapeOrbToggle size={30} />
          </div>
        </div>
      </header>

      {/* Unified Timeline: Experience Hero (t=0) -> Works Wheel (t=1..7) -> Cinema Footer (t=8) */}
      <WorksWheel
        ref={wheelRef}
        items={WORKS}
        label="Works '26"
        action="View"
        hero={<ExperienceHero onExplore={() => wheelRef.current?.to(1)} />}
        onDiscoverAll={() => navigate("/movies", "Complete Cinema Archive")}
        menu={
          <MercuryMenu
            items={menuItems}
            align="left"
            panelWidth={164}
            size={36}
            label="Cinema Navigation Menu"
          />
        }
        footer={
          <CinemaFooter
            onNavigateHome={() => wheelRef.current?.to(0)}
            onNavigateMovies={() => {
              navigate("/movies", "Complete Cinema Archive")
            }}
            onNavigateSchedule={() => {
              navigate("/schedule", "Exhibition Schedule")
            }}
            onNavigateCurations={() => wheelRef.current?.to(5)}
          />
        }
      />
    </main>
  )
}
