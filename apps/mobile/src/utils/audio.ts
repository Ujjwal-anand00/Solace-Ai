/**
 * Ambient Audio & Harmonic Tone Synthesizer
 * Provides gentle soundscapes for guided breathing and meditation sessions
 * without bulky asset bundles, using Web Audio API on web/supported environments.
 */

interface WebOscillator {
  type: string;
  frequency: {
    setValueAtTime(value: number, time: number): void;
  };
  connect(dest: unknown): void;
  disconnect(): void;
  start(time?: number): void;
  stop(time?: number): void;
}

interface WebGain {
  gain: {
    setValueAtTime(value: number, time: number): void;
    exponentialRampToValueAtTime(value: number, time: number): void;
    linearRampToValueAtTime(value: number, time: number): void;
  };
  connect(dest: unknown): void;
  disconnect(): void;
}

interface WebAudioContext {
  state: string;
  currentTime: number;
  destination: unknown;
  resume(): Promise<void>;
  createOscillator(): WebOscillator;
  createGain(): WebGain;
}

class SoundEngine {
  private audioCtx: WebAudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc: WebOscillator | null = null;
  private ambientGain: WebGain | null = null;

  private getAudioContext(): WebAudioContext | null {
    if (typeof window === 'undefined') return null;

    const win = window as unknown as {
      AudioContext?: new () => WebAudioContext;
      webkitAudioContext?: new () => WebAudioContext;
    };

    const AudioContextClass = win.AudioContext || win.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.audioCtx) {
      try {
        this.audioCtx = new AudioContextClass();
      } catch {
        return null;
      }
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  /**
   * Set mute state
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopAmbient();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play a gentle soothing bell/chime for breathing phase transitions
   * @param frequency Frequency in Hz (e.g., 528 for transformation, 432 for calm, 396 for grounding)
   */
  public playChime(frequency = 528): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Gentle bell envelope: quick attack, smooth exponential decay
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.8);
    } catch {
      // Audio is non-critical; fail silently
    }
  }

  /**
   * Start soft ambient singing bowl tone (432Hz deep meditative drone)
   */
  public startAmbient(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx || this.ambientOsc) return;

      this.ambientOsc = ctx.createOscillator();
      this.ambientGain = ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(432, ctx.currentTime);

      this.ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.ambientGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 2.0);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(ctx.destination);

      this.ambientOsc.start();
    } catch {
      // Audio is non-critical
    }
  }

  /**
   * Stop ambient soundscape
   */
  public stopAmbient(): void {
    try {
      if (this.ambientOsc && this.ambientGain && this.audioCtx) {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
        setTimeout(() => {
          try {
            this.ambientOsc?.stop();
            this.ambientOsc?.disconnect();
            this.ambientGain?.disconnect();
          } catch {
            // Cleanup error ignored
          }
          this.ambientOsc = null;
          this.ambientGain = null;
        }, 500);
      }
    } catch {
      this.ambientOsc = null;
      this.ambientGain = null;
    }
  }
}

export const soundEngine = new SoundEngine();
