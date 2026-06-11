import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    version: "v1.0.4", 
    commit: "8786269+", 
    timestamp: new Date().toISOString()
  });
}
