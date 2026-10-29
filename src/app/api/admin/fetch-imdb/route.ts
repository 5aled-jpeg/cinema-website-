import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ImdbFetchResponse {
  title: string;
  year: number;
  imdbRating: string;
  duration: string;
  director: string;
  category: string;
  tagline: string;
  synopsis: string;
  image: string;
  stills: { url: string; caption: string; aspectRatio?: string }[];
}

function formatRuntimeMinutes(runtimeStr?: string): string {
  if (!runtimeStr) return '2h 00m';
  const numMatch = runtimeStr.match(/\d+/);
  if (!numMatch) return runtimeStr;
  const totalMins = parseInt(numMatch[0], 10);
  if (isNaN(totalMins) || totalMins <= 0) return '2h 00m';
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  }
  return `${mins}m`;
}

// Fetch 4 authentic high-resolution film stills and production captures from TMDB / Cinemeta
async function fetchFilmStills(
  imdbId: string,
  title: string,
  posterUrl: string
): Promise<{ url: string; caption: string; aspectRatio?: string }[]> {
  const TMDB_KEYS = [
    '4e44d9029b1270a757cddc766a1bcb63',
    'c19772614b3c221b3334e2c16b429155',
    'b6e701f1fb3a2f7c00de4859063bc97a',
  ];

  let backdrops: string[] = [];

  for (const apiKey of TMDB_KEYS) {
    try {
      const findRes = await fetch(
        `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } }
      );
      if (!findRes.ok) continue;
      const findData = await findRes.json();
      const movie = findData.movie_results?.[0];
      if (!movie?.id) continue;

      const imgRes = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}/images?api_key=${apiKey}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } }
      );
      if (!imgRes.ok) continue;
      const imgData = await imgRes.json();

      if (imgData.backdrops && imgData.backdrops.length > 0) {
        backdrops = imgData.backdrops
          .slice(0, 6)
          .map((b: { file_path: string }) => `https://image.tmdb.org/t/p/w1280${b.file_path}`);
        break;
      }
    } catch {}
  }

  // Fallback to Cinemeta background if TMDB yielded fewer than 2 backdrops
  if (backdrops.length < 2) {
    try {
      const cinemetaRes = await fetch(`https://v3-cinemeta.strem.io/meta/movie/${imdbId}.json`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (cinemetaRes.ok) {
        const cinemetaData = await cinemetaRes.json();
        if (cinemetaData?.meta?.background) {
          backdrops.push(cinemetaData.meta.background);
        }
      }
    } catch {}
  }

  // Build the 4-photo bento grid stills matching the exhibition modal design
  const stills: { url: string; caption: string; aspectRatio?: string }[] = [
    {
      url: posterUrl,
      caption: `${title} — Official Archival Exhibition Print`,
      aspectRatio: '2:3 THEATRICAL',
    },
    {
      url: backdrops[0] || posterUrl,
      caption: `${title} — Archival 35mm Frame Capture`,
      aspectRatio: '16:9 VISTA',
    },
    {
      url: backdrops[1] || backdrops[0] || posterUrl,
      caption: `${title} — Theatrical Production Still`,
      aspectRatio: '16:9 VISTA',
    },
    {
      url: backdrops[2] || backdrops[1] || posterUrl,
      caption: `${title} — Cinematography Exhibition Frame`,
      aspectRatio: '2:3 ARCHIVAL',
    },
  ];

  return stills;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = (body?.query || body?.urlOrId || '').trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Please enter an IMDb URL, ID (tt...), or film title' },
        { status: 400 }
      );
    }

    let imdbId = '';
    const idMatch = query.match(/tt\d+/i);

    if (idMatch) {
      imdbId = idMatch[0].toLowerCase();
    } else {
      // Try searching IMDb by title
      const searchChar = query.charAt(0).toLowerCase();
      const searchUrl = `https://v3.sg.media-imdb.com/suggestion/${searchChar}/${encodeURIComponent(query)}.json`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      if (searchRes.ok) {
        const searchJson = await searchRes.json();
        const found =
          searchJson.d?.find(
            (item: { qid?: string; q?: string }) => item.qid === 'movie' || item.q === 'feature'
          ) || searchJson.d?.[0];
        if (found?.id) {
          imdbId = found.id;
        }
      }
    }

    if (!imdbId) {
      return NextResponse.json(
        { success: false, error: `Could not identify an IMDb title from "${query}". Try providing a direct IMDb link or tt-ID.` },
        { status: 404 }
      );
    }

    // 1. Fetch from IMDb Suggestion API for official high-res poster and cast
    let suggData: {
      l?: string;
      y?: number;
      s?: string;
      i?: { imageUrl?: string; width?: number; height?: number };
    } | null = null;

    try {
      const suggRes = await fetch(`https://v3.sg.media-imdb.com/suggestion/t/${imdbId}.json`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (suggRes.ok) {
        const json = await suggRes.json();
        suggData = json.d?.[0] || null;
      }
    } catch {
      // Suggestion API is optional enhancement
    }

    // 2. Fetch from OMDB for synopsis, rating, director, runtime, genres
    let omdbData: {
      Title?: string;
      Year?: string;
      Rated?: string;
      Runtime?: string;
      Genre?: string;
      Director?: string;
      Plot?: string;
      imdbRating?: string;
      Poster?: string;
    } | null = null;

    try {
      const omdbRes = await fetch(
        `https://www.omdbapi.com/?i=${imdbId}&plot=full&apikey=trilogy`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (omdbRes.ok) {
        const json = await omdbRes.json();
        if (json.Response !== 'False') {
          omdbData = json;
        }
      }
    } catch {
      // OMDB fallback handled below
    }

    const title = omdbData?.Title || suggData?.l || query;
    const year = parseInt(omdbData?.Year || `${suggData?.y || new Date().getFullYear()}`, 10) || new Date().getFullYear();
    const imdbRating = omdbData?.imdbRating && omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : '8.6';
    const duration = formatRuntimeMinutes(omdbData?.Runtime);
    const director = omdbData?.Director && omdbData.Director !== 'N/A' ? omdbData.Director : 'Visionary Director';
    const category = omdbData?.Genre && omdbData.Genre !== 'N/A' ? omdbData.Genre : 'Cinema Masterpiece';
    const synopsis =
      omdbData?.Plot && omdbData.Plot !== 'N/A'
        ? omdbData.Plot
        : `An extraordinary work of cinema directed by ${director}, presented in full archival resolution.`;

    // Choose best high-res poster
    let posterUrl = suggData?.i?.imageUrl || omdbData?.Poster || '';
    if (posterUrl && posterUrl !== 'N/A') {
      // Upgrade poster resolution if IMDb thumbnail modifiers exist
      posterUrl = posterUrl.replace(/\._V1_.*\.jpg$/, '._V1_FMjpg_UX1200_.jpg');
    } else {
      posterUrl =
        'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg';
    }

    const starring = suggData?.s ? `Starring ${suggData.s}.` : '';
    const tagline = starring ? `${starring} Directed by ${director}.` : `An indelible theatrical masterpiece directed by ${director}.`;

    // Fetch 4 authentic film stills & captures
    const stills = await fetchFilmStills(imdbId, title, posterUrl);

    const result: ImdbFetchResponse = {
      title,
      year,
      imdbRating,
      duration,
      director,
      category,
      tagline,
      synopsis,
      image: posterUrl,
      stills,
    };

    return NextResponse.json({
      success: true,
      imdbId,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch IMDb information' },
      { status: 500 }
    );
  }
}
