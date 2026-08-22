'use client';
import { useState } from 'react';
import { logoChain } from '@/lib/logo';

export function OrgLogo({ name, logoUrl, homepage, size }: {
  name: string; logoUrl: string | null; homepage: string | null; size: number;
}) {
  const chain = logoChain(logoUrl, homepage);
  const [idx, setIdx] = useState(0);
  if (idx >= chain.length) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-[var(--border)] font-bold text-[var(--text-dim)]"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        role="img"
        aria-label={name}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={chain[idx]}
      alt={`${name} logo`}
      width={size}
      height={size}
      className="rounded-full bg-white object-contain"
      style={{ width: size, height: size }}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
