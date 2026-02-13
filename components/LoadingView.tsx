
import React, { useEffect, useState } from 'react';

const LoadingView: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            {/* Spotify-style Centered Logo */}
            <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 mb-8 relative">
                    {/* Pulsing Aura */}
                    <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl animate-pulse" />

                    {/* Logo Icon */}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                    />
                </div>

                {/* Brand Name */}
                <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
                    WAVE
                </h1>

                {/* Subtle Spinner */}
                <div className="mt-8 flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce"></span>
                </div>
            </div>

            {/* Bottom Credit */}
            <div className="absolute bottom-10 flex flex-col items-center gap-1 opacity-40">
                <span className="text-[10px] font-medium tracking-[0.2em] text-white uppercase">
                    Premium Audio Experience
                </span>
                <span className="text-[9px] font-bold text-primary tracking-widest">
                    LOSSLESS DETECTED
                </span>
            </div>
        </div>
    );
};

export default LoadingView;
