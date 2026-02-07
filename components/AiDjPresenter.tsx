
import React, { useState, useEffect } from 'react';
import { Track } from '../types';

interface AiDjPresenterProps {
    track: Track | null;
    isVisible: boolean;
}

const AiDjPresenter: React.FC<AiDjPresenterProps> = ({ track, isVisible }) => {
    const [typedText, setTypedText] = useState('');
    const [show, setShow] = useState(false);

    const introductions = [
        "Switching up the energy. Here's a deep cut from {artist}.",
        "Matching your late-night focus. Let's go with {artist}.",
        "Detected a tempo shift. {artist} coming up next.",
        "Your burnout detection is active. Playing something fresh by {artist}."
    ];

    useEffect(() => {
        if (isVisible && track) {
            setShow(true);
            const template = introductions[Math.floor(Math.random() * introductions.length)];
            const text = template.replace('{artist}', track.artist);

            let i = 0;
            const interval = setInterval(() => {
                setTypedText(text.slice(0, i));
                i++;
                if (i > text.length) clearInterval(interval);
            }, 40);

            const timeout = setTimeout(() => {
                setShow(false);
            }, 5000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        } else {
            setShow(false);
            setTypedText('');
        }
    }, [isVisible, track]);

    if (!show || !track) return null;

    return (
        <div className="fixed top-12 left-6 right-6 z-[100] animate-in slide-in-from-top-10 duration-700">
            <div className="glass-effect border border-primary/20 bg-black/60 p-4 rounded-2xl flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,100,255,0.4)] relative">
                    <span className="material-symbols-outlined text-black font-black">graphic_eq</span>
                    <div className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-black" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black italic text-primary uppercase tracking-widest mb-1">AI DJ NARRATOR</p>
                    <p className="text-xs font-bold text-white/90 leading-tight">
                        {typedText}<span className="animate-pulse">|</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AiDjPresenter;
