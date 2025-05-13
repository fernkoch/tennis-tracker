import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { EmailService } from './emailService';
import { UserStore } from './userStore';
import fs from 'fs/promises';
import path from 'path';

export class Scheduler {
  private static isRunning = false;
  private static scheduledJobs = new Map<string, ScheduledTask>();

  static async start() {
    if (this.isRunning) {
      return;
    }

    // Check every minute for users who should receive notifications
    cron.schedule('* * * * *', async () => {
      await this.checkScheduledNotifications();
    });

    this.isRunning = true;
    console.log('Scheduler started');
  }

  private static async checkScheduledNotifications() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Get all users from the data directory
      const usersDir = path.join(process.cwd(), 'data', 'users');
      const userDirs = await fs.readdir(usersDir);

      // Process each user
      for (const userId of userDirs) {
        try {
          const prefs = await UserStore.getUserPreferences(userId);
          
          if (prefs && prefs.dailySchedule && prefs.email) {
            // Parse preferred delivery time
            const [prefHour, prefMinute] = prefs.dailyScheduleTime.split(':').map(Number);
            
            // Check if it's time to send
            if (currentHour === prefHour && currentMinute === prefMinute) {
              // Check quiet hours
              if (prefs.quietHours?.enabled) {
                const currentTime = currentHour * 100 + currentMinute;
                const startTime = parseInt(prefs.quietHours.start.replace(':', ''));
                const endTime = parseInt(prefs.quietHours.end.replace(':', ''));

                // Skip if we're in quiet hours
                if (currentTime >= startTime || currentTime <= endTime) {
                  console.log(`Skipping daily schedule for ${prefs.email} due to quiet hours`);
                  continue;
                }
              }

              await EmailService.sendDailySchedule(prefs.email);
            }
          }
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in checkScheduledNotifications:', error);
    }
  }
} 