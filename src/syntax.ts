const spaces = /([ \t]+|[\r\n]+[ \t\r\n]*)/g;
const comments = /([\t ]*\/\*\**([\s\S]*?)\*\/|[\t ]*\/\/.*$)[\n\r]*/gm;
const _commentPlaceholder = (index: number) => `___COMMENT@${index}___`;

/**
 * Maximum permissible content size, measured in number of characters, to
 * prevent occurrences of ReDoS (Regular expression Denial of Service).
 */
export const maxContentSize: number = 100000000;

/**
 * Remove whitespace from an OverpassQL string while preserving comments.
 *
 * @param content OverpassQL content string
 * @returns OverpassQL content string with extra whitespace removed
 */
export function stripWhitespace(content: string): string {
  if (content.length > maxContentSize) {
    throw new Error(
      'Content is too big, ' +
        `length of ${content.length} is larger than limit of ${maxContentSize}`
    );
  }

  const commentStore = // temporary store for all comments
    Array.from(content.matchAll(comments)).map((match) => match[0]);

  // implement a temporary placeholder to preserve the comment
  commentStore.forEach((comment, index) => {
    const regex = new RegExp(
      comment.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
      'g'
    );
    content = content.replace(regex, _commentPlaceholder(index));
  });

  // strip out whitespace
  content = content.replace(spaces, ' ').trim();

  // restore preserved comments to the location of their placeholders
  commentStore.forEach((comment, index) => {
    const placeholderRegex = new RegExp(
      _commentPlaceholder(index).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
      'g'
    );
    content = content.replace(placeholderRegex, comment);
  });

  return content;
}

/**
 * Remove comments from an OverpassQL string.
 *
 * @param content OverpassQL content string
 * @returns OverpassQL content string with comments removed
 */
export function stripComments(content: string): string {
  if (content.length > maxContentSize) {
    throw new Error(
      'Content is too big, ' +
        `length of ${content.length} is larger than limit of ${maxContentSize}`
    );
  }

  return content.replace(comments, (match) =>
    match.includes('@preserve') ? match : ''
  );
}
