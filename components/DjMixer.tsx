
import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

interface DjMixerProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    audioEngine: any;
}

const DjMixer: React.FC<DjMixerProps> = ({ appState, setAppState, audioEngine }) => {
    const [crossfade, setCrossfade] = useState(appState.crossfadeDuration);
    const [isVibeLocked, setIsVibeLocked] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let raf: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const energy = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--audio-energy') || '0');

            // Draw visualizer bars for mixer
            const bars = 20;
            const spacing = canvas.width / bars;
            ctx.fillStyle = isVibeLocked ? '#ff0000' : '#10b981';

            for (let i = 0; i < bars; i++) {
                const h = (energy * 100) * (Math.sin(Date.now() / 200 + i) * 0.5 + 0.5);
                ctx.fillRect(i * spacing + 2, canvas.height - h, spacing - 4, h);
            }
            raf = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(raf);
    }, [isVibeLocked]);

    const handleCrossfade = (val: number) => {
        setCrossfade(val);
        setAppState(prev => ({ ...prev, crossfadeDuration: val }));
    };

    const handleEqChange = (index: number, val: number) => {
        const newBands = [...appState.eqSettings.bands];
        newBands[index] = val;
        setAppState(prev => ({
            ...prev,
            eqSettings: { ...prev.eqSettings, bands: newBands }
        }));
        audioEngine?.setEQ(newBands);
    };

    const presets = {
        'Flat': [0, 0, 0, 0, 0],
        'Bass Boost': [8, 5, 0, 2, 4],
        'Vocal': [-2, 4, 6, 4, 0],
        'Treble': [-4, 0, 2, 6, 8],
        'Gym': [6, 3, -2, 4, 7]
    };

    const applyPreset = (name: string, bands: number[]) => {
        setAppState(prev => ({
            ...prev,
            eqSettings: { ...prev.eqSettings, preset: name, bands }
        }));
        audioEngine?.setEQ(bands);
    };

    return (
        <div className="flex flex-col gap-8 pb-40 pt-16 px-6 animate-in fade-in zoom-in-95 duration-700">
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full animate-ping ${isVibeLocked ? 'bg-red-600' : 'bg-emerald-400'}`} />
                    <h2 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Vibe Control Protocol</h2>
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">DJ MIXER</h1>
            </header>

            {/* Visual Analyzer Deck */}
            <div className="bg-black border-[3px] border-white/5 rounded-[3rem] h-48 overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                <canvas ref={canvasRef} width={400} height={200} className="w-full h-full opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center group cursor-pointer" onClick={() => setIsVibeLocked(!isVibeLocked)}>
                        <h3 className={`text-5xl font-black italic tracking-tighter uppercase transition-all duration-500 ${isVibeLocked ? 'text-red-600 scale-110' : 'text-white'}`}>
                            {isVibeLocked ? 'LOCKED' : 'FLOWING'}
                        </h3>
                        <p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase mt-2 group-hover:text-primary">Transition Lock</p>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {/* 5-Band Equalizer (60, 230, 910, 3600, 14000) */}
                {/* 5-Band Equalizer (60, 230, 910, 3600, 14000) */}
                <div className="bg-white/5 rounded-[3rem] p-8 border border-white/5 space-y-8 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-primary/20 blur-[100px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none">Sonic Sculpting</h3>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">5-Band Bio-Frequency EQ</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={() => applyPreset('Flat', [0, 0, 0, 0, 0])}
                                className="flex items-center gap-2 text-red-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 active:scale-95"
                            >
                                <span className="material-symbols-outlined !text-[14px]">restart_alt</span>
                                Reset Engines
                            </button>
                        </div>
                    </div>

                    {/* Presets / Modes */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 relative z-10">
                        {[
                            { name: 'Bass Boost', bands: [8, 5, 0, 2, 4] },
                            { name: 'Vocal', bands: [-2, 4, 6, 4, 0] },
                            { name: 'Treble', bands: [-4, 0, 2, 6, 8] },
                            { name: 'Gym', bands: [6, 3, -2, 4, 7] },
                            { name: 'Party', bands: [5, 3, 0, 4, 5] },
                            { name: 'Chill', bands: [0, 0, -2, -4, -6] },
                            { name: 'Focus', bands: [-5, -2, 0, 2, -5] }
                        ].map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => applyPreset(preset.name, preset.bands)}
                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${appState.eqSettings.preset === preset.name
                                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                                        : 'bg-black/40 text-white/40 border-white/10 hover:text-white hover:border-white/30'
                                    }`}
                            >
                                {preset.name} Mode
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between gap-2 h-64 items-end px-4 pb-4 relative z-10 bg-black/20 rounded-[2rem] border border-white/5">
                        {['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz'].map((label, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 h-full w-full py-6 group">
                                <div className="relative flex-1 w-full flex justify-center group-hover:scale-105 transition-transform duration-300">
                                    {/* Track Rail */}
                                    <div className="absolute inset-y-0 w-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="absolute bottom-0 w-full bg-primary/50 blur-sm transition-all duration-100"
                                            style={{ height: `${((appState.eqSettings.bands[i] + 12) / 24) * 100}%` }}
                                        />
                                        <div
                                            className="absolute bottom-0 w-full bg-white transition-all duration-100"
                                            style={{ height: `${((appState.eqSettings.bands[i] + 12) / 24) * 100}%` }}
                                        />
                                    </div>

                                    {/* Invisible Interaction Layer */}
                                    <input
                                        type="range"
                                        min="-12"
                                        max="12"
                                        step="1"
                                        value={appState.eqSettings.bands[i] || 0}
                                        onChange={(e) => handleEqChange(i, parseInt(e.target.value))}
                                        className="absolute inset-0 h-full w-full opacity-0 cursor-ns-resize z-20"
                                        style={{ appearance: 'slider-vertical' }}
                                    />

                                    {/* Thumb Handle */}
                                    <div
                                        className="absolute w-8 h-8 rounded-full border-4 border-white bg-black shadow-[0_0_20px_rgba(255,255,255,0.5)] pointer-events-none transition-all duration-75 flex items-center justify-center z-10"
                                        style={{ bottom: `calc(${((appState.eqSettings.bands[i] + 12) / 24) * 100}% - 16px)` }}
                                    >
                                        <div className="size-2 bg-primary rounded-full animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="text-[12px] font-black text-white block mb-1">{appState.eqSettings.bands[i]}dB</span>
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Crossfade */}
                <div className="bg-white/5 rounded-[3rem] p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black italic text-white tracking-tighter uppercase leading-none">Crossfade Architecture</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Blend Density Over Time</p>
                        </div>
                        <p className="text-3xl font-black italic text-primary">{crossfade}s</p>
                    </div>
                    <div className="relative h-12 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max="12"
                            step="0.5"
                            value={crossfade}
                            onChange={(e) => handleCrossfade(parseFloat(e.target.value))}
                            className="w-full account-slider relative z-10"
                        />
                        <div className="absolute left-0 right-0 h-1 bg-white/5 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Smart Transition Toggles */}
            <div className="grid grid-cols-2 gap-4">
                <button className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-white hover:text-black transition-all group">
                    <span className="material-symbols-outlined !text-4xl group-hover:scale-125 transition-transform">auto_mode</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Auto EQ Mix</span>
                </button>
                <button className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col items-center gap-3 hover:bg-primary hover:text-white transition-all group border-primary/20">
                    <span className="material-symbols-outlined !text-4xl group-hover:rotate-180 transition-transform">sync_alt</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Gapless Sync</span>
                </button>
            </div>

            {/* Manual Deck Controls */}
            <div className="flex flex-col gap-4 border-t border-white/5 pt-10">
                <h3 className="text-center text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Manual Deck Override</h3>
                <div className="flex items-center justify-around">
                    <button className="size-20 rounded-full border-2 border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all active:scale-90">
                        <span className="material-symbols-outlined !text-4xl">replay_10</span>
                    </button>
                    <button className="size-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-all">
                        <span className="material-symbols-outlined !text-5xl fill-1">equalizer</span>
                    </button>
                    <button className="size-20 rounded-full border-2 border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all active:scale-90">
                        <span className="material-symbols-outlined !text-4xl">forward_10</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DjMixer;
