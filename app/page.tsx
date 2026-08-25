"use client";
import { useEffect, useRef, useState } from "react";
import { Window } from "./components/Window";
import { Beep } from "./components/Beep";
import { MusicPlayer } from "./components/MusicPlayer";
import { Terminal } from "./terminal";
import { projects, repo } from "./projects";
import { drumFill } from "./sound";

type Stage = "boot" | "login" | "desktop";
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

export default function Home() {
  const [stage, setStage] = useState<Stage>("boot");
  const [clock, setClock] = useState("");
  const [about, setAbout] = useState(true);
  const [music, setMusic] = useState(false);
  const [hobbies, setHobbies] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [egg, setEgg] = useState(false);
  const [zMap, setZMap] = useState<Record<string, number>>({ portfolio: 21, about: 22, hobbies: 23, player: 24, terminal: 25 });
  const zCounter = useRef(26);
  const keyBuffer = useRef<string[]>([]);

  function focus(id: string) { setZMap((m) => ({ ...m, [id]: zCounter.current++ })); }
  function openHobbies() { setHobbies(true); focus("hobbies"); }
  function openPlayer() { setMusic(true); focus("player"); }
  function openTerminal() { setTerminalOpen(true); focus("terminal"); }

  useEffect(() => {
    const enter = (e: KeyboardEvent) => { if (e.key === "Enter" && stage === "boot") setStage("login"); };
    const konami = (e: KeyboardEvent) => {
      keyBuffer.current = [...keyBuffer.current, e.key.toLowerCase()].slice(-KONAMI.length);
      if (stage === "desktop" && !egg && keyBuffer.current.join(",") === KONAMI.join(",")) {
        setEgg(true);
        drumFill(() => setEgg(false));
      }
    };
    addEventListener("keydown", enter);
    addEventListener("keydown", konami);
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 1000);
    return () => { removeEventListener("keydown", enter); removeEventListener("keydown", konami); clearInterval(timer); };
  }, [stage, egg]);

  if (stage === "boot") return <main className="boot" onClick={() => setStage("login")}><pre>MAX BIOS v0.98

Checking memory... OK
Loading: MAXIMILIANO.EXE
Loading: PROJECTS.DAT
Loading: DRUMS.MID

Press ENTER to continue_</pre></main>;

  if (stage === "login") return <main className="login"><Window title="Welcome to MaxOS" resizable={false}><div className="login-body"><div className="avatar">M</div><h1>Maximiliano</h1><p>Click to enter the desktop.</p><Beep onClick={() => setStage("desktop")}>Enter</Beep></div></Window></main>;

  return <main className={`desktop${egg ? " shake" : ""}`}>
    <div className="wallpaper" />
    {egg && <div className="egg"><div className="egg-toast">🥁 nice one — Neil Peart energy.</div>{Array.from({ length: 12 }).map((_, i) => <span key={i} className="egg-note" style={{ left: `${(i * 8.3) % 100}%`, animationDelay: `${i * 0.05}s` }}>{i % 2 ? "♪" : "♫"}</span>)}</div>}
    <aside className="desktop-icons">
      <a href="#portfolio">▣<span>My Projects</span></a>
      <a href="https://github.com/max-lopzzz" target="_blank">⌘<span>GitHub</span></a>
      <button onClick={() => (music ? setMusic(false) : openPlayer())}>♫<span>Music.exe</span></button>
      <button onClick={() => (hobbies ? setHobbies(false) : openHobbies())}>❖<span>Hobbies</span></button>
      <button onClick={() => (terminalOpen ? setTerminalOpen(false) : openTerminal())}>▤<span>Terminal</span></button>
    </aside>
    <Window id="portfolio" title="max_portfolio.exe" className="portfolio" zIndex={zMap.portfolio} onFocus={focus}>
      <div className="menu"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div>
      <div className="portfolio-content" id="portfolio">
        <div className="banner"><p>MAXIMILIANO LÓPEZ MONTAÑO</p><h1>hello, internet.</h1><span>software · games · weird little tools</span></div>
        <article className="intro98"><div className="pixel-face">:)</div><p>Hi, I’m Max. I’m a CS student from Monterrey who likes making software that feels useful, friendly, and a bit more human than it has to be.</p></article>
        <h2>✦ project folder</h2>
        <div className="projects">{projects.map(({ name, copy, progress, slug }) => <a key={slug} href={repo + slug} target="_blank" className="project98"><b>▦ {name}</b><p>{copy}</p><div className="meter"><i style={{ width: progress }} /></div><small>status: {progress} complete</small></a>)}</div>
        <h2>✦ things I do</h2>
        <div className="services"><span>web apps</span><span>indie games</span><span>product design</span><span>software experiments</span></div>
        <h2>✦ frequently asked questions</h2>
        <details><summary>What are you working on right now?</summary><p>Mostly PakuPaku, work projects for civil-society organizations, and whatever I can’t stop thinking about.</p></details>
        <details><summary>Can I say hi?</summary><p>Yes please. Email is best: <a href="mailto:m.lopz.montn@gmail.com">m.lopz.montn@gmail.com</a></p></details>
      </div>
    </Window>
    {about && <Window id="about" title="about_max.txt" className="about" zIndex={zMap.about} onFocus={focus} onClose={() => setAbout(false)}><div className="about-body"><b>Max has logged on.</b><p>Engineering in Computer Technologies @ Tec de Monterrey. Software engineer, indie maker, game developer, drummer.</p><p>Currently making things for NGOs and people who need them.</p><a href="mailto:m.lopz.montn@gmail.com">send email ↗</a></div></Window>}
    {hobbies && <Window id="hobbies" title="hobbies.exe" className="hobbies" zIndex={zMap.hobbies} onFocus={focus} onClose={() => setHobbies(false)}>
      <div className="hobbies-body">
        <div className="hobby-card"><b>🧵 bead art</b><p>I turn pixel-art patterns into perler bead grids — color-matched, no guessing. Built a whole tool for it.</p><a href="https://beadart-sable.vercel.app/" target="_blank">open beadart-sable ↗</a></div>
        <div className="hobby-card"><b>🥁 drums</b><p>Currently learning Tom Sawyer by Rush — Neil Peart’s fills are humbling. Give it a listen:</p><Beep onClick={openPlayer}>▶ open player</Beep></div>
      </div>
    </Window>}
    {music && <Window id="player" title="tiny media player" className="player" zIndex={zMap.player} onFocus={focus} onClose={() => setMusic(false)} resizable={false}><MusicPlayer /></Window>}
    {terminalOpen && <Window id="terminal" title="terminal.exe" className="terminal-window" zIndex={zMap.terminal} onFocus={focus} onClose={() => setTerminalOpen(false)}><Terminal projects={projects} onOpenHobbies={openHobbies} onOpenPlayer={openPlayer} /></Window>}
    <footer className="taskbar"><Beep>▣ Start</Beep><span>max_portfolio.exe</span><time>{clock}</time></footer>
    <div className="scanlines" /><div className="crt-roll" />
  </main>;
}
