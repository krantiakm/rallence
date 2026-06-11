import { dbService } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'admin';
    const proposals = dbService.getProposals(userId);
    return NextResponse.json({ success: true, proposals });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userId = body.userId || 'admin';
    
    if (!body.title || !body.description) {
      return NextResponse.json({ success: false, error: "Missing required fields: title, description" }, { status: 400 });
    }
    
    const newProposal = dbService.createProposal(userId, body);
    return NextResponse.json({ success: true, proposal: newProposal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
