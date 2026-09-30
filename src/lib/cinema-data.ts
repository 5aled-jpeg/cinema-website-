export interface FilmStill {
  url: string;
  caption?: string;
  aspectRatio?: string;
}

export interface FilmReview {
  critic: string;
  publication: string;
  quote: string;
  rating?: string;
}

export interface FilmSpecs {
  format?: string;
  aspectRatio?: string;
  sound?: string;
  color?: string;
}

export interface FilmScreeningSlot {
  time: string;
  date: string;
  format: string;
  auditorium: string;
  availability: 'Selling Fast' | 'Available' | 'Few Seats Left';
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
  reviews: FilmReview[];
  specs: FilmSpecs;
}

export interface CinemaHall {
  id: string;
  name: string;
  shortName: string;
  type: 'vip' | 'standard' | 'kids';
  capacity: number;
  sound: string;
  projection: string;
  description: string;
}

export interface Screening {
  id: string;
  filmId: number;
  date: string; // YYYY-MM-DD e.g. "2026-09-28"
  time: string; // HH:mm e.g. "18:00"
  hallId: string;
  tag: 'VIP Salle' | 'Kids Only' | 'Standard' | 'Director Q&A' | 'Midnight Special';
  format: string;
  availability: 'Available' | 'Selling Fast' | 'Few Seats Left';
  notes?: string;
}

export const CINEMA_HALLS: CinemaHall[] = [
  {
    id: 'vip-salle',
    name: 'VIP Salle — Salon Privé',
    shortName: 'VIP Salle',
    type: 'vip',
    capacity: 34,
    sound: 'Dolby Atmos 64-Channel Private Array',
    projection: 'Artisanal Salon Presentation',
    description: 'Ultra-plush leather recliners with dedicated artisanal beverage service.',
  },
  {
    id: 'screen-1',
    name: 'Screen 1 — Grand Auditorium',
    shortName: 'Screen 1',
    type: 'standard',
    capacity: 280,
    sound: '12-Channel Custom Immersive Audio',
    projection: 'Grand Auditorium Presentation',
    description: 'Our flagship auditorium equipped for grand premiere presentations.',
  },
  {
    id: 'auditorium-2',
    name: 'Auditorium 2 — Main Hall',
    shortName: 'Auditorium 2',
    type: 'standard',
    capacity: 160,
    sound: 'Spatial Audio Precision Soundstage',
    projection: 'Digital Main Hall Presentation',
    description: 'Reference black levels and spatial audio precision.',
  },
  {
    id: 'kids-arena',
    name: 'Kids Arena — Hall 3',
    shortName: 'Kids Arena',
    type: 'kids',
    capacity: 85,
    sound: 'Soft Adaptive Family Acoustics',
    projection: 'Family-Friendly Presentation',
    description: 'Gentle ambient lighting, tiered family seating, and sound calibrated for younger ears.',
  },
];

