import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ApiTennisService } from '../../lib/apiTennis';
import { format } from 'date-fns';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FAVORITE_PLAYERS = ['Alcaraz', 'Zverev', 'Sinner'];

export async function GET(request: Request) {
  try {
    // Get today's matches
    const today = new Date();
    console.log('Fetching matches for:', today.toISOString());
    
    const matches = await ApiTennisService.getDailySchedule(today);
    console.log('Matches found:', matches.length);

    // Split matches into favorites and other major matches
    const favoriteMatches = matches.filter(match => 
      FAVORITE_PLAYERS.some(player => 
        match.homePlayer.name.toLowerCase().includes(player.toLowerCase()) ||
        match.awayPlayer.name.toLowerCase().includes(player.toLowerCase())
      )
    );
    
    const otherMajorMatches = matches.filter(match => 
      ApiTennisService.isMajorMatch(match) && 
      !favoriteMatches.includes(match)
    );

    console.log('Favorite matches found:', favoriteMatches.length);
    console.log('Other major matches found:', otherMajorMatches.length);

    // Sort matches by time
    const sortByTime = (a: any, b: any) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    
    favoriteMatches.sort(sortByTime);
    otherMajorMatches.sort(sortByTime);

    // Get additional data for favorite matches
    const favoriteMatchesWithDetails = await Promise.all(
      favoriteMatches.map(async match => {
        const h2h = await ApiTennisService.getHeadToHead(
          match.homePlayer.name,
          match.awayPlayer.name
        );
        const nextOpponent = ApiTennisService.getPotentialNextOpponent(matches, match);
        const favorite = ApiTennisService.getMatchFavorite(match);
        return { ...match, h2h, nextOpponent, favorite };
      })
    );

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a73e8; text-align: center; margin-bottom: 30px;">
          Tennis Matches for ${format(today, 'MMMM d, yyyy')}
        </h1>
        
        ${favoriteMatchesWithDetails.length > 0 ? `
          <h2 style="color: #1a73e8; margin-top: 30px;">Your Favorite Players' Matches</h2>
          ${favoriteMatchesWithDetails.map(match => `
            <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #1a73e8;">
              <h3 style="margin: 0 0 10px 0; color: #1a73e8;">
                ${match.tournament.name} - ${match.round}
              </h3>
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div>
                    <p style="margin: 5px 0; font-size: 1.1em;">
                      <strong>${match.homePlayer.name}</strong>
                      ${match.favorite === 'home' ? ' 🌟' : ''}
                    </p>
                    <p style="margin: 5px 0; font-size: 1.1em;">
                      <strong>${match.awayPlayer.name}</strong>
                      ${match.favorite === 'away' ? ' 🌟' : ''}
                    </p>
                  </div>
                  <div style="text-align: right;">
                    <p style="margin: 5px 0; color: #666;">
                      ${format(new Date(match.scheduledTime), 'HH:mm')}
                    </p>
                    ${match.odds ? `
                      <p style="margin: 5px 0; font-size: 0.9em; color: #666;">
                        Odds: ${match.odds.homeWin.toFixed(2)} / ${match.odds.awayWin.toFixed(2)}
                      </p>
                    ` : ''}
                  </div>
                </div>
                ${match.h2h ? `
                  <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <strong>Head-to-Head:</strong> ${match.h2h.homeWins}-${match.h2h.awayWins}
                    ${match.h2h.lastMatch ? `
                      <br>Last match: ${format(new Date(match.h2h.lastMatch.date), 'MMM d, yyyy')}
                      (Winner: ${match.h2h.lastMatch.winner})
                    ` : ''}
                  </div>
                ` : ''}
                ${match.nextOpponent ? `
                  <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <strong>Potential Next Opponent:</strong><br>
                    ${match.nextOpponent.homePlayer.name} vs ${match.nextOpponent.awayPlayer.name}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${otherMajorMatches.length > 0 ? `
          <h2 style="color: #1a73e8; margin-top: 30px;">Other Major Matches</h2>
          ${otherMajorMatches.map(match => `
            <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #1a73e8;">
                ${match.tournament.name} - ${match.round}
              </h3>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="margin: 5px 0;"><strong>${match.homePlayer.name}</strong></p>
                  <p style="margin: 5px 0;"><strong>${match.awayPlayer.name}</strong></p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 5px 0; color: #666;">
                    ${format(new Date(match.scheduledTime), 'HH:mm')}
                  </p>
                  ${match.odds ? `
                    <p style="margin: 5px 0; font-size: 0.9em; color: #666;">
                      Odds: ${match.odds.homeWin.toFixed(2)} / ${match.odds.awayWin.toFixed(2)}
                    </p>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        ` : ''}

        ${favoriteMatchesWithDetails.length === 0 && otherMajorMatches.length === 0 ? `
          <p style="text-align: center; color: #666;">No major matches scheduled for today.</p>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>You're receiving this email because you're following Alcaraz, Zverev, and Sinner.</p>
          <p>To update your preferences, visit your account settings.</p>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'nandokoch@gmail.com',
      subject: `🎾 Tennis Matches for ${format(today, 'MMMM d, yyyy')}`,
      html: emailContent,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      favoriteMatchesFound: favoriteMatches.length,
      otherMajorMatchesFound: otherMajorMatches.length
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 