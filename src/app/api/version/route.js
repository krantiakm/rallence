import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    version: "v1.0.6", 
    commit: "dcc8762+", 
    timestamp: new Date().toISOString()
  });
}
