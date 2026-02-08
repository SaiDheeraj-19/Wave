
import React from 'react';
import { Track } from '../types';

interface HomeViewProps {
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onPlayNext: (track: Track) => void;
  recentlyPlayed: Track[];
  onRecentlyPlayedClick?: (track: Track) => void;
  onToggleGym?: () => void;
  onOpenNotifications?: () => void;
  onSearchClick?: () => void;
  onClearRecentlyPlayed?: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onPlayTrack, onPlayNext, recentlyPlayed, onOpenNotifications, onSearchClick, onClearRecentlyPlayed, onToggleGym }) => {
  const [trending, setTrending] = React.useState<Track[]>([]);
  const [charts, setCharts] = React.useState<any[]>([]);
  const [featured, setFeatured] = React.useState<Track | null>(null);
  const [loadingChartId, setLoadingChartId] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [hero, setHero] = React.useState<Track | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { getHomePageData } = await import('../services/SaavnService');
        const data = await getHomePageData();
        setTrending(data.trending.songs);
        setCharts(data.charts);
        if (data.trending.songs.length > 0) {
          setHero(data.trending.songs[0]);
        }
      } catch (e) {
        console.error("HomeView fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChartClick = async (chart: any) => {
    setLoadingChartId(chart.id);
    try {
      const { getPlaylistDetails } = await import('../services/SaavnService');
      const tracks = await getPlaylistDetails(chart.id);
      if (tracks.length > 0) {
        onPlayTrack(tracks[0], tracks);
      }
    } catch (e) {
      console.error("Failed to load chart", e);
    } finally {
      setLoadingChartId(null);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-40 pt-16 px-6 animate-in fade-in duration-1000 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20 bg-onyx-surface relative flex items-center justify-center">
            <img
              src="/user_avatar.png"
              className="absolute inset-0 w-full h-full object-cover"
              alt="User"
              onError={(e) => (e.currentTarget.style.opacity = '0')}
            />
            <span className="text-white font-black italic text-xs relative z-0">U</span>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">Home</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onSearchClick}
            className="material-symbols-outlined text-white/40 hover:text-white transition-colors cursor-pointer active:scale-90"
          >
            search
          </button>
          <button
            onClick={onOpenNotifications}
            className="material-symbols-outlined text-white/40 hover:text-white transition-colors cursor-pointer active:scale-90 relative"
          >
            notifications
          </button>
        </div>
      </header>

      {/* MOBILE ONLY VAMPIRE MODE TRIGGER */}
      <div className="md:hidden">
        <button
          onClick={onToggleGym}
          className="w-full relative h-[100px] rounded-[2.5rem] bg-[#0a0000] border-2 border-red-900/40 flex items-center justify-center overflow-hidden group active:scale-95 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/60 via-black to-red-950/60 opacity-80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined !text-3xl text-red-600 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">bloodtype</span>
              <span className="text-2xl font-black italic tracking-tighter uppercase text-white font-display">VAMPIRE MODE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-red-900/50" />
              <span className="text-[9px] font-black text-red-600/60 uppercase tracking-[0.4em]">AWAKEN THIRST</span>
              <div className="h-px w-8 bg-red-900/50" />
            </div>
          </div>
        </button>
      </div>

      {/* For You Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">For You</h2>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-colors">See All</button>
        </div>

        {loading ? (
          <div className="relative h-64 rounded-[3rem] bg-white/5 animate-pulse border border-white/10" />
        ) : hero ? (
          <div
            onClick={() => onPlayTrack(hero, trending)}
            className="relative h-64 rounded-[3rem] overflow-hidden group cursor-pointer shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/5 active:scale-[0.98] transition-all"
          >
            <img src={hero.artwork} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div className="flex-1 overflow-hidden pr-4">
                <h3 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none mb-2 truncate">{hero.title}</h3>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none truncate">{hero.artist} • Featured Hub</p>
              </div>
              <div className="size-14 rounded-full bg-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white !text-3xl fill-1">play_arrow</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-64 rounded-[3rem] bg-white/5 flex flex-col items-center justify-center gap-4 border border-dashed border-white/10">
            <span className="material-symbols-outlined !text-4xl text-white/10">music_note</span>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Neural assets pending...</p>
          </div>
        )}
      </section>

      {/* Trending Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Trending Hits</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[160px] max-w-[160px] flex flex-col gap-3">
                <div className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
                <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
              </div>
            ))
          ) : trending.length > 0 ? (
            trending.map((track) => (
              <div key={track.id} className="min-w-[160px] max-w-[160px] group">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 cursor-pointer shadow-xl">
                  <img src={track.artwork} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onClick={() => onPlayTrack(track, trending)} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => onPlayTrack(track, trending)} className="size-10 rounded-full bg-primary flex items-center justify-center hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-white fill-1">play_arrow</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onPlayNext(track); }} className="size-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors" title="Play Next">
                      <span className="material-symbols-outlined text-sm">playlist_play</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm font-black italic text-white truncate uppercase tracking-tighter mb-0.5">{track.title}</p>
                <p className="text-[10px] font-black text-white/30 truncate uppercase tracking-widest">{track.artist}</p>
              </div>
            ))
          ) : (
            <div className="w-full h-40 flex items-center justify-center text-white/10 uppercase font-black text-xs tracking-widest border border-dashed border-white/5 rounded-3xl">
              No trends detected
            </div>
          )}
        </div>
      </section>

      {/* Recently Played Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black italic tracking-[0.4em] text-white/20 uppercase">Recently Played</h2>
          {recentlyPlayed.length > 0 && (
            <button
              onClick={onClearRecentlyPlayed}
              className="text-[9px] font-bold text-red-900/40 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Clear History
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {recentlyPlayed.slice(0, 4).map((track) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track)}
              className="flex items-center gap-3 p-2 bg-onyx-surface/50 rounded-2xl hover:bg-onyx-surface transition-all cursor-pointer group active:scale-95 border border-white/5"
            >
              <img src={track.artwork} className="size-14 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-black italic text-white truncate leading-none mb-1 uppercase tracking-tight">{track.title}</p>
                <p className="text-[10px] font-black text-white/20 uppercase truncate tracking-widest">{track.artist}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onPlayNext(track); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-white transition-opacity"
                title="Play Next"
              >
                <span className="material-symbols-outlined text-lg">playlist_play</span>
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomeView;
