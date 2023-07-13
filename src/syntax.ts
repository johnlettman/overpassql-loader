const spaces = /[ \t]+/g;
const newlines = /[\r\n]+[ \t\r\n]*/g;
const comments = /([\t ]*\/\*\**([\s\S]*?)\*\/|[\t ]*\/\/.*$)[\n\r]*/gm;
const _commentPlaceholder = (index: number) => `___COMMENT@${index}___`;

export function stripWhitespace(content: string): string {
    const commentStore = ( // temporary store for all comments
        Array.from(content.matchAll(comments)).map(match => match[0]));

    // implement a temporary placeholder to preserve the comment
    commentStore.forEach((comment, index) => {
        content = content.replace(comment, _commentPlaceholder(index));
    });

    // strip out whitespace
    content = content.replace(spaces, ' ');
    content = content.replace(newlines, '\n');
    content = content.trim();

    // restore preserved comments to the location of their placeholders
    commentStore.forEach((comment, index) => {
        content = content.replace(_commentPlaceholder(index), comment)
    });

    return content;
}

export function stripComments(content: string): string {
    return content.replace(comments, match => (
        match.includes('@preserve') ? match : ''));
}