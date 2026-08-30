"use client";

import { FormEvent, useState } from "react";
import { Project } from "./projects";

const NEOFETCH_ART = [
  "  /\\_/\\  ",
  " ( o.o ) ",
  " ( > ^ <)",
  " /|  |  |\\",
  "(_|  |  |_)",
];

function neofetchLines(projectCount: number): string[] {
  const specs = [
    "max@dev",
    "-------",
    "OS: MaxOS 11 (Next.js)",
    "Host: dynamic-cv.vercel.app",
    "Uptime: since 2003",
    "Shell: zsh (fake)",
    "Terminal: max.dev v2.0",
    "CPU: Caffeine @ 3.8GHz",
    "Memory: 640KB, should be enough",
    `Projects: ${projectCount}`,
  ];
  const artWidth = Math.max(...NEOFETCH_ART.map((line) => line.length)) + 2;
  const rows = Math.max(NEOFETCH_ART.length, specs.length);
  const output: string[] = [];
  for (let i = 0; i < rows; i++) {
    const left = (NEOFETCH_ART[i] ?? "").padEnd(artWidth);
    const right = specs[i] ?? "";
    output.push(left + right);
  }
  return output;
}

export function Terminal({ projects, onOpenHobbies, onOpenPlayer, onOpenGuestbook }: { projects: Project[]; onOpenHobbies: () => void; onOpenPlayer: () => void; onOpenGuestbook: () => void }) {
  const [lines, setLines] = useState(["Welcome to max.dev terminal v2.0", "Type help to explore."]);
  const [command, setCommand] = useState("");

  function run(event: FormEvent) {
    event.preventDefault();
    const input = command.trim().toLowerCase();
    if (!input) return;
    if (input === "clear") { setLines([]); setCommand(""); return; }
    let reply: string | string[] = "command not found — try help";
    if (input === "help") reply = "help · projects · status · hobbies · play · guestbook · whoami · neofetch · clear · open [project]";
    if (input === "whoami") reply = "Maximiliano — CS student, software engineer, drummer, bead artist.";
    if (input === "projects") { reply = "scrolling to project archive…"; document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" }); }
    if (input === "status") reply = projects.map((project) => `${project.name} [${project.progress}]`).join(" · ");
    if (input === "hobbies") { reply = "opening hobbies.exe…"; onOpenHobbies(); }
    if (input === "play") { reply = "cueing up Tom Sawyer…"; onOpenPlayer(); }
    if (input === "guestbook" || input === "sign") { reply = "opening guestbook.exe — leave a note!"; onOpenGuestbook(); }
    if (input === "neofetch") reply = neofetchLines(projects.length);
    const match = input.match(/^open\s+(.+)/);
    if (match) {
      const project = projects.find((item) => item.slug === match[1].replaceAll(" ", ""));
      reply = project ? `highlighting ${project.name} — click the card to open source.` : `try ${projects.map((p) => p.slug).join(", ")}`;
      if (project) document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" });
    }
    const replyLines = Array.isArray(reply) ? reply : [reply];
    setLines((old) => [...old.slice(-4), `max@dev:~$ ${input}`, ...replyLines]);
    setCommand("");
  }

  return <div className="terminal"><div className="terminal-body">{lines.map((line, index) => <p key={index}>{line}</p>)}<form onSubmit={run}><label htmlFor="terminal-command">max@dev:~$</label><input id="terminal-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="try help" autoComplete="off" /><button>run</button></form></div></div>;
}
