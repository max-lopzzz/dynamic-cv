"use client";
import { useEffect, useRef, useState } from "react";
import { Beep } from "./Beep";

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause(); else audio.play();
    setPlaying(!playing);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setTime(value);
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/tom-sawyer.mp3" preload="metadata" />
      <p className="track-title">♫ Tom Sawyer — Rush <small>(currently learning on drums 🥁)</small></p>
      <div className="player-row">
        <Beep onClick={toggle}>{playing ? "❚❚ pause" : "▶ play"}</Beep>
        <span className="time">{fmt(time)} / {fmt(duration)}</span>
      </div>
      <input type="range" aria-label="Seek" min={0} max={duration || 0} step={0.1} value={time} onChange={(e) => seek(Number(e.target.value))} />
      <input type="range" aria-label="Volume" min={0} max={1} step={0.01} defaultValue={0.7} onChange={(e) => { if (audioRef.current) audioRef.current.volume = Number(e.target.value); }} />
    </>
  );
}
