export function slugify(name: string): string {
  const s = name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || 'org';
}

export function assignSlugs(
  orgs: { id: string; name: string }[],
  prevSlugById: Map<string, string>,
): Map<string, string> {
  const used = new Set<string>();
  const out = new Map<string, string>();
  for (const org of orgs) {
    let slug = prevSlugById.get(org.id) ?? slugify(org.name);
    if (used.has(slug)) slug = `${slug}-${org.id.slice(1)}`;
    used.add(slug);
    out.set(org.id, slug);
  }
  return out;
}
