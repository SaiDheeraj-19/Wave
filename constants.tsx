
import { Track, Playlist } from './types';

export const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    artwork: 'https://picsum.photos/seed/m83/400/400',
    duration: 243,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    isHiRes: true,
    isDownloaded: true,
    format: 'FLAC'
  },
  {
    id: '2',
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    artwork: 'https://picsum.photos/seed/weeknd/400/400',
    duration: 230,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    isHiRes: false,
    isDownloaded: true,
    format: 'AAC'
  },
  {
    id: '3',
    title: 'Neon Horizon',
    artist: 'The Luminary Artists',
    album: 'Prism Dreams',
    artwork: 'https://picsum.photos/seed/neon/400/400',
    duration: 312,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    isHiRes: true,
    isDownloaded: false,
    format: 'FLAC'
  },
  {
    id: '4',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    artwork: 'https://picsum.photos/seed/bl/400/400',
    duration: 200,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    isHiRes: true,
    isDownloaded: true,
    format: 'FLAC'
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Daily Mix 1',
    description: 'Jazz Essentials',
    artwork: 'https://picsum.photos/seed/jazz/600/800',
    tracks: MOCK_TRACKS.slice(0, 2),
    isDownloaded: false,
    type: 'SMART'
  },
  {
    id: 'p2',
    name: 'Chill Lofi Mix',
    description: 'Perfect for focus',
    artwork: 'https://picsum.photos/seed/lofi/600/800',
    tracks: MOCK_TRACKS.slice(1, 3),
    isDownloaded: true,
    type: 'EDITORIAL'
  },
  {
    id: 'p3',
    name: 'Rock Anthems',
    description: 'The legends only',
    artwork: 'https://picsum.photos/seed/rock/600/800',
    tracks: MOCK_TRACKS,
    isDownloaded: true,
    type: 'EDITORIAL'
  }
];
