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
    this.master.gain.value = 0.22;
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
    return 0.018 + this.drone * 0.055;
  }

  setDrone(amount: number) {
    this.drone = Math.min(1, Math.max(0, amount));
    if (!this.ambientGain || !this.ctx || !this.enabled) return;
    this.ambientGain.gain.setTargetAtTime(this.level(), now(this.ctx), 0.2);
  }

  setScene(mode: string) {
    if (!this.oscA || !this.oscB || !this.ctx) return;
    const map: Record<string, [number, number, number]> = {
      home: [110, 164.81, 55],
      work: [98, 146.83, 49],
      room: [130.81, 196, 65.41],
      "assess-pilot": [146.83, 220, 73.42],
      "a-little-infinity": [87.31, 174.61, 43.65],
      "common-table": [98, 147, 49],
      lab: [82.41, 123.47, 41.2],
      about: [98, 196, 49],
      colophon: [87.31, 130.81, 43.65],
      contact: [146.83, 220, 73.42],
      notes: [123.47, 184.99, 61.74],
      play: [55, 82.41, 36.71],
      lost: [73.42, 110, 36.71],
    };
    const pair = map[mode] ?? map.home;
    const t = now(this.ctx);
    this.oscA.frequency.setTargetAtTime(pair[0], t, 0.45);
    this.oscB.frequency.setTargetAtTime(pair[1], t, 0.45);
    this.oscC?.frequency.setTargetAtTime(pair[2], t, 0.45);
    if (this.ambientGain && this.enabled) {
      const quiet = mode === "about" || mode === "notes" ? 0.18 : mode === "colophon" ? 0.4 : 1;
      this.ambientGain.gain.setTargetAtTime(this.level() * quiet, t, 0.7);
    }
    if (this.filter) {
      const open = mode === "play" ? 720 : mode === "about" ? 220 : 420;
      this.filter.frequency.setTargetAtTime(open, t, 0.5);
    }
  }

  private startAmbient() {
    if (!this.ctx || !this.master || this.oscA) return;
    const ctx = this.ctx;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = this.enabled ? this.level() : 0;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 420;
    this.filter.Q.value = 0.7;

    const makeOsc = (freq: number, type: OscKind) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.connect(this.filter!);
      o.start();
      return o;
    };

    this.oscA = makeOsc(110, "sine");
    this.oscB = makeOsc(164.81, "sine");
    this.oscC = makeOsc(55, "sine");

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    this.noise = ctx.createBufferSource();
    this.noise.buffer = noiseBuffer;
    this.noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.12;
    this.noise.connect(noiseGain);
    noiseGain.connect(this.filter);
    this.noise.start();

    this.filter.connect(this.ambientGain);
    this.ambientGain.connect(this.master);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 80;
    lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    lfo.start();

    const arp = () => {
      if (!this.enabled || !this.unlocked || !this.ctx) return;
      const seq = [110, 138.59, 164.81, 146.83];
      const f = seq[Math.floor(Date.now() / 3200) % seq.length]!;
      this.blip(f * 2, 0.012, 0.9, "sine");
    };
    this.arpTimer = window.setInterval(arp, 3200);
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
    this.blip(880 + Math.random() * 220, 0.035, 0.09, "triangle");
  }

  click() {
    this.blip(220, 0.08, 0.16, "sine");
    this.blip(1320, 0.03, 0.07, "square");
  }

  whoosh() {
    if (!this.enabled || !this.unlocked || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = now(ctx);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.32);
    const g = envGain(ctx, t, 0.07, 0.02, 0.34);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 0.4);
  }

  enter() {
    if (!this.unlocked || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = now(ctx);
    [220, 330, 440].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f * 0.5, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.5 + i * 0.05);
      const g = envGain(ctx, t, 0.05, 0.08, 0.9);
      o.connect(g);
      g.connect(this.master!);
      o.start(t + i * 0.04);
      o.stop(t + 1.2);
    });
  }

  harvest() {
    this.blip(660 + Math.random() * 280, 0.07, 0.14, "triangle");
    this.blip(1320, 0.025, 0.08, "sine");
  }

  nova() {
    if (!this.unlocked || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = now(ctx);
    [110, 165, 220, 330].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 1.1);
      const g = envGain(ctx, t, 0.06, 0.04, 1.1);
      o.connect(g);
      g.connect(this.master!);
      o.start(t + i * 0.03);
      o.stop(t + 1.4);
    });
  }

  duck(ms = 900) {
    if (!this.enabled || !this.unlocked || !this.ctx || !this.master) return;
    const t = now(this.ctx);
    const g = this.master.gain;
    const peak = 0.22;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.max(0.03, g.value || peak), t);
    g.linearRampToValueAtTime(0.03, t + 0.08);
    g.linearRampToValueAtTime(peak, t + ms / 1000);
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
