
import React from 'react';
import { Notification } from '../types';

interface NotificationCenterProps {
    notifications: Notification[];
    onClose: () => void;
    onClear: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClose, onClear }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300 flex flex-col p-6">
            <header className="flex items-center justify-between mb-10 pt-10">
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Updates</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2">Intelligence Stream</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onClear} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Clear All</button>
                    <button
                        onClick={onClose}
                        className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <span className="material-symbols-outlined text-white">close</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-20">
                {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20">
                        <span className="material-symbols-outlined !text-[120px] text-white">notifications_off</span>
                        <p className="text-sm font-black italic text-white uppercase tracking-[0.2em]">Zero Feed Discovered</p>
                    </div>
                ) : (
                    notifications.sort((a, b) => b.timestamp - a.timestamp).map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-6 rounded-[2rem] border-2 transition-all ${notif.type === 'GYM'
                                    ? 'bg-red-600/10 border-red-600/30 shadow-[0_20px_40px_rgba(220,38,38,0.15)]'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined !text-xl ${notif.type === 'GYM' ? 'text-red-500' : 'text-primary'
                                        }`}>
                                        {notif.type === 'GYM' ? 'bolt' : 'verified'}
                                    </span>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${notif.type === 'GYM' ? 'text-red-500' : 'text-primary'
                                        }`}>
                                        {notif.type} PROTOCOL
                                    </p>
                                </div>
                                <p className="text-[10px] font-black text-white/20 tabular-nums">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-1 leading-tight">{notif.title}</h3>
                            <p className="text-xs font-black italic text-white/40 uppercase tracking-tight leading-relaxed">{notif.message}</p>
                        </div>
                    ))
                )}
            </div>

            <footer className="mt-auto border-t border-white/5 pt-8 pb-4">
                <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                    <p>Last Sync: {new Date().toLocaleTimeString()}</p>
                    <p>System Optimized</p>
                </div>
            </footer>
        </div>
    );
};

export default NotificationCenter;
