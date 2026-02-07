
export enum PlaybackState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING'
}

export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
  OFFLINE_ONLY = 'OFFLINE_ONLY'
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number; // in seconds
  audioUrl: string;
  isHiRes: boolean;
  isDownloaded: boolean;
  format: 'MP3' | 'AAC' | 'FLAC';
  language?: string;
  lyrics?: string;
  // New Metadata
  bpm?: number;
  key?: string;
  energy?: number; // 0-1 (Direct score)
  energyScore?: 'WORKOUT_SAFE' | 'RISKY' | 'MOMENTUM_KILLER';
  muscleGroup?: 'PUSH' | 'PULL' | 'LEGS' | 'CARDIO';
  isPrLocked?: boolean;

  // Human State & Meaning Metadata
  journalNotes?: string;
  artistIntent?: string;
  era?: string;
  influences?: string[];
  recommendationReason?: string; // Explainable AI badge

  lineage?: {
    sampledFrom?: string[];
    coverOf?: string;
    remixOf?: string;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  artwork: string;
  tracks: Track[];
  isDownloaded: boolean;
  type: 'EDITORIAL' | 'USER' | 'SMART';
}

export interface UserPlaylist {
  id: string;
  name: string;
  trackIds: string[];
}

export type ListeningIntent = 'Focus' | 'Escape' | 'Reflect' | 'Celebrate' | 'Process' | 'Kill Time' | 'None';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'GYM' | 'UPDATE' | 'ALERT';
  timestamp: number;
  read: boolean;
}

export interface UserStatistics {
  groundTruthMonth: string; // e.g. "February 2026"
  totalGymTime: number; // in seconds
  artistListenCounts: Record<string, number>;
  songListenCounts: Record<string, number>;
  topGenres: Record<string, number>;
}

export interface AppState {
  activeTab: 'home' | 'search' | 'browse' | 'library' | 'offline' | 'analytics' | 'settings' | 'profile';
  isGymMode: boolean;
  currentTrack: Track | null;
  currentLyrics: string | null;
  playbackState: PlaybackState;

  stats: UserStatistics;

  // Human State Optimizations
  currentIntent: ListeningIntent;
  antiAlgorithmMode: boolean;
  moodStabilityWeight: number; // 0-1
  silenceBetweenSongs: number; // in seconds
  lyricsFirstMode: boolean;

  // Next-Gen Features
  radicalTrustMode: boolean; // Explainable AI
  artistContextMode: boolean; // Deep Context
  discoveryWindow: {
    enabled: boolean;
    day: string;
    time: string;
    amount: number;
  };
  musicJournal: Record<string, string>; // trackId -> personal note
  tasteEvolution: {
    genres: Record<string, number>; // month-year -> count
    tempos: Record<string, number>;
  };

  // Training Mode State
  trainingState: 'WARM_UP' | 'WORKING_SET' | 'PR_ATTEMPT' | 'REST';
  lockedEnergyMode: boolean;
  energyDebt: number; // Compensation value for next track
  prModeActive: boolean;

  // Queue Management
  queue: Track[];
  history: Track[];
  recentlyPlayed: Track[];
  shuffleMode: boolean;
  repeatMode: 'none' | 'one' | 'all';
  crossfadeDuration: number; // 0 to 12s

  // User Personalization Rules
  userRules: string[];
  skipShameData: Record<string, number>; // trackId -> heavySetSkipCount

  // Library & Personalization
  // Library & Personalization
  likedSongs: Track[]; // Full Track Objects
  userPlaylists: UserPlaylist[];
  favorites: string[]; // Track IDs
  downloads: Track[]; // Offline Assets

  gymSessionStartTime: number | null;

  // Gym Mode Resume State
  lastNormalTrack: Track | null;
  lastNormalProgress: number;

  // Audio Controls
  eqSettings: {
    enabled: boolean;
    preset: string;
    bands: number[]; // Gain values for frequencies
  };
  loudnessNormalization: boolean;
  monoAudio: boolean;

  // Analytics & Mood
  listeningMood: string;
  burnoutDetection: boolean;

  // System
  volume: number;
  progress: number; // current time in seconds
  duration: number;
  gymSeeds: string[]; // Dynamically configured workout artists/terms
  notifications: Notification[];
  audioDevice: 'Headphones' | 'Speaker' | 'Car' | 'Unknown';
  currentUser: User | null;
}

export interface User {
  email: string;
  password?: string; // In a real app, this would be a hash or token
  username?: string;
}
