import { NextResponse } from 'next/server';
import { upsertFilm, deleteFilmById, getAllFilms } from '@/lib/server-cinema-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const films = await getAllFilms();
    return NextResponse.json({ success: true, films });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to list films' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.title) {
      return NextResponse.json(
        { success: false, error: 'Film title is required' },
        { status: 400 }
      );
    }

    const saved = await upsertFilm(body);
    return NextResponse.json({ success: true, film: saved });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save film' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const body = await request.json().catch(() => ({}));
    const id = Number(idParam || body?.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'A valid numeric film ID is required' },
        { status: 400 }
      );
    }

    await deleteFilmById(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete film' },
      { status: 500 }
    );
  }
}
