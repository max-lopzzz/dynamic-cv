export const GREETINGS = {
  en: "Hi! I'm Clippy. Ask me anything about Max: his experience, projects, hobbies, or what he's up to now.",
  es: "¡Hola! Soy Clippy. Pregúntame lo que quieras sobre Max: su experiencia, proyectos, hobbies o en qué anda ahora.",
};

/** Spanish for browsers set to Spanish, English for everyone else. */
export function greetingFor(languages: readonly string[]): string {
  const first = languages[0]?.toLowerCase() ?? "";
  return first.startsWith("es") ? GREETINGS.es : GREETINGS.en;
}
