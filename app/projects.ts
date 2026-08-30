export type Category = "web" | "game" | "tool";

export type Project = {
  name: string;
  copy: string;
  progress: string;
  slug: string;
  technologies: string[];
  status: string;
  github: string;
  demo?: string;
  categories: Category[];
  // Optional — only used on the /projects/[slug] detail page.
  // Leave any of these out and that section just won't render.
  whatIsIt?: string;
  whyIMadeIt?: string;
  features?: string[];
  thingsLearned?: string[];
  thingsToChange?: string;
  screenshot?: string; // path under /public, e.g. "/screenshots/pakupaku.png"
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
    categories: ["web", "tool"],
    // Example detail-page content — copy this pattern into the other projects when you have time.
    whyIMadeIt: "Most food trackers feel clinical or judgmental. I wanted something that felt more like a friendly companion than a calorie cop.",
    features: [
      "Friendly, low-pressure food logging",
      "Progress tracking without shame-based messaging",
      "Custom illustrations for common foods",
    ],
    thingsLearned: [
      "Designing UI copy that avoids diet-culture language is harder than it sounds",
      "Next.js App Router data fetching patterns",
    ],
    thingsToChange: "I'd add offline support earlier — it came up as a request almost immediately after launch.",
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
    categories: ["tool"],
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
    categories: ["web", "tool"],
  },
  {
    name: "Pokémon Team Picker",
    copy: "For the very serious business of choosing a Pokémon team.",
    progress: "100%",
    slug: "pokemon-team-picker",
    technologies: ["JavaScript", "HTML", "CSS"],
    status: "complete",
    github: "https://github.com/max-lopzzz/pokemon_team_picker",
    categories: ["web", "game"],
  },
  {
    name: "Pawmodoro",
    copy: "A kawaii Pomodoro timer for macOS with cats, task tracking, and shared focus rooms.",
    progress: "95%",
    slug: "pawmodoro",
    technologies: ["TypeScript", "React", "Electron"],
    status: "complete",
    github: "https://github.com/max-lopzzz/pawmodoro",
    categories: ["tool"],
  },
  {
    name: "One Man Rave",
    copy: "A first-person roguelite where you shoot your way back into the nightclub you drank away.",
    progress: "100%",
    slug: "one-man-rave",
    technologies: ["Game Development"],
    status: "complete",
    github: "https://github.com/max-lopzzz/OneManRave",
    categories: ["game"],
  },
  {
    name: "Pedro No Quiere Pagar Impuestos",
    copy: "A roguelite solitaire where a samurai cat fights invading dogs one cooked dish at a time.",
    progress: "100%",
    slug: "pedro-no-quiere-pagar-impuestos",
    technologies: ["Game Development"],
    status: "complete",
    github: "https://github.com/max-lopzzz/pedro-no-quiere-pagar-impuestos",
    categories: ["game"],
  },
  {
    name: "Sprint de Entrevista",
    copy: "Generates a custom interview-prep bank from a job description, your CV, and GitHub.",
    progress: "100%",
    slug: "sprint-entrevista",
    technologies: ["Python", "AI", "Web Development"],
    status: "complete",
    github: "https://github.com/max-lopzzz/sprint-entrevista",
    categories: ["web", "tool"],
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
    categories: ["web"],
  },
];