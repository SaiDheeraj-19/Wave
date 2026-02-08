
import { PlaybackState, Track } from '../types';

/**
 * HUMAN-STATE AUDIO ENGINE (v3.5)
 * Features:
 * - Web Audio API Pipeline (Source -> EQ -> Normalization -> Analyzer -> Destination)
 * - Silence as a Feature (Intentional pauses between tracks)
 * - Mood Stability Engine (Soft volume ramps and continuity protection)
 * - Real-time Analyzer (Exposed for reactive UI animations)
 */
class AudioEngine {
  private ctx: AudioContext;
  private audioA: HTMLAudioElement;
  private audioB: HTMLAudioElement;
  private sourceA: MediaElementAudioSourceNode;
  private sourceB: MediaElementAudioSourceNode;
  private gainA: GainNode;
  private gainB: GainNode;
  private silentKeeper: HTMLAudioElement | null = null;
  private wakeLock: any = null;

  // Analysis
  private analyzer: AnalyserNode;
  private freqData: Uint8Array;

  // EQ Nodes
  private eqBands: BiquadFilterNode[] = [];
  private normalizer: DynamicsCompressorNode;

  private onStateChange: (state: PlaybackState) => void;
  private onProgress: (time: number) => void;
  private onDurationChange: (duration: number) => void;

  private activeElement: 'A' | 'B' = 'A';
  private currentTrack: Track | null = null;
  private silenceTimeout: any = null;

  constructor(
    onStateChange: (state: PlaybackState) => void,
    onProgress: (time: number) => void,
    onDurationChange: (duration: number) => void
  ) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    this.audioA = new Audio();
    this.audioB = new Audio();
    this.audioA.crossOrigin = "anonymous";
    this.audioB.crossOrigin = "anonymous";

    this.sourceA = this.ctx.createMediaElementSource(this.audioA);
    this.sourceB = this.ctx.createMediaElementSource(this.audioB);

    this.gainA = this.ctx.createGain();
    this.gainB = this.ctx.createGain();

    // Analyzer
    this.analyzer = this.ctx.createAnalyser();
    this.analyzer.fftSize = 256;
    this.freqData = new Uint8Array(this.analyzer.frequencyBinCount);

    // Create EQ Pipeline
    const frequencies = [60, 230, 910, 3600, 14000];
    this.eqBands = frequencies.map(freq => {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      return filter;
    });

    // Normalizer (Compressor)
    this.normalizer = this.ctx.createDynamicsCompressor();
    this.normalizer.threshold.setValueAtTime(-24, this.ctx.currentTime);
    this.normalizer.knee.setValueAtTime(40, this.ctx.currentTime);
    this.normalizer.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.normalizer.attack.setValueAtTime(0, this.ctx.currentTime);
    this.normalizer.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Chain: Source -> Gain -> EQ -> Analyzer -> Normalizer -> Destination
    this.sourceA.connect(this.gainA);
    this.sourceB.connect(this.gainB);

    let lastNodeA: AudioNode = this.gainA;
    let lastNodeB: AudioNode = this.gainB;

    this.eqBands.forEach(filter => {
      lastNodeA.connect(filter);
      lastNodeB.connect(filter);
      lastNodeA = filter;
      lastNodeB = filter;
    });

    // Connect both to analyzer before final output
    lastNodeA.connect(this.analyzer);
    lastNodeB.connect(this.analyzer);

    this.analyzer.connect(this.normalizer);
    this.normalizer.connect(this.ctx.destination);

    this.onStateChange = onStateChange;
    this.onProgress = onProgress;
    this.onDurationChange = onDurationChange;

    this.setupListeners(this.audioA, 'A');
    this.setupListeners(this.audioB, 'B');

