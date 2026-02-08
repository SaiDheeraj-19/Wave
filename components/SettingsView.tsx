
import React, { useState } from 'react';
import { AppState } from '../types';

interface SettingsViewProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    audioEngine: any; // AudioEngine instance
}

const EQ_PRESETS = {
    'Flat': [0, 0, 0, 0, 0],
    'Bass Boost': [6, 4, 0, 0, 0],
    'Treble Boost': [0, 0, 0, 4, 6],
    'Vocal': [-2, 0, 4, 2, 0],
    'Electronic': [4, 2, -1, 3, 5]
};

const SettingsView: React.FC<SettingsViewProps> = ({ appState, setAppState, audioEngine }) => {
    const [newArtist, setNewArtist] = useState('');

    const updateEQ = (presetName: string) => {
        const bands = EQ_PRESETS[presetName as keyof typeof EQ_PRESETS];
        setAppState(prev => ({
            ...prev,
            eqSettings: { ...prev.eqSettings, preset: presetName, bands: bands }
        }));
        audioEngine?.setEQ(bands);
    };

    const toggleNormalization = () => {
        const newVal = !appState.loudnessNormalization;
        setAppState(prev => ({ ...prev, loudnessNormalization: newVal }));
        audioEngine?.setNormalization(newVal);
    };

    const addGymSeed = () => {
        if (!newArtist.trim()) return;
        setAppState(prev => ({
            ...prev,
            gymSeeds: [...(prev.gymSeeds || []), newArtist.trim()]
        }));
        setNewArtist('');
    };

    const removeGymSeed = (seed: string) => {
        setAppState(prev => ({
            ...prev,
            gymSeeds: (prev.gymSeeds || []).filter(s => s !== seed)
        }));
    };

    return (
        <div className="flex flex-col gap-8 pb-32 pt-16 px-6 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
            <header>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black italic tracking-tighter mb-1 uppercase">ENGINE HUB</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-emerald-400 text-[10px] font-black tracking-[0.3em] uppercase">Human-State Calibration Active</p>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">•</span>
                        <div className="flex items-center gap-1 text-white/40">
                            <span className="material-symbols-outlined !text-[12px]">
                                {appState.audioDevice === 'Headphones' ? 'headphones' : appState.audioDevice === 'Speaker' ? 'speaker' : 'settings_input_component'}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider">{appState.audioDevice} DETECTED</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TRAINING GEAR CONFIG (NEW: Gym Seeds) */}
            <section className="space-y-4">
                <h3 className="text-red-500 font-black italic tracking-tight text-xs uppercase underline">Training Gear Calibration</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-red-600/20 space-y-6">
                    <div>
                        <p className="text-sm font-black italic uppercase tracking-tight mb-2">Beast Mode Artists</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-4">Add the fuel that powers your PR attempts</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {(appState.gymSeeds || []).map(seed => (
                                <div key={seed} className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full">
                                    <span className="text-[10px] font-black text-white uppercase">{seed}</span>
                                    <button onClick={() => removeGymSeed(seed)} className="material-symbols-outlined !text-sm text-red-500">close</button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newArtist}
                                onChange={(e) => setNewArtist(e.target.value)}
                                placeholder="Enter Artist/Term"
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-black italic tracking-tight text-white placeholder:text-white/20 focus:border-red-600 outline-none transition-all"
                            />
                            <button
                                onClick={addGymSeed}
                                className="px-6 bg-red-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* HUMAN-STATE CONTROLS */}
            <section className="space-y-4">
                <h3 className="text-primary font-black italic tracking-tight text-xs uppercase underline">Vibe & Intent Protocol</h3>

                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 space-y-6">
                    {/* Anti-Algorithm Mode */}
                    <div className="flex items-center justify-between group" onClick={() => setAppState(prev => ({ ...prev, antiAlgorithmMode: !prev.antiAlgorithmMode }))}>
                        <div className="flex flex-col flex-1 cursor-pointer">
                            <p className="font-black italic text-sm uppercase tracking-tight">Anti-Algorithm Mode</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase transition-colors group-hover:text-white/60">Zero new recommendations. Safety repetitions only.</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-all ${appState.antiAlgorithmMode ? 'bg-primary' : 'bg-white/10'}`}>
                            <div className={`size-4 bg-white rounded-full transition-transform ${appState.antiAlgorithmMode ? 'translate-x-6' : 'translate-x-0 opacity-40'}`} />
                        </div>
                    </div>

                    {/* Silence as a Feature */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <p className="text-sm font-black italic uppercase tracking-tight">Silence Duration</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase">Intentional pauses between transitions</p>
                            </div>
                            <p className="text-primary font-black italic">{appState.silenceBetweenSongs}s</p>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={appState.silenceBetweenSongs}
                            onChange={(e) => setAppState(prev => ({ ...prev, silenceBetweenSongs: parseInt(e.target.value) }))}
                            className="w-full account-slider"
                        />
                    </div>

                    {/* Mood Stability weight */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <p className="text-sm font-black italic uppercase tracking-tight">Stability Engine</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase">Weight of emotional trajectory protection</p>
                            </div>
                            <p className="text-primary font-black italic">{Math.round(appState.moodStabilityWeight * 100)}%</p>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={appState.moodStabilityWeight * 100}
                            onChange={(e) => setAppState(prev => ({ ...prev, moodStabilityWeight: parseInt(e.target.value) / 100 }))}
                            className="w-full account-slider"
                        />
                    </div>
                </div>
            </section>

            {/* Audio Engine Config */}
            <section className="space-y-6">
                <h3 className="text-primary font-black italic tracking-tight text-xs uppercase underline">Audio Pipeline</h3>

                {/* EQ Section */}
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">equalizer</span>
                            <p className="font-black italic text-sm uppercase">5-Band Equalizer</p>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {Object.keys(EQ_PRESETS).map(name => (
                            <button
                                key={name}
                                onClick={() => updateEQ(name)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest whitespace-nowrap transition-all border ${appState.eqSettings.preset === name
                                    ? 'bg-primary border-primary text-black'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                    }`}
                            >
                                {name.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Visual & Interactive Bands */}
                    <div className="flex justify-between items-end h-32 pt-4 gap-4">
                        {appState.eqSettings.bands.map((gain, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full">
                                <div className="w-2 bg-white/5 rounded-full h-full relative group/band">
                                    <input
                                        type="range"
                                        min="-10"
                                        max="10"
                                        step="1"
                                        value={gain}
                                        onChange={(e) => {
                                            const newBands = [...appState.eqSettings.bands];
                                            newBands[i] = parseInt(e.target.value);
                                            setAppState(prev => ({
                                                ...prev,
                                                eqSettings: { ...prev.eqSettings, preset: 'Custom', bands: newBands }
                                            }));
                                            audioEngine?.setEQ(newBands);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 [writing-mode:bt-lr] appearance-slider-vertical"
                                        style={{ WebkitAppearance: 'slider-vertical' } as any}
                                    />
                                    <div
                                        className="absolute bottom-0 w-full bg-primary/40 rounded-full transition-all duration-300"
                                        style={{ height: `${50 + (gain * 5)}%` }}
                                    />
                                    <div
                                        className="absolute w-4 h-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] left-1/2 -translate-x-1/2 rounded-full transition-all duration-300 border border-white/20"
                                        style={{ bottom: `calc(${50 + (gain * 5)}% - 2px)` }}
                                    />
                                </div>
                                <span className="text-[7px] font-black text-white/40 italic uppercase tracking-tighter">
                                    {i === 0 ? '60' : i === 1 ? '230' : i === 2 ? '910' : i === 3 ? '3.6k' : '14k'}
                                </span>
                                <span className="text-[8px] font-black text-primary italic">{gain > 0 ? `+${gain}` : gain}dB</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Normalization */}
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={toggleNormalization}>
                    <div className="flex flex-col">
                        <p className="font-black italic text-sm uppercase tracking-tight">Loudness Armor</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase transition-colors">Normalize intensity across streams</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${appState.loudnessNormalization ? 'bg-primary' : 'bg-white/10'}`}>
                        <div className={`size-4 bg-white rounded-full transition-transform ${appState.loudnessNormalization ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </div>
            </section>

            {/* Personal Rules */}
            <section className="space-y-4">
                <h3 className="text-secondary font-black italic tracking-tight text-xs uppercase underline">Personal Logic (User-Written)</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 space-y-4">
                    <div className="space-y-2">
                        {['No repeats within 48h', 'Avoid explicit in morning', 'New music only on Sundays'].map(rule => (
                            <div key={rule} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{rule}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-[2rem] text-[9px] font-black text-white/20 uppercase tracking-widest hover:border-white/20 hover:text-white/40 transition-all">
                        + Define New Logic Rule
                    </button>
                </div>
            </section>

            {/* Storage Dashboard */}
            <section className="space-y-4 pb-12">
                <h3 className="text-white/40 font-black italic tracking-tight text-xs uppercase underline">Library Footprint</h3>
                <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                        <span>Offline Density</span>
                        <span>4.2GB Cache</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[3.2%]" />
                    </div>
                    <button className="w-full py-4 bg-red-600/10 rounded-[2.5rem] text-[10px] font-black tracking-[0.2em] uppercase hover:bg-red-600 hover:text-white transition-all border border-red-600/20 text-red-600">
                        Purge All Local Assets
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SettingsView;
