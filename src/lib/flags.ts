export function flagEmoji(cc: string | null): string {
  if (!cc || cc.length !== 2) return '🌐';
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}
