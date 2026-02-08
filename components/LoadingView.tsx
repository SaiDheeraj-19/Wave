
import React, { useEffect, useState } from 'react';

const LoadingView: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-onyx-black flex flex-col items-center justify-center overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-black to-black opacity-60" />

            {/* Animated Logo Container */}
            <div className="relative mb-12 animate-in fade-in zoom-in-75 duration-1000">
                <div className="absolute inset-0 bg-primary blur-[100px] opacity-20 animate-pulse" />
                <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase leading-none relative z-10 select-none">
                    WAVE
                </h1>
                <p className="text-[10px] font-black text-primary uppercase tracking-[1em] mt-4 text-center animate-pulse">
                    Initializing Neural Link
                </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-64 h-[2px] bg-white/5 rounded-full relative overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-300 ease-out shadow-[0_0_20px_rgba(127,19,236,0.8)]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Status Messages */}
            <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                    Syncing Frequency: <span className="text-white/40">{progress}%</span>
                </p>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="size-1 rounded-full bg-primary/40 animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
            </div>

            {/* Footer Tag */}
            <div className="absolute bottom-12 text-center">
                <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] animate-pulse">
                    Onyx Systems v2.4.1
                </p>
            </div>
        </div>
    );
};

export default LoadingView;
