'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Film,
  Calendar,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  LogOut,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Star,
  Clock,
  Layers,
  Sliders,
  RefreshCw,
  X,
  Zap,
  Info,
  Tv,
} from 'lucide-react';
import {
  type CinemaFilm,
  type Screening,
  type CinemaHall,
  CINEMA_HALLS,
} from '@/lib/cinema-data';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'wheel' | 'catalogue' | 'screenings'>('wheel');

  // Core data states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [films, setFilms] = useState<CinemaFilm[]>([]);
  const [wheelIds, setWheelIds] = useState<number[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [halls, setHalls] = useState<CinemaHall[]>(CINEMA_HALLS);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // Notification toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Film Add / Edit Modal state
  const [filmModalOpen, setFilmModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<CinemaFilm | null>(null);
  const [imdbFetchQuery, setImdbFetchQuery] = useState('');
  const [fetchingImdb, setFetchingImdb] = useState(false);
  const [filmFormData, setFilmFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    category: 'Cinema Masterpiece',
    imdbRating: '8.5',
    director: 'Visionary Director',
    duration: '2h 15m',
    tagline: 'An indelible theatrical exhibition.',
    synopsis: '',
    image: '',
    isOnWheel: false,
  });

  // Screening Add / Edit Modal state
  const [screeningModalOpen, setScreeningModalOpen] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [screeningFormData, setScreeningFormData] = useState({
    filmId: 1,
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    hallId: 'screen-1',
    format: '35mm Archival Print',
    tag: 'Standard' as Screening['tag'],
    availability: 'Available' as Screening['availability'],
    notes: '',
  });

  // Multi-Showtime Program Modal state (Schedule film multiple times in a day)
  const [screeningViewMode, setScreeningViewMode] = useState<'grouped' | 'list'>('grouped');
  const [multiScreeningModalOpen, setMultiScreeningModalOpen] = useState(false);
  const [multiScreeningData, setMultiScreeningData] = useState<{
    filmId: number;
    date: string;
    slots: Array<{
      time: string;
      hallId: string;
      format: string;
      tag: Screening['tag'];
      availability: Screening['availability'];
      notes?: string;
    }>;
  }>({
    filmId: 1,
    date: new Date().toISOString().split('T')[0],
    slots: [
      {
        time: '14:00',
        hallId: 'salle-5',
        format: '4K Laser Projection',
        tag: 'Standard',
        availability: 'Available',
      },
      {
        time: '17:00',
        hallId: 'vip-salle',
        format: 'Dolby Atmos Private Array',
        tag: 'VIP Salle',
        availability: 'Available',
      },
    ],
  });

  // Fetch initial cinema data from server
  const loadCinemaData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cinema-data');
      const json = await res.json();
      if (json.success && json.data) {
        setFilms(json.data.films || []);
        setWheelIds(json.data.wheelIds || []);
        setScreenings(json.data.screenings || []);
        if (json.data.halls) setHalls(json.data.halls);
      }
    } catch {
      showToast('error', 'Failed to load cinema data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCinemaData();
  }, []);

  // Compute films in wheel sequence
  const wheelFilms = useMemo(() => {
    const map = new Map(films.map((f) => [f.id, f]));
    return wheelIds.map((id) => map.get(id)).filter((f): f is CinemaFilm => Boolean(f));
  }, [films, wheelIds]);

  // Compute non-wheel archive films
  const availableForWheel = useMemo(() => {
    const wheelSet = new Set(wheelIds);
    return films.filter((f) => !wheelSet.has(f.id));
  }, [films, wheelIds]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  // -------------------------------------------------------------
  // TAB 1: WORKS WHEEL OPERATIONS
  // -------------------------------------------------------------
  const moveWheelFilm = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= wheelIds.length) return;

    const newWheelIds = [...wheelIds];
    const [moved] = newWheelIds.splice(index, 1);
    newWheelIds.splice(targetIndex, 0, moved);

    setWheelIds(newWheelIds);
    await syncWheelOrder(newWheelIds);
  };

  const removeFilmFromWheel = async (filmId: number) => {
    const newWheelIds = wheelIds.filter((id) => id !== filmId);
    setWheelIds(newWheelIds);
    await syncWheelOrder(newWheelIds);
    showToast('info', 'Film removed from 3D Works Wheel.');
  };

  const addFilmToWheel = async (filmId: number) => {
    if (wheelIds.includes(filmId)) return;
    if (wheelIds.length >= 10) {
      showToast('error', 'Works Wheel holds a maximum of 10 featured films. Remove one first.');
      return;
    }
    const newWheelIds = [...wheelIds, filmId];
    setWheelIds(newWheelIds);
    await syncWheelOrder(newWheelIds);
    showToast('success', 'Film added to 3D Works Wheel.');
  };

  const syncWheelOrder = async (ids: number[]) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/wheel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wheelIds: ids }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update wheel order');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error updating wheel order.');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: FILM CATALOGUE OPERATIONS & 1-CLICK IMDB SCRAPER
  // -------------------------------------------------------------
  const handleOpenAddFilm = () => {
    setEditingFilm(null);
    setImdbFetchQuery('');
    setFilmFormData({
      title: '',
      year: new Date().getFullYear(),
      category: 'Cinema Masterpiece',
      imdbRating: '8.5',
      director: 'Visionary Director',
      duration: '2h 15m',
      tagline: 'An indelible theatrical exhibition.',
      synopsis: '',
      image: '',
      isOnWheel: wheelIds.length < 10,
    });
    setFilmModalOpen(true);
  };

  const handleOpenEditFilm = (film: CinemaFilm) => {
    setEditingFilm(film);
    setImdbFetchQuery('');
    setFilmFormData({
      title: film.title,
      year: film.year,
      category: film.category,
      imdbRating: film.imdbRating,
      director: film.director,
      duration: film.duration,
      tagline: film.tagline,
      synopsis: film.synopsis,
      image: film.image,
      isOnWheel: wheelIds.includes(film.id),
    });
    setFilmModalOpen(true);
  };

  // ⚡ 1-Click IMDb Auto-Fetch
  const handleFetchFromImdb = async () => {
    if (!imdbFetchQuery.trim()) {
      showToast('error', 'Please paste an IMDb URL, tt-ID, or film name.');
      return;
    }

    try {
      setFetchingImdb(true);
      const res = await fetch('/api/admin/fetch-imdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: imdbFetchQuery }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch IMDb details.');
      }

      const fetched = data.data;
      setFilmFormData((prev) => ({
        ...prev,
        title: fetched.title || prev.title,
        year: fetched.year || prev.year,
        imdbRating: fetched.imdbRating || prev.imdbRating,
        duration: fetched.duration || prev.duration,
        director: fetched.director || prev.director,
        category: fetched.category || prev.category,
        tagline: fetched.tagline || prev.tagline,
        synopsis: fetched.synopsis || prev.synopsis,
        image: fetched.image || prev.image,
      }));

      showToast('success', `✨ Successfully fetched "${fetched.title}" from IMDb!`);
    } catch (err: any) {
      showToast('error', err.message || 'IMDb auto-fetch failed.');
    } finally {
      setFetchingImdb(false);
    }
  };

  const handleSaveFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filmFormData.title.trim()) {
      showToast('error', 'Film title is required.');
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<CinemaFilm> & { title: string } = {
        id: editingFilm ? editingFilm.id : undefined,
        title: filmFormData.title.trim(),
        year: Number(filmFormData.year),
        category: filmFormData.category,
        imdbRating: filmFormData.imdbRating,
        director: filmFormData.director,
        duration: filmFormData.duration,
        tagline: filmFormData.tagline,
        synopsis: filmFormData.synopsis,
        image:
          filmFormData.image.trim() ||
          'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
      };

      const res = await fetch('/api/admin/films', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save film');
      }

      const savedFilm: CinemaFilm = data.film;

      // Handle wheel inclusion toggle
      let nextWheelIds = [...wheelIds];
      if (filmFormData.isOnWheel && !nextWheelIds.includes(savedFilm.id)) {
        if (nextWheelIds.length < 10) {
          nextWheelIds.push(savedFilm.id);
          await syncWheelOrder(nextWheelIds);
          setWheelIds(nextWheelIds);
        }
      } else if (!filmFormData.isOnWheel && nextWheelIds.includes(savedFilm.id)) {
        nextWheelIds = nextWheelIds.filter((id) => id !== savedFilm.id);
        await syncWheelOrder(nextWheelIds);
        setWheelIds(nextWheelIds);
      }

      // Update state
      setFilms((prev) => {
        const idx = prev.findIndex((f) => f.id === savedFilm.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = savedFilm;
          return updated;
        }
        return [...prev, savedFilm];
      });

      setFilmModalOpen(false);
      showToast('success', `Film "${savedFilm.title}" saved successfully!`);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving film.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFilm = async (film: CinemaFilm) => {
    if (!confirm(`Are you sure you want to permanently delete "${film.title}" and its scheduled screenings?`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/films?id=${film.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete film');
      }

      setFilms((prev) => prev.filter((f) => f.id !== film.id));
      setWheelIds((prev) => prev.filter((id) => id !== film.id));
      setScreenings((prev) => prev.filter((s) => s.filmId !== film.id));
      showToast('success', `"${film.title}" deleted.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete film.');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 3: SCHEDULE & SCREENINGS OPERATIONS
  // -------------------------------------------------------------
  const handleOpenAddScreening = () => {
    setEditingScreening(null);
    setScreeningFormData({
      filmId: films[0]?.id || 1,
      date: new Date().toISOString().split('T')[0],
      time: '19:30',
      hallId: 'screen-1',
      format: '35mm Archival Print',
      tag: 'Standard',
      availability: 'Available',
      notes: '',
    });
    setScreeningModalOpen(true);
  };

  const handleOpenEditScreening = (slot: Screening) => {
    setEditingScreening(slot);
    setScreeningFormData({
      filmId: slot.filmId,
      date: slot.date,
      time: slot.time,
      hallId: slot.hallId,
      format: slot.format,
      tag: slot.tag,
      availability: slot.availability,
      notes: slot.notes || '',
    });
    setScreeningModalOpen(true);
  };

  const handleSaveScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: Partial<Screening> & { filmId: number; date: string; time: string; hallId: string } = {
        id: editingScreening ? editingScreening.id : undefined,
        filmId: Number(screeningFormData.filmId),
        date: screeningFormData.date,
        time: screeningFormData.time,
        hallId: screeningFormData.hallId,
        format: screeningFormData.format,
        tag: screeningFormData.tag,
        availability: screeningFormData.availability,
        notes: screeningFormData.notes,
      };

      const res = await fetch('/api/admin/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save screening slot');
      }

      const savedSlot: Screening = data.screening;

      setScreenings((prev) => {
        const idx = prev.findIndex((s) => s.id === savedSlot.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = savedSlot;
          return updated;
        }
        return [...prev, savedSlot];
      });

      setScreeningModalOpen(false);
      showToast('success', 'Screening showtime saved successfully.');
    } catch (err: any) {
      showToast('error', err.message || 'Error saving screening.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScreening = async (slotId: string) => {
    if (!confirm('Are you sure you want to remove this screening showtime?')) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/screenings?id=${slotId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete screening');
      }

      setScreenings((prev) => prev.filter((s) => s.id !== slotId));
      showToast('success', 'Screening slot removed.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete screening.');
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------
  // MULTI-SHOWTIME PROGRAMMER (Multiple times in a day)
  // -------------------------------------------------------------
  const handleOpenMultiScreening = (initialFilmId?: number, initialDate?: string) => {
    setMultiScreeningData({
      filmId: initialFilmId || films[0]?.id || 1,
      date: initialDate || (selectedDate !== 'all' ? selectedDate : new Date().toISOString().split('T')[0]),
      slots: [
        {
          time: '14:00',
          hallId: 'salle-5',
          format: '4K Laser Projection',
          tag: 'Standard',
          availability: 'Available',
        },
        {
          time: '17:00',
          hallId: 'vip-salle',
          format: 'Dolby Atmos Private Array',
          tag: 'VIP Salle',
          availability: 'Available',
        },
      ],
    });
    setMultiScreeningModalOpen(true);
  };

  const handleAddSlotToMulti = (time = '20:30', hallId = 'screen-1', format = 'Theatrical 4K', tag: Screening['tag'] = 'Standard') => {
    setMultiScreeningData((prev) => ({
      ...prev,
      slots: [
        ...prev.slots,
        {
          time,
          hallId,
          format,
          tag,
          availability: 'Available',
        },
      ],
    }));
  };

  const handleRemoveSlotFromMulti = (index: number) => {
    setMultiScreeningData((prev) => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSlotInMulti = (index: number, updates: Partial<(typeof multiScreeningData.slots)[0]>) => {
    setMultiScreeningData((prev) => {
      const nextSlots = [...prev.slots];
      nextSlots[index] = { ...nextSlots[index], ...updates };
      return { ...prev, slots: nextSlots };
    });
  };

  const handleSaveMultiScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (multiScreeningData.slots.length === 0) {
      showToast('error', 'Please add at least one showtime slot.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        slots: multiScreeningData.slots.map((s) => ({
          filmId: Number(multiScreeningData.filmId),
          date: multiScreeningData.date,
          time: s.time,
          hallId: s.hallId,
          format: s.format,
          tag: s.tag,
          availability: s.availability,
          notes: s.notes || '',
        })),
      };

      const res = await fetch('/api/admin/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save multiple showtimes');
      }

      const savedList: Screening[] = data.screenings;

      setScreenings((prev) => {
        const copy = [...prev];
        savedList.forEach((saved) => {
          const idx = copy.findIndex((s) => s.id === saved.id);
          if (idx >= 0) copy[idx] = saved;
          else copy.push(saved);
        });
        return copy;
      });

      setMultiScreeningModalOpen(false);
      showToast(
        'success',
        `✨ Programmed ${savedList.length} showtimes for this film on ${multiScreeningData.date}!`
      );
    } catch (err: any) {
      showToast('error', err.message || 'Error saving multiple screenings.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered catalogue films
  const filteredFilms = useMemo(() => {
    if (!searchQuery.trim()) return films;
    const q = searchQuery.toLowerCase();
    return films.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.director.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.year.toString().includes(q)
    );
  }, [films, searchQuery]);

  // Distinct dates in screenings
  const distinctDates = useMemo(() => {
    const set = new Set<string>();
    screenings.forEach((s) => set.add(s.date));
    return Array.from(set).sort();
  }, [screenings]);

  // Filtered screenings
  const filteredScreenings = useMemo(() => {
    let list = screenings;
    if (selectedDate !== 'all') {
      list = list.filter((s) => s.date === selectedDate);
    }
    return list.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  }, [screenings, selectedDate]);

  // Group screenings by Film and Date for multi-showtime management
  const groupedScreenings = useMemo(() => {
    const map = new Map<string, { key: string; filmId: number; date: string; film?: CinemaFilm; slots: Screening[] }>();

    filteredScreenings.forEach((slot) => {
      const key = `${slot.filmId}-${slot.date}`;
      if (!map.has(key)) {
        const film = films.find((f) => f.id === slot.filmId);
        map.set(key, { key, filmId: slot.filmId, date: slot.date, film, slots: [] });
      }
      map.get(key)!.slots.push(slot);
    });

    map.forEach((item) => {
      item.slots.sort((a, b) => a.time.localeCompare(b.time));
    });

    return Array.from(map.values()).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.film?.title || '').localeCompare(b.film?.title || '');
    });
  }, [filteredScreenings, films]);

  return (
    <div data-admin-portal="true" className="admin-portal min-h-screen bg-[#07080a] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-medium transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-neutral-900/90 border-neutral-700 text-neutral-200'
          }`}
        >
          {toast.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0d11]/80 backdrop-blur-xl px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight font-serif">
                  Murdjadjo Cinema
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">
                  Admin Deck
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Server Store
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('wheel')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono uppercase tracking-wider transition-all ${
                activeTab === 'wheel'
                  ? 'bg-amber-500 text-black shadow-md font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Works Wheel (Top 10)
            </button>
            <button
              onClick={() => setActiveTab('catalogue')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono uppercase tracking-wider transition-all ${
                activeTab === 'catalogue'
                  ? 'bg-amber-500 text-black shadow-md font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Catalogue ({films.length})
            </button>
            <button
              onClick={() => setActiveTab('screenings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono uppercase tracking-wider transition-all ${
                activeTab === 'screenings'
                  ? 'bg-amber-500 text-black shadow-md font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule ({screenings.length})
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              Preview Live Site
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-mono text-rose-300 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="font-mono text-xs tracking-widest uppercase">Connecting to Cinema Data Vault...</p>
          </div>
        ) : (
          <>
            {/* ------------------------------------------------------------- */}
            {/* TAB 1: WORKS WHEEL (TOP 10 FEATURED) */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'wheel' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2.5">
                      <Layers className="w-5 h-5 text-amber-400" />
                      3D Works Wheel Programming
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                      These 10 films form the revolving 3D carousel on the homepage entrance. Reorder their sequence using the arrows, or remove/add titles from the master catalogue below.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-neutral-300">
                      Slots filled: <strong className="text-amber-400">{wheelFilms.length} / 10</strong>
                    </span>
                    <button
                      onClick={() => syncWheelOrder(wheelIds)}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Sync Live Wheel
                    </button>
                  </div>
                </div>

                {/* 10 Wheel Slots List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wheelFilms.map((film, index) => (
                    <div
                      key={film.id}
                      className="group relative flex items-center gap-4 p-4 rounded-xl bg-[#0e1015] border border-white/10 hover:border-amber-500/40 transition-all shadow-md"
                    >
                      {/* Rank Index Badge */}
                      <div className="flex flex-col items-center justify-center w-10 text-center">
                        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                          Pos
                        </span>
                        <span className="text-xl font-bold font-serif text-amber-400">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Poster Preview */}
                      <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={film.image}
                          alt={film.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Film Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">
                            {film.year}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {film.imdbRating}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">{film.duration}</span>
                        </div>
                        <h3 className="font-bold text-white text-base tracking-tight truncate mt-1">
                          {film.title}
                        </h3>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {film.director} &bull; <span className="text-neutral-500">{film.category}</span>
                        </p>
                      </div>

                      {/* Controls: Up, Down, Remove */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => moveWheelFilm(index, 'up')}
                          disabled={index === 0}
                          title="Move up"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveWheelFilm(index, 'down')}
                          disabled={index === wheelFilms.length - 1}
                          title="Move down"
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFilmFromWheel(film.id)}
                          title="Remove from wheel"
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* If fewer than 10, show add selector */}
                {wheelFilms.length < 10 && availableForWheel.length > 0 && (
                  <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-white/20 mt-6">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      Add Film to Available Slot
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableForWheel.map((film) => (
                        <button
                          key={film.id}
                          onClick={() => addFilmToWheel(film.id)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0e1015] border border-white/5 hover:border-amber-400/50 text-left transition-all group"
                        >
                          <div className="w-10 h-14 rounded overflow-hidden bg-neutral-900 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={film.image} alt={film.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate group-hover:text-amber-300">
                              {film.title}
                            </h4>
                            <p className="text-[10px] text-neutral-400 truncate">{film.year} &bull; {film.director}</p>
                          </div>
                          <Plus className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 shrink-0 mr-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 2: FILM CATALOGUE (ALL MOVIES) */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'catalogue' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search catalogue by title, director, year, or genre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1015] border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleOpenAddFilm}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-semibold text-xs font-mono uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Film (with IMDb Auto-Fetch)
                  </button>
                </div>

                {/* Catalogue Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredFilms.map((film) => {
                    const onWheel = wheelIds.includes(film.id);
                    const wheelRank = onWheel ? wheelIds.indexOf(film.id) + 1 : null;

                    return (
                      <div
                        key={film.id}
                        className="group flex flex-col rounded-2xl bg-[#0e1015] border border-white/10 hover:border-white/20 transition-all overflow-hidden shadow-lg"
                      >
                        {/* Film Banner with Stills/Poster */}
                        <div className="relative h-48 w-full bg-neutral-900 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={film.image}
                            alt={film.title}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-transparent to-black/60" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white">
                              {film.year}
                            </span>
                            {onWheel ? (
                              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-bold shadow-md flex items-center gap-1">
                                <Layers className="w-3 h-3" /> Works Wheel #{wheelRank}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-neutral-400">
                                Archive Only
                              </span>
                            )}
                          </div>

                          {/* IMDb Score badge */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-amber-300">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <strong className="text-white">{film.imdbRating}</strong> / 10
                          </div>
                        </div>

                        {/* Info Container */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
                              {film.title}
                            </h3>
                            <p className="text-xs text-neutral-400 mt-1">
                              Dir. <strong className="text-neutral-200">{film.director}</strong> &bull; {film.duration}
                            </p>
                            <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                              {film.category}
                            </p>
                            <p className="text-xs text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
                              {film.synopsis || film.tagline}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                            <button
                              onClick={() => {
                                if (onWheel) {
                                  removeFilmFromWheel(film.id);
                                } else {
                                  addFilmToWheel(film.id);
                                }
                              }}
                              className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all ${
                                onWheel
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                                  : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {onWheel ? '✓ On 3D Wheel' : '+ Add to Wheel'}
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditFilm(film)}
                                title="Edit Film"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteFilm(film)}
                                title="Delete Film"
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB 3: SCHEDULE & SCREENINGS MANAGER */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'screenings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Top Action & Filter Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1015] border border-white/10">
                  {/* Left: Date Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedDate('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                        selectedDate === 'all'
                          ? 'bg-amber-500 text-black font-bold shadow-sm'
                          : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
                      }`}
                    >
                      All Dates ({screenings.length})
                    </button>
                    {distinctDates.map((dateStr) => (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                          selectedDate === dateStr
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
                        }`}
                      >
                        {dateStr}
                      </button>
                    ))}
                  </div>

                  {/* Right: View Mode Toggle & Primary Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* View Switcher */}
                    <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setScreeningViewMode('grouped')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          screeningViewMode === 'grouped'
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        By Film ({groupedScreenings.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreeningViewMode('list')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          screeningViewMode === 'list'
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        All Slots ({filteredScreenings.length})
                      </button>
                    </div>

                    {/* ⚡ Multi-Showtime Programmer Button */}
                    <button
                      onClick={() => handleOpenMultiScreening()}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      Program Film (Multi-Times)
                    </button>

                    {/* Single Show Button */}
                    <button
                      onClick={handleOpenAddScreening}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Single Slot
                    </button>
                  </div>
                </div>

                {/* VIEW MODE 1: GROUPED BY FILM (Displays multiple showtimes per day) */}
                {screeningViewMode === 'grouped' ? (
                  <div className="space-y-4">
                    {groupedScreenings.length === 0 ? (
                      <div className="p-12 text-center text-neutral-500 font-mono text-xs rounded-2xl bg-[#0e1015] border border-white/5">
                        No screenings scheduled for the selected date. Click &quot;Program Film (Multi-Times)&quot; to schedule.
                      </div>
                    ) : (
                      groupedScreenings.map((group) => {
                        const { film, date, slots } = group;

                        return (
                          <div
                            key={group.key}
                            className="p-5 rounded-2xl bg-[#0e1015] border border-white/10 hover:border-amber-500/30 transition-all shadow-md space-y-4"
                          >
                            {/* Film Header Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-16 rounded-xl bg-neutral-900 overflow-hidden shrink-0 border border-white/10">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={film?.image || ''}
                                    alt={film?.title || ''}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                      {date}
                                    </span>
                                    <span className="text-[11px] font-mono text-neutral-400">
                                      {slots.length} {slots.length === 1 ? 'Showtime' : 'Showtimes Programmed'}
                                    </span>
                                  </div>
                                  <h3 className="font-bold text-white text-lg tracking-tight mt-1">
                                    {film?.title || `Film #${group.filmId}`}
                                  </h3>
                                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                                    Dir. {film?.director || 'Archive'} &bull; {film?.duration || '2h'} &bull; {film?.category}
                                  </p>
                                </div>
                              </div>

                              {/* Action to add another showtime for this film on this date */}
                              <div className="self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenMultiScreening(group.filmId, date)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Showtime
                                </button>
                              </div>
                            </div>

                            {/* Multiple Showtimes Chips */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                                Scheduled Times on {date}:
                              </span>
                              <div className="flex flex-wrap items-center gap-2.5">
                                {slots.map((slot) => {
                                  const hall = halls.find((h) => h.id === slot.hallId);
                                  const isVip = slot.tag === 'VIP Salle' || slot.hallId === 'vip-salle';
                                  const isSalle5 = slot.hallId === 'salle-5';

                                  return (
                                    <div
                                      key={slot.id}
                                      className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all ${
                                        isVip
                                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                          : isSalle5
                                          ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                                          : 'bg-white/5 border-white/10 text-neutral-200'
                                      }`}
                                    >
                                      {/* Time & Hall */}
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-sm tracking-tight">
                                          {slot.time}
                                        </span>
                                        <span className="text-xs opacity-90 font-medium">
                                          {hall?.shortName || slot.hallId}
                                        </span>
                                      </div>

                                      {/* Tag & Availability */}
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 opacity-80">
                                          {slot.format || '4K'}
                                        </span>
                                        <span
                                          className={`size-2 rounded-full shrink-0 ${
                                            slot.availability === 'Available'
                                              ? 'bg-emerald-400'
                                              : slot.availability === 'Selling Fast'
                                              ? 'bg-amber-400'
                                              : 'bg-rose-400'
                                          }`}
                                          title={slot.availability}
                                        />
                                      </div>

                                      {/* Quick Hover Controls */}
                                      <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditScreening(slot)}
                                          className="p-1 hover:text-white text-neutral-400 transition-colors"
                                          title="Edit Show"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteScreening(slot.id)}
                                          className="p-1 hover:text-rose-400 text-neutral-400 transition-colors"
                                          title="Delete Show"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* VIEW MODE 2: FLAT LIST OF ALL SLOTS */
                  <div className="space-y-3">
                    {filteredScreenings.length === 0 ? (
                      <div className="p-12 text-center text-neutral-500 font-mono text-xs rounded-2xl bg-[#0e1015] border border-white/5">
                        No screenings scheduled for the selected date. Click &quot;Program Film&quot; to add one.
                      </div>
                    ) : (
                      filteredScreenings.map((slot) => {
                        const film = films.find((f) => f.id === slot.filmId);
                        const hall = halls.find((h) => h.id === slot.hallId);

                        return (
                          <div
                            key={slot.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0e1015] border border-white/10 hover:border-amber-500/30 transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-16 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={film?.image || ''}
                                  alt={film?.title || ''}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                    {slot.time}
                                  </span>
                                  <span className="text-xs font-mono text-neutral-400">{slot.date}</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                                    {hall?.shortName || slot.hallId}
                                  </span>
                                </div>
                                <h4 className="font-bold text-white text-base mt-1">
                                  {film?.title || `Film #${slot.filmId}`}
                                </h4>
                                <p className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                                  <span>{slot.format}</span>
                                  &bull;
                                  <span
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                      slot.availability === 'Available'
                                        ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                                        : slot.availability === 'Selling Fast'
                                        ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                                        : 'text-rose-300 bg-rose-500/10 border border-rose-500/20'
                                    }`}
                                  >
                                    {slot.availability}
                                  </span>
                                  {slot.notes && (
                                    <span className="text-neutral-500 text-[11px] italic">
                                      &bull; {slot.notes}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => handleOpenEditScreening(slot)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                                title="Edit Show"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteScreening(slot.id)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                title="Delete Show"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT FILM (WITH ⚡ IMDB 1-CLICK SCRAPER) */}
      {/* ------------------------------------------------------------- */}
      {filmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d0f14] border border-white/15 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">
                  {editingFilm ? 'Edit Master Film Details' : 'Add New Film to Catalogue'}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Use the 1-Click IMDb scraper or enter details manually below.
                </p>
              </div>
              <button
                onClick={() => setFilmModalOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ⚡ 1-Click IMDb Auto-Fetch Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 mb-6">
              <label className="block text-xs font-mono uppercase tracking-wider text-amber-300 font-bold mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                1-Click IMDb Auto-Fetch
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste IMDb URL (e.g. https://www.imdb.com/title/tt0111161/) or ID (tt...)"
                  value={imdbFetchQuery}
                  onChange={(e) => setImdbFetchQuery(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleFetchFromImdb}
                  disabled={fetchingImdb}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {fetchingImdb ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-black" /> Auto-Fill
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-neutral-400 mt-2 font-mono">
                Extracts official title, year, IMDb rating, duration, director, synopsis, high-res archival poster, and genres.
              </p>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleSaveFilm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Film Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={filmFormData.title}
                    onChange={(e) => setFilmFormData({ ...filmFormData, title: e.target.value })}
                    placeholder="e.g. The Shawshank Redemption"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Director *
                  </label>
                  <input
                    type="text"
                    required
                    value={filmFormData.director}
                    onChange={(e) => setFilmFormData({ ...filmFormData, director: e.target.value })}
                    placeholder="e.g. Frank Darabont"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={filmFormData.year}
                    onChange={(e) => setFilmFormData({ ...filmFormData, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    IMDb Rating
                  </label>
                  <input
                    type="text"
                    value={filmFormData.imdbRating}
                    onChange={(e) => setFilmFormData({ ...filmFormData, imdbRating: e.target.value })}
                    placeholder="e.g. 9.3"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={filmFormData.duration}
                    onChange={(e) => setFilmFormData({ ...filmFormData, duration: e.target.value })}
                    placeholder="e.g. 2h 22m"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Category / Genres
                </label>
                <input
                  type="text"
                  value={filmFormData.category}
                  onChange={(e) => setFilmFormData({ ...filmFormData, category: e.target.value })}
                  placeholder="e.g. Drama · Crime · Masterpiece"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  High-Res Poster Image URL
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    value={filmFormData.image}
                    onChange={(e) => setFilmFormData({ ...filmFormData, image: e.target.value })}
                    placeholder="https://m.media-amazon.com/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                  {filmFormData.image && (
                    <div className="w-9 h-12 rounded overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={filmFormData.image} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={filmFormData.tagline}
                  onChange={(e) => setFilmFormData({ ...filmFormData, tagline: e.target.value })}
                  placeholder="e.g. Fear can hold you prisoner. Hope can set you free."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Full Synopsis / Plot
                </label>
                <textarea
                  rows={3}
                  value={filmFormData.synopsis}
                  onChange={(e) => setFilmFormData({ ...filmFormData, synopsis: e.target.value })}
                  placeholder="Enter complete theatrical synopsis..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              {/* Works Wheel Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="wheelToggle"
                  checked={filmFormData.isOnWheel}
                  onChange={(e) => setFilmFormData({ ...filmFormData, isOnWheel: e.target.checked })}
                  className="rounded border-white/20 text-amber-500 focus:ring-amber-400 bg-black/50"
                />
                <label htmlFor="wheelToggle" className="text-xs text-neutral-300 select-none">
                  Feature in Top 10 Works Wheel 3D Carousel
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFilmModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Film Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT SCREENING */}
      {/* ------------------------------------------------------------- */}
      {screeningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0d0f14] border border-white/15 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="text-xl font-bold font-serif text-white">
                {editingScreening ? 'Edit Screening Show' : 'Schedule New Screening'}
              </h3>
              <button
                onClick={() => setScreeningModalOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScreening} className="space-y-4">
              {/* Select Film */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Exhibited Film *
                </label>
                <select
                  value={screeningFormData.filmId}
                  onChange={(e) => setScreeningFormData({ ...screeningFormData, filmId: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {films.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title} ({f.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Date (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={screeningFormData.date}
                    onChange={(e) => setScreeningFormData({ ...screeningFormData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Showtime (HH:MM) *
                  </label>
                  <input
                    type="time"
                    required
                    value={screeningFormData.time}
                    onChange={(e) => setScreeningFormData({ ...screeningFormData, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Auditorium / Hall */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Auditorium / Hall *
                </label>
                <select
                  value={screeningFormData.hallId}
                  onChange={(e) => setScreeningFormData({ ...screeningFormData, hallId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {halls.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              {/* Format & Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Format
                  </label>
                  <input
                    type="text"
                    value={screeningFormData.format}
                    onChange={(e) => setScreeningFormData({ ...screeningFormData, format: e.target.value })}
                    placeholder="e.g. 35mm Archival Print"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                    Tag / Edition
                  </label>
                  <select
                    value={screeningFormData.tag}
                    onChange={(e) =>
                      setScreeningFormData({ ...screeningFormData, tag: e.target.value as Screening['tag'] })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Standard">Standard</option>
                    <option value="VIP Salle">VIP Salle</option>
                    <option value="Director Q&A">Director Q&A</option>
                    <option value="Midnight Special">Midnight Special</option>
                    <option value="Kids Only">Kids Only</option>
                  </select>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Availability Status
                </label>
                <select
                  value={screeningFormData.availability}
                  onChange={(e) =>
                    setScreeningFormData({
                      ...screeningFormData,
                      availability: e.target.value as Screening['availability'],
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Available">Available</option>
                  <option value="Selling Fast">Selling Fast</option>
                  <option value="Few Seats Left">Few Seats Left</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                  Curator Notes
                </label>
                <input
                  type="text"
                  value={screeningFormData.notes}
                  onChange={(e) => setScreeningFormData({ ...screeningFormData, notes: e.target.value })}
                  placeholder="e.g. Followed by 35mm projectionist showcase."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setScreeningModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Screening Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PROGRAM MULTIPLE SHOWTIMES (SAME DAY) */}
      {/* ------------------------------------------------------------- */}
      {multiScreeningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0d0f14] border border-amber-500/30 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  Multi-Showtime Programmer
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  Schedule Film Multiple Times (Same Day)
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Program a film across different auditoriums and hours in a single day (e.g. VIP at 5:00, Salle 5 at 14:00, Screen 1 at 20:30).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMultiScreeningModalOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMultiScreening} className="space-y-6">
              {/* Film Selection & Date Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/50 border border-white/10">
                {/* Film Selector */}
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1.5 font-semibold">
                    Exhibited Film *
                  </label>
                  <select
                    value={multiScreeningData.filmId}
                    onChange={(e) =>
                      setMultiScreeningData({
                        ...multiScreeningData,
                        filmId: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-amber-400"
                  >
                    {films.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title} ({f.year})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Screening Date */}
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1.5 font-semibold">
                    Programming Date (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={multiScreeningData.date}
                    onChange={(e) =>
                      setMultiScreeningData({
                        ...multiScreeningData,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
                  Quick Add Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSlotToMulti('05:00', 'vip-salle', 'VIP Sunrise Array', 'VIP Salle')
                    }
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors"
                  >
                    + 05:00 AM · VIP Salle
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSlotToMulti('14:00', 'salle-5', '4K Laser Projection', 'Standard')
                    }
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono transition-colors"
                  >
                    + 02:00 PM (14:00) · Salle 5
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSlotToMulti('17:00', 'vip-salle', 'Dolby Atmos Salon', 'VIP Salle')
                    }
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition-colors"
                  >
                    + 05:00 PM (17:00) · VIP Salle
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAddSlotToMulti('20:30', 'screen-1', '35mm Archival Print', 'Standard')
                    }
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs font-mono transition-colors"
                  >
                    + 08:30 PM (20:30) · Screen 1
                  </button>
                </div>
              </div>

              {/* Slots List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Programmed Showtimes ({multiScreeningData.slots.length} Slots):
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddSlotToMulti()}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Slot
                  </button>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {multiScreeningData.slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 hover:border-amber-500/25 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-300 font-bold">
                          Slot #{idx + 1}
                        </span>
                        {multiScreeningData.slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlotFromMulti(idx)}
                            className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Time */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                            Showtime (HH:MM) *
                          </label>
                          <input
                            type="time"
                            required
                            value={slot.time}
                            onChange={(e) =>
                              handleUpdateSlotInMulti(idx, { time: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {/* Auditorium / Hall */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                            Auditorium *
                          </label>
                          <select
                            value={slot.hallId}
                            onChange={(e) =>
                              handleUpdateSlotInMulti(idx, { hallId: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                          >
                            {halls.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Format */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                            Format / Audio
                          </label>
                          <input
                            type="text"
                            value={slot.format}
                            onChange={(e) =>
                              handleUpdateSlotInMulti(idx, { format: e.target.value })
                            }
                            placeholder="e.g. 4K Laser, Dolby Atmos"
                            className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {/* Tag */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                            Tag / Edition
                          </label>
                          <select
                            value={slot.tag}
                            onChange={(e) =>
                              handleUpdateSlotInMulti(idx, {
                                tag: e.target.value as Screening['tag'],
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                          >
                            <option value="Standard">Standard</option>
                            <option value="VIP Salle">VIP Salle</option>
                            <option value="Director Q&A">Director Q&A</option>
                            <option value="Midnight Special">Midnight Special</option>
                            <option value="Kids Only">Kids Only</option>
                          </select>
                        </div>

                        {/* Availability */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                            Initial Availability
                          </label>
                          <select
                            value={slot.availability}
                            onChange={(e) =>
                              handleUpdateSlotInMulti(idx, {
                                availability: e.target.value as Screening['availability'],
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400"
                          >
                            <option value="Available">Available</option>
                            <option value="Selling Fast">Selling Fast</option>
                            <option value="Few Seats Left">Few Seats Left</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setMultiScreeningModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || multiScreeningData.slots.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save All Programmed Showtimes ({multiScreeningData.slots.length} Slots)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
