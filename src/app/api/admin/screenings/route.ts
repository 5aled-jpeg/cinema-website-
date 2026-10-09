import { NextResponse } from 'next/server';
import {
  getAllScreenings,
  upsertScreening,
  upsertMultipleScreenings,
  deleteScreeningById,
} from '@/lib/server-cinema-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const screenings = await getAllScreenings();
    return NextResponse.json({ success: true, screenings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to list screenings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support batch multiple showtimes in a day: { slots: [...] } or array [...]
    if (Array.isArray(body?.slots) || Array.isArray(body)) {
      const list = Array.isArray(body?.slots) ? body.slots : body;
      const valid = list.filter(
        (item: any) => item?.filmId && item?.date && item?.time && item?.hallId
      );
      if (valid.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              'At least one valid screening slot with filmId, date, time, and hallId is required',
          },
          { status: 400 }
        );
      }
      const saved = await upsertMultipleScreenings(valid);
      return NextResponse.json({ success: true, screenings: saved });
    }

    if (!body?.filmId || !body?.date || !body?.time || !body?.hallId) {
      return NextResponse.json(
        { success: false, error: 'filmId, date, time, and hallId are required' },
        { status: 400 }
      );
    }

    const saved = await upsertScreening(body);
    return NextResponse.json({ success: true, screening: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save screening' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const body = await request.json().catch(() => ({}));
    const id = (idParam || body?.id || '').toString();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Screening slot id is required' },
        { status: 400 }
      );
    }

    await deleteScreeningById(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete screening' },
      { status: 500 }
    );
  }
}
