import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    version: "v1.0.5", 
    commit: "72ff2a7+", 
    timestamp: new Date().toISOString()
  });
}
