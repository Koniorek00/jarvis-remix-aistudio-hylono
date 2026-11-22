import { AudioOutputMode, AudioPresetId } from '../types/jarvis';

export interface AudioPresetConfig {
  id: AudioPresetId;
  carrierHz: number;
  beatHz: number;
  noiseType: 'brown' | 'pink';
  noiseGain: number;
  filterCutoffHz: number;
  labelPl: string;
  labelEn: string;
  freqLabel: string;
}

export const AUDIO_PRESETS: Record<AudioPresetId, AudioPresetConfig> = {
  clarity: {
    id: 'clarity',
    carrierHz: 220,
    beatHz: 12,
    noiseType: 'pink',
    noiseGain: 0.045,
    filterCutoffHz: 620,
    labelPl: 'RANO / CLARITY',
    labelEn: 'MORNING / CLARITY',
    freqLabel: '10→14 Hz SMR',
  },
  calm: {
    id: 'calm',
    carrierHz: 196,
    beatHz: 6,
    noiseType: 'brown',
    noiseGain: 0.09,
    filterCutoffHz: 340,
    labelPl: 'WYCISZ / CALM',
    labelEn: 'CALM / THETA',
    freqLabel: '6 Hz Theta',
  },
  focus: {
    id: 'focus',
    carrierHz: 240,
    beatHz: 16,
    noiseType: 'pink',
    noiseGain: 0.06,
    filterCutoffHz: 780,
    labelPl: 'FOCUS / DEEP WORK',
    labelEn: 'FOCUS / BETA',
    freqLabel: '16 Hz Beta',
  },
  sleep: {
    id: 'sleep',
    carrierHz: 160,
    beatHz: 3.5,
    noiseType: 'brown',
    noiseGain: 0.11,
    filterCutoffHz: 210,
    labelPl: 'SEN / DEEP REST',
    labelEn: 'SLEEP / DELTA',
    freqLabel: '3.5 Hz Delta',
  },
};

class JarvisAudioDspEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private isPlaying = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext, kind: 'brown' | 'pink'): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 3;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (kind === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.4;
      }
    } else {
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  private teardownActiveNodes(): void {
    for (const node of this.activeNodes) {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore already stopped audio nodes
      }
    }
    this.activeNodes = [];
  }

  public start(presetId: AudioPresetId, mode: AudioOutputMode, volume: number): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.teardownActiveNodes();
    const cfg = AUDIO_PRESETS[presetId];
    const now = ctx.currentTime;

    // 1. Filtered organic noise bed
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer(ctx, cfg.noiseType);
    noiseSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(cfg.filterCutoffHz, now);

    const noiseGainNode = ctx.createGain();
    noiseGainNode.gain.setValueAtTime(cfg.noiseGain, now);

    noiseSource.connect(lowpass);
    lowpass.connect(noiseGainNode);
    noiseGainNode.connect(this.masterGain);
    noiseSource.start(now);
    this.activeNodes.push(noiseSource, lowpass, noiseGainNode);

    // 2. Tone architecture: Binaural (headphones) vs Smooth Isochronic AM (speakers)
    if (mode === 'headphones') {
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscRight.type = 'sine';
      oscLeft.frequency.setValueAtTime(cfg.carrierHz, now);

      if (presetId === 'clarity') {
        oscRight.frequency.setValueAtTime(cfg.carrierHz + 10, now);
        oscRight.frequency.linearRampToValueAtTime(cfg.carrierHz + 14, now + 90);
      } else {
        oscRight.frequency.setValueAtTime(cfg.carrierHz + cfg.beatHz, now);
      }

      const panLeft = ctx.createStereoPanner();
      const panRight = ctx.createStereoPanner();
      panLeft.pan.setValueAtTime(-0.85, now);
      panRight.pan.setValueAtTime(0.85, now);

      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(0.11, now);

      oscLeft.connect(panLeft);
      oscRight.connect(panRight);
      panLeft.connect(toneGain);
      panRight.connect(toneGain);
      toneGain.connect(this.masterGain);

      oscLeft.start(now);
      oscRight.start(now);
      this.activeNodes.push(oscLeft, oscRight, panLeft, panRight, toneGain);
    } else {
      const carrier = ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(cfg.carrierHz, now);

      const padHarmonic = ctx.createOscillator();
      padHarmonic.type = 'sine';
      padHarmonic.frequency.setValueAtTime(cfg.carrierHz * 1.5, now);

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.08, now);

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(cfg.beatHz, now);

      const lfoDepth = ctx.createGain();
      lfoDepth.gain.setValueAtTime(0.055, now);

      lfo.connect(lfoDepth);
      lfoDepth.connect(modGain.gain);

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.025, now);

      carrier.connect(modGain);
      padHarmonic.connect(harmonicGain);
      harmonicGain.connect(modGain);
      modGain.connect(this.masterGain);

      carrier.start(now);
      padHarmonic.start(now);
      lfo.start(now);
      this.activeNodes.push(carrier, padHarmonic, lfo, lfoDepth, harmonicGain, modGain);
    }

    const clamped = Math.max(0.01, Math.min(0.85, volume));
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(clamped, now + 0.45);
    this.isPlaying = true;
  }

  public setVolume(volume: number): void {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0.001, Math.min(0.85, volume));
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(clamped, now, 0.08);
  }

  public stop(): void {
    if (!this.ctx || !this.masterGain) {
      this.isPlaying = false;
      return;
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(0.0001, now, 0.08);
    this.isPlaying = false;
    setTimeout(() => {
      if (!this.isPlaying) {
        this.teardownActiveNodes();
      }
    }, 280);
  }
}

export const audioDspEngine = new JarvisAudioDspEngine();
