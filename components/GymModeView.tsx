
import React, { useState, useEffect } from 'react';
import { Track, AppState, PlaybackState } from '../types';

interface GymModeViewProps {
    appState: AppState;
    onPlayTrack: (track: Track, newQueue?: Track[]) => void;
    onExit: () => void;
    onTogglePlay?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onOpenFull?: () => void;
}

const DigitalClockIST: React.FC = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const istTime = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
            setTime(istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-red-600 tracking-[0.3em] uppercase mb-1 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)] animate-pulse">BLOOD TIME</p>
            <p className="text-xl font-black italic text-white tracking-tighter tabular-nums drop-shadow-lg">{time}</p>
        </div>
    );
};

const GymModeView: React.FC<GymModeViewProps> = ({ appState, onPlayTrack, onExit, onTogglePlay, onNext, onPrev, onOpenFull }) => {
    const [loading, setLoading] = useState(true);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [aiTracks, setAiTracks] = useState<Track[]>([]);
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Coven / Sharing State
    const [covenRole, setCovenRole] = useState<'NONE' | 'HOST' | 'GUEST'>('NONE');
    const [covenCode, setCovenCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [peers, setPeers] = useState(0);

    const seeds = appState.gymSeeds || [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[new Date().getDay()];

    const dayPlaylists: Record<string, string> = {
        'Monday': 'Pure Aggression',
        'Tuesday': 'Vein Pump',
        'Wednesday': 'Leg Demolition',
        'Thursday': 'Shoulder Necrosis',
        'Friday': 'Armory Ritual',
        'Saturday': 'Chaos Theory',
        'Sunday': 'Active Resurrection'
    };

    // COVEN SYNC LOGIC (Simulation via LocalStorage for Democracy)
    useEffect(() => {
        if (covenRole === 'HOST' && appState.currentTrack) {
            // Broadcast state
            const payload = {
                code: covenCode,
                track: appState.currentTrack,
                timestamp: Date.now()
            };
            localStorage.setItem(`onyx_coven_${covenCode}`, JSON.stringify(payload));
        }
    }, [covenRole, appState.currentTrack, covenCode]);

    useEffect(() => {
        if (covenRole === 'GUEST') {
            const checkSync = () => {
                const data = localStorage.getItem(`onyx_coven_${joinCode}`);
                if (data) {
                    const parsed = JSON.parse(data);
                    // If track is different, sync
                    if (parsed.track.id !== appState.currentTrack?.id) {
                        onPlayTrack(parsed.track);
                    }
                }
            };
            const interval = setInterval(checkSync, 1000);
            return () => clearInterval(interval);
        }
    }, [covenRole, joinCode, appState.currentTrack, onPlayTrack]);

    const startHost = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setCovenCode(code);
        setCovenRole('HOST');
        setPeers(1);
    };

    const joinCoven = () => {
        if (joinCode.length !== 4) return;
        setCovenRole('GUEST');
        setPeers(2);
    };


    useEffect(() => {
        const fetchGymMusic = async () => {
            setLoading(true);
            try {
                const { searchSongs } = await import('../services/SaavnService');
                const dayQuery = dayPlaylists[currentDay] || 'Dark Phonk';
                const allQueries = [...seeds, dayQuery, 'Dark Trap', 'Horrorcore'];

                const results = await Promise.all(
                    allQueries.map(query => searchSongs(query, 60))
                );

                const seenId = new Set();
                const allTracks = results.flat().filter(t => {
                    if (seenId.has(t.id)) return false;
                    const isEnglish = (t.language || '').toLowerCase().includes('english') || (t.language || '') === '';
                    if (!isEnglish) return false;
                    seenId.add(t.id);
                    return true;
                }).map(t => {
                    const isPhonk = t.title.toLowerCase().includes('phonk') || t.artist.toLowerCase().includes('phonk');

                    return {
                        ...t,
                        energyScore: 'WORKOUT_SAFE',
                        bpm: isPhonk ? 140 + Math.floor(Math.random() * 40) : 120 + Math.floor(Math.random() * 60)
                    };
                }).sort(() => Math.random() - 0.5);

                setTracks(allTracks);
                const aiSelection = [...allTracks].slice(0, 30);
                setAiTracks(aiSelection);
            } catch (e) {
                console.error("Failed to load gym music", e);
            } finally {
                setTimeout(() => setLoading(false), 2000);
            }
        };
        fetchGymMusic();
    }, [seeds.join(','), currentDay]);

    const filteredTracks = tracks.filter(t => {
        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matches = t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.album.toLowerCase().includes(q);
            if (!matches) return false;
        }

        if (activeTab === 'ALL') return true;
        if (activeTab === 'AI') return aiTracks.some(at => at.id === t.id);
        if (activeTab === 'PHONK') return t.title.toLowerCase().includes('phonk') || t.artist.toLowerCase().includes('phonk');

        const search = activeTab.toLowerCase();
        return t.artist.toLowerCase().includes(search) || t.title.toLowerCase().includes(search);
    });

    const handleSelectTrack = (track: Track) => {
        if (covenRole === 'GUEST') {
            alert("🩸 GUEST MODE: Only the Vampire Lord (Host) can choose the ritual music.");
            return;
        }
        onPlayTrack(track, filteredTracks);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-black to-red-950/80 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center gap-12 text-center">
                    <div className="relative">
                        <div className="size-32 border-[6px] border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(220,38,38,0.8)]" />
                        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center !text-5xl text-red-600 fill-1 animate-ping">bloodtype</span>
                    </div>
                    <div>
                        <h1 className="text-7xl font-black italic tracking-tighter text-red-600 mb-2 uppercase animate-glitch font-display drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">Vampire Mode</h1>
                        <p className="text-red-500 font-black tracking-[0.8em] text-xs animate-pulse">RITUAL COMMENCING...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[90] bg-[#050000] flex flex-col animate-in fade-in duration-700 overflow-hidden selection:bg-red-900 selection:text-white">

            {/* Ambient Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 mix-blend-overlay" />
                <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-red-900/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-red-900/20 to-transparent" />

                {/* Floating Dust/Ash - CSS Animations */}
                <div className="absolute inset-0 overflow-hidden opacity-50">
                    <div className="absolute top-[10%] left-[10%] text-sm opacity-20 animate-spin transition-all duration-[10s]">🌑</div>
                </div>
            </div>

            {/* Header */}
            <header className="relative z-20 p-6 pt-12 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-red-900/30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onExit}
                        className="size-12 rounded-full border border-red-900/30 bg-black/50 flex items-center justify-center hover:bg-red-900/20 hover:border-red-600 transition-all active:scale-90 group"
                    >
                        <span className="material-symbols-outlined text-red-700 group-hover:text-white transition-colors">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic text-white tracking-tighter leading-none uppercase drop-shadow-[0_0_10px_rgba(255,0,0,0.4)]">Vampire's Lair</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="size-2 bg-red-600 rounded-full animate-bounce shadow-[0_0_10px_red]" />
                            <p className="text-[10px] font-black text-red-600 tracking-[0.2em] uppercase">{currentDay} RITUAL</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {covenRole !== 'NONE' && (
                        <div className="hidden md:flex flex-col items-end">
                            <p className="text-[10px] font-black text-emerald-500 tracking-[0.3em] uppercase mb-1 animate-pulse">COVEN LINKED</p>
                            <p className="text-white font-bold text-xs uppercase tracking-widest">{peers} SOUL{peers !== 1 ? 'S' : ''} CONNECTED</p>
                        </div>
                    )}
                    <DigitalClockIST />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-12 no-scrollbar relative z-10 pb-60">

                {/* DYNAMIC SEARCH BAR */}
                <section className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-red-600/50 group-focus-within:text-red-600 transition-colors">search</span>
                    </div>
                    <input
                        type="text"
                        placeholder="HUNT PREY..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-16 pl-16 pr-6 bg-black border-2 border-red-900/50 focus:border-red-600 rounded-3xl text-sm font-black italic uppercase tracking-widest text-red-500 placeholder:text-red-900/50 outline-none transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
                    />
                </section>

                {/* DAILY OBJECTIVE CARD */}
                <section className="relative px-8 py-10 rounded-[3rem] bg-[#0f0000] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.4)] border-2 border-red-900/50 group active:scale-[0.98] transition-all cursor-pointer animate-blood-pulse">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 mix-blend-overlay" />
                    <div className="absolute top-0 right-0 p-8 opacity-20 animate-pulse">
                        <span className="material-symbols-outlined !text-[120px] text-red-600">skull</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-black italic text-red-500 uppercase tracking-[0.4em] mb-4 drop-shadow-[0_0_5px_red]">Blood Pact Protocol</p>
                        <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-tight mb-2 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-glitch">
                            {dayPlaylists[currentDay]}
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-600/30 rounded-full">
                                <span className="material-symbols-outlined !text-xs text-red-500">hourglass_bottom</span>
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">ETERNAL DURATION</span>
                            </div>
                            <p className="text-[10px] font-black text-red-900/60 uppercase tracking-widest">Summoned {tracks.length} Demons</p>
                        </div>
                    </div>
                </section>

                {/* COVEN CONNECT SECTION */}
                <section className="relative overflow-hidden rounded-[2.5rem] bg-black border border-red-900/30 shadow-[0_0_60px_rgba(153,27,27,0.15)] group transition-all hover:border-red-600/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-transparent to-red-950/40 pointer-events-none" />
                    <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-8">

                        {/* Intro Text */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="material-symbols-outlined text-red-600 animate-pulse text-3xl">diversity_3</span>
                                <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase">Coven Connect</h2>
                            </div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest max-w-sm">Share the ritual. Sync your audio stream with other vampires in the network.</p>
                        </div>

                        {/* Action Area */}
                        <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-4 justify-end items-center">
                            {covenRole === 'NONE' ? (
                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                                    <button
                                        onClick={startHost}
                                        className="h-14 px-8 rounded-2xl bg-red-700 hover:bg-red-600 text-white font-black italic uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.4)] w-full md:w-auto"
                                    >
                                        Host Ritual
                                    </button>

                                    <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                                    <div className="w-full h-[1px] bg-white/10 md:hidden" />

                                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 focus-within:border-red-600/50 transition-colors w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="ENTER CODE"
                                            maxLength={4}
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value)}
                                            className="w-full md:w-32 bg-transparent text-center text-white font-black italic placeholder:text-white/20 outline-none uppercase tracking-widest"
                                        />
                                        <button
                                            onClick={joinCoven}
                                            className="size-10 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={joinCode.length !== 4}
                                        >
                                            <span className="material-symbols-outlined text-lg">link</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-6 bg-red-900/20 px-8 py-4 rounded-2xl border border-red-500/30 w-full md:w-auto justify-center md:justify-end">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">{covenRole === 'HOST' ? 'RITUAL CODE' : 'CONNECTED TO'}</p>
                                        <p className="text-4xl font-black text-white tracking-[0.2em] animate-pulse tabular-nums drop-shadow-[0_0_10px_red]">{covenRole === 'HOST' ? covenCode : joinCode}</p>
                                    </div>
                                    <button
                                        onClick={() => { setCovenRole('NONE'); setCovenCode(''); setJoinCode(''); }}
                                        className="size-10 rounded-full bg-red-950 hover:bg-red-600 text-white/50 hover:text-white flex items-center justify-center transition-colors border border-red-900"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* TRACK LISTING */}
                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-red-900/30 pb-4 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter uppercase leading-none drop-shadow-md mb-2">
                                {dayPlaylists[currentDay]}
                            </h2>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Selected By The Void</p>
                        </div>
                        <div className="flex gap-2 bg-black/50 p-1 rounded-xl border border-white/5">
                            {['ALL', 'PHONK', 'AI'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-transparent text-white/40 hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {appState.currentTrack && covenRole === 'HOST' && (
                            <div className="md:col-span-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-900 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-white text-3xl">podcasts</span>
                                    <div>
                                        <p className="text-white font-black italic uppercase text-lg">Broadcasting Ritual</p>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Syncing {appState.currentTrack.title}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredTracks.map((t) => (
                            <div
                                key={t.id}
                                onClick={() => handleSelectTrack(t)}
                                className="group relative bg-[#0a0a0a] border border-white/5 hover:border-red-600/50 rounded-3xl p-4 flex items-center gap-4 cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.2)] hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative size-16 shrink-0 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-red-900/40 transition-shadow">
                                    <img src={t.artwork} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-2xl">play_arrow</span>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 relative z-10">
                                    <h4 className="text-white font-black italic uppercase tracking-tighter truncate text-sm mb-1 group-hover:text-red-500 transition-colors">{t.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest truncate">{t.artist}</p>
                                        {t.title.toLowerCase().includes('phonk') && <span className="text-[8px] font-black bg-white/10 px-1 rounded text-white/60">PHONK</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* VAMPIRE PLAYER DOCK */}
            {appState.currentTrack && (
                <div className="absolute bottom-6 left-4 right-4 md:left-10 md:right-10 z-[100] animate-in slide-in-from-bottom duration-700">
                    <div className="bg-[#0f0000] backdrop-blur-3xl rounded-[3rem] p-4 pr-8 border-2 border-red-900/50 shadow-[0_0_80px_rgba(220,38,38,0.6)] flex items-center justify-between gap-6 relative overflow-hidden group">

                        {/* Blood Drip overlay */}
                        <div className="absolute top-0 right-10 w-4 h-12 bg-red-600/80 rounded-b-full blur-[2px] animate-pulse" />
                        <div className="absolute top-0 left-20 w-2 h-8 bg-red-800/80 rounded-b-full blur-[1px]" />

                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
                            <div className="h-full bg-red-600 relative transition-all duration-1000 ease-linear shadow-[0_0_20px_red]" style={{ width: `${(appState.progress / appState.duration) * 100}%` }}>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-red-500 rounded-full shadow-[0_0_10px_red]" />
                            </div>
                        </div>

                        <div className="flex items-center gap-5 relative z-10 min-w-0">
                            <div
                                className="size-16 rounded-2xl overflow-hidden border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)] shrink-0 animate-pulse"
                            >
                                <img src={appState.currentTrack.artwork} className="w-full h-full object-cover grayscale contrast-125 sepia hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl font-black italic text-red-500 uppercase tracking-tighter truncate leading-none mb-1 animate-glitch drop-shadow-md">{appState.currentTrack.title}</p>
                                <p className="text-[10px] font-bold text-red-900 uppercase tracking-widest truncate">NOW DEVOURING</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <button onClick={onPrev} className="text-red-900 hover:text-red-500 transition-colors active:scale-90"><span className="material-symbols-outlined !text-4xl">skip_previous</span></button>
                            <button
                                onClick={onTogglePlay}
                                className="size-16 rounded-full bg-red-950 text-red-500 flex items-center justify-center hover:bg-red-900/80 hover:text-white transition-all hover:scale-110 shadow-[0_0_40px_rgba(220,38,38,0.5)] active:scale-95 border-2 border-red-600"
                            >
                                <span className="material-symbols-outlined !text-4xl fill-1">{appState.playbackState === PlaybackState.PLAYING ? 'pause' : 'play_arrow'}</span>
                            </button>
                            <button onClick={onNext} className="text-red-900 hover:text-red-500 transition-colors active:scale-90"><span className="material-symbols-outlined !text-4xl">skip_next</span></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymModeView;
