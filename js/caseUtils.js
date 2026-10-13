/**
 * ToolCanvas — Advanced Core Case Conversion Library
 * 
 * Accurately handles:
 * - Preservation of multi-line structures, indentation, and empty lines
 * - CMOS/APA standard Title Case with subtitle & hyphen rules
 * - Sentence case with punctuation detection, abbreviations, and pronoun 'I'
 * - True word tokenization for developer cases (camelCase, PascalCase, kebab-case, snake_case)
 * - Independent multi-line list processing for developer code variable batches
 */

/** Common English honorifics that are capitalized and followed by capitalized proper nouns */
const COMMON_HONORIFICS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr'
]);

/** Abbreviations that should not trigger sentence termination */
const NON_TERMINATING_ABBREVIATIONS = new Set([
  'vs', 'etc', 'approx', 'est', 'dept', 'min', 'sec', 'vol', 'inc', 'ltd', 'co', 'corp', 'e.g', 'i.e'
]);

/** Standard title case minor words (articles, coordinating conjunctions, short prepositions) */
const TITLE_CASE_MINOR_WORDS = new Set([
  'a', 'an', 'the',
  'and', 'but', 'for', 'or', 'nor', 'so', 'yet',
  'as', 'at', 'by', 'for', 'in', 'of', 'off', 'on', 'per', 'to', 'up', 'via', 'with'
]);

/** Verbs that must always be capitalized in title case */
const TITLE_CASE_ALWAYS_CAPITALIZE = new Set([
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am',
  'do', 'does', 'did', 'has', 'have', 'had', 'go', 'goes'
]);

/**
 * 1. Sentence case
 * Capitalizes the first character of each sentence, the pronoun 'I', beginnings of lines/paragraphs,
 * honorifics (Dr., Mr.), middle initials, without disrupting line breaks or list formats.
 */
