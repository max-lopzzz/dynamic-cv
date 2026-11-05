// Everything Clippy knows about Max (besides live data from projects.ts and
// now.ts, which is injected separately). Max reviews this file before launch.
// Sources: Max's CV (Nov 2026), his public GitHub repos, the Clippy design
// spec, and the About/Hobbies windows in app/page.tsx.
// Never add: phone number, ATLAS details beyond the public info below.

export const knowledge = `# About Max

- Full name: Maximiliano López Montaño ("Max"). Pronouns: he/him.
- Based in Monterrey, Nuevo León, Mexico.
- Headline: CS student @ Tec de Monterrey · Software Engineer Intern · Indie App & Game Developer.
- In his own words (About window): "Engineering in Computer Technologies @ Tec de Monterrey. Software engineer, indie maker, game developer, drummer. Currently making things for NGOs and people who need them."
- Links: email m.lopz.montn@gmail.com · LinkedIn linkedin.com/in/max-lopezzz · GitHub github.com/max-lopzzz · website max-lopezzz.neocities.org

## Summary (from his CV)

Computer Technologies engineering student at Tecnológico de Monterrey. Software Engineer Intern at Iteramind: maintains CFOSContigo (459 users, one per NGO across Mexico) and builds internal platforms for CFOSC (50 users across 2 tools). Indie app developer (PakuPaku, Bead Art Helper) and award-winning game developer: 1st place at the Pixel Borregos 2025 Game Jam.

# Experience

## Software Engineer Intern, Iteramind (Apr 2026 – present)
- CFOSContigo: website maintenance, feature development and quality-of-life upgrades. 459 users (one NGO per user, Mexico-wide).
- sesfi-fortalecimiento (Next.js, PostgreSQL): SESFI, CFOSC's diagnostic tool that measures the development, transparency and institutional maturity of civil-society organizations (OSCs). 25 users.
- hrmanager: an HR management platform for CFOSC. 25 users.
- Twenty CRM MCP server (TypeScript, GraphQL, OAuth 2.1): 29 tools for AI-assistant integration (contacts, companies, pipeline).
- LexiLingo (Flutter, FastAPI, LangGraph, KuzuDB): contributor, through Iteramind, to an AI English-tutoring platform. He is generalizing its HuBERT pronunciation-feedback pipeline from Vietnamese-only to learners of any native language.

## Indie App Developer, self-employed (Apr 2026 – present)
- PakuPaku (pakupakuapp.com): a nutrition/calorie tracker for transgender people and people with metabolic-rate conditions. Max is the solo developer and handles product management, roadmapping and the community (Discord, Ko-fi, itch.io). Per its GitHub repo: a FastAPI backend plus a React/Capacitor frontend for iOS and Android; features include food search, progress graphs, custom recipes, a "safe mode" with no calorie numbers, and inclusive onboarding with HRT-aware nutrition estimates.

## Game Developer & Project Lead, self-employed (May 2025)
- "Pedro No Quiere Pagar Impuestos": 1st place at the Pixel Borregos 2025 Game Jam, 5-person team; Max led the C#/Unity programming. (See Game jams.)

## Campus Ambassador, Out for Undergrad (Mar 2026 – present)
- LGBTQ2+ student outreach and community building at Tec de Monterrey; recruitment and marketing for the O4U Engineering & Sciences Conference.

## Project Leader, Plantando el Cambio (Feb 2023 – Apr 2024)
- A sustainability initiative at an Otomí cultural centre in Monterrey: fundraising, workshops and community engagement.

# Projects (from his CV)

- Bead Art Helper (React, TypeScript): turns pixel art into fuse/perler bead patterns, with a 221-color palette matcher (CIELAB / Delta-E 76). Live at beadart-sable.vercel.app; code at github.com/max-lopzzz/beadart. Also has a working view to place beads one color at a time, a materials overview with bead counts, custom palettes, and opt-in progress sharing.
- BoxBuddy (Next.js, Supabase): a small-business inventory tracker with QR-code/barcode generation and scanning, cost/price/margin tracking and low-stock alerts. Live at boxbuddy-nine.vercel.app; code at github.com/max-lopzzz/boxbuddy.
- Kechappu (Electron): a kawaii macOS Pomodoro timer with cat GIFs and task tracking (subtasks, time estimates, dark mode). Code at github.com/max-lopzzz/kechappu.
- Project ATLAS and the ATLAS Web Prototype: see the Project ATLAS section.
- LexiLingo: see Iteramind above.

# Project ATLAS

- Project ATLAS (Unity, WebGL): a gamified HR self-service portal prototype, industry-sponsored. Details are under NDA.
- ATLAS Web Prototype (HTML, JS; github.com/max-lopzzz/atlas-prototipo-web): the public companion to Project ATLAS. The team built an AI NPC chat (3 assistants) and an accessibility layer (contrast, reduced motion, keyboard navigation). 5-person team.
- Max's role: he originated the project idea and its features, led the team's SCRUM process, wrote the documentation, and contributed a bit across the game, front-end and back-end.
- Anything else about ATLAS (sponsors, other repos, features, internal details) is under NDA: Clippy must say so and not speculate.

# Game jams

## Pixel Borregos 2025: 1st place
"Pedro No Quiere Pagar Impuestos" (github.com/max-lopzzz/pedro-no-quiere-pagar-impuestos). A Unity roguelite solitaire game: Pedro, a samurai cat, cooks dishes from ingredient cards to drive off an invading dog army. It has score targets, redraws, a store with condiments and allies (Catdrick Lamar, Shao Cat), and multipliers. 5-person team; Max led the C#/Unity programming.

## Pixel Borregos 2026: Honorable Mention
"One Man Rave" (team repo github.com/a16b07/Polo; Max's fork with a full README at github.com/max-lopzzz/one-man-rave). A first-person roguelite wave shooter in Unity 6 (URP, with a VHS/bitcrush filter): Polo fights his way back into the nightclub he lost to drinking. Post-wave risk/reward perks, guns and knives, and three hidden "Consejos" that decide between two endings. A team project.

# Other hackathons
- FEMSA "HackTheShelf" 2025.
- Data Science Club Datathon 2025.
- The Brainrot Hackathon (see Skibidi Toilet Dating Simulator below).

# More projects on GitHub (github.com/max-lopzzz)

- Pawmodoro (pawmodoro-peach.vercel.app): a kawaii Pomodoro timer with a supportive cat, a to-do panel, dark mode, and shared rooms where you can see who else is focusing or on a break; built for macOS, with an iOS build via Capacitor.
- Pokémon Team Picker: a Python program where you choose a Pokémon generation, game and gym, and see the gym leader's team; planned features include comparing your own Pokémon and recommending the best team. It also has a web version.
- Who's That Pokémon?: a Python/Streamlit quiz game where you guess Pokémon from their images, covering all 1215 Pokémon in its Pokédex data, with score tracking.
- MaxBot: an earlier intent-based chatbot (Python, Streamlit) that answers questions about Max's CV.
- Skibidi Toilet Dating Simulator: Max's entry to the Brainrot Hackathon. A Ren'Py visual novel where you romance a Skibidi Toilet character, with multiple endings, meme-filled dialogue and a "social credit" score.
- HackTheShelf: Max's project repo from the FEMSA HackTheShelf 2025 hackathon (Python).
- Clippy vs BonziBuddy: a 2D Unity 6 game connected to a REST API. Clippy (the player!) collects BonziBuddy's bananas and dodges the peels; scores are saved through the API. Yes, Max made a game about Clippy beating BonziBuddy.
- sprint-entrevista (sprint-entrevista.vercel.app): a study platform that uses AI to generate personalized interview question banks from a job description (optionally your CV and GitHub), with 5 practice modes including flashcards, a mock interview and AI-graded open answers. Spanish and English.

# Education

- Tecnológico de Monterrey: Engineer's Degree in Computer Technologies (2024–2028).

# Skills

- Programming languages: Python, TypeScript/JavaScript, C#, SQL.
- Frameworks & tools: React, Next.js, PostgreSQL, GraphQL, Unity, Git/GitHub, Product Design & UX.
- Spoken languages: Spanish (native), English (native/bilingual), German (limited working proficiency).

# Honors

- Asociación de Scouts de México: Messengers of Peace; Performance, Perseverance and Fraternity Diplomas; Optimal Development Badge.

# Hobbies (from the Hobbies window, in Max's words)

- Bead art: "I turn pixel-art patterns into perler bead grids — color-matched, no guessing. Built a whole tool for it." (That tool is Bead Art Helper.)
- Drums: "Currently learning Tom Sawyer by Rush — Neil Peart's fills are humbling." The site's music player has the song.

# Fun facts

- His special interest is Tweek and Craig from South Park.
- He plays drums to metal.
- He makes perler/fuse bead art.
<!-- Max: add more fun facts here -->
`;
