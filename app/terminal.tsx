"use client";

import { FormEvent, useState } from "react";

type Project = { id: string; name: string; progress: number };

export function Terminal({ projects }: { projects: Project[] }) {
  const [lines, setLines] = useState(["Welcome to max.dev terminal v2.0", "Type help to explore."]);
  const [command, setCommand] = useState("");

  function run(event: FormEvent) {
    event.preventDefault();
    const input = command.trim().toLowerCase();
    if (!input) return;
    if (input === "clear") { setLines([]); setCommand(""); return; }
    let reply = "command not found — try help";
    if (input === "help") reply = "help · projects · status · clear · open [project]";
    if (input === "projects") { reply = "scrolling to project archive…"; document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" }); }
    if (input === "status") reply = projects.map((project) => `${project.name} [${project.progress}%]`).join(" · ");
    const match = input.match(/^open\s+(.+)/);
    if (match) {
      const project = projects.find((item) => item.id === match[1].replaceAll(" ", ""));
      reply = project ? `highlighting ${project.name} — click the card to open source.` : "try pakupaku, beadart, boxbuddy, kechappu, pokemon, or pawmodoro";
      if (project) document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" });
    }
    setLines((old) => [...old.slice(-4), `max@dev:~$ ${input}`, reply]);
    setCommand("");
  }

  return <div className="terminal"><div className="terminal-bar"><span>● ● ●</span> max@portfolio — interactive terminal <span>_ □ ×</span></div><div className="terminal-body">{lines.map((line, index) => <p key={index}>{line}</p>)}<form onSubmit={run}><label htmlFor="terminal-command">max@dev:~$</label><input id="terminal-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="try help" autoComplete="off" /><button>run</button></form></div></div>;
}
