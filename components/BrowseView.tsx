
import React, { useState, useEffect } from 'react';
import { Track } from '../types';

interface BrowseViewProps {
    onPlayTrack: (track: Track, queue?: Track[]) => void;
    onSelectPlaylist: (playlist: any) => void;
}

const CATEGORIES = [
    { id: 'english', title: 'English Hits', query: 'English Top Songs', color: 'from-blue-600 to-indigo-900', icon: 'auto_awesome' },
    { id: 'hindi', title: 'Hindi Hits', query: 'Hindi Top Songs', color: 'from-rose-600 to-pink-900', icon: 'fire_truck' },
    { id: 'telugu', title: 'Telugu Hits', query: 'Telugu Top Songs', color: 'from-emerald-600 to-teal-900', icon: 'eco' },
    { id: 'tamil', title: 'Tamil Hits', query: 'Tamil Top Songs', color: 'from-orange-600 to-yellow-900', icon: 'tsunami' },
    { id: 'phonk', title: 'Aggressive Phonk', query: 'Phonk', color: 'from-violet-600 to-purple-900', icon: 'bolt' },
    { id: 'gym', title: 'Beast Mode', query: 'Gym Workout', color: 'from-red-600 to-black', icon: 'fitness_center' },
    { id: 'lofi', title: 'Late Night Lofi', query: 'Lofi', color: 'from-indigo-900 to-black', icon: 'nightlight' },
];

const BrowseView: React.FC<BrowseViewProps> = ({ onPlayTrack, onSelectPlaylist }) => {
    const [activeCategory, setActiveCategory] = useState<string>('english'); // Fixed: defaulted to 'top' which didn't exist
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlaylists = async () => {
            setLoading(true);
            try {
                const { searchPlaylists } = await import('../services/SaavnService');
                const cat = CATEGORIES.find(c => c.id === activeCategory);
                const query = cat?.query || 'Top';
                const results = await searchPlaylists(query);
                setPlaylists(results);
            } catch (e) {
                console.error("Failed to fetch playlists", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, [activeCategory]);

    const handlePlaylistClick = async (playlist: any) => {
        const playlistId = playlist.id || playlist.listid;
        if (!playlistId) return;

        try {
            const { getPlaylistDetails } = await import('../services/SaavnService');
            const tracks = await getPlaylistDetails(playlistId);
            if (tracks.length > 0) {
                onPlayTrack(tracks[0], tracks);
            }
        } catch (e) {
            console.error("Failed to play playlist", e);
        }
    };

    return (
        <div className="flex flex-col gap-10 pb-40 pt-16 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-y-auto no-scrollbar">
            <header className="flex flex-col gap-1">
                <h2 className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Discovery Engine</h2>
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Browse Hub</h1>
            </header>

            {/* Premium Categories Tabs */}
            <div className="flex overflow-x-auto gap-3 no-scrollbar py-2 -mx-2 px-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black tracking-widest whitespace-nowrap transition-all border-2 ${activeCategory === cat.id
                            ? 'bg-white border-white text-black shadow-[0_15px_40px_rgba(255,255,255,0.2)] scale-105'
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                            }`}
                    >
                        {cat.title.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Feature Zone (Displaying actively selected category context) */}
            {!loading && playlists.length > 0 && (
                <div className={`relative h-52 rounded-[2.5rem] overflow-hidden group cursor-pointer active:scale-[0.98] transition-all bg-gradient-to-br ${CATEGORIES.find(c => c.id === activeCategory)?.color}`}>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                    <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <span className="material-symbols-outlined !text-5xl text-white/20 group-hover:text-white transition-colors">
                                {CATEGORIES.find(c => c.id === activeCategory)?.icon}
                            </span>
                            <div className="px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/20">
                                <p className="text-[8px] font-black text-white uppercase tracking-widest">Master Selected</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black italic text-white tracking-tighter leading-none mb-2 uppercase">
                                {CATEGORIES.find(c => c.id === activeCategory)?.title}
                            </h2>
                            <p className="text-[10px] font-black text-white/60 tracking-widest uppercase">Curated Intensity Protocol</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Playlist Grid with Glassmorphism */}
            <div className="space-y-6">
                <h3 className="text-xs font-black italic tracking-[0.3em] text-white/20 uppercase">Deployment Ready Packs</h3>

                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 4, 5, 6, 7].map(i => (
                            <div key={i} className="aspect-square rounded-[2rem] bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-6">
                        {playlists.map((p: any) => (
                            <div
                                key={p.id}
                                className="group cursor-pointer flex flex-col gap-4 active:scale-95 transition-all"
                                onClick={() => handlePlaylistClick(p)}
                            >
                                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                                    <img
                                        src={p.image.replace('50x50', '500x500').replace('150x150', '500x500')}
                                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700 blur-0 group-hover:blur-[2px] opacity-100 group-hover:opacity-60"
                                        alt={p.title}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
                                        <div className="size-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                                            <span className="material-symbols-outlined !text-4xl fill-1">play_arrow</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-[9px] font-black text-white bg-black/40 backdrop-blur-xl inline-block px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 uppercase tracking-widest leading-none">Initialize</p>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <h3 className="font-black italic text-lg truncate text-white leading-none tracking-tighter uppercase mb-1">{p.title}</h3>
                                    <p className="text-[10px] font-black text-white/30 truncate uppercase tracking-widest">{p.subtitle || 'Verified Stream'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseView;
