import type { EventCardData } from '../components/EventCard'

export const MOCK_EVENTS: EventCardData[] = [
  {
    id: '6',
    title: 'Bowling vendredi',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // passé depuis 2h
    location: "Bowl'n One",
    maxParticipants: 10,
    confirmed: 7,
    maybe: 1,
    no: 2,
    waitlistCount: 0,
    userStatus: 'yes',
  },
  {
    id: '1',
    title: 'Soirée rooftop',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: 'Paris 11e',
    maxParticipants: 15,
    confirmed: 14,
    maybe: 2,
    no: 1,
    waitlistCount: 3,
    userStatus: 'yes',
  },
  {
    id: '2',
    title: 'BBQ chez Théo',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    location: 'Vincennes',
    maxParticipants: 20,
    confirmed: 8,
    maybe: 4,
    no: 2,
    waitlistCount: 0,
    userStatus: 'maybe',
  },
  {
    id: '3',
    title: 'Foot du dimanche',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    location: 'Stade Charléty',
    maxParticipants: 14,
    confirmed: 3,
    maybe: 1,
    no: 0,
    waitlistCount: 0,
    userStatus: 'pending',
  },
  {
    id: '4',
    title: 'Ciné La Défense',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    location: 'UGC Ciné Cité',
    maxParticipants: 8,
    confirmed: 8,
    maybe: 0,
    no: 3,
    waitlistCount: 2,
    userStatus: 'waitlist',
  },
  {
    id: '5',
    title: 'Pétanque + rosé',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    location: 'Parc des Buttes-Chaumont',
    maxParticipants: null,
    confirmed: 5,
    maybe: 3,
    no: 0,
    waitlistCount: 0,
    userStatus: 'yes',
  },
]

export interface MockEventDetail {
  id: string
  title: string
  date: Date
  deadline: Date
  location?: string
  creatorId: string
  creatorName: string
  maxParticipants: number | null
  participants: Array<{
    id: string
    name: string
    avatar?: string
    status: 'yes' | 'no' | 'maybe' | 'waitlist'
  }>
}

export const MOCK_EVENT_DETAILS: Record<string, MockEventDetail> = {
  '6': {
    id: '6',
    title: 'Bowling vendredi',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deadline: new Date(Date.now() - 4 * 60 * 60 * 1000),
    location: "Bowl'n One",
    creatorId: 'u1',
    creatorName: 'Lucas',
    maxParticipants: 10,
    participants: [
      { id: 'u1', name: 'Lucas', status: 'yes' },
      { id: 'u2', name: 'Emma', status: 'yes' },
      { id: 'u3', name: 'Théo', status: 'yes' },
      { id: 'u4', name: 'Sarah', status: 'yes' },
      { id: 'u5', name: 'Jules', status: 'yes' },
      { id: 'u6', name: 'Léa', status: 'yes' },
      { id: 'u7', name: 'Maxime', status: 'yes' },
      { id: 'u8', name: 'Nina', status: 'maybe' },
      { id: 'u9', name: 'Romain', status: 'no' },
    ],
  },
  '1': {
    id: '1',
    title: 'Soirée rooftop',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    location: 'Paris 11e',
    creatorId: 'u1',
    creatorName: 'Lucas',
    maxParticipants: 15,
    participants: [
      { id: 'u1', name: 'Lucas', status: 'yes' },
      { id: 'u2', name: 'Emma', status: 'yes' },
      { id: 'u3', name: 'Tom', status: 'yes' },
      { id: 'u4', name: 'Sarah', status: 'maybe' },
      { id: 'u5', name: 'Jules', status: 'no' },
      { id: 'u6', name: 'Léa', status: 'yes' },
      { id: 'u7', name: 'Maxime', status: 'yes' },
    ],
  },
  '2': {
    id: '2',
    title: 'BBQ chez Théo',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 28 * 60 * 60 * 1000),
    location: 'Vincennes',
    creatorId: 'u3',
    creatorName: 'Théo',
    maxParticipants: 20,
    participants: [
      { id: 'u3', name: 'Théo', status: 'yes' },
      { id: 'u1', name: 'Lucas', status: 'yes' },
      { id: 'u2', name: 'Emma', status: 'maybe' },
      { id: 'u4', name: 'Sarah', status: 'yes' },
    ],
  },
  '3': {
    id: '3',
    title: 'Foot du dimanche',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    location: 'Stade Charléty',
    creatorId: 'u5',
    creatorName: 'Jules',
    maxParticipants: 14,
    participants: [
      { id: 'u5', name: 'Jules', status: 'yes' },
      { id: 'u6', name: 'Léa', status: 'yes' },
      { id: 'u7', name: 'Maxime', status: 'yes' },
    ],
  },
  '4': {
    id: '4',
    title: 'Ciné La Défense',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 3 * 60 * 60 * 1000),
    location: 'UGC Ciné Cité',
    creatorId: 'u2',
    creatorName: 'Emma',
    maxParticipants: 8,
    participants: [
      { id: 'u2', name: 'Emma', status: 'yes' },
      { id: 'u1', name: 'Lucas', status: 'yes' },
      { id: 'u3', name: 'Théo', status: 'yes' },
      { id: 'u4', name: 'Sarah', status: 'yes' },
      { id: 'u5', name: 'Jules', status: 'yes' },
      { id: 'u6', name: 'Léa', status: 'yes' },
      { id: 'u7', name: 'Maxime', status: 'yes' },
      { id: 'u8', name: 'Nina', status: 'yes' },
    ],
  },
  '5': {
    id: '5',
    title: 'Pétanque + rosé',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
    location: 'Parc des Buttes-Chaumont',
    creatorId: 'u4',
    creatorName: 'Sarah',
    maxParticipants: null,
    participants: [
      { id: 'u4', name: 'Sarah', status: 'yes' },
      { id: 'u1', name: 'Lucas', status: 'yes' },
      { id: 'u2', name: 'Emma', status: 'maybe' },
    ],
  },
}

export const MOCK_FRIENDS = [
  { id: 'u1', name: 'Lucas' },
  { id: 'u2', name: 'Emma' },
  { id: 'u3', name: 'Théo' },
  { id: 'u4', name: 'Sarah' },
  { id: 'u5', name: 'Jules' },
  { id: 'u6', name: 'Léa' },
  { id: 'u7', name: 'Maxime' },
  { id: 'u8', name: 'Nina' },
]
