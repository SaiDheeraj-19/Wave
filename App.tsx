
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlaybackState, Track, AppState, ListeningIntent, UserPlaylist } from './types';
import { MOCK_TRACKS } from './constants';
import AudioEngine from './services/AudioEngine';
import Navigation from './components/Navigation';
import MiniPlayer from './components/MiniPlayer';
import HomeView from './components/HomeView';
import LibraryView from './components/LibraryView';
import PlayerView from './components/PlayerView';
import BrowseView from './components/BrowseView';
import SearchView from './components/SearchView';
import GymModeView from './components/GymModeView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import AiDjPresenter from './components/AiDjPresenter';
import BeastReport from './components/BeastReport';
import DjMixer from './components/DjMixer';
import AccountView from './components/AccountView';
import NotificationCenter from './components/NotificationCenter';
import AuthView from './components/AuthView';

const App: React.FC = () => {
  const [showReport, setShowReport] = useState(false);
  const [reportDuration, setReportDuration] = useState("0:00");
  const [uiMorph, setUiMorph] = useState<'morning-morph' | 'night-morph'>('night-morph');
  const [gymSkips, setGymSkips] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isDjVisible, setIsDjVisible] = useState(false);

  const [appState, setAppState] = useState<AppState>({
    activeTab: 'home',
    isGymMode: false,
    currentTrack: null,
    currentLyrics: null,
    playbackState: PlaybackState.IDLE,
    gymSessionStartTime: null,

    // Gym Mode Resume State
    lastNormalTrack: null,
    lastNormalProgress: 0,

    stats: {
      groundTruthMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalGymTime: 0,
      artistListenCounts: {},
      songListenCounts: {},
      topGenres: {}
    },

    currentIntent: 'None',
    antiAlgorithmMode: false,
    moodStabilityWeight: 0.5,
    silenceBetweenSongs: 0,
    lyricsFirstMode: false,

    // NEW FEATURES
    radicalTrustMode: true,
    artistContextMode: false,
    discoveryWindow: {
      enabled: false,
      day: 'Sunday',
      time: '18:00',
      amount: 3
    },
    musicJournal: {},
    tasteEvolution: {
      genres: {},
      tempos: {}
    },

    userRules: [],

    trainingState: 'WARM_UP',
    lockedEnergyMode: false,
    energyDebt: 0,
    prModeActive: false,
    skipShameData: {},

    queue: MOCK_TRACKS,
    history: [],
    recentlyPlayed: [],
    shuffleMode: false,
    repeatMode: 'none',
    crossfadeDuration: 2,
    likedSongs: [],
    userPlaylists: [],
    favorites: [],
    downloads: [],
    eqSettings: {
      enabled: true,
      preset: 'Custom',
      bands: [0, 0, 0, 0, 0] // 60, 230, 910, 3600, 14000
    },
    loudnessNormalization: true,
    monoAudio: false,
    listeningMood: 'Neutral',
    burnoutDetection: true,
    volume: 1,
    progress: 0,
    duration: 0,
    gymSeeds: ['The Weeknd', 'XXXTentacion', 'Phonk', 'Kendrick Lamar', 'NEFFEX', 'Hardstyle'],
    notifications: [],
    audioDevice: 'Unknown',
    currentUser: { email: 'Guest@wave.ai', password: '' }
  });

  const audioEngineRef = useRef<AudioEngine | null>(null);

  // AUTH PERSISTENCE (Disabled for Guest Mode)
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('onyx_active_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const allData = JSON.parse(localStorage.getItem('onyx_user_data') || '{}');
        const userData = allData[user.email];

        setAppState(prev => ({
          ...prev,
          ...userData,
          currentUser: user,
          playbackState: PlaybackState.IDLE
        }));
      }
    } catch (e) {
      console.error("Auth hydration failed", e);
    }
  }, []);

  // AUTO-SAVE PREFERENCES
  useEffect(() => {
    if (appState.currentUser) {
      const timer = setTimeout(() => {
        const allData = JSON.parse(localStorage.getItem('onyx_user_data') || '{}');
        const { playbackState, progress, duration, currentTrack, ...stateToSave } = appState;
        allData[appState.currentUser!.email] = stateToSave;
        localStorage.setItem('onyx_user_data', JSON.stringify(allData));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [appState]);


  const handleLogin = (user: any) => {
    localStorage.setItem('onyx_active_user', JSON.stringify(user));
    const allData = JSON.parse(localStorage.getItem('onyx_user_data') || '{}');
    if (allData[user.email]) {
      setAppState(prev => ({ ...prev, ...allData[user.email], currentUser: user }));
    } else {
      setAppState(prev => ({ ...prev, currentUser: user }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('onyx_active_user');
    setAppState(prev => ({
      ...prev,
      currentUser: { email: 'Guest@wave.ai', password: '' },
      activeTab: 'home',
      currentTrack: null
    }));
  };

  const addNotification = useCallback((title: string, message: string, type: 'INFO' | 'GYM' | 'UPDATE' | 'ALERT' = 'INFO') => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    setAppState(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications].slice(0, 50)
    }));
  }, []);

  useEffect(() => {
    const handleStateChange = (state: PlaybackState) => {
      setAppState(prev => ({ ...prev, playbackState: state }));
    };
    const handleProgress = (time: number) => {
      setAppState(prev => ({ ...prev, progress: time }));
    };
    const handleDuration = (dur: number) => {
      setAppState(prev => ({ ...prev, duration: dur }));
    };

    audioEngineRef.current = new AudioEngine(handleStateChange, handleProgress, handleDuration);

    const hour = new Date().getHours();
    setUiMorph(hour > 5 && hour < 18 ? 'morning-morph' : 'night-morph');
  }, []);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      if (audioEngineRef.current) {
        const energy = (audioEngineRef.current.getEnergy() || 0) / 255;
        document.documentElement.style.setProperty('--audio-energy', energy.toString());
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    const checkAudioOutput = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter(d => d.kind === 'audiooutput');
        const defaultOutput = outputs.find(d => d.deviceId === 'default') || outputs[0];

        if (defaultOutput) {
          const label = defaultOutput.label || 'Headphones/Speaker';
          setAppState(prev => ({ ...prev, audioDevice: label as any }));
          if (label) addNotification("DEVICE SYNCED", `Audio output routed to: ${label}`, "INFO");
        }
      } catch (e) {
        console.warn("Device enumeration failed", e);
      }
    };

    checkAudioOutput();
    if (navigator.mediaDevices) {
      navigator.mediaDevices.ondevicechange = checkAudioOutput;
    }

    return () => cancelAnimationFrame(raf);
  }, [addNotification]);

  const formatSessionTimeSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = useCallback(async (track: Track, newQueue?: Track[]) => {
    if (!audioEngineRef.current) return;

    let finalTrack = { ...track };

    if (!finalTrack.isDownloaded && (!finalTrack.audioUrl || finalTrack.audioUrl.length < 10 || !finalTrack.audioUrl.includes('cf.saavncdn.com'))) {
      try {
        const { getTrackDetails } = await import('./services/SaavnService');
        const details = await getTrackDetails(track.id);

        const sameId = String(details.id) === String(track.id);
        const sameTitle = details.title.toLowerCase().trim() === track.title.toLowerCase().trim();

        if (details && details.audioUrl && (sameId || sameTitle)) {
          finalTrack = { ...finalTrack, ...details };
        } else if (!finalTrack.audioUrl) {
          addNotification("STREAM ERROR", "Audio source unavailable or restricted.", "ALERT");
          return;
        }
      } catch (e) {
        console.error("Fetch failed", e);
        addNotification("NETWORK ERROR", "Failed to retrieve track metadata.", "ALERT");
        return;
      }
    }

    setAppState(prev => {
      const updatedRecent = [finalTrack, ...prev.recentlyPlayed.filter(t => t.id !== finalTrack.id)].slice(0, 20);
      let finalQueue = newQueue || (prev.queue.length > 0 ? prev.queue : [finalTrack]);
      if (!newQueue && !finalQueue.some(t => t.id === finalTrack.id)) {
        finalQueue = [finalTrack, ...finalQueue];
      }

      return {
        ...prev,
        stats: {
          ...prev.stats,
          songListenCounts: {
            ...prev.stats.songListenCounts,
            [finalTrack.title]: (prev.stats.songListenCounts[finalTrack.title] || 0) + 1
          },
          artistListenCounts: {
            ...prev.stats.artistListenCounts,
            [finalTrack.artist]: (prev.stats.artistListenCounts[finalTrack.artist] || 0) + 1
          }
        },
        currentTrack: finalTrack,
        recentlyPlayed: updatedRecent,
        queue: finalQueue,
        currentLyrics: null,
      };
    });

    (async () => {
      try {
        const { getLyrics, getRecommendations } = await import('./services/SaavnService');
        const [lyrics, recommendations] = await Promise.all([
          getLyrics(finalTrack.id),
          getRecommendations(finalTrack.id)
        ]);

        if (lyrics || (recommendations && recommendations.length > 0)) {
          setAppState(prev => {
            if (prev.currentTrack?.id !== finalTrack.id) return prev;
            let updatedQueue = [...prev.queue];
            if (recommendations && recommendations.length > 0 && !prev.antiAlgorithmMode) {
              const related = recommendations.filter(r => !updatedQueue.some(q => q.id === r.id)).slice(0, 10);
              updatedQueue = [...updatedQueue, ...related];
            }
            return {
              ...prev,
              currentLyrics: lyrics || prev.currentLyrics,
              queue: updatedQueue
            };
          });
        }
      } catch (e) {
        console.error("Asset discovery protocol failed", e);
      }
    })();

    setIsDjVisible(false);
    setTimeout(() => setIsDjVisible(true), 1200);

    try {
      await audioEngineRef.current.play(finalTrack, appState.crossfadeDuration, appState.silenceBetweenSongs);
    } catch (err) {
      console.error("Playback execution error", err);
      addNotification("PLAYBACK FAILED", "Stream connection reset or blocked.", "ALERT");
    }
  }, [appState.crossfadeDuration, appState.silenceBetweenSongs, addNotification]);

  const handleNext = useCallback(() => {
    if (appState.queue.length === 0) return;
    const currentIndex = appState.queue.findIndex(t => t.id === appState.currentTrack?.id);
    let nextIndex = 0;
    if (currentIndex !== -1) {
      nextIndex = (currentIndex + 1) % appState.queue.length;
    }
    if (appState.isGymMode) {
      setGymSkips(prev => prev + 1);
    }
    handlePlayTrack(appState.queue[nextIndex]);
  }, [appState.queue, appState.currentTrack, handlePlayTrack, appState.isGymMode]);

  const handlePrev = useCallback(() => {
    if (appState.queue.length === 0) return;
    const currentIndex = appState.queue.findIndex(t => t.id === appState.currentTrack?.id);
    let prevIndex = appState.queue.length - 1;
    if (currentIndex !== -1) {
      prevIndex = (currentIndex - 1 + appState.queue.length) % appState.queue.length;
    }
    handlePlayTrack(appState.queue[prevIndex]);
  }, [appState.queue, appState.currentTrack, handlePlayTrack]);

  const handleTogglePlay = useCallback(() => {
    audioEngineRef.current?.toggle();
  }, []);

  const handleSeek = useCallback((time: number) => {
    audioEngineRef.current?.seek(time);
  }, []);

  const handleToggleGym = useCallback(() => {
    setAppState(prev => {
      const enteringGym = !prev.isGymMode;
      let newStats = { ...prev.stats };
      let newStartTime = prev.gymSessionStartTime;
      let resumeTrack = prev.lastNormalTrack;
      let resumeProgress = prev.lastNormalProgress;
      let currentTrack = prev.currentTrack;

      if (enteringGym) {
        resumeTrack = prev.currentTrack;
        resumeProgress = prev.progress;
        newStartTime = Date.now();
        setGymSkips(0);
        currentTrack = null;
      } else {
        if (prev.gymSessionStartTime) {
          const sessionSeconds = Math.floor((Date.now() - prev.gymSessionStartTime) / 1000);
          newStats.totalGymTime += sessionSeconds;
          setReportDuration(formatSessionTimeSeconds(sessionSeconds));
          setShowReport(true);
        }
        if (resumeTrack) {
          currentTrack = resumeTrack;
        }
      }

      return {
        ...prev,
        isGymMode: enteringGym,
        stats: newStats,
        gymSessionStartTime: newStartTime,
        lastNormalTrack: enteringGym ? resumeTrack : null,
        lastNormalProgress: enteringGym ? resumeProgress : 0,
        currentTrack: currentTrack
      };
    });
  }, []);

  const prevGymModeRef = useRef(false);
  useEffect(() => {
    if (prevGymModeRef.current !== appState.isGymMode) {
      if (appState.isGymMode) {
        if (audioEngineRef.current) audioEngineRef.current.pause();
        const audio = new Audio('https://www.soundjay.com/weapon/sounds/sword-unsheathe-1.mp3');
        audio.volume = 0.6;
        audio.play().catch(e => console.warn("Audio play failed", e));
      } else {
        if (audioEngineRef.current) audioEngineRef.current.pause();
        if (appState.currentTrack) {
          const resumeTrack = appState.currentTrack;
          const resumeProgress = appState.lastNormalProgress;
          setTimeout(() => {
            if (audioEngineRef.current) {
              audioEngineRef.current.play(resumeTrack).then(() => {
                if (resumeProgress > 5) {
                  audioEngineRef.current?.seek(resumeProgress);
                }
              }).catch(e => {
                console.error("Resume playback failed", e);
                setTimeout(() => audioEngineRef.current?.play(resumeTrack), 500);
              });
            }
          }, 500);
        }
      }
      prevGymModeRef.current = appState.isGymMode;
    }
  }, [appState.isGymMode, appState.currentTrack, appState.lastNormalProgress]);

  useEffect(() => {
    if (appState.playbackState === PlaybackState.IDLE && appState.currentTrack) {
      handleNext();
    }
  }, [appState.playbackState, handleNext, appState.currentTrack]);

  useEffect(() => {
    if (appState.isGymMode) {
      addNotification("BEAST MODE ENGAGED", "GYM PROTOCOL ACTIVE.", "GYM");
    }
  }, [appState.isGymMode, addNotification]);

  const handleToggleDownload = useCallback((track: Track) => {
    setAppState(prev => {
      const isDownloaded = prev.downloads.some(t => t.id === track.id);
      let newDownloads = [...prev.downloads];
      if (isDownloaded) {
        newDownloads = newDownloads.filter(t => t.id !== track.id);
      } else {
        newDownloads.push({ ...track, isDownloaded: true });
        setTimeout(() => addNotification("ASSET SECURED", `${track.title} downloaded.`, "INFO"), 0);
      }
      return { ...prev, downloads: newDownloads };
    });
  }, [addNotification]);

  const handleToggleLike = useCallback((track: Track) => {
    setAppState(prev => {
      const isLiked = prev.likedSongs.some(t => t.id === track.id);
      let newLiked = [...prev.likedSongs];
      if (isLiked) {
        newLiked = newLiked.filter(t => t.id !== track.id);
      } else {
        newLiked.push(track);
        setTimeout(() => addNotification("PREFERENCE LOGGED", "Track added to favorites.", "INFO"), 0);
      }
      return { ...prev, likedSongs: newLiked };
    });
  }, [addNotification]);

  const handlePlayNext = useCallback((track: Track) => {
    setAppState(prev => {
      const currentIdx = prev.queue.findIndex(t => t.id === prev.currentTrack?.id);
      let newQueue = [...prev.queue];
      if (currentIdx !== -1) {
        newQueue.splice(currentIdx + 1, 0, track);
      } else {
        newQueue.push(track);
      }
      addNotification("QUEUE UPDATED", `${track.title} set to play next.`, "INFO");
      return { ...prev, queue: newQueue };
    });
  }, [addNotification]);

  const handleClearRecentlyPlayed = useCallback(() => {
    setAppState(prev => ({ ...prev, recentlyPlayed: [] }));
    addNotification("MEMORY WIPED", "History cleared.", "INFO");
  }, [addNotification]);

  const renderView = () => {
    switch (appState.activeTab) {
      case 'home': return (
        <HomeView
          onPlayTrack={handlePlayTrack}
          onPlayNext={handlePlayNext}
          recentlyPlayed={appState.recentlyPlayed}
          onToggleGym={handleToggleGym}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onSearchClick={() => setAppState(prev => ({ ...prev, activeTab: 'search' }))}
          onClearRecentlyPlayed={handleClearRecentlyPlayed}
        />
      );
      case 'browse': return (
        <BrowseView onPlayTrack={handlePlayTrack} onPlayNext={handlePlayNext} onSelectPlaylist={() => { }} />
      );
      case 'search': return <SearchView onPlayTrack={handlePlayTrack} onPlayNext={handlePlayNext} />;
      case 'mixer': return <DjMixer appState={appState} setAppState={setAppState} audioEngine={audioEngineRef.current} />;
      case 'library': return <LibraryView onPlayTrack={handlePlayTrack} onPlayNext={handlePlayNext} appState={appState} />;
      case 'analytics': return <AnalyticsView appState={appState} />;
      case 'settings': return <SettingsView appState={appState} setAppState={setAppState} audioEngine={audioEngineRef.current} />;
      case 'profile': return <AccountView appState={appState} setAppState={setAppState} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen relative bg-onyx-black transition-all duration-[1s] flex flex-col md:flex-row ${uiMorph}`}>
      <div className="fixed inset-0 pointer-events-none breathing-surface opacity-30 bg-gradient-to-b from-primary/10 to-transparent z-0" />

      {/* Sidebar for Laptop - Navigation */}
      <div className="hidden md:flex md:w-64 lg:w-72 xl:w-80 h-screen sticky top-0 flex-col border-r border-white/5 bg-black/40 backdrop-blur-3xl z-30">
        <div className="p-10">
          <div className="flex items-center justify-between mb-10 cursor-pointer group" onClick={() => setAppState(prev => ({ ...prev, activeTab: 'profile' }))}>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none group-hover:text-primary transition-colors">WAVE</h1>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-white">Profile & Identity</p>
            </div>
            <div className="size-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center group-hover:bg-primary transition-colors relative">
              <img
                src="/user_avatar.png"
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
                onError={(e) => (e.currentTarget.style.opacity = '0')}
              />
              <span className="text-white font-black italic relative z-10">{appState.currentUser?.email?.[0].toUpperCase() || 'U'}</span>
            </div>
          </div>


          {/* BEAST MODE TRIGGER - Vampire Theme */}
          <div className="mb-10">
            <button
              onClick={handleToggleGym}
              className="w-full relative h-24 rounded-[2rem] bg-[#0a0000] border-2 border-red-900/40 flex items-center justify-center gap-4 group overflow-hidden shadow-[0_0_50px_rgba(153,27,27,0.2)] hover:shadow-[0_0_80px_rgba(220,38,38,0.6)] transition-all duration-700 hover:scale-[1.02] active:scale-95 hover:border-red-600"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-red-950/20 opacity-60" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <span className="absolute top-1/2 left-1/2 text-2xl animate-bat-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDuration: '3s' }}>🦇</span>
                <span className="absolute top-1/3 left-1/3 text-xl animate-bat-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100" style={{ animationDuration: '4s' }}>🦇</span>
                <span className="absolute top-2/3 left-2/3 text-3xl animate-bat-3 opacity-0 group-hover:opacity-100 transition-opacity delay-200" style={{ animationDuration: '2.5s' }}>🦇</span>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`material-symbols-outlined !text-4xl transition-all duration-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] ${appState.isGymMode ? 'text-white animate-pulse' : 'text-red-700 group-hover:text-red-500'}`}>
                    {appState.isGymMode ? 'bloodtype' : 'nights_stay'}
                  </span>
                </div>

                <span className={`text-xl font-black italic tracking-tighter uppercase leading-none transition-colors duration-300 font-display ${appState.isGymMode ? 'text-white' : 'text-red-800 group-hover:text-red-500'}`}>
                  {appState.isGymMode ? 'FEEDING FRENZY' : 'VAMPIRE MODE'}
                </span>
                <span className="text-[9px] font-bold text-red-900/50 uppercase tracking-[0.3em] group-hover:text-red-500/50 transition-colors mt-1">
                  {appState.isGymMode ? 'DRAIN ENERGY' : 'AWAKEN THIRST'}
                </span>
              </div>
            </button>
          </div>

          <div className="space-y-6">
            {[
              { id: 'home', icon: 'home', label: 'Home' },
              { id: 'browse', icon: 'explore', label: 'Explore' },
              { id: 'search', icon: 'search', label: 'Search' },
              { id: 'mixer', icon: 'equalizer', label: 'Mixer' },
              { id: 'library', icon: 'library_music', label: 'Library' },
              { id: 'settings', icon: 'settings', label: 'Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAppState(prev => ({ ...prev, activeTab: tab.id as any }))}
                className={`flex items-center gap-6 group transition-all duration-500 w-full p-4 rounded-2xl ${appState.activeTab === tab.id ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined !text-[32px] ${appState.activeTab === tab.id ? 'fill-1' : ''}`}>{tab.icon}</span>
                <span className="text-lg font-black uppercase tracking-widest italic">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 relative z-10 animate-in fade-in duration-1000 overflow-x-hidden md:max-w-7xl md:mx-auto w-full">
        {renderView()}
      </main>

      <AiDjPresenter track={appState.currentTrack} isVisible={isDjVisible} />

      {appState.isGymMode && (
        <GymModeView
          appState={appState}
          onPlayTrack={handlePlayTrack}
          onExit={handleToggleGym}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          onOpenFull={() => setIsPlayerOpen(true)}
        />
      )}

      <MiniPlayer
        track={appState.currentTrack}
        state={appState.playbackState}
        duration={appState.duration}
        onTogglePlay={handleTogglePlay}
        onOpenFull={() => setIsPlayerOpen(true)}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      <div className="md:hidden">
        <Navigation
          activeTab={appState.activeTab}
          setActiveTab={(tab) => setAppState(prev => ({ ...prev, activeTab: tab as any }))}
        />
      </div>

      {isPlayerOpen && appState.currentTrack && (
        <PlayerView
          track={appState.currentTrack}
          state={appState.playbackState}
          progress={appState.progress}
          duration={appState.duration}
          queue={appState.queue}
          lyrics={appState.currentLyrics}
          onClose={() => setIsPlayerOpen(false)}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onNext={handleNext}
          onPrev={handlePrev}
          onToggleDownload={handleToggleDownload}
          isDownloaded={appState.downloads.some(t => t.id === appState.currentTrack?.id)}
          onToggleLike={handleToggleLike}
          isLiked={appState.likedSongs.some(t => t.id === appState.currentTrack?.id)}
          lyricsFirstMode={appState.lyricsFirstMode}
        />
      )}

      {showReport && (
        <BeastReport
          sessionDuration={reportDuration}
          topHypeTrack={appState.recentlyPlayed[0] || appState.currentTrack}
          skippedTracksCount={gymSkips}
          energyDebtPaid={Math.floor(appState.energyDebt)}
          onClose={() => setShowReport(false)}
        />
      )}

      {isNotificationOpen && (
        <NotificationCenter
          notifications={appState.notifications}
          onClose={() => setIsNotificationOpen(false)}
          onClear={() => setAppState(prev => ({ ...prev, notifications: [] }))}
        />
      )}
    </div>
  );
};

export default App;