export const INITIAL_FILMS: CinemaFilm[] = [
  {
    id: 1,
    slug: 'the-godfather',
    title: 'The Godfather',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    category: 'Crime · Drama · Classic',
    imdbRating: '9.2',
    director: 'Francis Ford Coppola',
    year: 1972,
    duration: '2h 55m',
    tagline: "An offer you can't refuse.",
    synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son. Photographed in painterly chiaroscuro by Gordon Willis.',
    stills: [
      {
        url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
        caption: 'The study of Don Vito Corleone',
        aspectRatio: '1.85:1 Academy',
      },
      {
        url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80',
        caption: 'Michael Corleone in Corleone, Sicily',
        aspectRatio: '1.85:1 Academy',
      },
      {
        url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        caption: 'Opening wedding reception exterior',
        aspectRatio: '1.85:1 Academy',
      },
    ],
    reviews: [
      {
        critic: 'Roger Ebert',
        publication: 'Chicago Sun-Times',
        quote: 'The Godfather is not only a great popular entertainment, but an inspired work of cinematic art. One of the undisputed masterworks of world cinema.',
        rating: '4/4 ★',
      },
      {
        critic: 'Sight & Sound',
        publication: 'BFI',
        quote: 'A monumental tragedy of the American dream, photographed with painterly chiaroscuro by Gordon Willis.',
        rating: 'All-Time Top 10',
      },
    ],
    specs: {
      format: 'Theatrical Feature',
      aspectRatio: '1.85:1 Academy Flat',
      sound: 'Restored 5.1 DTS-HD Master Audio',
      color: 'Technicolor Dye-Transfer Process',
    },
  },
  {
    id: 2,
    slug: 'resident-evil',
    title: 'Resident Evil',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    category: 'Sci-Fi · Action · Horror',
    imdbRating: '6.7',
    director: 'Paul W.S. Anderson',
    year: 2002,
    duration: '1h 40m',
    tagline: 'Survive the Hive.',
    synopsis: 'A special military unit fights a powerful, out-of-control supercomputer and hundreds of scientists who have mutated into flesh-eating creatures after a laboratory accident.',
    stills: [
      {
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
        caption: 'Alice in the subterranean Hive corridor',
        aspectRatio: '1.85:1',
      },
    ],
    reviews: [
      {
        critic: 'Peter Travers',
        publication: 'Rolling Stone',
        quote: 'A kinetic, pulse-pounding techno-horror blast that birthed a modern gaming cinema milestone.',
        rating: 'Cult Favorite',
      },
    ],
    specs: {
      format: 'Theatrical Presentation',
      aspectRatio: '1.85:1 Standard',
      sound: 'Dolby Digital 5.1 Discrete',
      color: 'Deluxe Color Laboratory',
    },
  },
  {
    id: 3,
    slug: 'sacrifice',
    title: 'Sacrifice',
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80',
    category: 'Art House · Drama · Mystery',
    imdbRating: '8.1',
    director: 'Romain Gavras',
    year: 2025,
    duration: '2h 10m',
    tagline: 'Faith is the ultimate fire.',
    synopsis: 'A high-society charity gala held on a secluded volcanic island is violently hijacked by a passionate neo-spiritual militia demanding reparations for the Earth.',
    stills: [
      {
        url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=1200&q=80',
        caption: 'The volcanic gala plateau at dawn',
        aspectRatio: '2.39:1 Anamorphic',
      },
    ],
    reviews: [
      {
        critic: 'Manohla Dargis',
        publication: 'The New York Times',
        quote: 'Gavras unleashes a furious, visually hypnotic opera of moral decay and apocalyptic beauty.',
        rating: 'Critics Pick',
      },
    ],
    specs: {
      format: 'Theatrical Feature',
      aspectRatio: '2.39:1 Scope',
      sound: 'Dolby Atmos 64-Channel',
      color: 'Kodak Vision3 500T Stock',
    },
  },
  {
    id: 4,
    slug: 'spider-man-brand-new-day',
    title: 'Spider-Man: Brand New Day',
    image: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1200&q=80',
    category: 'Action · Adventure · Sci-Fi',
    imdbRating: '8.4',
    director: 'Destin Daniel Cretton',
    year: 2026,
    duration: '2h 22m',
    tagline: 'With great responsibility comes a brand new dawn.',
    synopsis: 'Peter Parker navigates life completely stripped of his past identity, forging a raw, grounded vigilante presence through the rain-soaked winter rooftops of New York City.',
    stills: [
      {
        url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1200&q=80',
        caption: 'Peter Parker above the Queensboro Bridge',
        aspectRatio: '2.39:1 Scope',
      },
    ],
    reviews: [
      {
        critic: 'David Ehrlich',
        publication: 'IndieWire',
        quote: 'The most tactile, emotionally centered and visually daring Spider-Man entry since the Raimi golden age.',
        rating: 'A-',
      },
    ],
    specs: {
      format: 'Theatrical Presentation',
      aspectRatio: '2.39:1 Scope',
      sound: 'Dolby Atmos Spatial Audio',
      color: 'Studio Digital Master',
    },
  },
  {
    id: 5,
    slug: 'weapons',
    title: 'Weapons',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    category: 'Horror · Mystery · Thriller',
    imdbRating: '7.8',
    director: 'Zach Cregger',
    year: 2026,
    duration: '1h 58m',
    tagline: 'Every truth is armed.',
    synopsis: 'An interrelated, multi-story horror epic tracking the midnight disappearance of high school seniors in a small Florida town.',
    stills: [
      {
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        caption: 'The suburban cul-de-sac at 3:00 AM',
        aspectRatio: '2.39:1 Anamorphic',
      },
    ],
    reviews: [
      {
        critic: 'Bilge Ebiri',
        publication: 'Vulture',
        quote: 'Zach Cregger delivers an audacious, terrifying puzzle-box thriller that defies expectation at every turn.',
        rating: 'Must See',
      },
    ],
    specs: {
      format: 'Theatrical Presentation',
      aspectRatio: '2.39:1 Scope',
      sound: 'Dolby Atmos 7.1.4',
      color: 'Digital Cinema Master',
    },
  },
  {
    id: 6,
    slug: 'barbarian',
    title: 'Barbarian',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    category: 'Horror · Thriller · Cult',
    imdbRating: '7.0',
    director: 'Zach Cregger',
    year: 2022,
    duration: '1h 42m',
    tagline: 'Some stay here. Some leave here. Some never get out.',
    synopsis: 'A young woman traveling to Detroit for a job interview books a rental home, only to discover that a strange man is already staying there. Against her better judgement, she decides to spend the evening.',
    stills: [
      {
        url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        caption: 'The sub-basement corridor under Brightmoor',
        aspectRatio: '2.39:1 Scope',
      },
    ],
    reviews: [
      {
        critic: 'A.O. Scott',
        publication: 'The New York Times',
        quote: 'A masterclass in narrative misdirection and subterranean dread.',
        rating: 'Critics Pick',
      },
    ],
    specs: {
      format: 'Theatrical Presentation',
      aspectRatio: '2.39:1 Scope',
      sound: 'Dolby Digital 5.1 Surround',
      color: 'Digital Cinema Master',
    },
  },
  {
    id: 7,
    slug: 'the-drama',
    title: 'The Drama',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    category: 'Romance · Drama · Comedy',
    imdbRating: '7.5',
    director: 'Kristoffer Borgli',
    year: 2026,
    duration: '1h 52m',
    tagline: 'Love is a rehearsal.',
    synopsis: 'In the days leading up to what should be their picture-perfect wedding day, unexpected revelations derail what was supposed to be a simple, joyful celebration.',
    stills: [
      {
        url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
        caption: 'Rehearsal dinner in coastal Maine',
        aspectRatio: '1.66:1 European Flat',
      },
    ],
    reviews: [
      {
        critic: 'The Guardian',
        publication: 'London',
        quote: "Borgli proves once again to be cinema's most astute chronicler of social self-sabotage.",
        rating: '4/5 ★',
      },
    ],
    specs: {
      format: 'Theatrical Feature',
      aspectRatio: '1.66:1 European Flat',
      sound: '5.1 Surround Sound',
      color: 'Kodak Double-X Black & White / Color Reversal',
    },
  },
];

