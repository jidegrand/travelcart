import { NextRequest, NextResponse } from 'next/server';
import { searchAirports } from '@/lib/amadeus';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');

  if (!keyword || keyword.length < 2) {
    return NextResponse.json({ airports: [] });
  }

  try {
    const airports = await searchAirports(keyword);
    return NextResponse.json({ airports });
  } catch (error: any) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search airports' },
      { status: 500 }
    );
  }
}
