import { NextResponse } from 'next/server';
import { getCinemaStore, getWheelFilms } from '@/lib/server-cinema-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await getCinemaStore();
    const wheelFilms = await getWheelFilms();

    return NextResponse.json({
      success: true,
      data: {
        films: store.films,
        wheelFilms,
        wheelIds: store.wheelIds,
        halls: store.halls,
        screenings: store.screenings,
        lastUpdated: store.lastUpdated,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load cinema data' },
      { status: 500 }
    );
  }
}