export const INITIAL_SCREENINGS: Screening[] = [
  // --- SATURDAY 28 SEPTEMBER 2026 ---
  {
    id: 'scr-28-sp-kids',
    filmId: 4, // Spider-Man: Brand New Day
    date: '2026-09-28',
    time: '10:00',
    hallId: 'kids-arena',
    tag: 'Kids Only',
    format: 'Family Matinee',
    availability: 'Available',
    notes: 'Acoustics calibrated for young ears. Complimentary kids superhero sticker sheet included.',
  },
  {
    id: 'scr-28-sp-vip',
    filmId: 4, // Spider-Man: Brand New Day
    date: '2026-09-28',
    time: '15:00',
    hallId: 'vip-salle',
    tag: 'VIP Salle',
    format: 'Dolby Atmos Luxury Recliner',
    availability: 'Selling Fast',
    notes: 'Includes artisanal popcorn & private lounge access before the screening.',
  },
  {
    id: 'scr-28-sp-std',
    filmId: 4, // Spider-Man: Brand New Day
    date: '2026-09-28',
    time: '18:00',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Few Seats Left',
    notes: 'Primary auditorium presentation.',
  },
  {
    id: 'scr-28-gf-std',
    filmId: 1, // The Godfather
    date: '2026-09-28',
    time: '17:30',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Few Seats Left',
    notes: 'Restored studio print with magnetic stereophonic sound.',
  },
  {
    id: 'scr-28-gf-dolby',
    filmId: 1, // The Godfather
    date: '2026-09-28',
    time: '21:00',
    hallId: 'auditorium-2',
    tag: 'Standard',
    format: 'Digital Presentation',
    availability: 'Available',
    notes: 'Supervised by Francis Ford Coppola.',
  },
  {
    id: 'scr-28-wp-vip',
    filmId: 5, // Weapons
    date: '2026-09-28',
    time: '20:30',
    hallId: 'vip-salle',
    tag: 'VIP Salle',
    format: 'Exclusive Preview',
    availability: 'Selling Fast',
    notes: 'Advance festival sneak preview. No photography permitted.',
  },
  {
    id: 'scr-28-bb-mid',
    filmId: 6, // Barbarian
    date: '2026-09-28',
    time: '22:45',
    hallId: 'screen-1',
    tag: 'Midnight Special',
    format: 'Late-Night Special',
    availability: 'Available',
    notes: 'Late-night genre programming. Doors close strictly at 22:40.',
  },

  // --- SUNDAY 29 SEPTEMBER 2026 ---
  {
    id: 'scr-29-sp-kids',
    filmId: 4,
    date: '2026-09-29',
    time: '11:30',
    hallId: 'kids-arena',
    tag: 'Kids Only',
    format: 'Family Matinee',
    availability: 'Available',
  },
  {
    id: 'scr-29-gf-vip',
    filmId: 1,
    date: '2026-09-29',
    time: '14:00',
    hallId: 'vip-salle',
    tag: 'VIP Salle',
    format: 'VIP Salon Matinee',
    availability: 'Selling Fast',
  },
  {
    id: 'scr-29-sp-vip',
    filmId: 4,
    date: '2026-09-29',
    time: '16:30',
    hallId: 'vip-salle',
    tag: 'VIP Salle',
    format: 'VIP Luxury Screening',
    availability: 'Few Seats Left',
  },
  {
    id: 'scr-29-gf-std',
    filmId: 1,
    date: '2026-09-29',
    time: '19:00',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Few Seats Left',
  },
  {
    id: 'scr-29-sp-std',
    filmId: 4,
    date: '2026-09-29',
    time: '20:00',
    hallId: 'auditorium-2',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Available',
  },
  {
    id: 'scr-29-re-mid',
    filmId: 2,
    date: '2026-09-29',
    time: '22:30',
    hallId: 'auditorium-2',
    tag: 'Midnight Special',
    format: 'Midnight Retrospective',
    availability: 'Available',
  },

  // --- MONDAY 30 SEPTEMBER 2026 ---
  {
    id: 'scr-30-sc-vip',
    filmId: 3,
    date: '2026-09-30',
    time: '18:30',
    hallId: 'vip-salle',
    tag: 'VIP Salle',
    format: 'VIP Presentation',
    availability: 'Available',
  },
  {
    id: 'scr-30-td-std',
    filmId: 7,
    date: '2026-09-30',
    time: '20:45',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Available',
  },
  {
    id: 'scr-30-sp-std',
    filmId: 4,
    date: '2026-09-30',
    time: '21:15',
    hallId: 'auditorium-2',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Available',
  },

  // --- TUESDAY 01 OCTOBER 2026 ---
  {
    id: 'scr-01-sp-vip',
    filmId: 4,
    date: '2026-10-01',
    time: '15:00',
    hallId: 'vip-salle',
    tag: 'VIP Salle',
    format: 'VIP Luxury Screening',
    availability: 'Available',
  },
  {
    id: 'scr-01-sp-std',
    filmId: 4,
    date: '2026-10-01',
    time: '18:30',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Selling Fast',
  },
  {
    id: 'scr-01-wp-std',
    filmId: 5,
    date: '2026-10-01',
    time: '21:15',
    hallId: 'auditorium-2',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Available',
  },

  // --- WEDNESDAY 02 OCTOBER 2026 ---
  {
    id: 'scr-02-gf-std',
    filmId: 1,
    date: '2026-10-02',
    time: '19:30',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Few Seats Left',
  },
  {
    id: 'scr-02-bb-mid',
    filmId: 6,
    date: '2026-10-02',
    time: '22:00',
    hallId: 'auditorium-2',
    tag: 'Midnight Special',
    format: 'Midnight Special',
    availability: 'Available',
  },

  // --- THURSDAY 03 OCTOBER 2026 ---
  {
    id: 'scr-03-sc-std',
    filmId: 3,
    date: '2026-10-03',
    time: '17:00',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Available',
  },
  {
    id: 'scr-03-sp-vip',
    filmId: 4,
    date: '2026-10-03',
    time: '19:45',
    hallId: 'vip-salle',
    tag: 'VIP Salle',
    format: 'VIP Luxury Screening',
    availability: 'Selling Fast',
  },

  // --- FRIDAY 04 OCTOBER 2026 ---
  {
    id: 'scr-04-td-std',
    filmId: 7,
    date: '2026-10-04',
    time: '18:00',
    hallId: 'auditorium-2',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Available',
  },
  {
    id: 'scr-04-gf-std',
    filmId: 1,
    date: '2026-10-04',
    time: '21:00',
    hallId: 'screen-1',
    tag: 'Standard',
    format: 'Theatrical Presentation',
    availability: 'Few Seats Left',
  },
];

