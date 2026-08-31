"use client";

import { useEffect, useRef, useState } from "react";

import { Window } from "./components/Window";
import { Beep } from "./components/Beep";
import { CRTScreen } from "./components/CRTScreen";
import { MusicPlayer } from "./components/MusicPlayer";
import { Guestbook } from "./components/Guestbook";
import { WallOfKindWords } from "./components/WallOfKindWords";
import { AssetIcon } from "./components/AssetIcon";
import { Terminal } from "./terminal";
import { AchievementToast } from "./components/AchievementToast";
import { projects, Category } from "./projects";
import { playWindowsSound } from "./sound";
import { nowItems, nowUpdatedAt } from "./now";
import { funStats } from "./devstats";
import {
  achievements,
  loadUnlockedAchievements,
  saveUnlockedAchievements,
} from "./achievements";

type Stage = "boot" | "login" | "desktop";

const beadArtShareUrl =
  process.env.NEXT_PUBLIC_BEADART_SHARE_URL;

const GITHUB_USERNAME = "max-lopzzz";

const KONAMI = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

const icons = {
  projects: "/assets/icons/Folder Open.ico",
  about: "/assets/icons/My Profile Folder.ico",
  now: "/assets/icons/Monitor.ico",
  github: "/assets/icons/My Computer.ico",
  kofi: "/assets/icons/Sounds, Speech, and Audio Devices.ico",
  discord: "/assets/icons/Phone.ico",
  music: "/assets/icons/Music File.ico",
  hobbies: "/assets/icons/Game Controller.ico",
  terminal: "/assets/icons/Manage your Server.ico",
  guestbook: "/assets/icons/List File.ico",
  hireMe: "/assets/icons/User Support.ico",
  devStats: "/assets/icons/System Properties.ico",
  wall: "/assets/icons/Hearts.ico",
  achievements: "/assets/icons/Freecell.ico",
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("boot");
  const [clock, setClock] = useState("");

  const [about, setAbout] = useState(true);
  const [now, setNow] = useState(false);
  const [portfolio, setPortfolio] = useState(true);
  const [music, setMusic] = useState(false);
  const [hobbies, setHobbies] = useState(false);
  const [guestbook, setGuestbook] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [hireMe, setHireMe] = useState(false);
  const [devStats, setDevStats] = useState(false);
  const [wall, setWall] = useState(false);
  const [achievementsOpen, setAchievementsOpen] =
    useState(false);
  const [unlocked, setUnlocked] = useState<string[]>(
    []
  );
  const [achievementToast, setAchievementToast] =
    useState<
      (typeof achievements)[number] | null
    >(null);
  const [githubRepoCount, setGithubRepoCount] =
    useState<number | null>(null);
  const [githubCommitCount, setGithubCommitCount] =
    useState<number | null>(null);

  const [egg, setEgg] = useState(false);
  const [godMode, setGodMode] = useState(false);
  const [logoSecret, setLogoSecret] = useState(false);

  const [projectFilter, setProjectFilter] =
    useState<"all" | Category>("all");

  const [selectedProject, setSelectedProject] =
    useState<(typeof projects)[number] | null>(null);

  const [zMap, setZMap] = useState<Record<string, number>>({
    portfolio: 21,
    about: 22,
    now: 23,
    hobbies: 24,
    player: 25,
    terminal: 26,
    guestbook: 27,
    projectDetails: 28,
    hireMe: 29,
    devStats: 30,
    wall: 31,
    achievements: 32,
  });

  const zCounter = useRef(33);
  const keyBuffer = useRef<string[]>([]);
  const letterBuffer = useRef<string[]>([]);
  const logoClicks = useRef(0);
  const logoClicksTimer = useRef<number | null>(
    null
  );
  const filtersTried = useRef<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setUnlocked(loadUnlockedAchievements());
  }, []);

  function unlock(id: string) {
    setUnlocked((current) => {
      if (current.includes(id)) return current;

      const next = [...current, id];
      saveUnlockedAchievements(next);

      const found = achievements.find(
        (a) => a.id === id
      );

      if (found) {
        setAchievementToast(found);
        playWindowsSound("notify", 0.5);

        window.setTimeout(() => {
          setAchievementToast(null);
        }, 3200);
      }

      return next;
    });
  }

  function focus(id: string) {
    setZMap((current) => ({
      ...current,
      [id]: zCounter.current++,
    }));
  }

  function openHobbies() {
    setHobbies(true);
    focus("hobbies");
    playWindowsSound("open");
  }

  function openPlayer() {
    setMusic(true);
    focus("player");
    playWindowsSound("open");
  }

  function openTerminal() {
    setTerminalOpen(true);
    focus("terminal");
    playWindowsSound("open");
    unlock("terminal");
  }

  function openGuestbook() {
    setGuestbook(true);
    focus("guestbook");
    playWindowsSound("open");
  }

  function openPortfolio() {
    setPortfolio(true);
    focus("portfolio");
    playWindowsSound("open");
  }

  function openAbout() {
    setAbout(true);
    focus("about");
    playWindowsSound("open");
  }

  function openNow() {
    setNow(true);
    focus("now");
    playWindowsSound("open");
  }

  function openHireMe() {
    setHireMe(true);
    focus("hireMe");
    playWindowsSound("open");
    unlock("hire-me");
  }

  function openDevStats() {
    setDevStats(true);
    focus("devStats");
    playWindowsSound("open");
  }

  function openWall() {
    setWall(true);
    focus("wall");
    playWindowsSound("open");
  }

  function openAchievements() {
    setAchievementsOpen(true);
    focus("achievements");
    playWindowsSound("open");
  }

  function handleLogoClick() {
    playWindowsSound("click", 0.3);

    logoClicks.current += 1;

    if (logoClicksTimer.current) {
      window.clearTimeout(
        logoClicksTimer.current
      );
    }

    if (logoClicks.current >= 5) {
      logoClicks.current = 0;
      setLogoSecret(true);
      playWindowsSound("success");
      unlock("logo-secret");

      window.setTimeout(() => {
        setLogoSecret(false);
      }, 2200);

      return;
    }

    logoClicksTimer.current = window.setTimeout(
      () => {
        logoClicks.current = 0;
      },
      1200
    );
  }

  function openProjectDetails(
    project: (typeof projects)[number]
  ) {
    setSelectedProject(project);
    focus("projectDetails");
    playWindowsSound("open");
  }

  function closeProjectDetails() {
    setSelectedProject(null);
    playWindowsSound("close");
  }

  function closeWindow(
    setOpen: (value: boolean) => void
  ) {
    setOpen(false);
    playWindowsSound("close");
  }

  useEffect(() => {
    let cancelled = false;

    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`
    )
      .then((res) =>
        res.ok ? res.json() : null
      )
      .then((data) => {
        if (
          !cancelled &&
          typeof data?.public_repos === "number"
        ) {
          setGithubRepoCount(data.public_repos);
        }
      })
      .catch(() => {
        // Silently fall back to the local project count below.
      });

    fetch(
      `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&per_page=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    )
      .then((res) =>
        res.ok ? res.json() : null
      )
      .then((data) => {
        if (
          !cancelled &&
          typeof data?.total_count === "number"
        ) {
          setGithubCommitCount(data.total_count);
        }
      })
      .catch(() => {
        // Silently omit the commits row below.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        stage === "boot"
      ) {
        playWindowsSound("startup", 0.55);
        setStage("login");
      }
    };

    const handleKonami = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      keyBuffer.current = [
        ...keyBuffer.current,
        key,
      ].slice(-KONAMI.length);

      if (
        stage === "desktop" &&
        !egg &&
        keyBuffer.current.join(",") ===
          KONAMI.join(",")
      ) {
        setEgg(true);
        playWindowsSound("success");
        unlock("konami");

        window.setTimeout(() => {
          setEgg(false);
          keyBuffer.current = [];
        }, 1800);
      }
    };

    const handleGodMode = (
      event: KeyboardEvent
    ) => {
      if (stage !== "desktop") return;

      const key = event.key.toLowerCase();

      /*
       * Solo trackeamos letras individuales,
       * para no chocar con el buffer de flechas
       * del Konami code de arriba.
       */
      if (key.length !== 1 || !/[a-z]/.test(key)) {
        return;
      }

      letterBuffer.current = [
        ...letterBuffer.current,
        key,
      ].slice(-5);

      if (
        letterBuffer.current.join("") === "iddqd"
      ) {
        setGodMode((current) => {
          if (!current) unlock("godmode");
          return !current;
        });
        playWindowsSound("success");
        letterBuffer.current = [];
      }
    };

    const handleGlobalClick = (
      event: MouseEvent
    ) => {
      if (stage !== "desktop") return;
      if (egg) return;

      const target =
        event.target as HTMLElement | null;

      if (!target) return;

      const clickable = target.closest(
        "button, a, summary, input[type='range']"
      ) as HTMLElement | null;

      if (!clickable) return;

      /*
       * Algunos elementos ya reproducen su propio
       * sonido explícitamente. Evitamos duplicarlo.
       */

      if (
        clickable.closest(".titlebar") ||
        clickable.closest(".project-links") ||
        clickable.closest(".taskbar")
      ) {
        return;
      }

      /*
       * Enlaces que no tienen sonido explícito.
       */
      if (clickable.tagName === "A") {
        playWindowsSound("click", 0.22);
        return;
      }

      /*
       * Iconos del escritorio.
       */
      if (
        clickable.closest(".desktop-icons")
      ) {
        return;
      }

      /*
       * Filtros de proyectos.
       */
      if (
        clickable.closest(".project-filters")
      ) {
        return;
      }

      /*
       * FAQ / details.
       */
      if (clickable.matches("summary")) {
        playWindowsSound("click", 0.22);
      }
    };

    window.addEventListener(
      "keydown",
      handleEnter
    );

    window.addEventListener(
      "keydown",
      handleKonami
    );

    window.addEventListener(
      "keydown",
      handleGodMode
    );

    window.addEventListener(
      "click",
      handleGlobalClick
    );

    const timer = window.setInterval(() => {
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEnter
      );

      window.removeEventListener(
        "keydown",
        handleKonami
      );

      window.removeEventListener(
        "keydown",
        handleGodMode
      );

      window.removeEventListener(
        "click",
        handleGlobalClick
      );

      window.clearInterval(timer);
    };
  }, [stage, egg]);

  /*
   * ========================================================
   * BOOT
   * ========================================================
   */

  if (stage === "boot") {
    return (
      <CRTScreen intensity="strong">
        <main
          className="boot"
          onClick={() => {
            playWindowsSound(
              "startup",
              0.55
            );

            setStage("login");
          }}
        >
          <pre>{`MAX BIOS v0.98

  Checking memory... OK
  Loading: MAXIMILIANO.EXE

  Loading: PROJECTS.DAT
  Loading: DRUMS.MID
  Loading: WINDOWS98.ASSETS

  Press ENTER to continue_`}</pre>
        </main>
      </CRTScreen>
    );
  }

  /*
   * ========================================================
   * LOGIN
   * ========================================================
   */

  if (stage === "login") {
    return (
      <CRTScreen intensity="medium">
        <main className="login">
          <Window
            title="Welcome to MaxOS"
            resizable={false}
          >
            <div className="login-body">
              <AssetIcon
                src={icons.about}
                size={48}
              />

              <div className="avatar">
                M
              </div>

              <h1>Maximiliano</h1>

              <p>
                Click to enter the desktop.
              </p>

              <Beep
                onClick={() => {
                  playWindowsSound(
                    "startup",
                    0.55
                  );

                  setStage("desktop");
                }}
              >
                Enter
              </Beep>
            </div>
          </Window>
        </main>
      </CRTScreen>
    );
  }

  /*
   * ========================================================
   * DESKTOP
   * ========================================================
   */

  return (
    <main
      className={`desktop${egg ? " shake" : ""}${
        godMode ? " godmode" : ""
      }`}
    >
      <div className="wallpaper" />

      {/* ==================================================
          KONAMI EASTER EGG
          ================================================== */}

      {egg && (
        <div
          className="egg"
          aria-hidden="true"
        >
          <div className="egg-toast">
            🥁 nice one — Neil Peart energy.
          </div>

          {Array.from({
            length: 12,
          }).map((_, i) => (
            <span
              key={i}
              className="egg-note"
              style={{
                left: `${(i * 8.3) % 100}%`,
                animationDelay: `${
                  i * 0.05
                }s`,
              }}
            >
              {i % 2 === 0 ? "♫" : "♪"}
            </span>
          ))}
        </div>
      )}

      {/* ==================================================
          GOD MODE (iddqd)
          ================================================== */}

      {godMode && (
        <div
          className="godmode-badge"
          aria-hidden="true"
        >
          🕹️ god mode on — infinite
          coffee, zero bugs (probably)
          <span className="godmode-hint">
            type iddqd again to turn off
          </span>
        </div>
      )}

      {/* ==================================================
          LOGO SECRET (5 clicks on Start)
          ================================================== */}

      {logoSecret && (
        <div
          className="logo-secret"
          aria-hidden="true"
        >
          <div className="logo-secret-toast">
            🖱️ ooh, curious clicker — you
            found the secret.
          </div>

          {Array.from({
            length: 10,
          }).map((_, i) => (
            <span
              key={i}
              className="logo-secret-star"
              style={{
                left: `${(i * 10) % 100}%`,
                animationDelay: `${
                  i * 0.06
                }s`,
              }}
            >
              {i % 2 === 0 ? "⭐" : "✨"}
            </span>
          ))}
        </div>
      )}

      {/* ==================================================
          DESKTOP ICONS
          ================================================== */}

      <aside className="desktop-icons">
        <button
          type="button"
          onClick={openPortfolio}
        >
          <AssetIcon
            src={icons.projects}
          />

          <span>My Projects</span>
        </button>

        <button
          type="button"
          onClick={openAbout}
        >
          <AssetIcon
            src={icons.about}
          />

          <span>About Max</span>
        </button>

        <button
          type="button"
          onClick={() =>
            now
              ? closeWindow(setNow)
              : openNow()
          }
        >
          <AssetIcon
            src={icons.now}
          />

          <span>Now.exe</span>
        </button>

        <button
          type="button"
          onClick={() =>
            hireMe
              ? closeWindow(setHireMe)
              : openHireMe()
          }
        >
          <AssetIcon
            src={icons.hireMe}
          />

          <span>Hire Me.exe</span>
        </button>

        <button
          type="button"
          onClick={() =>
            devStats
              ? closeWindow(setDevStats)
              : openDevStats()
          }
        >
          <AssetIcon
            src={icons.devStats}
          />

          <span>Dev Stats.exe</span>
        </button>

        <a
          href="https://github.com/max-lopzzz"
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            playWindowsSound("open")
          }
        >
          <AssetIcon
            src={icons.github}
          />

          <span>GitHub</span>
        </a>

        <a
          href="https://ko-fi.com/P5P61TI6BS"
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            playWindowsSound("open")
          }
        >
          <AssetIcon
            src={icons.kofi}
          />

          <span>Ko-fi</span>
        </a>

        <a
          href="https://discord.com/users/605435789010141207"
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            playWindowsSound("open")
          }
        >
          <AssetIcon
            src={icons.discord}
          />

          <span>Discord</span>
        </a>

        <button
          type="button"
          onClick={() =>
            music
              ? closeWindow(setMusic)
              : openPlayer()
          }
        >
          <AssetIcon
            src={icons.music}
          />

          <span>Music.exe</span>
        </button>

        <button
          type="button"
          onClick={() =>
            hobbies
              ? closeWindow(setHobbies)
              : openHobbies()
          }
        >
          <AssetIcon
            src={icons.hobbies}
          />

          <span>Hobbies</span>
        </button>

        <button
          type="button"
          onClick={() =>
            terminalOpen
              ? closeWindow(
                  setTerminalOpen
                )
              : openTerminal()
          }
        >
          <AssetIcon
            src={icons.terminal}
          />

          <span>Terminal</span>
        </button>

        <button
          type="button"
          onClick={() =>
            guestbook
              ? closeWindow(
                  setGuestbook
                )
              : openGuestbook()
          }
        >
          <AssetIcon
            src={icons.guestbook}
          />

          <span>Guestbook</span>
        </button>

        <button
          type="button"
          onClick={() =>
            wall
              ? closeWindow(setWall)
              : openWall()
          }
        >
          <AssetIcon
            src={icons.wall}
          />

          <span>Kind Words</span>
        </button>

        <button
          type="button"
          onClick={() =>
            achievementsOpen
              ? closeWindow(
                  setAchievementsOpen
                )
              : openAchievements()
          }
        >
          <AssetIcon
            src={icons.achievements}
          />

          <span>
            Achievements ({unlocked.length}/
            {achievements.length})
          </span>
        </button>
      </aside>

      {/* ==================================================
          PORTFOLIO
          ================================================== */}

      {portfolio && (
        <Window
          id="portfolio"
          title="max_portfolio.exe"
          className="portfolio"
          zIndex={zMap.portfolio}
          onFocus={focus}
          onClose={() =>
            closeWindow(setPortfolio)
          }
        >
          <div className="menu">
            <span>
              <u>F</u>ile
            </span>

            <span>
              <u>E</u>dit
            </span>

            <span>
              <u>V</u>iew
            </span>

            <span>
              <u>H</u>elp
            </span>
          </div>

          <div
            className="portfolio-content"
            id="portfolio"
          >
            <div className="banner">
              <p>
                MAXIMILIANO LÓPEZ MONTAÑO
              </p>

              <h1>
                hello, internet.
              </h1>

              <span>
                software · games · weird
                little tools
              </span>
            </div>

            <article className="intro98">
              <div className="pixel-face">
                :)
              </div>

              <p>
                Hi, I’m Max. I’m a CS
                student from Monterrey
                who likes making software
                that feels useful,
                friendly, and a bit more
                human than it has to be.
              </p>
            </article>

            <div className="section-heading">
              <div>
                <h2>
                  ✦ project folder
                </h2>

                <p>
                  things i've made,
                  broken, fixed, and
                  shipped.
                </p>
              </div>

              <span>
                {projects.length} ITEMS
              </span>
            </div>

            {/* PROJECT FILTERS */}

            <div className="project-filters">
              {(
                [
                  "all",
                  "web",
                  "game",
                  "tool",
                ] as const
              ).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    projectFilter ===
                    option
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    setProjectFilter(
                      option
                    );

                    if (option !== "all") {
                      filtersTried.current.add(
                        option
                      );

                      if (
                        filtersTried.current
                          .size >= 3
                      ) {
                        unlock("all-filters");
                      }
                    }

                    playWindowsSound(
                      "click",
                      0.25
                    );
                  }}
                >
                  {option ===
                  "all"
                    ? "ALL"
                    : option === "web"
                      ? "WEB"
                      : option ===
                          "game"
                        ? "GAMES"
                        : "TOOLS"}
                </button>
              ))}
            </div>

            {/* PROJECTS */}

            <div className="projects">
              {projects
                .filter(
                  (project) =>
                    projectFilter ===
                      "all" ||
                    project.categories.includes(
                      projectFilter
                    )
                )
                .map((project) => {
                  const {
                    name,
                    copy,
                    progress,
                    slug,
                    technologies,
                    status,
                    github,
                    demo,
                  } = project;

                  return (
                    <article
                      key={slug}
                      className="project98"
                    >
                      <b>
                        ▦ {name}
                      </b>

                      <p>{copy}</p>

                      <div className="project-tech">
                        {technologies.map(
                          (
                            technology
                          ) => (
                            <span
                              key={
                                technology
                              }
                            >
                              {
                                technology
                              }
                            </span>
                          )
                        )}
                      </div>

                      <div className="meter">
                        <i
                          style={{
                            width:
                              progress,
                          }}
                        />
                      </div>

                      <small>
                        status:{" "}
                        {status} ·{" "}
                        {progress}
                      </small>

                      <div className="project-links">
                        <button
                          type="button"
                          className="project-details-button"
                          onClick={() =>
                            openProjectDetails(
                              project
                            )
                          }
                        >
                          details →
                        </button>

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
                  );
                })}
            </div>

            <h2>
              ✦ things I do
            </h2>

            <div className="services">
              <span>
                web apps
              </span>

              <span>
                indie games
              </span>

              <span>
                product design
              </span>

              <span>
                software experiments
              </span>
            </div>

            <h2>
              ✦ frequently asked
              questions
            </h2>

            <details>
              <summary>
                What are you working
                on right now?
              </summary>

              <p>
                Mostly PakuPaku, work
                projects for
                civil-society
                organizations, and
                whatever I can’t stop
                thinking about.
              </p>
            </details>

            <details>
              <summary>
                Can I say hi?
              </summary>

              <p>
                Yes please. Email is
                best:{" "}
                <a href="mailto:m.lopz.montn@gmail.com">
                  m.lopz.montn@gmail.com
                </a>{" "}
                — or send feedback
                on{" "}
                <a
                  href="https://discord.com/users/605435789010141207"
                  target="_blank"
                  rel="noreferrer"
                >
                  Discord ↗
                </a>
                .
              </p>
            </details>

            <p className="kofi-cta">
              <a
                className="bevel"
                href="https://ko-fi.com/P5P61TI6BS"
                target="_blank"
                rel="noreferrer"
              >
                ☕ buy me a Ko-fi ↗
              </a>
            </p>
          </div>
        </Window>
      )}

      {/* ==================================================
          PROJECT DETAILS
          ================================================== */}

      {selectedProject && (
        <Window
          id="projectDetails"
          title={`${selectedProject.name}.exe`}
          className="project-details-window"
          zIndex={
            zMap.projectDetails
          }
          onFocus={focus}
          onClose={
            closeProjectDetails
          }
          resizable={true}
        >
          <div className="project-details-body">
            <div className="project-details-header">
              <div>
                <span className="project-details-eyebrow">
                  PROJECT FILE
                </span>

                <h1>
                  {selectedProject.name}
                </h1>
              </div>

              <span className="project-details-status">
                {
                  selectedProject.status
                }
              </span>
            </div>

            <div className="project-details-divider" />

            <p className="project-details-description">
              {
                selectedProject.copy
              }
            </p>

            <h2>
              TECHNOLOGIES
            </h2>

            <div className="project-details-tech">
              {selectedProject.technologies.map(
                (technology) => (
                  <span
                    key={technology}
                  >
                    {technology}
                  </span>
                )
              )}
            </div>

            <h2>
              PROGRESS
            </h2>

            <div className="project-details-meter">
              <i
                style={{
                  width:
                    selectedProject.progress,
                }}
              />
            </div>

            <p className="project-details-progress">
              {
                selectedProject.progress
              }{" "}
              complete
            </p>

            <h2>
              LINKS
            </h2>

            <div className="project-details-actions">
              <a
                href={
                  selectedProject.github
                }
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>

              {selectedProject.demo && (
                <a
                  href={
                    selectedProject.demo
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Demo ↗
                </a>
              )}
            </div>

            <div className="project-details-footer">
              <span>
                C:\MAX\PROJECTS\
                {selectedProject.slug}
              </span>

              <span>
                {
                  selectedProject.slug
                }
                .dat
              </span>
            </div>
          </div>
        </Window>
      )}

      {/* ==================================================
          ABOUT
          ================================================== */}

      {about && (
        <Window
          id="about"
          title="about_max.txt"
          className="about"
          zIndex={zMap.about}
          onFocus={focus}
          onClose={() =>
            closeWindow(setAbout)
          }
        >
          <div className="about-body">
            <b>
              Max has logged on.
            </b>

            <p>
              Engineering in Computer
              Technologies @ Tec de
              Monterrey. Software
              engineer, indie maker,
              game developer, drummer.
            </p>

            <p>
              Currently making things
              for NGOs and people who
              need them.
            </p>

            <a href="mailto:m.lopz.montn@gmail.com">
              send email ↗
            </a>
          </div>
        </Window>
      )}

      {/* ==================================================
          NOW
          ================================================== */}

      {now && (
        <Window
          id="now"
          title="now.exe"
          className="now"
          zIndex={zMap.now}
          onFocus={focus}
          onClose={() =>
            closeWindow(setNow)
          }
        >
          <div className="now-body">
            {nowItems.map((item) => (
              <div
                className="now-row"
                key={item.label}
              >
                <b>
                  {item.emoji}{" "}
                  {item.label}:
                </b>

                <span>
                  {item.value}
                </span>
              </div>
            ))}

            <p className="now-updated">
              last updated{" "}
              {nowUpdatedAt}
            </p>
          </div>
        </Window>
      )}

      {/* ==================================================
          HIRE ME
          ================================================== */}

      {hireMe && (
        <Window
          id="hireMe"
          title="hire_me.exe"
          className="hire-me"
          zIndex={zMap.hireMe}
          onFocus={focus}
          onClose={() =>
            closeWindow(setHireMe)
          }
        >
          <div className="hire-me-body">
            <b>let&apos;s build something.</b>

            <p>
              need a website? have a
              weird idea? need a
              little tool built?
            </p>

            <div className="hire-me-links">
              <a
                className="bevel"
                href="https://www.upwork.com/freelancers/~0161289b05445bca4e?mp_source=share"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  playWindowsSound("open")
                }
              >
                🅄 upwork ↗
              </a>

              <a
                className="bevel"
                href="https://www.fiverr.com/s/r37aYkr"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  playWindowsSound("open")
                }
              >
                🅵 fiverr ↗
              </a>

              <a
                className="bevel"
                href="https://contra.com/maximiliano_lopez"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  playWindowsSound("open")
                }
              >
                🅲 contra ↗
              </a>

              <a
                className="bevel"
                href="mailto:m.lopz.montn@gmail.com?subject=Let%27s%20build%20something"
                onClick={() =>
                  playWindowsSound("open")
                }
              >
                ✉ email me
              </a>

              <a
                className="bevel"
                href="https://github.com/max-lopzzz"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  playWindowsSound("open")
                }
              >
                ⌘ github ↗
              </a>

              <a
                className="bevel"
                href="https://discord.com/users/605435789010141207"
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  playWindowsSound("open")
                }
              >
                💬 discord ↗
              </a>
            </div>

            <p className="hire-me-note">
              usually reply within a
              day or two.
            </p>
          </div>
        </Window>
      )}

      {/* ==================================================
          DEV STATS
          ================================================== */}

      {devStats && (
        <Window
          id="devStats"
          title="devstats.exe"
          className="dev-stats"
          zIndex={zMap.devStats}
          onFocus={focus}
          onClose={() =>
            closeWindow(setDevStats)
          }
        >
          <div className="dev-stats-body">
            <div className="dev-stats-row">
              <b>📁 projects</b>
              <span>
                {String(
                  projects.length
                ).padStart(2, "0")}
              </span>
            </div>

            <div className="dev-stats-row">
              <b>🐙 github repos</b>
              <span>
                {String(
                  githubRepoCount ??
                    projects.length
                ).padStart(2, "0")}
                {githubRepoCount === null && "*"}
              </span>
            </div>

            {githubCommitCount !== null && (
              <div className="dev-stats-row">
                <b>⌨️ commits</b>
                <span>
                  {githubCommitCount.toLocaleString()}
                </span>
              </div>
            )}

            {funStats.map((stat) => (
              <div
                className="dev-stats-row"
                key={stat.label}
              >
                <b>
                  {stat.emoji}{" "}
                  {stat.label}
                </b>
                <span>{stat.value}</span>
              </div>
            ))}

            {githubRepoCount === null && (
              <p className="dev-stats-note">
                * live count unavailable,
                showing local project
                count
              </p>
            )}
          </div>
        </Window>
      )}

      {/* ==================================================
          HOBBIES
          ================================================== */}

      {hobbies && (
        <Window
          id="hobbies"
          title="hobbies.exe"
          className="hobbies"
          zIndex={zMap.hobbies}
          onFocus={focus}
          onClose={() =>
            closeWindow(setHobbies)
          }
        >
          <div className="hobbies-body">
            <div className="hobby-card">
              <b>
                🧵 bead art
              </b>

              <p>
                I turn pixel-art
                patterns into perler
                bead grids —
                color-matched, no
                guessing. Built a
                whole tool for it.
              </p>

              {beadArtShareUrl && (
                <iframe
                  src={
                    beadArtShareUrl
                  }
                  className="beadart-embed"
                  title="Current bead art progress"
                  loading="lazy"
                />
              )}

              <a
                href="https://beadart-sable.vercel.app/"
                target="_blank"
                rel="noreferrer"
              >
                open beadart-sable ↗
              </a>
            </div>

            <div className="hobby-card">
              <b>
                🥁 drums
              </b>

              <p>
                Currently learning
                Tom Sawyer by Rush
                — Neil Peart’s fills
                are humbling. Give
                it a listen:
              </p>

              <Beep
                onClick={openPlayer}
              >
                ▶ open player
              </Beep>
            </div>
          </div>
        </Window>
      )}

      {/* ==================================================
          MUSIC PLAYER
          ================================================== */}

      {music && (
        <Window
          id="player"
          title="tiny media player"
          className="player"
          zIndex={zMap.player}
          onFocus={focus}
          onClose={() =>
            closeWindow(setMusic)
          }
          resizable={false}
        >
          <MusicPlayer />
        </Window>
      )}

      {/* ==================================================
          TERMINAL
          ================================================== */}

      {terminalOpen && (
        <Window
          id="terminal"
          title="terminal.exe"
          className="terminal-window"
          zIndex={zMap.terminal}
          onFocus={focus}
          onClose={() =>
            closeWindow(
              setTerminalOpen
            )
          }
        >
          <Terminal
            projects={projects}
            onOpenHobbies={
              openHobbies
            }
            onOpenPlayer={
              openPlayer
            }
            onOpenGuestbook={
              openGuestbook
            }
            onNeofetch={() =>
              unlock("neofetch")
            }
            onSecretFound={() =>
              unlock("secret-page")
            }
          />
        </Window>
      )}

      {/* ==================================================
          GUESTBOOK
          ================================================== */}

      {guestbook && (
        <Window
          id="guestbook"
          title="guestbook.exe"
          className="guestbook"
          zIndex={zMap.guestbook}
          onFocus={focus}
          onClose={() =>
            closeWindow(
              setGuestbook
            )
          }
        >
          <Guestbook
            onSubmitted={() =>
              unlock("guestbook-signed")
            }
          />
        </Window>
      )}

      {/* ==================================================
          WALL OF KIND WORDS
          ================================================== */}

      {wall && (
        <Window
          id="wall"
          title="kind_words.exe"
          className="wall"
          zIndex={zMap.wall}
          onFocus={focus}
          onClose={() =>
            closeWindow(setWall)
          }
        >
          <WallOfKindWords
            onSign={() => {
              setWall(false);
              openGuestbook();
            }}
          />
        </Window>
      )}

      {/* ==================================================
          ACHIEVEMENTS
          ================================================== */}

      {achievementsOpen && (
        <Window
          id="achievements"
          title="achievements.exe"
          className="achievements"
          zIndex={zMap.achievements}
          onFocus={focus}
          onClose={() =>
            closeWindow(
              setAchievementsOpen
            )
          }
        >
          <div className="achievements-body">
            <p className="achievements-intro">
              {unlocked.length} of{" "}
              {achievements.length} unlocked
              — poke around to find the
              rest.
            </p>

            <div className="achievements-list">
              {achievements.map((a) => {
                const isUnlocked =
                  unlocked.includes(a.id);

                return (
                  <div
                    key={a.id}
                    className={
                      isUnlocked
                        ? "achievement-row unlocked"
                        : "achievement-row"
                    }
                  >
                    <span className="achievement-emoji">
                      {isUnlocked
                        ? a.emoji
                        : "🔒"}
                    </span>

                    <div>
                      <b>
                        {isUnlocked
                          ? a.title
                          : "???"}
                      </b>

                      <p>
                        {isUnlocked
                          ? a.description
                          : "keep exploring…"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Window>
      )}

      {/* ==================================================
          ACHIEVEMENT TOAST
          ================================================== */}

      {achievementToast && (
        <div
          className="achievement-toast"
          aria-hidden="true"
        >
          <span className="achievement-toast-emoji">
            {achievementToast.emoji}
          </span>

          <div>
            <b>Achievement unlocked!</b>
            <p>{achievementToast.title}</p>
          </div>
        </div>
      )}

      {/* ==================================================
          TASKBAR
          ================================================== */}

      <footer className="taskbar">
        <Beep
          onClick={handleLogoClick}
        >
          <AssetIcon
            src="/assets/icons/Folder Closed.ico"
            size={16}
          />{" "}
          Start
        </Beep>

        {portfolio && (
          <button
            type="button"
            className="taskbar-window"
            onClick={
              openPortfolio
            }
          >
            max_portfolio.exe
          </button>
        )}

        {about && (
          <button
            type="button"
            className="taskbar-window"
            onClick={openAbout}
          >
            about_max.txt
          </button>
        )}

        {now && (
          <button
            type="button"
            className="taskbar-window"
            onClick={openNow}
          >
            now.exe
          </button>
        )}

        {hireMe && (
          <button
            type="button"
            className="taskbar-window"
            onClick={openHireMe}
          >
            hire_me.exe
          </button>
        )}

        {devStats && (
          <button
            type="button"
            className="taskbar-window"
            onClick={openDevStats}
          >
            devstats.exe
          </button>
        )}

        {hobbies && (
          <button
            type="button"
            className="taskbar-window"
            onClick={
              openHobbies
            }
          >
            hobbies.exe
          </button>
        )}

        {music && (
          <button
            type="button"
            className="taskbar-window"
            onClick={openPlayer}
          >
            tiny media player
          </button>
        )}

        {terminalOpen && (
          <button
            type="button"
            className="taskbar-window"
            onClick={
              openTerminal
            }
          >
            terminal.exe
          </button>
        )}

        {guestbook && (
          <button
            type="button"
            className="taskbar-window"
            onClick={
              openGuestbook
            }
          >
            guestbook.exe
          </button>
        )}

        {wall && (
          <button
            type="button"
            className="taskbar-window"
            onClick={openWall}
          >
            kind_words.exe
          </button>
        )}

        {achievementsOpen && (
          <button
            type="button"
            className="taskbar-window"
            onClick={openAchievements}
          >
            achievements.exe
          </button>
        )}

        {selectedProject && (
          <button
            type="button"
            className="taskbar-window"
            onClick={() =>
              focus(
                "projectDetails"
              )
            }
          >
            {
              selectedProject.name
            }
            .exe
          </button>
        )}

        <time>{clock}</time>
      </footer>

      <div className="scanlines" />
      <div className="crt-roll" />
    </main>
  );
}
