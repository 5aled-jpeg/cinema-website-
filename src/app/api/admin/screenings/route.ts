import { NextResponse } from 'next/server';
import {
  getAllScreenings,
  upsertScreening,
  deleteScreeningById,
} from '@/lib/server-cinema-store';

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
