import fs from 'fs/promises';
import path from 'path';
import {
  INITIAL_FILMS,
  CINEMA_HALLS,
  INITIAL_SCREENINGS,
  type CinemaFilm,
  type CinemaHall,
  type Screening,
} from './cinema-data';

export interface CinemaStoreData {
  films: CinemaFilm[];
  wheelIds: number[];
  halls: CinemaHall[];
  screenings: Screening[];
  lastUpdated: string;
}

import os from 'os';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'cinema-store.json');
const TMP_FILE = path.join(os.tmpdir(), 'cinema-store.json');

const DEFAULT_STORE: CinemaStoreData = {
  films: INITIAL_FILMS,
  wheelIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  halls: CINEMA_HALLS,
  screenings: INITIAL_SCREENINGS,
  lastUpdated: new Date().toISOString(),
};

let memoryStore: CinemaStoreData | null = null;

export async function getCinemaStore(): Promise<CinemaStoreData> {
  if (memoryStore) {
    return memoryStore;
  }

  // 1. Try reading committed project data file
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as CinemaStoreData;
    if (parsed && Array.isArray(parsed.films) && Array.isArray(parsed.wheelIds)) {
      memoryStore = parsed;
      return parsed;
    }
  } catch {
    // Continue to fallback
  }

  // 2. Try reading from serverless tmpdir fallback
  try {
    const raw = await fs.readFile(TMP_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as CinemaStoreData;
    if (parsed && Array.isArray(parsed.films) && Array.isArray(parsed.wheelIds)) {
      memoryStore = parsed;
      return parsed;
    }
  } catch {
    // Continue to initialization
  }

  // 3. Try initializing data directory (local development)
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem on Vercel, try tmpdir
    try {
      await fs.writeFile(TMP_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
    } catch {
      // Memory store fallback
    }
  }

  memoryStore = DEFAULT_STORE;
  return DEFAULT_STORE;
}

export async function saveCinemaStore(
  updates: Partial<CinemaStoreData>
): Promise<CinemaStoreData> {
  const current = await getCinemaStore();
  const next: CinemaStoreData = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  memoryStore = next;

  // Persist to disk if writable, fallback to /tmp or memory on Vercel serverless
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), 'utf-8');
  } catch {
    try {
      await fs.writeFile(TMP_FILE, JSON.stringify(next, null, 2), 'utf-8');
    } catch {
      // In-memory update maintained
    }
  }

  return next;
}

export async function getAllFilms(): Promise<CinemaFilm[]> {
  const store = await getCinemaStore();
  return store.films;
}

export async function getFilmById(id: number): Promise<CinemaFilm | undefined> {
  const store = await getCinemaStore();
  return store.films.find((f) => f.id === id);
}

export async function upsertFilm(
  filmData: Partial<CinemaFilm> & { title: string }
): Promise<CinemaFilm> {
  const store = await getCinemaStore();
  let films = [...store.films];
  let wheelIds = [...store.wheelIds];

  const nowId = filmData.id || (films.length > 0 ? Math.max(...films.map((f) => f.id)) + 1 : 1);
  const slug =
    filmData.slug ||
    filmData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const existingIndex = films.findIndex((f) => f.id === nowId);

  const cleanFilm: CinemaFilm = {
    id: nowId,
    slug,
    title: filmData.title.trim(),
    image:
      filmData.image ||
      'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    category: filmData.category || 'Cinema Masterpiece',
    imdbRating: filmData.imdbRating || '8.5',
    director: filmData.director || 'Visionary Director',
    year: Number(filmData.year) || new Date().getFullYear(),
    duration: filmData.duration || '2h 00m',
    tagline: filmData.tagline || 'Exclusively in theatrical exhibition.',
    synopsis: filmData.synopsis || 'An extraordinary work of cinema presented in archival resolution.',
    stills: filmData.stills || [{ url: filmData.image || '', caption: filmData.title }],
  };

  if (existingIndex >= 0) {
    films[existingIndex] = cleanFilm;
  } else {
    films.push(cleanFilm);
    // If fewer than 10 wheel films, automatically add to wheel
    if (wheelIds.length < 10) {
      wheelIds.push(cleanFilm.id);
    }
  }

  await saveCinemaStore({ films, wheelIds });
  return cleanFilm;
}

