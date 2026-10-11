import { NextResponse } from 'next/server';
import { getCinemaStore, getWheelFilms, rehydrateCinemaStore, getStoreStorageStatus } from '@/lib/server-cinema-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await getCinemaStore();
    const wheelFilms = await getWheelFilms();
    const storageStatus = getStoreStorageStatus();

    return NextResponse.json({
      success: true,
      storageStatus,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.films)) {
      return NextResponse.json(
        { success: false, error: 'Valid films array required' },
        { status: 400 }
      );
    }

    const rehydrated = await rehydrateCinemaStore(body);
    const wheelFilms = await getWheelFilms();
    const storageStatus = getStoreStorageStatus();

    return NextResponse.json({
      success: true,
      storageStatus,
      data: {
        films: rehydrated.films,
        wheelFilms,
        wheelIds: rehydrated.wheelIds,
        halls: rehydrated.halls,
        screenings: rehydrated.screenings,
        lastUpdated: rehydrated.lastUpdated,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to sync cinema data' },
      { status: 500 }
    );
  }
}
