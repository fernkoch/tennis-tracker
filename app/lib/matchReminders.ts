import { differenceInMinutes } from 'date-fns';
import { getUserPreferences } from './userPreferences';
import { sendPushoverNotification } from './pushover';

interface Match {
  id: string;
  homePlayer: {
    name: string;
  };
  awayPlayer: {
    name: string;
  };
  scheduledTime: string;
  tournament: {
    name: string;
  };
  round: string;
}

export async function checkAndSendMatchReminders(matches: Match[]) {
  // Get all users with notification preferences
  const usersPrefs = await getUserPreferences();
  
  for (const userPrefs of usersPrefs) {
    if (!userPrefs.pushoverKey || !userPrefs.favoritePlayers?.length) continue;

    const userFavorites = userPrefs.favoritePlayers.map(p => p.toLowerCase());
    
    // Filter matches for user's favorite players
    const relevantMatches = matches.filter(match => {
      const homePlayerName = match.homePlayer.name.toLowerCase();
      const awayPlayerName = match.awayPlayer.name.toLowerCase();
      
      return userFavorites.some(favorite => 
        homePlayerName.includes(favorite) || awayPlayerName.includes(favorite)
      );
    });

    // Check each match's start time
    for (const match of relevantMatches) {
      const matchTime = new Date(match.scheduledTime);
      const minutesUntilMatch = differenceInMinutes(matchTime, new Date());

      // Send reminder 5 minutes before match
      if (minutesUntilMatch === 5) {
        const message = `Match starting in 5 minutes!\n\n${match.homePlayer.name} vs ${match.awayPlayer.name}\n${match.tournament.name} - ${match.round}`;
        
        await sendPushoverNotification({
          userKey: userPrefs.pushoverKey,
          message,
          title: '🎾 Match Reminder',
          priority: 1
        });
      }
    }
  }
} 