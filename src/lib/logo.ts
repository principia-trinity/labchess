export function logoChain(logoUrl: string | null, homepage: string | null): string[] {
  const chain: string[] = [];
  if (logoUrl) chain.push(logoUrl);
  if (homepage) {
    try {
      const domain = new URL(homepage).hostname;
      chain.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
    } catch { /* invalid homepage: skip favicon */ }
  }
  return chain;
}
