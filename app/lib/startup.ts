import { Scheduler } from './scheduler';

export async function initializeServices() {
  // Start the scheduler for daily notifications
  await Scheduler.start();
}

// Call this function when the app starts
initializeServices().catch(console.error); 