    this.setupMediaSession();
    this.setupKeepAlive();
  }

  private setupKeepAlive() {
    // 1-second silent WAV to trick Safari into keeping the process alive
    const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP8A/wD/AA==";
    this.silentKeeper = new Audio(silentWav);
    this.silentKeeper.loop = true;

    // Wake Lock to prevent CPU sleep (where supported)
    if ('wakeLock' in navigator) {
      const requestWakeLock = async () => {
        try {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn("WakeLock request failed", err);
        }
      };
      document.addEventListener('visibilitychange', () => {
        if (this.wakeLock !== null && document.visibilityState === 'visible') {
          requestWakeLock();
        }
      });
      requestWakeLock();
    }
  }

  private setupListeners(audio: HTMLAudioElement, id: 'A' | 'B') {
    audio.addEventListener('play', () => {
      if (this.activeElement === id) this.onStateChange(PlaybackState.PLAYING);
    });
    audio.addEventListener('pause', () => {
      if (this.activeElement === id) this.onStateChange(PlaybackState.PAUSED);
    });
    audio.addEventListener('timeupdate', () => {
      if (this.activeElement === id) {
        this.onProgress(audio.currentTime);
      }
    });
    audio.addEventListener('durationchange', () => {
      if (this.activeElement === id) this.onDurationChange(audio.duration);
    });
    audio.addEventListener('ended', () => {
      if (this.activeElement === id) this.onStateChange(PlaybackState.IDLE);
    });
  }

  public getEnergy(): number {
    if (this.ctx.state === 'suspended') return 0;
    this.analyzer.getByteFrequencyData(this.freqData as any);
    let sum = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      sum += this.freqData[i];
    }
    return sum / this.freqData.length; // Average energy
  }

  public getSpectrum(): Uint8Array {
    if (this.ctx.state === 'suspended') return new Uint8Array(this.analyzer.frequencyBinCount);
    this.analyzer.getByteFrequencyData(this.freqData as any);
    return this.freqData;
  }

  public async play(track: Track, crossfade: number = 0, silence: number = 0) {
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        if (this.silentKeeper) this.silentKeeper.play().catch(() => { });
      } catch (e) {
        console.warn("AudioContext resume failed", e);
      }
    }

    if (!track.audioUrl) {
      console.error("AudioEngine: No audio URL provided for track", track);
      throw new Error("Invalid Track URL");
    }

    // Clear any pending silence
    if (this.silenceTimeout) clearTimeout(this.silenceTimeout);

    const executePlay = async () => {
      const prevElement = this.activeElement === 'A' ? this.audioA : this.audioB;
      const prevGain = this.activeElement === 'A' ? this.gainA : this.gainB;

      // Switch Active
      this.activeElement = this.activeElement === 'A' ? 'B' : 'A';
      const nextElement = this.activeElement === 'A' ? this.audioA : this.audioB;
      const nextGain = this.activeElement === 'A' ? this.gainA : this.gainB;

      this.currentTrack = track;
      nextElement.src = track.audioUrl;

      // Mood Stability: Always use a small ramp (0.5s) if no crossfade is provided
      const rampTime = crossfade > 0 ? crossfade : 0.5;
      nextGain.gain.setValueAtTime(0, this.ctx.currentTime);

      try {
        await nextElement.play();
        nextGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + rampTime);

        if (crossfade > 0) {
          prevGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + rampTime);
          setTimeout(() => {
            prevElement.pause();
            prevElement.src = "";
          }, rampTime * 1000);
        } else {
          prevElement.pause();
          prevElement.src = "";
        }

        this.updateMediaSession(track);
      } catch (e) {
        console.error("AudioEngine playback failed:", e);
        throw e; // Propagate error to UI
      }
    };


    if (silence > 0) {
      this.onStateChange(PlaybackState.BUFFERING);
      this.silenceTimeout = setTimeout(() => {
        executePlay().catch(e => {
          console.error("Delayed playback failed", e);
          // Attempt recovery
          setTimeout(() => executePlay(), 500);
        });
      }, silence * 1000);
    } else {
      try {
        await executePlay();
      } catch (e) {
        // Immediate retry for race conditions
        console.warn("Immediate playback failed, retrying...", e);
        setTimeout(() => executePlay(), 500);
      }
    }
  }

  public pause() {
    this.getActiveAudio().pause();
  }

  public resume() {
    this.getActiveAudio().play();
  }

  public toggle() {
    const audio = this.getActiveAudio();
    if (audio.paused) audio.play();
    else audio.pause();
  }

  public seek(time: number) {
    this.getActiveAudio().currentTime = time;
  }

  public setVolume(val: number) {
    this.ctx.resume();
    const gain = this.activeElement === 'A' ? this.gainA : this.gainB;
    gain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
  }

  public setEQ(bands: number[]) {
    this.ctx.resume();
    bands.forEach((gain, i) => {
      if (this.eqBands[i]) {
        this.eqBands[i].gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
      }
    });
  }

  public setNormalization(enabled: boolean) {
    this.ctx.resume();
    const threshold = enabled ? -24 : 0;
    this.normalizer.threshold.setTargetAtTime(threshold, this.ctx.currentTime, 0.1);
  }

  private getActiveAudio() {
    return this.activeElement === 'A' ? this.audioA : this.audioB;
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        console.log("MediaSession: play");
        this.resume();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        console.log("MediaSession: pause");
        this.pause();
      });
      // These will be overridden by App.tsx through callbacks if needed
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log("MediaSession: previous");
        window.dispatchEvent(new CustomEvent('audio-skip-prev'));
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log("MediaSession: next");
        window.dispatchEvent(new CustomEvent('audio-skip-next'));
      });

      // Update playback state for lock screen
      this.audioA.addEventListener('play', () => navigator.mediaSession.playbackState = 'playing');
      this.audioA.addEventListener('pause', () => navigator.mediaSession.playbackState = 'paused');
      this.audioB.addEventListener('play', () => navigator.mediaSession.playbackState = 'playing');
      this.audioB.addEventListener('pause', () => navigator.mediaSession.playbackState = 'paused');
    }

    // Lifecycle handler for iOS backgrounding
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }
    });
  }

  private updateMediaSession(track: Track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [{ src: track.artwork, sizes: '512x512', type: 'image/png' }]
      });
    }
  }
}

export default AudioEngine;
