

import React, { useState, useEffect } from 'react';
import { Track, PlaybackState } from '../types';

interface MiniPlayerProps {
  track: Track | null;
  state: PlaybackState;
  onTogglePlay: () => void;
  onOpenFull: () => void;
  onNext: () => void;
  onPrev: () => void;
  duration: number;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ track, state, onTogglePlay, onOpenFull, onNext, onPrev }) => {
  const [isShrunk, setIsShrunk] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsShrunk(true);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Re-expand after 1.5s of no scrolling
      const timeout = setTimeout(() => {
        setIsShrunk(false);
      }, 1500);

      setScrollTimeout(timeout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollTimeout]);

  if (!track) return null;

  return (
    <div
      className={`fixed z-[100] transition-all duration-500 ease-out cursor-pointer ${isShrunk
        ? 'bottom-32 right-6 w-14 h-14 rounded-full overflow-hidden shadow-2xl scale-90 border-2 border-primary/20 bg-black'
        : 'bottom-28 md:bottom-12 right-4 left-4 md:left-auto md:w-[450px] rounded-[3rem] scale-100'
        }`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onOpenFull();
      }}
    >
      {isShrunk ? (
        // FLOATING ICON MODE
        <div className="w-full h-full relative group">
          <img src={track.artwork} className="w-full h-full object-cover animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-white">{state === PlaybackState.PLAYING ? 'equalizer' : 'play_arrow'}</span>
          </div>
          {/* Progress ring border effect could go here */}
          <div className={`absolute inset-0 rounded-full border-2 ${state === PlaybackState.PLAYING ? 'border-primary animate-pulse' : 'border-white/20'}`} />
        </div>
      ) : (
        // FULL MINI PLAYER MODE
        <div
          className="group relative flex items-center justify-between p-4 rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] hover:bg-black/60 active:scale-95 transition-all overflow-hidden"
        >
          {/* Living Energy Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex items-center gap-5 relative z-10 overflow-hidden">
            <div className="relative size-16 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:rotate-6 transition-transform duration-500">
              <img
                src={track.artwork}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              {state === PlaybackState.PLAYING && (
                <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-lg font-black italic uppercase tracking-tighter truncate text-white leading-none mb-1.5 group-hover:text-primary transition-colors">{track.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Live</span>
                <p className="text-[11px] font-black text-white/30 uppercase tracking-widest truncate">{track.artist}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 pr-2 relative z-10">
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              className="flex items-center justify-center size-14 rounded-full bg-white text-black hover:scale-110 active:scale-90 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.2)]"
            >
              <span className="material-symbols-outlined !text-[40px] fill-1">
                {state === PlaybackState.PLAYING ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniPlayer;

