window.FS = window.FS || {};
FS.Audio = {
  ctx: null,
  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(()=>{});
  },
  tone(freq=620, duration=.06, type="sine", gain=.035) {
    try {
      this.ensure(); if (!this.ctx) return;
      const osc = this.ctx.createOscillator(), amp = this.ctx.createGain();
      osc.type = type; osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, this.ctx.currentTime);
      amp.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + duration);
      osc.connect(amp); amp.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },
  click() { this.tone(740,.045,"triangle",.035); setTimeout(()=>this.tone(950,.035,"sine",.018),25); },
  success() { this.tone(660,.08); setTimeout(()=>this.tone(880,.12),90); },
  fail() { this.tone(190,.13,"triangle",.025); },
  splash() { this.tone(250,.11,"sine",.025); setTimeout(()=>this.tone(150,.16,"sine",.02),65); },
  bell() { this.tone(900,.1,"sine",.028); setTimeout(()=>this.tone(1200,.12,"sine",.018),75); }
};
