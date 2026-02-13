
import React from 'react';
import { Track, AppState } from '../types';

interface LibraryViewProps {
  onPlayTrack: (track: Track) => void;
  appState: AppState;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onPlayTrack, appState }) => {
  const [filter, setFilter] = React.useState<'ALL' | 'DOWNLOADED'>('ALL');

  const displayedTracks = filter === 'DOWNLOADED' ? appState.downloads : appState.recentlyPlayed;

  return (
    <div className="flex flex-col gap-10 pb-40 pt-16 px-6 animate-in fade-in duration-1000 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20 bg-onyx-surface">
            <img src="/user_avatar.png" className="w-full h-full object-cover" alt="User" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Library</h1>
        </div>
        <span className="material-symbols-outlined text-white/40 hover:text-white transition-colors cursor-pointer">search</span>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-[1.5rem] border border-white/5">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}
        >
          All Music
        </button>
        <button
          onClick={() => setFilter('DOWNLOADED')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'DOWNLOADED' ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}
        >
          Downloaded
        </button>
      </div>

      {/* Smart Playlists */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-44 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-800 p-8 flex flex-col justify-between group cursor-pointer active:scale-95 transition-all shadow-2xl">
          <span className="material-symbols-outlined !text-[44px] text-white fill-1 drop-shadow-2xl group-hover:scale-110 transition-transform">favorite</span>
          <div>
            <h3 className="text-lg font-black italic text-white tracking-tighter uppercase leading-none mb-1">Liked Songs</h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{appState.likedSongs.length} tracks • Favorites</p>
          </div>
        </div>
        <div
          onClick={() => setFilter('DOWNLOADED')}
          className="h-44 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 p-8 flex flex-col justify-between group cursor-pointer active:scale-95 transition-all shadow-2xl"
        >
          <span className="material-symbols-outlined !text-[44px] text-white fill-1 drop-shadow-2xl group-hover:scale-110 transition-transform">offline_pin</span>
          <div>
            <h3 className="text-lg font-black italic text-white tracking-tighter uppercase leading-none mb-1">Offline Vault</h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{appState.downloads.length} Assets</p>
          </div>
        </div>
      </div>

      {/* Your Collection */}
      <section className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">{filter === 'DOWNLOADED' ? 'Offline Assets' : 'Recent Activity'}</h2>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest">See All</button>
        </div>
        <div className="space-y-2">
          {displayedTracks.length > 0 ? (
            displayedTracks.slice(0, 20).map((track) => (
              <div key={track.id} onClick={() => onPlayTrack(track)} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
                <img src={track.artwork} className="size-16 rounded-2xl object-cover shadow-2xl group-hover:scale-110 transition-all font-bold" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-lg font-black italic text-white truncate leading-none tracking-tighter uppercase mb-1">{track.title}</p>
                  <div className="flex items-center gap-2">
                    {filter === 'DOWNLOADED' && <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Ready</span>}
                    {filter === 'DOWNLOADED' && <div className="size-1 bg-white/20 rounded-full" />}
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest truncate">{track.artist}</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative flex items-center px-1 shadow-lg shadow-primary/20">
                  <div className="size-4 bg-white rounded-full ml-auto" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center gap-4 text-center">
              <span className="material-symbols-outlined text-white/10 !text-6xl">{filter === 'DOWNLOADED' ? 'cloud_off' : 'history'}</span>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-relaxed">
                {filter === 'DOWNLOADED' ? 'Offline Vault Empty. Secure assets from Player.' : 'No recent activity detected.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LibraryView;
