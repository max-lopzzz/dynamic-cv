"use client";
import { useEffect, useRef, useState } from "react";
import { Window } from "./components/Window";
import { Beep } from "./components/Beep";
import { MusicPlayer } from "./components/MusicPlayer";
import { Guestbook } from "./components/Guestbook";
import { Terminal } from "./terminal";
import { projects } from "./projects";
import { drumFill } from "./sound";

type Stage = "boot" | "login" | "desktop";
const beadArtShareUrl = process.env.NEXT_PUBLIC_BEADART_SHARE_URL;
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

export default function Home() {
  const [stage, setStage] = useState<Stage>("boot");
  const [clock, setClock] = useState("");
  const [about, setAbout] = useState(true);
  const [portfolio, setPortfolio] = useState(true);
  const [music, setMusic] = useState(false);
  const [hobbies, setHobbies] = useState(false);
  const [guestbook, setGuestbook] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [egg, setEgg] = useState(false);
  const [zMap, setZMap] = useState<Record<string, number>>({ portfolio: 21, about: 22, hobbies: 23, player: 24, terminal: 25, guestbook: 26 });
  const zCounter = useRef(27);
  const keyBuffer = useRef<string[]>([]);

  function focus(id: string) { setZMap((m) => ({ ...m, [id]: zCounter.current++ })); }
  function openHobbies() { setHobbies(true); focus("hobbies"); }
  function openPlayer() { setMusic(true); focus("player"); }
  function openTerminal() { setTerminalOpen(true); focus("terminal"); }
  function openGuestbook() { setGuestbook(true); focus("guestbook"); }

  function toggleWindow(
    id: string,
    isOpen: boolean,
    setOpen: (value: boolean) => void
  ) {
    if (!isOpen) {
      setOpen(true);
    }

    focus(id);
  }

  function openPortfolio() {
    setPortfolio(true);
    focus("portfolio");
  }

  function openAbout() {
    setAbout(true);
    focus("about");
  }

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
      <button
        onClick={() => {
          setPortfolio(true);
          focus("portfolio");
        }}
      >
        ▣
        <span>My Projects</span>
      </button>

      <button
        onClick={() => {
          setAbout(true);
          focus("about");
        }}
      >
        👤
        <span>About Max</span>
      </button>

      <a
        href="https://github.com/max-lopzzz"
        target="_blank"
        rel="noreferrer"
      >
        ⌘
        <span>GitHub</span>
      </a>

      <a
        href="https://ko-fi.com/P5P61TI6BS"
        target="_blank"
        rel="noreferrer"
      >
        ☕
        <span>Ko-fi</span>
      </a>

      <a
        href="https://discord.com/users/605435789010141207"
        target="_blank"
        rel="noreferrer"
      >
        💬
        <span>Discord</span>
      </a>

      <button
        onClick={() => (music ? setMusic(false) : openPlayer())}
      >
        ♫
        <span>Music.exe</span>
      </button>

      <button
        onClick={() => (hobbies ? setHobbies(false) : openHobbies())}
      >
        ❖
        <span>Hobbies</span>
      </button>

      <button
        onClick={() =>
          terminalOpen ? setTerminalOpen(false) : openTerminal()
        }
      >
        ▤
        <span>Terminal</span>
      </button>

      <button
        onClick={() =>
          guestbook ? setGuestbook(false) : openGuestbook()
        }
      >
        📖
        <span>Guestbook</span>
      </button>
    </aside>
    {portfolio && (
      <Window
        id="portfolio"
        title="max_portfolio.exe"
        className="portfolio"
        zIndex={zMap.portfolio}
        onFocus={focus}
        onClose={() => setPortfolio(false)}
      >
      <div className="menu"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div>
      <div className="portfolio-content" id="portfolio">
        <div className="banner"><p>MAXIMILIANO LÓPEZ MONTAÑO</p><h1>hello, internet.</h1><span>software · games · weird little tools</span></div>
        <article className="intro98"><div className="pixel-face">:)</div><p>Hi, I’m Max. I’m a CS student from Monterrey who likes making software that feels useful, friendly, and a bit more human than it has to be.</p></article>
        <div className="section-heading">
          <div>
            <h2>✦ project folder</h2>
            <p>things i've made, broken, fixed, and shipped.</p>
          </div>

          <span>8 ITEMS</span>
        </div>
        <div className="projects">
          {projects.map(
            ({
              name,
              copy,
              progress,
              slug,
              technologies,
              status,
              github,
              demo,
            }) => (
              <article key={slug} className="project98">
                <b>▦ {name}</b>

                <p>{copy}</p>

                <div className="project-tech">
                  {technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>

                <div className="meter">
                  <i style={{ width: progress }} />
                </div>

                <small>
                  status: {status} · {progress}
                </small>

                <div className="project-links">
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub ↗
                  </a>

                  {demo && (
                    <a
                      href={demo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      live ↗
                    </a>
                  )}
                </div>
              </article>
            )
          )}
        </div>
        <h2>✦ things I do</h2>
        <div className="services"><span>web apps</span><span>indie games</span><span>product design</span><span>software experiments</span></div>
        <h2>✦ frequently asked questions</h2>
        <details><summary>What are you working on right now?</summary><p>Mostly PakuPaku, work projects for civil-society organizations, and whatever I can’t stop thinking about.</p></details>
        <details><summary>Can I say hi?</summary><p>Yes please. Email is best: <a href="mailto:m.lopz.montn@gmail.com">m.lopz.montn@gmail.com</a> — or send feedback on <a href="https://discord.com/users/605435789010141207" target="_blank">Discord ↗</a>.</p></details>
        <p className="kofi-cta"><a className="bevel" href="https://ko-fi.com/P5P61TI6BS" target="_blank">☕ buy me a Ko-fi ↗</a></p>
      </div>
    </Window>
    )}
    {about && <Window id="about" title="about_max.txt" className="about" zIndex={zMap.about} onFocus={focus} onClose={() => setAbout(false)}><div className="about-body"><b>Max has logged on.</b><p>Engineering in Computer Technologies @ Tec de Monterrey. Software engineer, indie maker, game developer, drummer.</p><p>Currently making things for NGOs and people who need them.</p><a href="mailto:m.lopz.montn@gmail.com">send email ↗</a></div></Window>}
    {hobbies && <Window id="hobbies" title="hobbies.exe" className="hobbies" zIndex={zMap.hobbies} onFocus={focus} onClose={() => setHobbies(false)}>
      <div className="hobbies-body">
        <div className="hobby-card"><b>🧵 bead art</b><p>I turn pixel-art patterns into perler bead grids — color-matched, no guessing. Built a whole tool for it.</p>{beadArtShareUrl && <iframe src={beadArtShareUrl} className="beadart-embed" title="Current bead art progress" loading="lazy" />}<a href="https://beadart-sable.vercel.app/" target="_blank">open beadart-sable ↗</a></div>
        <div className="hobby-card"><b>🥁 drums</b><p>Currently learning Tom Sawyer by Rush — Neil Peart’s fills are humbling. Give it a listen:</p><Beep onClick={openPlayer}>▶ open player</Beep></div>
      </div>
    </Window>}
    {music && <Window id="player" title="tiny media player" className="player" zIndex={zMap.player} onFocus={focus} onClose={() => setMusic(false)} resizable={false}><MusicPlayer /></Window>}
    {terminalOpen && <Window id="terminal" title="terminal.exe" className="terminal-window" zIndex={zMap.terminal} onFocus={focus} onClose={() => setTerminalOpen(false)}><Terminal projects={projects} onOpenHobbies={openHobbies} onOpenPlayer={openPlayer} onOpenGuestbook={openGuestbook} /></Window>}
    {guestbook && <Window id="guestbook" title="guestbook.exe" className="guestbook" zIndex={zMap.guestbook} onFocus={focus} onClose={() => setGuestbook(false)}><Guestbook /></Window>}
    <footer className="taskbar">
      <Beep>▣ Start</Beep>

      {portfolio && (
        <button
          type="button"
          className="taskbar-window"
          onClick={() => {
            openPortfolio();
          }}
        >
          max_portfolio.exe
        </button>
      )}

      {about && (
        <button
          type="button"
          className="taskbar-window"
          onClick={() => {
            openAbout();
          }}
        >
          about_max.txt
        </button>
      )}

      {hobbies && (
        <button
          type="button"
          className="taskbar-window"
          onClick={() => {
            openHobbies();
          }}
        >
          hobbies.exe
        </button>
      )}

      {music && (
        <button
          type="button"
          className="taskbar-window"
          onClick={() => {
            openPlayer();
          }}
        >
          tiny media player
        </button>
      )}

      {terminalOpen && (
        <button
          type="button"
          className="taskbar-window"
          onClick={() => {
            openTerminal();
          }}
        >
          terminal.exe
        </button>
      )}

      {guestbook && (
        <button
          type="button"
          className="taskbar-window"
          onClick={() => {
            openGuestbook();
          }}
        >
          guestbook.exe
        </button>
      )}

      <time>{clock}</time>
    </footer>
    <div className="scanlines" /><div className="crt-roll" />
  </main>;
}
