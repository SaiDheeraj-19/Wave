
import React, { useEffect, useState } from 'react';
import { Track } from '../types';
import { getArtistDetails } from '../services/SaavnService';

interface ArtistProfileViewProps {
    artistId: string;
    onClose: () => void;
    onPlayTrack: (track: Track, queue?: Track[]) => void;
    onPlayNext: (track: Track) => void;
}

const ArtistProfileView: React.FC<ArtistProfileViewProps> = ({ artistId, onClose, onPlayTrack, onPlayNext }) => {
    const [data, setData] = useState<{ artist: any, songs: Track[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtist = async () => {
            setLoading(true);
            const artistData = await getArtistDetails(artistId);
            setData(artistData);
            setLoading(false);
        };
        fetchArtist();
    }, [artistId]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-[60] bg-onyx-black flex items-center justify-center">
                <div className="size-12 border-4 border-white/5 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!data || !data.artist) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-onyx-black overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-500 pb-40">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px]">
                <img src={data.artist.image} className="w-full h-full object-cover" alt={data.artist.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx-black via-onyx-black/40 to-transparent" />

                <header className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-10">
                    <button onClick={onClose} className="size-12 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center hover:bg-black/60 transition-colors">
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <div className="px-4 py-2 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/40">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Verified Author</span>
                    </div>
                </header>

                <div className="absolute bottom-10 left-10 right-10">
                    <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-2xl mb-4">
                        {data.artist.name}
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Fans</span>
                            <span className="text-xl font-black italic text-white">{(data.artist.fanCount || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pulse</span>
                            <span className="text-xl font-black italic text-white">Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 space-y-12 mt-8">
                {/* Biography */}
                <section>
                    <h2 className="text-[10px] font-black italic tracking-[0.4em] text-primary uppercase mb-4 border-l-4 border-primary pl-4">Neural Biography</h2>
                    <p className="text-sm font-medium text-white/60 leading-relaxed max-w-2xl line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                        {data.artist.bio}
                    </p>
                </section>

                {/* Top Tracks */}
                <section>
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none">Top Deployments</h2>
                        <button
                            onClick={() => onPlayTrack(data.songs[0], data.songs)}
                            className="flex items-center gap-2 px-6 py-2 bg-primary rounded-full hover:scale-105 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm fill-1">play_arrow</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Execute All</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        {data.songs.map((track, i) => (
                            <div
                                key={track.id}
                                onClick={() => onPlayTrack(track, data.songs)}
                                className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-[2rem] border border-transparent hover:border-white/10 group cursor-pointer transition-all active:scale-[0.98]"
                            >
                                <span className="text-xs font-black text-white/20 w-4">{i + 1}</span>
                                <div className="relative size-14 shrink-0 rounded-2xl overflow-hidden shadow-xl">
                                    <img src={track.artwork} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" alt="" />
                                    <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                        <span className="material-symbols-outlined fill-1">play_arrow</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-lg font-black italic text-white truncate leading-none tracking-tighter uppercase mb-1 group-hover:text-primary transition-colors">{track.title}</p>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest truncate">{track.album || 'Single'}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onPlayNext(track); }}
                                        className="size-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                        title="Deploy Next"
                                    >
                                        <span className="material-symbols-outlined !text-[20px]">playlist_play</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ArtistProfileView;