// Helper functions for reading/syncing cinema data
const STORAGE_FILMS_KEY = 'murdjadjo_films_v1';
const STORAGE_SCREENINGS_KEY = 'murdjadjo_screenings_v1';

export function getFilms(): CinemaFilm[] {
  if (typeof window === 'undefined') return INITIAL_FILMS;
  try {
    const raw = localStorage.getItem(STORAGE_FILMS_KEY);
    if (!raw) return INITIAL_FILMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FILMS;
  } catch {
    return INITIAL_FILMS;
  }
}

export function saveFilms(films: CinemaFilm[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_FILMS_KEY, JSON.stringify(films));
    window.dispatchEvent(new Event('murdjadjo_data_updated'));
  } catch (err) {
    console.error('Failed to save films:', err);
  }
}

export function getScreenings(): Screening[] {
  if (typeof window === 'undefined') return INITIAL_SCREENINGS;
  try {
    const raw = localStorage.getItem(STORAGE_SCREENINGS_KEY);
    if (!raw) return INITIAL_SCREENINGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SCREENINGS;
  } catch {
    return INITIAL_SCREENINGS;
  }
}

export function saveScreenings(screenings: Screening[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SCREENINGS_KEY, JSON.stringify(screenings));
    window.dispatchEvent(new Event('murdjadjo_data_updated'));
  } catch (err) {
    console.error('Failed to save screenings:', err);
  }
}

export function getScreeningsForDate(dateStr: string, screeningsList?: Screening[]): Screening[] {
  const list = screeningsList || getScreenings();
  return list
    .filter((s) => s.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function getDistinctDates(screeningsList?: Screening[]): string[] {
  const list = screeningsList || getScreenings();
  const dateSet = new Set<string>();
  list.forEach((s) => dateSet.add(s.date));
  return Array.from(dateSet).sort();
}
