import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserStore } from '../../../lib/userStore';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  const userId = cookies().get('userId')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const preferences = await UserStore.getUserPreferences(userId);
    if (!preferences) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = cookies().get('userId')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    const currentPrefs = await UserStore.getUserPreferences(userId);
    
    if (!currentPrefs) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update preferences
    const updatedPrefs = {
      ...currentPrefs,
      ...updates,
    };

    await UserStore.saveUserPreferences(updatedPrefs);

    return NextResponse.json(updatedPrefs);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await request.json();
    const user = await UserStore.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user preferences
    await UserStore.saveUserPreferences({
      ...preferences,
      userId: user.userId,
      email: session.user.email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
} 