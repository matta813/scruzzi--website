"use client";

// Synthesised ambience and UI ticks via Web Audio: no audio files to load.
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastBlip = 0;

  get enabled() {
    return this.ctx?.state === "running";
  }

  async enable() {
    if (!this.ctx) this.build();
    await this.ctx!.resume();
    this.master!.gain.cancelScheduledValues(this.ctx!.currentTime);
    this.master!.gain.linearRampToValueAtTime(1, this.ctx!.currentTime + 1.2);
  }

  async disable() {
    if (!this.ctx || !this.master) return;
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
    await new Promise((resolve) => setTimeout(resolve, 450));
    await this.ctx.suspend();
  }

  blip(frequency = 1760) {
    if (!this.ctx || !this.master || !this.enabled) return;
    const now = this.ctx.currentTime;
    if (now - this.lastBlip < 0.05) return;
    this.lastBlip = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  private build() {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Low server-room hum: two detuned saws through a slowly breathing filter.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 180;
    filter.Q.value = 6;

    const hum = ctx.createGain();
    hum.gain.value = 0.035;
    filter.connect(hum).connect(master);

    for (const frequency of [55, 55.35, 110.2]) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = frequency;
      osc.connect(filter);
      osc.start();
    }

    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoDepth.gain.value = 70;
    lfo.connect(lfoDepth).connect(filter.frequency);
    lfo.start();

    this.ctx = ctx;
    this.master = master;
  }
}

export const sound = new SoundEngine();
