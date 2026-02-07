
import React from 'react';
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
  if (!track) return null;

  return (
    <div className="fixed bottom-32 md:bottom-12 right-6 left-6 md:left-auto md:w-[450px] z-50 animate-in slide-in-from-right duration-1000">
      <div
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onOpenFull();
        }}
        className="group relative flex items-center justify-between p-4 rounded-[3rem] bg-black/40 backdrop-blur-3xl border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] cursor-pointer hover:bg-black/60 active:scale-95 transition-all overflow-hidden"
      >
        {/* Living Energy Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Animated Spectrum Overlay (Conceptual) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex gap-1 items-end px-12 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`bg-primary w-full transition-all duration-300 ${state === PlaybackState.PLAYING ? 'animate-bounce' : 'h-0'}`}
              style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>

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
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="text-white/20 hover:text-white transition-colors active:scale-90">
            <span className="material-symbols-outlined !text-[24px]">skip_previous</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
            className="flex items-center justify-center size-14 rounded-full bg-white text-black hover:scale-110 active:scale-90 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.2)]"
          >
            <span className="material-symbols-outlined !text-[40px] fill-1">
              {state === PlaybackState.PLAYING ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="text-white/20 hover:text-white transition-colors active:scale-90">
            <span className="material-symbols-outlined !text-[24px]">skip_next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
