export type Project = {
  name: string;
  copy: string;
  progress: string;
  slug: string;
  technologies: string[];
  status: string;
  github: string;
  demo?: string;
};

export const projects: Project[] = [
  {
    name: "PakuPaku",
    copy: "A cute nutrition and wellness tracker designed to make food tracking feel more friendly and inclusive.",
    progress: "72%",
    slug: "pakupaku",
    technologies: ["TypeScript", "React", "Next.js"],
    status: "in development",
    github: "https://github.com/max-lopzzz/pakupaku",
    demo: "https://pakupaku.m-lopz-montn.workers.dev/",
  },
  {
    name: "Bead Art Helper",
    copy: "Turns images into perler bead patterns and color palettes without the guesswork.",
    progress: "91%",
    slug: "beadart",
    technologies: ["JavaScript", "React", "Canvas"],
    status: "complete",
    github: "https://github.com/max-lopzzz/beadart",
    demo: "https://beadart-sable.vercel.app/",
  },
  {
    name: "BoxBuddy",
    copy: "A QR-powered inventory helper for keeping track of where your stuff actually is.",
    progress: "84%",
    slug: "boxbuddy",
    technologies: ["TypeScript", "React", "Next.js"],
    status: "complete",
    github: "https://github.com/max-lopzzz/boxbuddy",
    demo: "https://boxbuddy-nine.vercel.app/",
  },
  {
    name: "Pokémon Team Picker",
    copy: "For the very serious business of choosing a Pokémon team.",
    progress: "100%",
    slug: "pokemon-team-picker",
    technologies: ["JavaScript", "HTML", "CSS"],
    status: "complete",
    github: "https://github.com/max-lopzzz/pokemon_team_picker",
  },
  {
    name: "Pawmodoro",
    copy: "A kawaii Pomodoro timer for macOS with cats, task tracking, and shared focus rooms.",
    progress: "95%",
    slug: "pawmodoro",
    technologies: ["TypeScript", "React", "Electron"],
    status: "complete",
    github: "https://github.com/max-lopzzz/pawmodoro",
  },
  {
    name: "One Man Rave",
    copy: "A first-person roguelite where you shoot your way back into the nightclub you drank away.",
    progress: "100%",
    slug: "one-man-rave",
    technologies: ["Game Development"],
    status: "complete",
    github: "https://github.com/max-lopzzz/OneManRave",
  },
  {
    name: "Pedro No Quiere Pagar Impuestos",
    copy: "A roguelite solitaire where a samurai cat fights invading dogs one cooked dish at a time.",
    progress: "100%",
    slug: "pedro-no-quiere-pagar-impuestos",
    technologies: ["Game Development"],
    status: "complete",
    github: "https://github.com/max-lopzzz/pedro-no-quiere-pagar-impuestos",
  },
  {
    name: "Sprint de Entrevista",
    copy: "Generates a custom interview-prep bank from a job description, your CV, and GitHub.",
    progress: "100%",
    slug: "sprint-entrevista",
    technologies: ["Python", "AI", "Web Development"],
    status: "complete",
    github: "https://github.com/max-lopzzz/sprint-entrevista",
  },
  {
    name: "Dynamic CV",
    copy: "An interactive retro-style developer portfolio built as a tiny operating system.",
    progress: "100%",
    slug: "dynamic-cv",
    technologies: ["TypeScript", "React", "Next.js"],
    status: "active",
    github: "https://github.com/max-lopzzz/dynamic-cv",
    demo: "https://dynamic-cv-inky.vercel.app/",
  },
];