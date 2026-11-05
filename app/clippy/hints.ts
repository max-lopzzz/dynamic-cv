// Hint copy for achievements and the site guide Clippy uses to suggest windows.
// Max reviews this file before launch. Hints are nudges only: they must never
// contain the actual solution (hints.test.ts guards the obvious giveaways).
// `clippy-dismissed` deliberately has no hint.

export const achievementHints: Record<string, string> = {
  konami:
    "It looks like you grew up with a game controller! There's a legendary cheat code from old consoles that just might work here. Try playing it out on your keyboard while you're on the desktop.",
  godmode:
    "Old-school shooter fans might know a cheat that makes you invincible… try typing it on the desktop.",
  "logo-secret":
    "Psst! The button in the bottom-left corner of the taskbar is a little ticklish. Impatient clickers get a surprise.",
  terminal:
    "Feeling like a hacker? There's an icon on the desktop for people who'd rather type than click.",
  neofetch:
    "Once you're in the terminal, ask it for help and try out what it suggests. One of those commands is a nerdy little show-off!",
  "guestbook-signed":
    "Why not leave Max a little note? There's a book on the desktop waiting for your signature.",
  "all-filters":
    "In My Projects, don't stick to just one view. Max makes all kinds of things; try browsing each kind!",
  "hire-me":
    "Thinking about working with Max? There's a program on the desktop made exactly for that. Go on, take a peek!",
  "secret-page":
    "The terminal has a sense of humor about who's allowed to order what. Classic computer jokes might get you somewhere unexpected…",
};

export const siteGuide = `- About Max (about_max.txt): a short intro to Max plus an email link.
- Now.exe: what Max is up to right now (working on, learning, listening to, and so on).
- My Projects (max_portfolio.exe): Max's project folder, filterable by web, game and tool; each project opens a detail window.
- Music.exe (tiny media player): a Windows Media Player-style player cued up with Tom Sawyer by Rush.
- Hobbies (hobbies.exe): Max's bead art (with his current pattern progress) and his drumming.
- Guestbook (guestbook.exe): visitors sign their name and leave a message for Max.
- Earth.exe: shows a random figure from Wikipedia / Wikimedia Commons; click "another one" for more.
- Terminal (terminal.exe): a playful fake command line; type help to see the commands.
- Hire Me.exe (hire_me.exe): ways to hire Max for a website or small tool: Upwork, Fiverr, Contra, email, GitHub and Discord.
- Dev Stats.exe (devstats.exe): project count, live GitHub repo and commit counts, and some silly stats.
- Kind Words (kind_words.exe): a wall of kind messages people left in the guestbook.
- Achievements (achievements.exe): a list of hidden achievements to unlock while exploring the site.
- Contact Max: email m.lopz.montn@gmail.com, LinkedIn linkedin.com/in/max-lopezzz, GitHub github.com/max-lopzzz, or open Hire Me.exe.`;
