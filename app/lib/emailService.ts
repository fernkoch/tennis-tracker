import nodemailer from 'nodemailer';
import { format, parseISO } from 'date-fns';
import { ApiTennisService } from './apiTennis';
import { UserStore } from './userStore';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class EmailService {
  static async sendDailySchedule(userEmail: string) {
    try {
      // Get user preferences
      const user = await UserStore.getUserByEmail(userEmail);
      if (!user || !user.dailySchedule) {
        return;
      }

      // Get today's matches
      const matches = await ApiTennisService.getDailySchedule();
      const majorMatches = matches.filter(match => ApiTennisService.isMajorMatch(match));

      // Sort matches by time
      majorMatches.sort((a, b) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );

      // Get head-to-head stats for each match
      const matchesWithStats = await Promise.all(
        majorMatches.map(async match => {
          const h2h = await ApiTennisService.getHeadToHead(
            match.homePlayer.name,
            match.awayPlayer.name
          );

          const nextOpponent = ApiTennisService.getPotentialNextOpponent(matches, match);
          const favorite = ApiTennisService.getMatchFavorite(match);

          return {
            ...match,
            h2h,
            nextOpponent,
            favorite
          };
        })
      );

      // Generate email content
      const emailContent = this.generateDailyScheduleEmail(matchesWithStats, user.favoritePlayerIds || []);

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `🎾 Your Tennis Schedule for ${format(new Date(), 'MMMM d, yyyy')}`,
        html: emailContent,
      });

      console.log(`Daily schedule sent to ${userEmail}`);
    } catch (error) {
      console.error(`Error sending daily schedule to ${userEmail}:`, error);
    }
  }

  private static generateDailyScheduleEmail(matches: any[], favoritePlayerIds: string[]): string {
    const matchesToHtml = matches.map(match => {
      const isFavoriteMatch = favoritePlayerIds.includes(match.homePlayer.id) || 
                             favoritePlayerIds.includes(match.awayPlayer.id);

      const h2hStats = match.h2h ? `
        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
          <strong>Head-to-Head:</strong> ${match.h2h.homeWins}-${match.h2h.awayWins}
          ${match.h2h.lastMatch ? `
            <br>Last match: ${format(parseISO(match.h2h.lastMatch.date), 'MMM d, yyyy')}
            (Winner: ${match.h2h.lastMatch.winner})
          ` : ''}
        </div>
      ` : '';

      const nextOpponentInfo = match.nextOpponent ? `
        <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
          <strong>Potential Next Opponent:</strong> 
          ${match.nextOpponent.homePlayer.name} vs ${match.nextOpponent.awayPlayer.name}
        </div>
      ` : '';

      const favoriteIndicator = match.favorite !== 'even' ? `
        <div style="margin-top: 5px; font-size: 0.9em; color: #1a73e8;">
          Favorite: ${match.favorite === 'home' ? match.homePlayer.name : match.awayPlayer.name}
        </div>
      ` : '';

      return `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; ${isFavoriteMatch ? 'border: 2px solid #1a73e8;' : ''}">
          <div style="font-weight: bold; color: #1a73e8; margin-bottom: 10px;">
            ${format(parseISO(match.scheduledTime), 'HH:mm')} - ${match.tournament.name} (${match.round})
            ${isFavoriteMatch ? ' ⭐' : ''}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <div>
              ${match.homePlayer.name} 
              <span style="color: #666;">#${match.homePlayer.ranking}</span>
            </div>
            <div>vs</div>
            <div>
              ${match.awayPlayer.name}
              <span style="color: #666;">#${match.awayPlayer.ranking}</span>
            </div>
          </div>
          <div style="color: #666; font-size: 0.9em;">
            Surface: ${match.tournament.surface}
          </div>
          ${h2hStats}
          ${favoriteIndicator}
          ${nextOpponentInfo}
        </div>
      `;
    }).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a73e8; text-align: center; margin-bottom: 30px;">
          Today's Major Tennis Matches
        </h1>
        ${matches.length > 0 ? matchesToHtml : '<p style="text-align: center;">No major matches scheduled for today.</p>'}
        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>You're receiving this email because you've enabled daily schedule notifications.</p>
          <p>To update your preferences, visit your account settings.</p>
        </div>
      </div>
    `;
  }
} 