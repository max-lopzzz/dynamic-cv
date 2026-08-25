"use client";
import { useEffect, useState } from "react";

type Stage = "boot" | "login" | "desktop";
const projects = [
  ["PakuPaku", "A nutrition tracker made with trans people and metabolic conditions in mind.", "72%", "pakupaku"],
  ["Bead Art Helper", "Turns a picture into a bead palette without the guessing.", "91%", "beadart"],
  ["BoxBuddy", "A QR inventory helper for knowing where your stuff actually is.", "84%", "boxbuddy"],
  ["Pokémon Team Picker", "For the very serious business of choosing a Pokémon team.", "100%", "pokemon_team_picker"],
];
const repo = "https://github.com/max-lopzzz/";

function Beep({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { return <button className="bevel" onClick={() => { navigator.vibrate?.(8); onClick?.(); }}>{children}</button>; }
function Window({ title, children, className = "", onClose }: { title: string; children: React.ReactNode; className?: string; onClose?: () => void }) {
  return <section className={`window ${className}`}><div className="titlebar"><span>{title}</span><button onClick={onClose} aria-label="Close window">×</button></div>{children}</section>;
}
export default function Home() {
  const [stage, setStage] = useState<Stage>("boot"); const [clock, setClock] = useState(""); const [about, setAbout] = useState(true); const [music, setMusic] = useState(false);
  useEffect(() => { const enter = (e: KeyboardEvent) => { if (e.key === "Enter" && stage === "boot") setStage("login"); }; addEventListener("keydown", enter); const timer = setInterval(() => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 1000); return () => { removeEventListener("keydown", enter); clearInterval(timer); }; }, [stage]);
  if (stage === "boot") return <main className="boot" onClick={() => setStage("login")}><pre>MAX BIOS v0.98

Checking memory... OK
Loading: MAXIMILIANO.EXE
Loading: PROJECTS.DAT
Loading: DRUMS.MID

Press ENTER to continue_</pre></main>;
  if (stage === "login") return <main className="login"><Window title="Welcome to MaxOS"><div className="login-body"><div className="avatar">M</div><h1>Maximiliano</h1><p>Click to enter the desktop.</p><Beep onClick={() => setStage("desktop")}>Enter</Beep></div></Window></main>;
  return <main className="desktop">
    <div className="wallpaper" />
    <aside className="desktop-icons"><a href="#portfolio">▣<span>My Projects</span></a><a href="https://github.com/max-lopzzz" target="_blank">⌘<span>GitHub</span></a><button onClick={() => setMusic(!music)}>♫<span>Music.exe</span></button></aside>
    <Window title="max_portfolio.exe" className="portfolio"><div className="menu"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div><div className="portfolio-content" id="portfolio"><div className="banner"><p>MAXIMILIANO LÓPEZ MONTAÑO</p><h1>hello, internet.</h1><span>software · games · weird little tools</span></div><article className="intro98"><div className="pixel-face">:)</div><p>Hi, I’m Max. I’m a CS student from Monterrey who likes making software that feels useful, friendly, and a bit more human than it has to be.</p></article><h2>✦ project folder</h2><div className="projects">{projects.map(([name, copy, progress, slug]) => <a key={slug} href={repo + slug} target="_blank" className="project98"><b>▦ {name}</b><p>{copy}</p><div className="meter"><i style={{ width: progress }} /></div><small>status: {progress} complete</small></a>)}</div><h2>✦ things I do</h2><div className="services"><span>web apps</span><span>indie games</span><span>product design</span><span>software experiments</span></div><h2>✦ frequently asked questions</h2><details><summary>What are you working on right now?</summary><p>Mostly PakuPaku, work projects for civil-society organizations, and whatever I can’t stop thinking about.</p></details><details><summary>Can I say hi?</summary><p>Yes please. Email is best: <a href="mailto:m.lopz.montn@gmail.com">m.lopz.montn@gmail.com</a></p></details></div></Window>
    {about && <Window title="about_max.txt" className="about" onClose={() => setAbout(false)}><div className="about-body"><b>Max has logged on.</b><p>Engineering in Computer Technologies @ Tec de Monterrey. Software engineer, indie maker, game developer, drummer.</p><p>Currently making things for NGOs and people who need them.</p><a href="mailto:m.lopz.montn@gmail.com">send email ↗</a></div></Window>}
    {music && <Window title="tiny media player" className="player" onClose={() => setMusic(false)}><p>♫ currently not playing</p><input type="range" aria-label="Volume" /><Beep>▶ play</Beep></Window>}
    <footer className="taskbar"><Beep>▣ Start</Beep><span>max_portfolio.exe</span><time>{clock}</time></footer><div className="scanlines" /><div className="crt-roll" />
  </main>;
}
