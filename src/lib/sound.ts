type OscKind = OscillatorType;

function now(ctx: AudioContext) {
  return ctx.currentTime;
}

function envGain(ctx: AudioContext, start: number, peak: number, attack: number, release: number) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(peak, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + release);
  return g;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private enabled = false;
  private unlocked = false;
  private drone = 0.55;
  private oscC: OscillatorNode | null = null;
  private arpTimer = 0;

  private ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.14;
    this.master.connect(this.ctx.destination);
  }

  async unlock() {
    this.ensure();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    this.unlocked = true;
    this.startAmbient();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!this.ambientGain || !this.ctx) return;
    const t = now(this.ctx);
    this.ambientGain.gain.cancelScheduledValues(t);
    this.ambientGain.gain.linearRampToValueAtTime(on ? this.level() : 0, t + 0.4);
  }

  isEnabled() {
    return this.enabled;
  }

  private level() {
    return 0.01 + this.drone * 0.032;
  }

  setDrone(amount: number) {
    this.drone = Math.min(1, Math.max(0, amount));
    if (!this.ambientGain || !this.ctx || !this.enabled) return;
    this.ambientGain.gain.setTargetAtTime(this.level(), now(this.ctx), 0.2);
  }

  setScene(mode: string) {
    if (!this.oscA || !this.oscB || !this.ctx) return;
    const map: Record<string, [number, number, number]> = {
      home: [55, 82.41, 41.2],
      work: [49, 73.42, 36.71],
      room: [61.74, 92.5, 46.25],
      "assess-pilot": [65.41, 98, 49],
      "a-little-infinity": [51.91, 77.78, 38.89],
      "common-table": [49, 73.42, 36.71],
      lab: [41.2, 61.74, 30.87],
      about: [43.65, 65.41, 32.7],
      colophon: [46.25, 69.3, 34.65],
      contact: [55, 82.41, 41.2],
      notes: [49, 73.42, 36.71],
      play: [32.7, 49, 24.5],
      lost: [36.71, 55, 27.5],
    };
    const pair = map[mode] ?? map.home;
    const t = now(this.ctx);
    this.oscA.frequency.setTargetAtTime(pair[0], t, 1.2);
    this.oscB.frequency.setTargetAtTime(pair[1] * 1.003, t, 1.2);
    this.oscC?.frequency.setTargetAtTime(pair[2], t, 1.2);
    if (this.ambientGain && this.enabled) {
      const quiet = mode === "about" || mode === "notes" ? 0.55 : mode === "colophon" ? 0.4 : 1;
      this.ambientGain.gain.setTargetAtTime(this.level() * quiet, t, 1.1);
    }
    if (this.filter) {
      const open = mode === "play" ? 380 : mode === "about" ? 180 : 260;
      this.filter.frequency.setTargetAtTime(open, t, 0.9);
    }
  }

  private startAmbient() {
    if (!this.ctx || !this.master || this.oscA) return;
    const ctx = this.ctx;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = this.enabled ? this.level() : 0;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 240;
    this.filter.Q.value = 0.45;

    const makeOsc = (freq: number, type: OscKind) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.22;
      o.connect(g);
      g.connect(this.filter!);
      o.start();
      return o;
    };

    this.oscA = makeOsc(55, "sine");
    this.oscB = makeOsc(55.18, "sine");
    this.oscC = makeOsc(82.41, "triangle");

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = (brown + (Math.random() * 2 - 1) * 0.02) * 0.996;
      data[i] = brown * 3.2;
    }
    this.noise = ctx.createBufferSource();
    this.noise.buffer = noiseBuffer;
    this.noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.28;
    this.noise.connect(noiseGain);
    noiseGain.connect(this.filter);
    this.noise.start();

    this.filter.connect(this.ambientGain);
    this.ambientGain.connect(this.master);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.028;
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    lfo.start();
  }

  private blip(freq: number, peak: number, dur: number, type: OscKind = "sine") {
    if (!this.enabled || !this.unlocked || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = now(ctx);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.5), t + dur);
    const g = envGain(ctx, t, peak, 0.008, dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  hover() {
    this.blip(196 + Math.random() * 40, 0.018, 0.28, "sine");
  }

  click() {
    this.blip(90, 0.04, 0.42, "sine");
    this.whoosh();
  }

  whoosh() {
    if (!this.enabled || !this.unlocked || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = now(ctx);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.9, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = (brown + (Math.random() * 2 - 1) * 0.02) * 0.997;
      data[i] = brown * 3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.exponentialRampToValueAtTime(620, t + 0.55);
    const g = envGain(ctx, t, 0.05, 0.06, 0.7);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 0.85);
  }

  enter() {
    if (!this.unlocked || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = now(ctx);
    [55, 82.41, 110].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f * 0.5, t);
      o.frequency.linearRampToValueAtTime(f, t + 1.6 + i * 0.12);
      const g = envGain(ctx, t, 0.035, 0.4, 2.4);
      o.connect(g);
      g.connect(this.master!);
      o.start(t + i * 0.08);
      o.stop(t + 3.1);
    });
  }

  harvest() {
    this.blip(330 + Math.random() * 40, 0.03, 0.22, "sine");
  }

  nova() {
    this.whoosh();
    if (!this.unlocked || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = now(ctx);
    [41.2, 55, 82.41].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 1.6);
      const g = envGain(ctx, t, 0.04, 0.12, 1.6);
      o.connect(g);
      g.connect(this.master!);
      o.start(t + i * 0.05);
      o.stop(t + 2);
    });
  }

  duck(ms = 900) {
    if (!this.enabled || !this.unlocked || !this.ctx || !this.master) return;
    const t = now(this.ctx);
    const g = this.master.gain;
    const peak = 0.22;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(0.02, g.value || peak), t);
    g.linearRampToValueAtTime(0.02, t + 0.12);
    g.linearRampToValueAtTime(0.14, t + ms / 1000);
  }

  tone(freq: number) {
    this.blip(freq, 0.07, 0.55, "sine");
    this.blip(freq * 2, 0.02, 0.32, "triangle");
    this.blip(freq * 0.5, 0.03, 0.7, "sine");
  }

  letter() {
    this.blip(196, 0.05, 0.4, "sine");
    this.blip(294, 0.03, 0.5, "triangle");
  }

  setFilter(amount: number) {
    if (!this.filter || !this.ctx) return;
    const freq = 180 + amount * 1400;
    this.filter.frequency.setTargetAtTime(freq, now(this.ctx), 0.05);
  }
}

export const sound = new SoundEngine();
