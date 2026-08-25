let ctx: AudioContext | null = null;
function getCtx() { if (!ctx) ctx = new AudioContext(); return ctx; }

export function beep() {
  const c = getCtx();
  const osc = c.createOscillator(); const gain = c.createGain();
  osc.type = "square"; osc.frequency.value = 720;
  gain.gain.setValueAtTime(0.05, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08);
  osc.connect(gain).connect(c.destination);
  osc.start(); osc.stop(c.currentTime + 0.08);
}

function kick(c: AudioContext) {
  const osc = c.createOscillator(); const gain = c.createGain();
  osc.frequency.setValueAtTime(150, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(45, c.currentTime + 0.15);
  gain.gain.setValueAtTime(0.35, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
  osc.connect(gain).connect(c.destination);
  osc.start(); osc.stop(c.currentTime + 0.2);
}

function snare(c: AudioContext) {
  const size = c.sampleRate * 0.12;
  const buffer = c.createBuffer(1, size, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
  const noise = c.createBufferSource(); noise.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.25, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  const filter = c.createBiquadFilter(); filter.type = "highpass"; filter.frequency.value = 1000;
  noise.connect(filter).connect(gain).connect(c.destination);
  noise.start();
}

export function drumFill(onDone?: () => void) {
  const c = getCtx();
  const hits = [0, 110, 210, 310, 400, 490, 580, 700];
  hits.forEach((t, i) => setTimeout(() => (i % 2 === 0 ? kick(c) : snare(c)), t));
  if (onDone) setTimeout(onDone, hits[hits.length - 1] + 250);
}
