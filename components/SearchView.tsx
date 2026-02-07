
import React from 'react';
import { Track } from '../types';

interface SearchViewProps {
    onPlayTrack: (track: Track, queue?: Track[]) => void;
    onPlayNext: (track: Track) => void;
}



const SearchView: React.FC<SearchViewProps> = ({ onPlayTrack, onPlayNext }) => {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);
    const [debouncedQuery, setDebouncedQuery] = React.useState('');

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 400);
        return () => clearTimeout(timer);
    }, [query]);

    React.useEffect(() => {
        if (!debouncedQuery) {
            setResults(null);
            return;
        }

        const performSearch = async () => {
            setLoading(true);
            try {
                const { searchAll } = await import('../services/SaavnService');
                const data = await searchAll(debouncedQuery);
                setResults(data);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        };
        performSearch();
    }, [debouncedQuery]);

    const handleTrackSelect = async (track: Track) => {
        // Use current results.songs as the queue for search results
        const queue = results?.songs || [track];
        onPlayTrack(track, queue);
    };

    return (
        <div className="flex flex-col gap-8 pb-40 pt-16 animate-in fade-in duration-700 overflow-y-auto no-scrollbar">
            <header className="px-6 sticky top-0 z-30 bg-onyx-black/80 backdrop-blur-3xl py-6 border-b border-white/5 mx-2 rounded-[2rem]">
                <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Intelligence Matrix</h2>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Find Audio</h1>
                </div>

                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-all group-focus-within:scale-125">search</span>
                    <input
                        type="text"
                        placeholder="Search IDs, Artists, or Frequency"
                        className="w-full bg-white/5 border-2 border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-black italic tracking-tight focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 text-white uppercase"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {loading && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <div className="size-5 border-[3px] border-white/5 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </header>

            <main className="px-6 space-y-10">
                {query && results && (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-12 pb-20">
                        {/* Top Result Profile */}
                        {results.topResult && (
                            <section>
                                <h2 className="text-[10px] font-black italic tracking-[0.3em] text-primary uppercase mb-6 border-l-4 border-primary pl-4">Target Identified</h2>
                                <div
                                    onClick={() => handleTrackSelect(results.topResult)}
                                    className="bg-white/5 p-8 rounded-[3rem] border border-white/10 flex flex-col items-center text-center group cursor-pointer active:scale-[0.98] transition-all hover:bg-white/10 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative size-48 md:size-56 mb-6">
                                        <img src={results.topResult.artwork} className="w-full h-full rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
                                            <div className="size-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                                                <span className="material-symbols-outlined !text-4xl fill-1">play_arrow</span>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black italic text-white leading-none tracking-tighter uppercase mb-2 group-hover:text-primary transition-colors">{results.topResult.title}</h3>
                                    <p className="text-xs font-black text-white/40 tracking-[0.2em] uppercase mb-6">{results.topResult.artist}</p>
                                    <div className="px-6 py-2 bg-primary text-black rounded-full">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Master Song</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Song Stream */}
                        {results.songs && results.songs.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                                    <h2 className="text-xl font-black italic text-white tracking-tighter uppercase leading-none">Relevant Audio</h2>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{results.songs.length} Nodes</p>
                                </div>
                                <div className="space-y-4">
                                    {results.songs.map((t: Track) => (
                                        <div
                                            key={t.id}
                                            onClick={() => handleTrackSelect(t)}
                                            className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-[2rem] border border-transparent hover:border-white/10 group cursor-pointer transition-all active:scale-[0.98]"
                                        >
                                            <div className="relative size-16 shrink-0 rounded-2xl overflow-hidden shadow-xl">
                                                <img src={t.artwork} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 font-bold" />
                                                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="material-symbols-outlined text-white fill-1">play_arrow</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-lg font-black italic text-white truncate leading-none tracking-tighter uppercase mb-1 group-hover:text-primary transition-colors">{t.title}</p>
                                                <p className="text-[11px] font-black text-white/30 uppercase tracking-widest truncate">{t.artist}</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onPlayNext(t); }}
                                                className="size-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all hover:scale-110"
                                                title="Play Next"
                                            >
                                                <span className="material-symbols-outlined text-white/20 group-hover:text-black !text-[20px]">playlist_play</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Collections */}
                        {results.albums && results.albums.length > 0 && (
                            <section className="pb-10">
                                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                                    <h2 className="text-xl font-black italic text-white tracking-tighter uppercase leading-none">Album Artifacts</h2>
                                </div>
                                <div className="flex overflow-x-auto gap-6 no-scrollbar -mx-2 px-2">
                                    {results.albums.map((al: any) => (
                                        <div key={al.id} className="min-w-[180px] group cursor-pointer transition-all active:scale-95">
                                            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl mb-4 border-2 border-white/5 group-hover:border-white/20 transition-all group-hover:scale-105 duration-700">
                                                <img src={al.image} className="w-full h-full object-cover" />
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                                            </div>
                                            <p className="text-lg font-black italic text-white/90 leading-none truncate uppercase tracking-tighter mb-1">{al.title}</p>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest truncate">{al.artist}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchView;
