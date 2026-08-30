"use client";

const SOUND_BASE = "/assets/sounds/Windows Classic/Windows 98/";

export const WINDOWS_SOUNDS = {
  startup: `${SOUND_BASE}START.WAV`,
  click: `${SOUND_BASE}CHORD.WAV`,
  open: `${SOUND_BASE}CHIMES.WAV`,
  close: `${SOUND_BASE}RECYCLE.WAV`,
  error: `${SOUND_BASE}DING.WAV`,
  notify: `${SOUND_BASE}NOTIFY.WAV`,
  success: `${SOUND_BASE}TADA.WAV`,
} as const;

export type WindowsSound = keyof typeof WINDOWS_SOUNDS;

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function fallbackClick() {
  const ctx = getAudioContext();

  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = 720;

  gain.gain.setValueAtTime(0.045, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + 0.055
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.06);
}

export function playWindowsSound(
  sound: WindowsSound,
  volume = 0.45
) {
  if (typeof window === "undefined") return;

  const audio = new Audio(WINDOWS_SOUNDS[sound]);

  audio.preload = "auto";
  audio.volume = volume;

  audio.addEventListener(
    "error",
    () => {
      // If an asset is missing, clicking should still make a sound.
      if (sound === "click") {
        fallbackClick();
      }
    },
    { once: true }
  );

  void audio.play().catch(() => {
    if (sound === "click") {
      fallbackClick();
    }
  });
}

/**
 * Compatibility helper used by Beep.tsx and Guestbook.tsx.
 */
export function beep() {
  playWindowsSound("click", 0.3);
}

/**
 * Original MaxOS drum easter egg.
 */
export function drumFill(done?: () => void) {
  const ctx = getAudioContext();

  if (!ctx) {
    done?.();
    return;
  }

  const kick = (time: number) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(150, time);
    oscillator.frequency.exponentialRampToValueAtTime(
      45,
      time + 0.15
    );

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + 0.18
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(time);
    oscillator.stop(time + 0.2);
  };

  const snare = (time: number) => {
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(
      1,
      bufferSize,
      ctx.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] =
        (Math.random() * 2 - 1) *
        (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1000;

    const gain = ctx.createGain();

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      time + 0.12
    );

    noise
      .connect(filter)
      .connect(gain)
      .connect(ctx.destination);

    noise.start(time);
  };

  const hits = [
    0,
    110,
    210,
    310,
    400,
    490,
    580,
    700,
  ];

  const start = ctx.currentTime;

  hits.forEach((offset, index) => {
    const time = start + offset / 1000;

    if (index % 2 === 0) {
      kick(time);
    } else {
      snare(time);
    }
  });

  window.setTimeout(() => {
    done?.();
  }, 1050);
}
