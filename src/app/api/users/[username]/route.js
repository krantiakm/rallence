import { dbService } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { username } = await params;
    const profile = dbService.getUserProfile(username);
    if (!profile) {
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
