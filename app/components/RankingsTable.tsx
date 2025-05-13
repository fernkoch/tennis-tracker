'use client';

import { useState, useMemo } from 'react';
import { PlayerRanking, RankingFilters } from '../types/ranking';
import { BellIcon, StarIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTheme } from './ThemeProvider';
import CountryFlag from './CountryFlag';
import CountryDropdown from './CountryDropdown';

interface RankingsTableProps {
  rankings: PlayerRanking[];
}

type SortField = 'rank' | 'name' | 'age' | 'points' | 'pointsToDefend';
type SortDirection = 'asc' | 'desc' | null;

function getAge(age: number): string {
  const years = Math.floor(age);
  const months = Math.round((age - years) * 12);
  return `${years}y ${months}m`;
}

function getRankChangeDescription(change: number): string {
  if (change > 0) return `Up ${change} spots this week`;
  if (change < 0) return `Down ${Math.abs(change)} spots this week`;
  return 'No change in ranking';
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  const { theme: currentTheme } = useTheme();
  const [filters, setFilters] = useState<RankingFilters>({
    onlyFollowed: false,
    countryFilter: undefined,
    ageRange: undefined,
    rankRange: undefined
  });
  const [sortConfig, setSortConfig] = useState<{field: SortField, direction: SortDirection}>({
    field: 'rank',
    direction: 'asc'
  });
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const toggleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field 
        ? prev.direction === 'asc' 
          ? 'desc' 
          : prev.direction === 'desc' 
            ? null 
            : 'asc'
        : 'asc'
    }));
  };

  const toggleFollow = (playerName: string) => {
    // In a real app, this would be connected to a backend
    console.log(`Toggle follow for ${playerName}`);
    alert('This feature requires user authentication. Coming soon!');
  };

  const toggleNotifications = (playerName: string) => {
    // In a real app, this would be connected to a backend
    console.log(`Toggle notifications for ${playerName}`);
    alert('This feature requires user authentication. Coming soon!');
  };

  const filteredAndSortedRankings = useMemo(() => {
    let result = [...rankings];

    // Apply filters
    result = result.filter(player => {
      if (filters.onlyFollowed && !player.isFollowed) return false;
      if (filters.countryFilter && player.country !== filters.countryFilter) return false;
      if (filters.ageRange && (player.age < filters.ageRange.min || player.age > filters.ageRange.max)) return false;
      if (filters.rankRange && (player.rank < filters.rankRange.min || player.rank > filters.rankRange.max)) return false;
      return true;
    });

    // Apply sorting
    if (sortConfig.direction !== null) {
      result.sort((a, b) => {
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        switch (sortConfig.field) {
          case 'rank':
            return (a.rank - b.rank) * direction;
          case 'name':
            return a.name.localeCompare(b.name) * direction;
          case 'age':
            return (a.age - b.age) * direction;
          case 'points':
            return (a.points - b.points) * direction;
          case 'pointsToDefend':
            return (a.pointsToDefend - b.pointsToDefend) * direction;
          default:
            return 0;
        }
      });
    } else {
      // Reset to default sorting (by rank ascending)
      result.sort((a, b) => a.rank - b.rank);
    }

    return result;
  }, [rankings, filters, sortConfig]);

  const uniqueCountries = useMemo(() => {
    const countryCount = rankings.reduce((acc, player) => {
      acc[player.country] = (acc[player.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([country]) => country);
  }, [rankings]);

  const playerCountsByCountry = useMemo(() => {
    return rankings.reduce((acc, player) => {
      acc[player.country] = (acc[player.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [rankings]);

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    if (sortConfig.direction === 'asc') return <ChevronUpIcon className="w-4 h-4 ml-1" />;
    if (sortConfig.direction === 'desc') return <ChevronDownIcon className="w-4 h-4 ml-1" />;
    return null;
  };

  return (
    <div className={`overflow-x-auto ${currentTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className={`mb-4 flex flex-wrap gap-4 p-4 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.onlyFollowed}
            onChange={(e) => setFilters({ ...filters, onlyFollowed: e.target.checked })}
            className="rounded border-gray-300 text-blue-600"
          />
          <span>Show only followed players</span>
        </label>
        <CountryDropdown
          countries={uniqueCountries}
          selectedCountry={filters.countryFilter}
          onSelect={(country) => setFilters({ ...filters, countryFilter: country })}
          playerCounts={playerCountsByCountry}
        />
      </div>

      <table className={`min-w-full ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <thead className={currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
          <tr>
            <th onClick={() => toggleSort('rank')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-opacity-80">
              <div className="flex items-center">
                Rank
                {getSortIcon('rank')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">±</th>
            <th onClick={() => toggleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-opacity-80">
              <div className="flex items-center">
                Player
                {getSortIcon('name')}
              </div>
            </th>
            <th onClick={() => toggleSort('age')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-opacity-80">
              <div className="flex items-center">
                Age
                {getSortIcon('age')}
              </div>
            </th>
            <th onClick={() => toggleSort('points')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-opacity-80">
              <div className="flex items-center">
                Points
                {getSortIcon('points')}
              </div>
            </th>
            <th onClick={() => toggleSort('pointsToDefend')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-opacity-80">
              <div className="flex items-center">
                To Defend
                {getSortIcon('pointsToDefend')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${currentTheme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {filteredAndSortedRankings.map((player) => (
            <>
              <tr 
                key={player.name}
                className={`cursor-pointer ${
                  expandedPlayer === player.name 
                    ? currentTheme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'
                    : currentTheme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                }`}
                onClick={() => setExpandedPlayer(expandedPlayer === player.name ? null : player.name)}
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                  {player.rank}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  player.rankChange > 0 ? 'text-green-500' : player.rankChange < 0 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {player.rankChange > 0 ? `↑${player.rankChange}` : player.rankChange < 0 ? `↓${Math.abs(player.rankChange)}` : '-'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                  <div className="flex items-center">
                    <CountryFlag countryCode={player.country} className="mr-2" />
                    <span className="font-medium">{player.name}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {getAge(player.age)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                  {player.points.toLocaleString()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  {player.pointsToDefend.toLocaleString()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFollow(player.name);
                      }}
                      className={`${currentTheme === 'dark' ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500'}`}
                      title="Follow player"
                    >
                      {player.isFollowed ? (
                        <StarIconSolid className="h-5 w-5" />
                      ) : (
                        <StarIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotifications(player.name);
                      }}
                      className={`${currentTheme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}`}
                      title="Enable notifications"
                    >
                      {player.notificationsEnabled ? (
                        <BellIconSolid className="h-5 w-5" />
                      ) : (
                        <BellIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedPlayer === player.name && (
                <tr className={currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="text-sm">
                      <h4 className="font-medium mb-2">Recent Results & Stats</h4>
                      <div className="mb-4">
                        <p className={`mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {getRankChangeDescription(player.rankChange)}
                        </p>
                      </div>
                      {player.recentResults?.map((result, idx) => (
                        <div key={idx} className="flex justify-between items-center mb-1">
                          <span>{result.tournament} - {result.round}</span>
                          <span className={currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{result.result}</span>
                          <span className={currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>+{result.pointsEarned} pts</span>
                        </div>
                      ))}
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <span className="font-medium">Points Defended This Week:</span>
                          <span className={`ml-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {player.pointsDefendedThisWeek.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Tournament Points:</span>
                          <span className={`ml-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {player.tournamentPoints.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Week over Week:</span>
                          <span className={`ml-2 ${
                            player.rankChange > 0 
                              ? currentTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                              : player.rankChange < 0
                              ? currentTheme === 'dark' ? 'text-red-400' : 'text-red-600'
                              : currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {player.rankChange > 0 ? '+' : ''}{player.rankChange} positions
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
} 