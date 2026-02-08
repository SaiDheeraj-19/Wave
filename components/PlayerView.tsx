
import React, { useState, useEffect } from 'react';
import { Track, PlaybackState } from '../types';

interface PlayerViewProps {
  track: Track;
  state: PlaybackState;
  progress: number;
  duration: number;
  queue: Track[];
  lyrics: string | null;
  onClose: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleLike: (track: Track) => void;
  isLiked: boolean;
  lyricsFirstMode: boolean;
  onPlayTrack: (track: Track) => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({
  track, state, progress, duration, queue, lyrics, onClose, onTogglePlay, onSeek, onNext, onPrev, onToggleDownload, isDownloaded,
  onToggleLike, isLiked, lyricsFirstMode, onPlayTrack
}) => {
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [showLyrics, setShowLyrics] = useState(lyricsFirstMode);
  const [showQueue, setShowQueue] = useState(false);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = duration > 0 ? duration : (track.duration || 0);

  // Find next song
  const currentIndex = queue.findIndex(t => t.id === track.id);
  const nextTrack = currentIndex !== -1 && currentIndex < queue.length - 1 ? queue[currentIndex + 1] : (repeatMode === 'all' ? queue[0] : null);

  return (
    <div className="fixed inset-0 z-[100] bg-onyx-black flex flex-col p-8 pt-12 animate-in slide-in-from-bottom duration-700 overflow-y-auto no-scrollbar">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-[60%] opacity-30 blur-[120px] pointer-events-none" style={{ background: `radial-gradient(circle, ${track.artwork.includes('placeholder') ? '#4F46E5' : 'rgba(168,85,247,0.5)'}, transparent)` }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-12">
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors active:scale-90">
          <span className="material-symbols-outlined !text-[32px] text-white">keyboard_arrow_down</span>
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Playing from Playlist</p>
          <p className="text-xs font-black italic text-white uppercase tracking-tight truncate max-w-[200px]">{track.album || track.artist}</p>
        </div>
        <button onClick={() => setShowQueue(!showQueue)} className={`p-2 rounded-full transition-colors ${showQueue ? 'bg-primary text-white' : 'hover:bg-white/5 text-white'}`}>
          <span className="material-symbols-outlined !text-[24px]">queue_music</span>
        </button>
      </header>

      {/* Main Content Toggle (Artwork or Lyrics) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-12 min-h-[400px]">
        {showLyrics ? (
          <div className="w-full h-full p-6 bg-white/5 rounded-[3rem] backdrop-blur-3xl overflow-y-auto no-scrollbar animate-in fade-in zoom-in duration-500 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black italic tracking-[0.2em] text-primary uppercase">Lyrics Deployment</h3>
              <button onClick={() => setShowLyrics(false)} className="material-symbols-outlined text-white/40">close</button>
            </div>
            {lyrics ? (
              <div className="space-y-6">
                {lyrics.split('<br>').map((line, i) => (
                  <p key={i} className="text-2xl font-black italic text-white tracking-tight leading-snug opacity-80 hover:opacity-100 transition-opacity">
                    {line.replace(/&quot;/g, '"').replace(/&amp;/g, '&')}
                  </p>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-20">
                <span className="material-symbols-outlined !text-6xl text-white/10 animate-pulse">subtitles_off</span>
                <p className="text-sm font-black italic text-white/20 uppercase tracking-widest">No Intelligence Assets Found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-[85%] aspect-square rounded-[3rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.8)] border border-white/10 group active:scale-95 transition-all">
            <img src={track.artwork} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s]" alt={track.title} />
          </div>
        )}
      </div>

      {/* Info & Badges */}
      <div className="relative z-10 space-y-6 mb-8">
        <div className="flex items-center justify-between pr-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-none mb-2 truncate">{track.title}</h1>
            <p className="text-xl font-black italic text-white/40 uppercase tracking-tight truncate">{track.artist}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onToggleDownload && onToggleDownload(track)}
              className={`transition-all active:scale-90 ${isDownloaded ? 'text-primary scale-110' : 'text-white/20 hover:text-white'}`}
            >
              <span className="material-symbols-outlined !text-[32px]">{isDownloaded ? 'offline_pin' : 'download'}</span>
            </button>
            <button
              onClick={() => onToggleLike(track)}
              className={`transition-transform active:scale-90 ${isLiked ? 'text-red-600 scale-110' : 'text-white/20 hover:text-white'}`}
            >
              <span className={`material-symbols-outlined !text-[36px] ${isLiked ? 'fill-1' : ''}`}>favorite</span>
            </button>
          </div>
        </div>

        {/* Up Next Preview */}
        {nextTrack && !showLyrics && (
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-4 animate-in slide-in-from-right duration-700">
            <div className="size-10 rounded-xl overflow-hidden shadow-2xl">
              <img src={nextTrack.artwork} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Up Next</p>
              <p className="text-xs font-black italic text-white uppercase truncate">{nextTrack.title}</p>
            </div>
            <span className="material-symbols-outlined text-white/20">skip_next</span>
          </div>
        )}
      </div>

      {/* Progress & Controls */}
      <div className="relative z-10 space-y-12">
        <div className="space-y-4">
          <div
            className="relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer flex items-center overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              onSeek(pct * totalDuration);
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 bg-primary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]" style={{ width: `${(progress / (totalDuration || 1)) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-black text-white/20 uppercase tracking-widest leading-none">
            <span>{formatTime(progress)}</span>
            <span>-{formatTime(totalDuration - progress)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-12">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`transition-all active:scale-90 ${isShuffle ? 'text-primary' : 'text-white/20 hover:text-white'}`}
          >
            <span className="material-symbols-outlined !text-[28px]">{isShuffle ? 'shuffle_on' : 'shuffle'}</span>
          </button>

          <div className="flex items-center gap-10">
            <button onClick={onPrev} className="text-white hover:scale-125 transition-transform active:scale-75"><span className="material-symbols-outlined !text-[40px] fill-1">skip_previous</span></button>
            <button
              onClick={onTogglePlay}
              className="size-24 rounded-full bg-white text-black flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined !text-[52px] fill-1">
                {state === PlaybackState.PLAYING ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button onClick={onNext} className="text-white hover:scale-125 transition-transform active:scale-75"><span className="material-symbols-outlined !text-[40px] fill-1">skip_next</span></button>
          </div>

          <button
            onClick={() => setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none')}
            className={`transition-all active:scale-90 ${repeatMode !== 'none' ? 'text-primary' : 'text-white/20 hover:text-white'}`}
          >
            <span className="material-symbols-outlined !text-[28px]">
              {repeatMode === 'one' ? 'repeat_one' : repeatMode === 'all' ? 'repeat_on' : 'repeat'}
            </span>
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-white/5 pt-10 px-4">
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className={`flex items-center gap-2 transition-all active:scale-90 ${showLyrics ? 'text-primary' : 'text-white/40 hover:text-white'}`}
          >
            <span className="material-symbols-outlined !text-[24px]">lyrics</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Lyrics</span>
          </button>
          <div className="flex items-center gap-6">
            <span className="material-symbols-outlined text-white/20 hover:text-white cursor-pointer transition-colors !text-[24px]">devices</span>
            <span
              onClick={() => setShowQueue(!showQueue)}
              className={`material-symbols-outlined cursor-pointer transition-colors !text-[24px] ${showQueue ? 'text-primary' : 'text-white/20 hover:text-white'}`}
            >
              queue_music
            </span>
          </div>
        </div>
      </div>

      {/* Queue Overlay */}
      {showQueue && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom duration-500 overflow-y-auto p-8 no-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Strategic Queue</h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1">Ready for deployment</p>
            </div>
            <button onClick={() => setShowQueue(false)} className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">close</span>
            </button>
          </div>
          <div className="space-y-4">
            {queue.map((t, i) => (
              <div
                key={t.id + i}
                onClick={() => onPlayTrack(t)}
                className={`flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer hover:bg-white/10 ${t.id === track.id ? 'bg-primary/20 border-2 border-primary/40' : 'bg-white/5 border-2 border-transparent'}`}
              >
                <div className="size-14 rounded-2xl overflow-hidden">
                  <img src={t.artwork} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`font-black italic uppercase truncate leading-none mb-1 ${t.id === track.id ? 'text-primary' : 'text-white'}`}>{t.title}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest truncate">{t.artist}</p>
                </div>
                {t.id === track.id && (
                  <div className="flex gap-1 justify-center items-end h-4">
                    <div className="w-1 bg-primary animate-pulse h-full" />
                    <div className="w-1 bg-primary animate-pulse h-2/3" />
                    <div className="w-1 bg-primary animate-pulse h-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerView;
