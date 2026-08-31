export type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
};

// Add new achievements here — the UI and unlock tracking pick them up
// automatically. Just remember to call unlockAchievement(id) somewhere.
export const achievements: Achievement[] = [
  {
    id: "konami",
    title: "Drummer's Secret",
    description: "Found the Konami code.",
    emoji: "🥁",
  },
  {
    id: "godmode",
    title: "iddqd",
    description: "Typed the classic Doom cheat code.",
    emoji: "🕹️",
  },
  {
    id: "logo-secret",
    title: "Curious Clicker",
    description: "Clicked Start five times fast.",
    emoji: "🖱️",
  },
  {
    id: "terminal",
    title: "Power User",
    description: "Opened the terminal.",
    emoji: "💻",
  },
  {
    id: "neofetch",
    title: "Neofetch Enjoyer",
    description: "Ran neofetch in the terminal.",
    emoji: "🐈",
  },
  {
    id: "guestbook-signed",
    title: "Kind Stranger",
    description: "Signed the guestbook.",
    emoji: "💌",
  },
  {
    id: "all-filters",
    title: "Completionist",
    description: "Tried every project filter.",
    emoji: "🗂️",
  },
  {
    id: "hire-me",
    title: "Window Shopper",
    description: "Opened Hire Me.exe.",
    emoji: "💼",
  },
  {
    id: "secret-page",
    title: "Sandwich Achieved",
    description:
      "Found the hidden page via the terminal.",
    emoji: "🥪",
  },
];

const STORAGE_KEY = "maxos-achievements";

export function loadUnlockedAchievements(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUnlockedAchievements(ids: string[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage disabled/full — achievements just won't persist, no big deal.
  }
}
