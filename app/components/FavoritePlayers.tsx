'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Player {
  id: string;
  name: string;
  isFavorite: boolean;
}

const TOP_PLAYERS = [
  'Alcaraz',
  'Zverev',
  'Sinner',
  'Medvedev',
  'Djokovic',
  'Swiatek',
  'Sabalenka',
  'Gauff',
  'Rybakina',
  'Nadal'
].map(name => ({ name, id: name.toLowerCase(), isFavorite: false }));

export default function FavoritePlayers() {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<Player[]>(TOP_PLAYERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/preferences');
          const data = await response.json();
          
          if (data.success && data.preferences.favoritePlayers) {
            setPlayers(TOP_PLAYERS.map(player => ({
              ...player,
              isFavorite: data.preferences.favoritePlayers.includes(player.id)
            })));
          }
        } catch (error) {
          console.error('Error loading favorite players:', error);
        }
      }
      setLoading(false);
    };

    loadFavorites();
  }, [session]);

  const toggleFavorite = async (playerId: string) => {
    if (!session?.user?.email) return;

    const updatedPlayers = players.map(player =>
      player.id === playerId ? { ...player, isFavorite: !player.isFavorite } : player
    );
    setPlayers(updatedPlayers);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favoritePlayers: updatedPlayers.filter(p => p.isFavorite).map(p => p.id)
        })
      });

      if (!response.ok) {
        // Revert on error
        setPlayers(players);
        console.error('Failed to update favorites');
      }
    } catch (error) {
      // Revert on error
      setPlayers(players);
      console.error('Error updating favorites:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  if (!session?.user?.email) {
    return (
      <div className="p-4 text-center text-gray-600">
        Please sign in to manage your favorite players
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Favorite Players</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map(player => (
          <div
            key={player.id}
            className={`p-4 rounded-lg border ${
              player.isFavorite 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{player.name}</span>
              <button
                onClick={() => toggleFavorite(player.id)}
                className={`p-2 rounded-full transition-colors ${
                  player.isFavorite
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {player.isFavorite ? '★' : '☆'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        You'll receive notifications for matches involving your favorite players.
      </p>
    </div>
  );
} 