import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    version: "v1.0.10", 
    commit: "e74d3a4+", 
    timestamp: new Date().toISOString()
  });
}
