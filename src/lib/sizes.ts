/**
 * Normalizes any size representation (array of strings, single comma-separated string,
 * space-separated string, etc.) into a clean, deduplicated array of individual size strings.
 *
 * Examples:
 * ["32 34 45 213 345"] -> ["32", "34", "45", "213", "345"]
 * ["28, 30, 32"] -> ["28", "30", "32"]
 * "32 34 36" -> ["32", "34", "36"]
 * ["Free Size"] -> ["Free Size"]
 * ["S", "M", "L", "XL"] -> ["S", "M", "L", "XL"]
 */
export function normalizeSizes(sizes?: (string | null | undefined)[] | string | null): string[] {
  if (!sizes) return [];
  const list = Array.isArray(sizes) ? sizes : [sizes];
  const result: string[] = [];

  for (const item of list) {
    if (!item || typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    // Check if whole string is "Free Size" or "One Size"
    if (/^(free\s+size|one\s+size)$/i.test(trimmed)) {
      result.push('Free Size');
      continue;
    }

    // Split on commas, semicolons, newlines, tabs
    const tokens = trimmed.split(/[,;\n\r\t]+/).map(t => t.trim()).filter(Boolean);
    for (const token of tokens) {
      if (/^(free\s+size|one\s+size)$/i.test(token)) {
        result.push('Free Size');
      } else if (/\s+/.test(token)) {
        // Space-separated numbers or letters like "32 34 45 213 345" or "S M L"
        const subtokens = token.split(/\s+/).map(s => s.trim()).filter(Boolean);
        result.push(...subtokens);
      } else {
        result.push(token);
      }
    }
  }

  // Deduplicate and preserve order
  return Array.from(new Set(result));
}

/**
 * Parses user input from a form or text field into an array of clean sizes.
 */
export function parseSizesInput(input: string): string[] {
  return normalizeSizes(input);
}

/**
 * Common presets for quick selection in admin
 */
export const SIZE_PRESETS = [
  { label: 'Jeans (28-36)', sizes: ['28', '30', '32', '34', '36'] },
  { label: 'Tops (S-XXL)', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Free Size', sizes: ['Free Size'] },
];

/**
 * Common individual size toggles for click-to-add
 */
export const COMMON_NUMBER_SIZES = ['28', '30', '32', '34', '36', '38', '40'];
export const COMMON_ALPHA_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
