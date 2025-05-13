import { NextResponse } from 'next/server';
import { ApiTennisService } from '../../lib/apiTennis';

export async function GET(request: Request) {
  try {
    const matches = await ApiTennisService.getDailySchedule();
    
    // Sort matches by time and importance
    const sortedMatches = matches.sort((a, b) => {
      // First, sort by whether it's a major match
      const aMajor = ApiTennisService.isMajorMatch(a);
      const bMajor = ApiTennisService.isMajorMatch(b);
      if (aMajor && !bMajor) return -1;
      if (!aMajor && bMajor) return 1;
      
      // Then sort by scheduled time
      return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    });

    return NextResponse.json(sortedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
} 