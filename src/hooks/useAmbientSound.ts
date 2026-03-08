import { useRef, useCallback, useEffect } from 'react';

// Web Audio API ambient sound generator
type SoundType = 'none' | 'rain' | 'forest' | 'ocean' | 'wind';

function createNoise(ctx: AudioContext, type: SoundType): { source: AudioNode; gain: GainNode } {
  const gain = ctx.createGain();
  gain.gain.value = 0.3;

  if (type === 'rain') {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
        if (i > 0) data[i] = data[i] * 0.3 + data[i - 1] * 0.7; // lowpass for rain
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    source.connect(filter);
    filter.connect(gain);
    source.start();
    return { source, gain };
  }

  if (type === 'ocean') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 0.1;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 200;
    osc.connect(oscGain);

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
        if (i > 0) data[i] = data[i] * 0.2 + data[i - 1] * 0.8;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    oscGain.connect(filter.frequency);
    osc.start();
    source.connect(filter);
    filter.connect(gain);
    source.start();
    return { source, gain };
  }

  if (type === 'wind') {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
        if (i > 0) data[i] = data[i] * 0.15 + data[i - 1] * 0.85;
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.5;
    source.connect(filter);
    filter.connect(gain);
    source.start();
    return { source, gain };
  }

  if (type === 'forest') {
    const bufferSize = 4 * ctx.sampleRate;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
        if (i > 0) data[i] = data[i] * 0.1 + data[i - 1] * 0.9;
        // bird chirp bursts
        if (Math.random() < 0.0001) {
          const chirpLen = Math.floor(Math.random() * 2000 + 500);
          const freq = Math.random() * 2000 + 1500;
          for (let j = 0; j < chirpLen && i + j < bufferSize; j++) {
            data[i + j] += Math.sin(j * freq / ctx.sampleRate * Math.PI * 2) * 0.08 * (1 - j / chirpLen);
          }
        }
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    source.connect(filter);
    filter.connect(gain);
    source.start();
    return { source, gain };
  }

  // fallback silence
  const osc = ctx.createOscillator();
  osc.frequency.value = 0;
  osc.connect(gain);
  gain.gain.value = 0;
  osc.start();
  return { source: osc, gain };
}

export function useAmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ source: AudioNode; gain: GainNode } | null>(null);

  const stop = useCallback(() => {
    if (nodesRef.current) {
      try {
        nodesRef.current.gain.disconnect();
        nodesRef.current.source.disconnect();
      } catch {}
      nodesRef.current = null;
    }
  }, []);

  const play = useCallback((type: SoundType, volume: number = 0.3) => {
    stop();
    if (type === 'none') return;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const nodes = createNoise(ctx, type);
    nodes.gain.gain.value = volume;
    nodes.gain.connect(ctx.destination);
    nodesRef.current = nodes;
  }, [stop]);

  const setVolume = useCallback((vol: number) => {
    if (nodesRef.current) {
      nodesRef.current.gain.gain.value = vol;
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, [stop]);

  return { play, stop, setVolume };
}
