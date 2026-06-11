import { dbService } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const proposal = dbService.getProposal(id);
    if (!proposal) {
      return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { bidId, userId } = body;
    
    if (!bidId || !userId) {
      return NextResponse.json({ success: false, error: "Missing bidId or userId" }, { status: 400 });
    }
    
    const updatedProposal = dbService.acceptProviderBid(id, bidId, userId);
    return NextResponse.json({ success: true, proposal: updatedProposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
