/**
 * Reusable word helper utility for Employee Task Manager (ETM).
 * Enforces strict input restrictions at the controller/state level.
 */

/**
 * Counts the number of real words in a string, ignoring leading/trailing spaces,
 * multiple spaces, tabs, and punctuation-only tokens.
 */
export const countWords = (text: string): number => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => /\p{L}|\p{N}/u.test(word)).length;
};

/**
 * Enforces a strict maximum word limit on the input text.
 * - If the word count is below maxWords, it preserves the formatting (including multiple spaces).
 * - If the word count reaches maxWords, it ignores any trailing spaces or new words.
 * - If a long text is pasted, it keeps only the first maxWords words.
 */
export const limitToMaxWords = (text: string, maxWords: number): string => {
  if (!text) return "";

  const rawTokens = text.split(/(\s+)/);
  let wordCount = 0;
  let result = "";

  for (const token of rawTokens) {
    if (!token) continue;
    
    const isWhitespace = /^\s+$/.test(token);
    const isWord = !isWhitespace && /\p{L}|\p{N}/u.test(token);

    if (isWord) {
      wordCount++;
      if (wordCount > maxWords) {
        break;
      }
      result += token;
    } else {
      // Only append whitespace if we haven't reached the word limit yet
      if (wordCount < maxWords) {
        result += token;
      }
    }
  }

  // Ensure trailing space is trimmed if we are exactly at the word limit
  if (wordCount === maxWords) {
    result = result.trimEnd();
  }

  return result;
};