export async function deleteFilmById(id: number): Promise<boolean> {
  const store = await getCinemaStore();
  const films = store.films.filter((f) => f.id !== id);
  const wheelIds = store.wheelIds.filter((wheelId) => wheelId !== id);
  const screenings = store.screenings.filter((s) => s.filmId !== id);

  await saveCinemaStore({ films, wheelIds, screenings });
  return true;
}

export async function setWheelFilmIds(wheelIds: number[]): Promise<CinemaFilm[]> {
  const store = await getCinemaStore();
  const validIds = wheelIds.filter((id) => store.films.some((f) => f.id === id));
  await saveCinemaStore({ wheelIds: validIds.slice(0, 10) });

  return validIds
    .map((id) => store.films.find((f) => f.id === id))
    .filter((f): f is CinemaFilm => Boolean(f));
}

export async function getWheelFilms(): Promise<CinemaFilm[]> {
  const store = await getCinemaStore();
  const wheelMap = new Map(store.films.map((f) => [f.id, f]));
  const ordered = store.wheelIds
    .map((id) => wheelMap.get(id))
    .filter((f): f is CinemaFilm => Boolean(f));

  if (ordered.length === 0) {
    return store.films.slice(0, 10);
  }

  return ordered;
}

export async function getAllScreenings(): Promise<Screening[]> {
  const store = await getCinemaStore();
  return store.screenings;
}

export async function upsertScreening(
  slot: Partial<Screening> & { filmId: number; date: string; time: string; hallId: string }
): Promise<Screening> {
  const store = await getCinemaStore();
  let screenings = [...store.screenings];

  const slotId = slot.id || `scr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const cleanScreening: Screening = {
    id: slotId,
    filmId: Number(slot.filmId),
    date: slot.date,
    time: slot.time,
    hallId: slot.hallId,
    tag: slot.tag || 'Standard',
    format: slot.format || 'Theatrical 4K',
    availability: slot.availability || 'Available',
    notes: slot.notes || '',
  };

  const existingIndex = screenings.findIndex((s) => s.id === slotId);
  if (existingIndex >= 0) {
    screenings[existingIndex] = cleanScreening;
  } else {
    screenings.push(cleanScreening);
  }

  await saveCinemaStore({ screenings });
  return cleanScreening;
}

export async function upsertMultipleScreenings(
  slots: (Partial<Screening> & { filmId: number; date: string; time: string; hallId: string })[]
): Promise<Screening[]> {
  const store = await getCinemaStore();
  let screenings = [...store.screenings];
  const savedList: Screening[] = [];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const slotId = slot.id || `scr-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`;
    const cleanScreening: Screening = {
      id: slotId,
      filmId: Number(slot.filmId),
      date: slot.date,
      time: slot.time,
      hallId: slot.hallId,
      tag: slot.tag || 'Standard',
      format: slot.format || 'Theatrical 4K',
      availability: slot.availability || 'Available',
      notes: slot.notes || '',
    };

    const existingIndex = screenings.findIndex((s) => s.id === slotId);
    if (existingIndex >= 0) {
      screenings[existingIndex] = cleanScreening;
    } else {
      screenings.push(cleanScreening);
    }
    savedList.push(cleanScreening);
  }

  await saveCinemaStore({ screenings });
  return savedList;
}

export async function deleteScreeningById(id: string): Promise<boolean> {
  const store = await getCinemaStore();
  const screenings = store.screenings.filter((s) => s.id !== id);
  await saveCinemaStore({ screenings });
  return true;
}

