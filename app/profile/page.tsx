import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import FavoritePlayers from '../components/FavoritePlayers';
import NotificationSettings from '../components/NotificationSettings';

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      <div className="space-y-8">
        {/* User Info */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p>
              <span className="text-gray-600">Email:</span>{' '}
              <span className="font-medium">{session.user.email}</span>
            </p>
          </div>
        </section>

        {/* Favorite Players */}
        <section className="bg-white rounded-lg shadow">
          <FavoritePlayers />
        </section>

        {/* Notification Settings */}
        <section className="bg-white rounded-lg shadow">
          <NotificationSettings />
        </section>
      </div>
    </div>
  );
} 