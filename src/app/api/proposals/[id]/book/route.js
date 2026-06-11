import { dbService } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, seatsCount, notes } = body;
    
    if (!userId || !seatsCount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId, seatsCount" },
        { status: 400 }
      );
    }
    
    const result = dbService.bookExperience(id, userId, parseInt(seatsCount), notes);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Proposal not found or booking failed" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      proposal: result.proposal, 
      booking: result.booking 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
