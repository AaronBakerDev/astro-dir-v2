export function extractIdFromSlug(slug: string | undefined): number | null {
  if (!slug) return null;

  // Extract the last number from the slug
  const matches = slug.match(/(\d+)$/);
  if (!matches) return null;

  const id = parseInt(matches[1]);
  return isNaN(id) ? null : id;
}

export function generateSlug(title: string, id: number): string {
  return `${title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${id}`;
}
