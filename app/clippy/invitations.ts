// Lines Clippy says in his periodic invitation bubble, in classic Office Assistant voice.
export const INVITATIONS: readonly string[] = [
  "It looks like you're snooping around Max's CV. Would you like some help?",
  "It looks like you're trying to hire a developer. Would you like some help?",
  "It looks like you've been clicking around for a while. Want me to point you to the good stuff?",
  "It looks like you're wondering what Max actually builds. Should I explain?",
  "It looks like you're reading a résumé on a 1998 desktop. Would you like a guided tour?",
  "It looks like you might be looking for secrets. I know a few things. Want to ask?",
];

export function nextInvitation(index: number): string {
  const n = INVITATIONS.length;
  return INVITATIONS[((index % n) + n) % n];
}
