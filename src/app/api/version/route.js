import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    version: "v1.0.7", 
    commit: "9073561+", 
    timestamp: new Date().toISOString()
  });
}
