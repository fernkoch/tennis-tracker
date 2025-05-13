import { TennisMatch } from '../types/match';

const currentYear = new Date().getFullYear();

export const romeMatches: TennisMatch[] = [
  {
    id: 'rome_r16_1',
    opponent: 'Karen Khachanov',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '11:00',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'Campo Centrale'
  },
  {
    id: 'rome_r16_2',
    opponent: 'Francisco Cerundolo',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '15:00',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'Campo Centrale'
  },
  {
    id: 'rome_r16_3',
    opponent: 'Daniil Medvedev',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '14:00',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'Grand Stand Arena'
  },
  {
    id: 'rome_r16_4',
    opponent: 'Arthur Fils',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '17:00',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'Grand Stand Arena'
  },
  {
    id: 'rome_r16_5',
    opponent: 'Corentin Moutet',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '11:00',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'SuperTennis Arena'
  },
  {
    id: 'rome_r16_6',
    opponent: 'Hubert Hurkacz',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '12:30',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'SuperTennis Arena'
  },
  {
    id: 'rome_r16_7',
    opponent: 'Tommy Paul',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '18:30',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'Grand Stand Arena'
  },
  {
    id: 'rome_r16_8',
    opponent: 'Jaume Munar',
    tournament: 'Rome Masters',
    date: `${currentYear}-05-13`,
    time: '20:30',
    round: 'Round of 16',
    surface: 'Clay',
    court: 'Campo Centrale'
  }
]; 