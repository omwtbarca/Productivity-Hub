/* ============================================
   Procedural ambient sound generator (Web Audio API)
   No external audio files — works fully offline.
   ============================================ */

class AmbientPlayer {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.activeNodes = []; // for current preset
    this.preset = null;
    this.volume = 0.6;
  }

  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  /* ----- Noise buffers ----- */
  makeNoise(type = "brown", seconds = 4) {
    const len = this.ctx.sampleRate * seconds;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    if (type === "white") {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else { // brown
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        d[i] = (last + 0.02 * w) / 1.02;
        last = d[i];
        d[i] *= 3.5;
      }
    }
    return buf;
  }

  noiseSource(type, seconds) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.makeNoise(type, seconds);
    src.loop = true;
    return src;
  }

  /* ----- Presets ----- */
  buildOcean() {
    // Brown noise + slow LFO modulating gain = wave crashes
    const src = this.noiseSource("brown", 5);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 0.7;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.0;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.18; // ~one wave per 5.5s
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.55;
    const lfoBase = this.ctx.createConstantSource();
    lfoBase.offset.value = 0.45;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfoBase.connect(gain.gain);

    src.connect(filter); filter.connect(gain); gain.connect(this.master);
    src.start(); lfo.start(); lfoBase.start();
    return [src, lfo, lfoBase, filter, gain];
  }

  buildRain() {
    // Pink noise + highpass → patter; plus occasional droplets
    const src = this.noiseSource("pink", 4);
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;
    hp.Q.value = 0.6;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.8;
    src.connect(hp); hp.connect(gain); gain.connect(this.master);
    src.start();

    // droplets
    const dropletTimer = setInterval(() => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.frequency.value = 2000 + Math.random() * 1500;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
      osc.connect(g); g.connect(this.master);
      osc.start(); osc.stop(this.ctx.currentTime + 0.1);
    }, 180);

    return [src, hp, gain, { stop: () => clearInterval(dropletTimer) }];
  }

  buildCafe() {
    // Pink noise + bandpass at speech frequencies + occasional clinks
    const src = this.noiseSource("pink", 4);
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 600;
    bp.Q.value = 0.8;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.7;
    src.connect(bp); bp.connect(gain); gain.connect(this.master);
    src.start();

    // gentle LFO on filter for "murmur"
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.3;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 300;
    lfo.connect(lfoG); lfoG.connect(bp.frequency);
    lfo.start();

    // occasional clink
    const clinkTimer = setInterval(() => {
      if (!this.ctx) return;
      if (Math.random() > 0.3) return;
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 1800 + Math.random() * 800;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      osc.connect(g); g.connect(this.master);
      osc.start(); osc.stop(this.ctx.currentTime + 0.5);
    }, 2200);

    return [src, bp, gain, lfo, { stop: () => clearInterval(clinkTimer) }];
  }

  buildFire() {
    // Brown noise + lowpass + crackles
    const src = this.noiseSource("brown", 4);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.6;
    src.connect(lp); lp.connect(gain); gain.connect(this.master);
    src.start();

    const crackleTimer = setInterval(() => {
      if (!this.ctx) return;
      const burst = this.ctx.createBufferSource();
      burst.buffer = this.makeNoise("white", 0.05);
      const bp = this.ctx.createBiquadFilter();
      bp.type = "highpass";
      bp.frequency.value = 2500;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.12, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);
      burst.connect(bp); bp.connect(g); g.connect(this.master);
      burst.start(); burst.stop(this.ctx.currentTime + 0.08);
    }, 120);

    return [src, lp, gain, { stop: () => clearInterval(crackleTimer) }];
  }

  buildForest() {
    // Pink noise low + occasional bird-like tones
    const src = this.noiseSource("pink", 4);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1500;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.35;
    src.connect(lp); lp.connect(gain); gain.connect(this.master);
    src.start();

    const birdTimer = setInterval(() => {
      if (!this.ctx) return;
      if (Math.random() > 0.4) return;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      const f0 = 1600 + Math.random() * 1200;
      osc.frequency.setValueAtTime(f0, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(f0 * (1 + (Math.random() - 0.5) * 0.4), this.ctx.currentTime + 0.18);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);
      osc.connect(g); g.connect(this.master);
      osc.start(); osc.stop(this.ctx.currentTime + 0.25);
    }, 1800);

    return [src, lp, gain, { stop: () => clearInterval(birdTimer) }];
  }

  buildBrown() {
    const src = this.noiseSource("brown", 5);
    const gain = this.ctx.createGain();
    gain.gain.value = 0.55;
    src.connect(gain); gain.connect(this.master);
    src.start();
    return [src, gain];
  }

  /* ----- Playback control ----- */
  play(preset) {
    this.ensure();
    if (this.ctx.state === "suspended") this.ctx.resume();
    this.stop();
    const builders = {
      ocean: () => this.buildOcean(),
      rain: () => this.buildRain(),
      cafe: () => this.buildCafe(),
      fire: () => this.buildFire(),
      forest: () => this.buildForest(),
      brown: () => this.buildBrown(),
    };
    if (!builders[preset]) return;
    this.activeNodes = builders[preset]();
    this.preset = preset;
  }

  stop() {
    if (!this.activeNodes.length) return;
    this.activeNodes.forEach((n) => {
      try { if (n.stop) n.stop(); } catch (e) {}
      try { if (n.disconnect) n.disconnect(); } catch (e) {}
    });
    this.activeNodes = [];
    this.preset = null;
  }
}

window.ambientPlayer = new AmbientPlayer();