export function toSentenceCase(text) {
  if (!text) return '';

  const lines = text.split(/(\r?\n)/);

  return lines.map(line => {
    if (/^\r?\n$/.test(line)) return line;
    if (!line.trim()) return line;

    let result = '';
    let capitalizeNext = true;
    let i = 0;
    const len = line.length;

    while (i < len) {
      const char = line[i];

      // Handle bullet points / list markers at the start of a line
      if (capitalizeNext && i === 0) {
        const bulletMatch = line.match(/^(\s*(?:[-*•–—]|\d+[\.\)]|[a-zA-Z][\.\)])\s*)/);
        if (bulletMatch) {
          result += bulletMatch[1];
          i += bulletMatch[1].length;
          capitalizeNext = true;
          continue;
        }
      }

      // Word token
      if (/[a-zA-Z]/.test(char)) {
        let word = '';
        while (i < len && /[a-zA-Z0-9'’]/.test(line[i])) {
          word += line[i];
          i++;
        }

        const lowerWord = word.toLowerCase();

        // Check pronoun 'I' and contractions
        if (/^i(['’](m|ve|ll|d))?$/i.test(word)) {
          word = 'I' + word.slice(1).toLowerCase();
          capitalizeNext = false;
        } else if (COMMON_HONORIFICS.has(lowerWord)) {
          // Honorifics: Dr., Mr., Mrs., etc.
          word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          capitalizeNext = false;
        } else if (word.length === 1 && i < len && line[i] === '.') {
          // Middle initials (e.g. John F. Kennedy)
          word = word.toUpperCase();
          capitalizeNext = false;
        } else if (capitalizeNext) {
          word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          capitalizeNext = false;
        } else {
          word = word.toLowerCase();
        }

        result += word;
        continue;
      }

      // Sentence terminating punctuation
      if (/[.?!…]/.test(char)) {
        let punct = '';
        while (i < len && /[.?!…]/.test(line[i])) {
          punct += line[i];
          i++;
        }
        result += punct;

        // Check if preceding word was an honorific, single letter, or abbreviation
        const precedingMatch = result.slice(0, -punct.length).match(/([a-zA-Z]+)$/);
        const prevWord = precedingMatch ? precedingMatch[1].toLowerCase() : '';

        if (punct === '.') {
          if (COMMON_HONORIFICS.has(prevWord) || (prevWord.length === 1 && prevWord !== 'a' && prevWord !== 'i')) {
            // E.g. Dr. Smith or John F. Kennedy
            capitalizeNext = true;
          } else if (NON_TERMINATING_ABBREVIATIONS.has(prevWord)) {
            capitalizeNext = false;
          } else {
            capitalizeNext = true;
          }
        } else {
          capitalizeNext = true;
        }
        continue;
      }

      result += char;
      i++;
    }

    return result;
  }).join('');
}

/**
 * 2. lower case
 * Converts all letters to lowercase while maintaining all line breaks, spaces, symbols, and numbers.
 */
export function toLowerCase(text) {
  if (!text) return '';
  return text.toLowerCase();
}

/**
 * 3. UPPER CASE
 * Converts all letters to uppercase while maintaining all line breaks, spaces, symbols, and numbers.
 */
export function toUpperCase(text) {
  if (!text) return '';
  return text.toUpperCase();
}

/**
 * 4. Capitalized Case (Start Case)
 * Capitalizes the first letter of every word, while keeping newlines and spacing intact.
 */
export function toCapitalizedCase(text) {
  if (!text) return '';
  return text.replace(/([a-zA-Z0-9]+(?:['’][a-zA-Z0-9]+)*)/g, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

/**
 * 5. aLtErNaTiNg cAsE
 * Alternates the case of letters (starting lowercase), skipping whitespace, punctuation, and newlines.
 */
export function toAlternatingCase(text) {
  if (!text) return '';
  let upper = false;
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (/[a-zA-Z]/.test(c)) {
      res += upper ? c.toUpperCase() : c.toLowerCase();
      upper = !upper;
    } else {
      res += c;
    }
  }
  return res;
}

/**
 * 6. Title Case
 * Adheres to standard CMOS/APA rules: capitalizes first/last words, major words, verbs, and words after colons,
 * keeps minor words in the middle lowercase, and preserves every line break.
 */
export function toTitleCase(text) {
  if (!text) return '';

  const lines = text.split(/(\r?\n)/);

  return lines.map(line => {
    if (/^\r?\n$/.test(line)) return line;
    if (!line.trim()) return line;

    const wordRegex = /[a-zA-Z0-9]+(?:['’][a-zA-Z0-9]+)*/g;
    const words = [];
    let match;
    while ((match = wordRegex.exec(line)) !== null) {
      words.push({
        word: match[0],
        index: match.index,
        end: match.index + match[0].length
      });
    }

    if (words.length === 0) return line;

    let result = '';
    let lastIndex = 0;

    words.forEach((item, idx) => {
      const prefix = line.slice(lastIndex, item.index);
      result += prefix;

      const lower = item.word.toLowerCase();
      const isFirst = (idx === 0);
      const isLast = (idx === words.length - 1);

      // Subtitle rule: capitalize word immediately after colon, em-dash, question mark, or opening quote
      const isAfterSubtitlePunct = /[:?!\u2014—]\s*['"“‘]?\s*$/.test(prefix);

      let converted = lower;
      if (isFirst || isLast || isAfterSubtitlePunct || TITLE_CASE_ALWAYS_CAPITALIZE.has(lower) || !TITLE_CASE_MINOR_WORDS.has(lower)) {
        converted = lower.charAt(0).toUpperCase() + lower.slice(1);
      } else {
        converted = lower;
      }

      // Handle hyphenated compound words (e.g. State-of-the-Art)
      if (item.word.includes('-')) {
        const parts = item.word.split('-');
        converted = parts.map((part, pIdx) => {
          const pLower = part.toLowerCase();
          const pFirst = (pIdx === 0);
          const pLast = (pIdx === parts.length - 1);
          if (pFirst || pLast || TITLE_CASE_ALWAYS_CAPITALIZE.has(pLower) || !TITLE_CASE_MINOR_WORDS.has(pLower)) {
            return pLower.charAt(0).toUpperCase() + pLower.slice(1);
          }
          return pLower;
        }).join('-');
      }

      result += converted;
      lastIndex = item.end;
    });

    result += line.slice(lastIndex);
    return result;
  }).join('');
}

/**
 * 7. InVerSe CaSe
 * Inverts the casing of each letter: uppercase becomes lowercase, lowercase becomes uppercase.
 */
export function toInverseCase(text) {
  if (!text) return '';
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === c.toUpperCase() && c !== c.toLowerCase()) {
      res += c.toLowerCase();
    } else if (c === c.toLowerCase() && c !== c.toUpperCase()) {
      res += c.toUpperCase();
    } else {
      res += c;
    }
  }
  return res;
}

/**
 * Helper: Splits string into distinct semantic words by handling:
 * - CamelCase/PascalCase word transitions (e.g., 'fooBar' -> 'foo', 'Bar'; 'XMLHttpRequest' -> 'XML', 'Http', 'Request')
 * - Delimiters (spaces, underscores, hyphens, dots, slashes)
 */
export function splitWords(str) {
  if (!str) return [];
  const separated = str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z0-9])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();
  return separated ? separated.split(/\s+/) : [];
}

/**
 * 8. camelCase
 * First word is lowercase, subsequent words capitalized, no delimiters.
 * Processes each line independently to support batch list conversion.
 */
export function toCamelCase(text) {
  if (!text) return '';
  const lines = text.split(/(\r?\n)/);
  return lines.map(line => {
    if (/^\r?\n$/.test(line)) return line;
    const words = splitWords(line);
    if (words.length === 0) return '';
    return words.map((w, idx) => {
      const lower = w.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');
  }).join('');
}

/**
 * 9. PascalCase
 * Every word starts with a capital letter, no delimiters.
 * Processes each line independently.
 */
export function toPascalCase(text) {
  if (!text) return '';
  const lines = text.split(/(\r?\n)/);
  return lines.map(line => {
    if (/^\r?\n$/.test(line)) return line;
    const words = splitWords(line);
    if (words.length === 0) return '';
    return words.map(w => {
      const lower = w.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');
  }).join('');
}

/**
 * 10. kebab-case
 * All words in lowercase joined by hyphens.
 * Processes each line independently.
 */
export function toKebabCase(text) {
  if (!text) return '';
  const lines = text.split(/(\r?\n)/);
  return lines.map(line => {
    if (/^\r?\n$/.test(line)) return line;
    const words = splitWords(line);
    if (words.length === 0) return '';
    return words.map(w => w.toLowerCase()).join('-');
  }).join('');
}

/**
 * 11. snake_case
 * All words in lowercase joined by underscores.
 * Processes each line independently.
 */
export function toSnakeCase(text) {
  if (!text) return '';
  const lines = text.split(/(\r?\n)/);
  return lines.map(line => {
    if (/^\r?\n$/.test(line)) return line;
    const words = splitWords(line);
    if (words.length === 0) return '';
    return words.map(w => w.toLowerCase()).join('_');
  }).join('');
}
