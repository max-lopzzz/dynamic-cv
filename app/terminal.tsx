"use client";

import { FormEvent, useState } from "react";
import { Project } from "./projects";

export function Terminal({ projects, onOpenHobbies, onOpenPlayer }: { projects: Project[]; onOpenHobbies: () => void; onOpenPlayer: () => void }) {
  const [lines, setLines] = useState(["Welcome to max.dev terminal v2.0", "Type help to explore."]);
  const [command, setCommand] = useState("");

  function run(event: FormEvent) {
    event.preventDefault();
    const input = command.trim().toLowerCase();
    if (!input) return;
    if (input === "clear") { setLines([]); setCommand(""); return; }
    let reply = "command not found — try help";
    if (input === "help") reply = "help · projects · status · hobbies · play · whoami · clear · open [project]";
    if (input === "whoami") reply = "Maximiliano — CS student, software engineer, drummer, bead artist.";
    if (input === "projects") { reply = "scrolling to project archive…"; document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" }); }
    if (input === "status") reply = projects.map((project) => `${project.name} [${project.progress}]`).join(" · ");
    if (input === "hobbies") { reply = "opening hobbies.exe…"; onOpenHobbies(); }
    if (input === "play") { reply = "cueing up Tom Sawyer…"; onOpenPlayer(); }
    const match = input.match(/^open\s+(.+)/);
    if (match) {
      const project = projects.find((item) => item.slug === match[1].replaceAll(" ", ""));
      reply = project ? `highlighting ${project.name} — click the card to open source.` : `try ${projects.map((p) => p.slug).join(", ")}`;
      if (project) document.querySelector("#portfolio")?.scrollIntoView({ behavior: "smooth" });
    }
    setLines((old) => [...old.slice(-4), `max@dev:~$ ${input}`, reply]);
    setCommand("");
  }

  return <div className="terminal"><div className="terminal-body">{lines.map((line, index) => <p key={index}>{line}</p>)}<form onSubmit={run}><label htmlFor="terminal-command">max@dev:~$</label><input id="terminal-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="try help" autoComplete="off" /><button>run</button></form></div></div>;
}
