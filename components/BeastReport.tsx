
import React from 'react';
import { Track } from '../types';

interface BeastReportProps {
    sessionDuration: string;
    topHypeTrack: Track | null;
    skippedTracksCount: number;
    energyDebtPaid: number;
    onClose: () => void;
}

const BeastReport: React.FC<BeastReportProps> = ({
    sessionDuration,
    topHypeTrack,
    skippedTracksCount,
    energyDebtPaid,
    onClose
}) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-8 animate-in zoom-in duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm space-y-8 text-center">
                <div className="space-y-2">
                    <div className="size-20 bg-red-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.5)]">
                        <span className="material-symbols-outlined !text-4xl text-white fill-1">analytics</span>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">SESSION CLOSED</h1>
                    <p className="text-red-600 font-bold tracking-[0.3em] text-[10px]">BRUTALLY HONEST PERFORMANCE DATA</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Duration */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-1">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Grind</p>
                        <p className="text-3xl font-black italic text-white">{sessionDuration}</p>
                    </div>

                    {/* Hype Track */}
                    {topHypeTrack && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4 text-left">
                            <img src={topHypeTrack.artwork} className="size-16 rounded-2xl object-cover shadow-2xl" alt="" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Top Carry</p>
                                <p className="text-lg font-black italic text-white truncate uppercase tracking-tighter leading-none">{topHypeTrack.title}</p>
                                <p className="text-xs font-bold text-white/40 mt-1 uppercase">{topHypeTrack.artist}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center gap-1">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Weak Skips</p>
                            <p className="text-2xl font-black italic text-red-600">{skippedTracksCount}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center gap-1">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Debt Repaid</p>
                            <p className="text-2xl font-black italic text-blue-500">{energyDebtPaid} units</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-bold text-white/30 italic">"Discipline outlasts motivation."</p>
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-white text-black rounded-[2rem] font-black tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                        RETURN TO HUB
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BeastReport;
