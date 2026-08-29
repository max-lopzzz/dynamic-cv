export type Project = { name: string; copy: string; progress: string; slug: string };

export const repo = "https://github.com/max-lopzzz/";

export const projects: Project[] = [
  { name: "PakuPaku", copy: "A nutrition tracker made with trans people and metabolic conditions in mind.", progress: "72%", slug: "pakupaku" },
  { name: "Bead Art Helper", copy: "Turns a picture into a bead palette without the guessing.", progress: "91%", slug: "beadart" },
  { name: "BoxBuddy", copy: "A QR inventory helper for knowing where your stuff actually is.", progress: "84%", slug: "boxbuddy" },
  { name: "Pokémon Team Picker", copy: "For the very serious business of choosing a Pokémon team.", progress: "100%", slug: "pokemon_team_picker" },
  { name: "Pawmodoro", copy: "A kawaii Pomodoro timer for macOS — cat GIFs, task tracking, and shared focus rooms.", progress: "95%", slug: "pawmodoro" },
  { name: "One Man Rave", copy: "A first-person roguelite where you shoot your way back into the nightclub you drank away.", progress: "100%", slug: "OneManRave" },
  { name: "Pedro No Quiere Pagar Impuestos", copy: "A roguelite solitaire — samurai cat vs. invading dogs, fought one cooked dish at a time.", progress: "100%", slug: "pedro-no-quiere-pagar-impuestos" },
  { name: "Sprint de Entrevista", copy: "Generates a custom multiple-choice interview-prep bank from a job description, your CV, and GitHub — practice, flashcards, mock exam, or explain-it-back mode.", progress: "100%", slug: "sprint-entrevista" },
];
