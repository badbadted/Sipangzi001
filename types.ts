export interface Racer {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: number;
}

export type Distance = 10 | 30 | 50;

export interface Record {
  id: string;
  racerId: string;
  distance: Distance;
  timeSeconds: number;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD for easier grouping
}

export interface GroupedRecords {
  [date: string]: Record[];
}

export const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 
  'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 
  'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];
