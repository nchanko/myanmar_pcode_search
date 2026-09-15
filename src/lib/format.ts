const MYANMAR_DIGITS = '၀၁၂၃၄၅၆၇၈၉';

/**
 * Group a number with commas, in Myanmar or Latin digits.
 *
 * Done by hand rather than with toLocaleString('my') because ICU data differs
 * between Node and browsers, which makes server and client HTML disagree and
 * triggers a React hydration error.
 */
export function formatNumber(value: number, language: 'en' | 'mm'): string {
  const grouped = value.toLocaleString('en-US');
  return language === 'mm'
    ? grouped.replace(/[0-9]/g, (d) => MYANMAR_DIGITS[Number(d)])
    : grouped;
}

/**
 * Escape a string for interpolation into an HTML string.
 *
 * Needed because Leaflet popups and divIcons take raw HTML, so place names and
 * landmark names (the latter coming from OpenStreetMap, which anyone can edit)
 * would otherwise be parsed as markup.
 */
export function escapeHtml(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
