import { dbService } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { userId, willingnessToPay, availability } = body;
    
    if (!userId || willingnessToPay === undefined || !availability) {
      return NextResponse.json({ success: false, error: "Missing required fields: userId, willingnessToPay, availability" }, { status: 400 });
    }
    
    const updatedProposal = dbService.supportProposal(id, userId, parseInt(willingnessToPay), availability);
    return NextResponse.json({ success: true, proposal: updatedProposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
