import { NextResponse } from 'next/server';
import { Scheduler } from '../../lib/scheduler';

// Track if scheduler is initialized
let isInitialized = false;

export async function GET() {
  if (!isInitialized) {
    await Scheduler.start();
    isInitialized = true;
    return NextResponse.json({ status: 'Scheduler initialized' });
  }
  return NextResponse.json({ status: 'Scheduler already running' });
}

// Initialize when this file is first loaded
if (!isInitialized) {
  Scheduler.start().catch(console.error);
  isInitialized = true;
} 