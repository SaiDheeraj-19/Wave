
import React from 'react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'browse', icon: 'explore', label: 'Explore' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'library', icon: 'library_music', label: 'Library' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-6 px-4 bg-onyx-black/95 backdrop-blur-3xl border-t border-white/5 shadow-[0_-30px_60px_rgba(0,0,0,0.8)]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-2 transition-all duration-500 relative ${activeTab === tab.id ? 'text-primary' : 'text-white/20 hover:text-white/40'
            }`}
        >
          {activeTab === tab.id && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_5px_15px_rgba(168,85,247,0.8)] animate-in fade-in duration-500" />
          )}
          <span className={`material-symbols-outlined !text-[28px] ${activeTab === tab.id ? 'fill-1' : ''}`}>
            {tab.icon}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest italic">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
