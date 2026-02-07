
import React from 'react';
import { AppState } from '../types';

interface AnalyticsViewProps {
    appState: AppState;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ appState }) => {
    return (
        <div className="flex flex-col gap-12 pb-32 pt-16 px-6 animate-in slide-in-from-right duration-700 overflow-y-auto no-scrollbar">
            <header className="flex flex-col gap-1">
                <h2 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase leading-none mb-1">Mirror</h2>
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">TASTE EVOLUTION</h1>
            </header>

            {/* TASTE EVOLUTION: Real Data Integration */}
            <section className="space-y-6">
                <div className="flex flex-col">
                    <h3 className="text-xs font-black italic tracking-[0.2em] text-primary uppercase leading-none mb-1">Human Narrative</h3>
                    <p className="text-lg font-bold text-white/80 leading-tight italic">
                        "{appState.stats.groundTruthMonth} Report: You spent {(appState.stats.totalGymTime / 60).toFixed(0)} minutes in high-intensity protocols."
                    </p>
                </div>

                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-8">
                    {/* Top Artists & Songs */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dominant Frequencies</p>
                        <div className="flex flex-col gap-4">
                            {/* Top Artists */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Top Authors</p>
                                {Object.entries(appState.stats.artistListenCounts)
                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                    .slice(0, 3)
                                    .map(([artist, count], i) => (
                                        <div key={artist} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black italic text-white/20">0{i + 1}</span>
                                                <span className="text-sm font-black italic uppercase text-white">{artist}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-white/40">{count} Plays</span>
                                        </div>
                                    ))}
                                {Object.keys(appState.stats.artistListenCounts).length === 0 && (
                                    <p className="text-[10px] italic text-white/20">No data available yet.</p>
                                )}
                            </div>

                            <div className="h-[1px] bg-white/5 w-full" />

                            {/* Top Songs */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-secondary uppercase tracking-widest">Most Played Tracks</p>
                                {Object.entries(appState.stats.songListenCounts)
                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                    .slice(0, 3)
                                    .map(([song, count], i) => (
                                        <div key={song} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black italic text-white/20">0{i + 1}</span>
                                                <span className="text-sm font-black italic uppercase text-white truncate max-w-[150px]">{song}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-white/40">{count} Loops</span>
                                        </div>
                                    ))}
                                {Object.keys(appState.stats.songListenCounts).length === 0 && (
                                    <p className="text-[10px] italic text-white/20">Start listening to generate patterns.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Activity Heatmap - "Time mattered" */}
            <section className="space-y-4">
                <h3 className="text-xs font-black italic tracking-[0.2em] text-white/40 uppercase">Temporal Density</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5">
                    <div className="grid grid-cols-12 gap-2 h-32 items-end">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-full rounded-full transition-all ${i >= 18 && i <= 21 ? 'bg-primary shadow-[0_0_25px_rgba(255,255,255,0.2)]' : 'bg-white/5'}`}
                                style={{ height: `${15 + Math.random() * 85}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                        <span>00:00</span>
                        <span className="text-white/40">Peak Focus: 20:00</span>
                        <span>23:59</span>
                    </div>
                </div>
            </section>

            {/* Artist Context Integration in Analytics */}
            <section className="space-y-4 pb-10">
                <h3 className="text-xs font-black italic tracking-[0.2em] text-white/40 uppercase">Artistic Proximity</h3>
                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 flex items-center gap-6">
                    <div className="size-16 rounded-[1.2rem] bg-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined !text-3xl text-white">brush</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black italic uppercase text-white/80">Creator Affinity</p>
                        <p className="text-[11px] font-bold text-white/40 leading-relaxed mt-1">
                            You are currently most aligned with <span className="text-white">Conceptual Electronic</span> artists who prioritize era-specific intent.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AnalyticsView;
