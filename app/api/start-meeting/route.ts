import { NextResponse } from 'next/server';
import { n8nService } from '@/packages/n8n/service';

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json();

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId is required' }, { status: 400 });
    }

    // Here you could add logic to save the meeting to Supabase before triggering n8n
    // For example:
    // const { data, error } = await supabase.from('meetings').insert([{ id: meetingId, status: 'pending' }]);
    // if (error) throw error;

    const result = await n8nService.callVexaMeetingIngest(meetingId);

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('API Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 