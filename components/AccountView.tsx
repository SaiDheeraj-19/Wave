
import React, { useState } from 'react';
import { AppState, ListeningIntent } from '../types';

interface AccountViewProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const INTENTS: ListeningIntent[] = ['Focus', 'Escape', 'Reflect', 'Celebrate', 'Process', 'Kill Time'];

const AccountView: React.FC<AccountViewProps> = ({ appState, setAppState }) => {
    const [journalEntry, setJournalEntry] = useState('');
    const [selectedJournalTrack, setSelectedJournalTrack] = useState<string | null>(null);

    const toggleFeature = (key: keyof AppState) => {
        setAppState(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-col gap-8 pb-32 pt-16 px-6 animate-in fade-in duration-500 overflow-y-auto no-scrollbar h-full">
            <header className="flex items-end justify-between border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none mb-2">My Neural Profile</h1>
                    <p className="text-sm font-black text-white/40 uppercase tracking-widest">
                        {appState.currentUser?.email || 'GUEST USER'} • <span className="text-emerald-500">OPTIMIZED STATE</span>
                    </p>
                </div>
                <div className="size-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl">
                    <span className="text-2xl font-black italic text-white">{appState.currentUser?.email?.[0].toUpperCase() || 'G'}</span>
                </div>
            </header>

            {/* 1. INTENT-BASED LISTENING */}
            <section className="space-y-4">
                <h3 className="text-primary font-black italic tracking-tight text-xs uppercase underline">Current Intent Protocol</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INTENTS.map(intent => (
                        <button
                            key={intent}
                            onClick={() => setAppState(prev => ({ ...prev, currentIntent: intent }))}
                            className={`p-4 rounded-3xl border-2 transition-all active:scale-95 text-left relative overflow-hidden group ${appState.currentIntent === intent
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <span className="relative z-10 text-lg font-black italic uppercase tracking-tighter">{intent}</span>
                            {appState.currentIntent === intent && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* NEXT-GEN FEATURES GRID */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 2. EXPLAINABLE RECOMMENDATIONS */}
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="material-symbols-outlined text-3xl text-blue-400">psychology_alt</span>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${appState.radicalTrustMode ? 'bg-blue-400' : 'bg-white/10'}`} onClick={() => toggleFeature('radicalTrustMode')}>
                                <div className={`size-4 bg-white rounded-full transition-transform ${appState.radicalTrustMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tight mb-1">Radical Trust</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase">Explainable AI Badges on all recommendations.</p>
                    </div>
                </div>

                {/* 4. ANTI-ALGORITHM MODE */}
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="material-symbols-outlined text-3xl text-red-500">shield_lock</span>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${appState.antiAlgorithmMode ? 'bg-red-500' : 'bg-white/10'}`} onClick={() => toggleFeature('antiAlgorithmMode')}>
                                <div className={`size-4 bg-white rounded-full transition-transform ${appState.antiAlgorithmMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tight mb-1">Anti-Algorithm</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase">Block new discoveries. Safe repetitions only.</p>
                    </div>
                </div>

                {/* 12. ARTIST CONTEXT MODE */}
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-colors">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="material-symbols-outlined text-3xl text-purple-400">frame_person</span>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${appState.artistContextMode ? 'bg-purple-400' : 'bg-white/10'}`} onClick={() => toggleFeature('artistContextMode')}>
                                <div className={`size-4 bg-white rounded-full transition-transform ${appState.artistContextMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tight mb-1">Deep Context</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase">Artist lore and backstory injection.</p>
                    </div>
                </div>

                {/* 5. MOOD STABILITY */}
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight mb-1 text-emerald-400">Mood Stability Engine</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase">Prevents abrupt emotional trajectory shifts.</p>
                        </div>
                        <span className="text-2xl font-black italic text-emerald-400">{Math.round(appState.moodStabilityWeight * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        className="w-full accent-emerald-400 bg-white/10 h-2 rounded-full appearance-none cursor-pointer"
                        value={appState.moodStabilityWeight * 100}
                        onChange={(e) => setAppState(prev => ({ ...prev, moodStabilityWeight: parseInt(e.target.value) / 100 }))}
                    />
                </div>
            </section>

            {/* 6. SILENCE & 7. LYRICS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5">
                    <h3 className="text-sm font-black italic uppercase tracking-tight mb-4 text-white/60">Silence Architecture</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-black italic text-white">{appState.silenceBetweenSongs}s</span>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={appState.silenceBetweenSongs}
                            onChange={(e) => setAppState(prev => ({ ...prev, silenceBetweenSongs: parseInt(e.target.value) }))}
                            className="w-1/2 accent-white bg-white/10 h-2 rounded-full appearance-none"
                        />
                    </div>
                    <p className="text-[10px] text-white/30 font-bold uppercase mt-2">Inter-track breathing room</p>
                </div>

                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => toggleFeature('lyricsFirstMode')}
                >
                    <div>
                        <h3 className={`text-xl font-black italic uppercase tracking-tight mb-1 ${appState.lyricsFirstMode ? 'text-primary' : 'text-white'}`}>Lyrics-First</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase">Text primary, Audio secondary.</p>
                    </div>
                    <span className={`material-symbols-outlined !text-4xl ${appState.lyricsFirstMode ? 'text-primary' : 'text-white/20'}`}>lyrics</span>
                </div>
            </section>

            {/* 8. PERSONAL RULES */}
            <section className="space-y-4">
                <h3 className="text-white/40 font-black italic tracking-tight text-xs uppercase underline">Logic Layer (User-Written)</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5">
                    <div className="space-y-2 mb-4">
                        {appState.userRules.length > 0 ? appState.userRules.map((rule, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-2xl border border-white/5">
                                <span className="material-symbols-outlined text-[16px] text-emerald-400">terminal</span>
                                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest font-mono">{rule}</span>
                            </div>
                        )) : (
                            <p className="text-center text-[10px] font-black text-white/20 uppercase py-4">No active logic protocols</p>
                        )}
                        {/* Default Rules for Demo */}
                        {['No repeats within 48h', 'Avoid explicit in morning'].map(rule => (
                            <div key={rule} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 opacity-60">
                                <span className="material-symbols-outlined text-[16px] text-white/40">lock</span>
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{rule}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            const rule = prompt("Enter IF-THEN logic statement:");
                            if (rule) setAppState(prev => ({ ...prev, userRules: [...prev.userRules, rule] }));
                        }}
                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-[2rem] text-[9px] font-black text-white/40 uppercase tracking-widest hover:border-primary hover:text-white transition-all hover:bg-primary/10"
                    >
                        + Define New Protocol
                    </button>
                </div>
            </section>

            {/* 10. PRIVATE JOURNAL */}
            <section className="space-y-4">
                <h3 className="text-white/40 font-black italic tracking-tight text-xs uppercase underline">Neural Journal</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
                        {Object.keys(appState.musicJournal).length} Entries Encrypted
                    </p>
                    <textarea
                        className="w-full bg-black/20 rounded-2xl p-4 text-xs font-mono text-white/80 placeholder:text-white/20 outline-none border border-white/5 focus:border-white/20 h-32 resize-none"
                        placeholder="Log thought for current track..."
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            if (appState.currentTrack && journalEntry) {
                                setAppState(prev => ({
                                    ...prev,
                                    musicJournal: { ...prev.musicJournal, [appState.currentTrack!.id]: journalEntry }
                                }));
                                setJournalEntry('');
                                alert("Encrypted to Neural Journal");
                            } else {
                                alert("Play a track to log entry.");
                            }
                        }}
                        className="mt-4 w-full py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white text-white hover:text-black transition-all"
                    >
                        Commit Entry
                    </button>
                </div>
            </section>

            {/* 3. TIME-AWARE MEMORY (Visual Only) */}
            <section className="space-y-4">
                <h3 className="text-white/40 font-black italic tracking-tight text-xs uppercase underline">Temporal Memory</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                    {['2AM Reflex', 'Exam Month', 'Monsoon Season'].map(mem => (
                        <div key={mem} className="min-w-[140px] h-32 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent p-4 flex flex-col justify-end border border-white/5 cursor-pointer hover:border-white/20">
                            <span className="material-symbols-outlined text-white/40 mb-auto">history</span>
                            <p className="text-xs font-black italic text-white uppercase leading-none">{mem}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 9. TASTE EVOLUTION (Visual Only) */}
            <section className="space-y-4">
                <h3 className="text-white/40 font-black italic tracking-tight text-xs uppercase underline">Taste Evolution</h3>
                <div className="h-40 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-end justify-between px-8 pb-8 pt-20 relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
                    {[30, 45, 35, 60, 55, 80, 70, 90].map((h, i) => (
                        <div key={i} className="w-1/12 bg-white/20 rounded-t-lg hover:bg-primary transition-colors cursor-pointer" style={{ height: `${h}%` }} title={`Month ${i + 1}`} />
                    ))}
                </div>
            </section>

            {/* 11. CONTROLLED DISCOVERY WINDOW */}
            <section className="space-y-4">
                <h3 className="text-white/40 font-black italic tracking-tight text-xs uppercase underline">Controlled Discovery</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black italic text-white uppercase">Discovery Window</h3>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${appState.discoveryWindow.enabled ? 'bg-primary' : 'bg-white/10'}`} onClick={() => setAppState(prev => ({ ...prev, discoveryWindow: { ...prev.discoveryWindow, enabled: !prev.discoveryWindow.enabled } }))}>
                            <div className={`size-4 bg-white rounded-full transition-transform ${appState.discoveryWindow.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {appState.discoveryWindow.enabled && (
                        <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-white/40">Day</label>
                                <select
                                    value={appState.discoveryWindow.day}
                                    onChange={(e) => setAppState(prev => ({ ...prev, discoveryWindow: { ...prev.discoveryWindow, day: e.target.value } }))}
                                    className="w-full bg-black/20 rounded-xl p-2 text-xs font-bold text-white border border-white/5 outline-none"
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-white/40">Time</label>
                                <input
                                    type="time"
                                    value={appState.discoveryWindow.time}
                                    onChange={(e) => setAppState(prev => ({ ...prev, discoveryWindow: { ...prev.discoveryWindow, time: e.target.value } }))}
                                    className="w-full bg-black/20 rounded-xl p-2 text-xs font-bold text-white border border-white/5 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-white/40">Amount</label>
                                <select
                                    value={appState.discoveryWindow.amount}
                                    onChange={(e) => setAppState(prev => ({ ...prev, discoveryWindow: { ...prev.discoveryWindow, amount: parseInt(e.target.value) } }))}
                                    className="w-full bg-black/20 rounded-xl p-2 text-xs font-bold text-white border border-white/5 outline-none"
                                >
                                    {[3, 5, 10, 20].map(n => <option key={n} value={n}>{n} Tracks</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
};

export default AccountView;
