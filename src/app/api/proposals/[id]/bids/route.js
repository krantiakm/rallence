import { dbService } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.providerName || !body.price || !body.proposedDate || !body.capacity || !body.terms) {
      return NextResponse.json({ success: false, error: "Missing required fields for provider bid" }, { status: 400 });
    }
    
    const updatedProposal = dbService.submitProviderBid(id, body);
    return NextResponse.json({ success: true, proposal: updatedProposal });
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
    
    const updatedProposal = dbService.voteOnProviderBid(id, bidId, userId);
    return NextResponse.json({ success: true, proposal: updatedProposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'admin';
    const count = parseInt(searchParams.get('count')) || 1;
    const updatedProposal = dbService.inviteFriends(id, userId, count);
    return NextResponse.json({ success: true, proposal: updatedProposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
