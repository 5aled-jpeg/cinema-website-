import { NextResponse } from 'next/server';
import { setWheelFilmIds, getWheelFilms } from '@/lib/server-cinema-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const wheelFilms = await getWheelFilms();
    return NextResponse.json({ success: true, wheelFilms });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to get wheel films' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const wheelIds = body?.wheelIds;

    if (!Array.isArray(wheelIds)) {
      return NextResponse.json(
        { success: false, error: 'wheelIds array is required' },
        { status: 400 }
      );
    }

    const updatedFilms = await setWheelFilmIds(wheelIds.map(Number));
    return NextResponse.json({
      success: true,
      wheelIds,
      wheelFilms: updatedFilms,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update wheel order' },
      { status: 500 }
    );
  }
}
