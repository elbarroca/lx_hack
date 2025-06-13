import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json();

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId is required' }, { status: 400 });
    }


    const result = {
      success: true,
      meetingId,
      message: 'Meeting processing initiated',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 