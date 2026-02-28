/**
 * Detects URLs in text input
 */
const URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi

export function detectUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  return matches ? Array.from(new Set(matches)) : []
}

export function hasUrl(text: string): boolean {
  return URL_REGEX.test(text)
}

export function highlightUrls(text: string): string {
  return text.replace(URL_REGEX, (url) => `[${url}](${url})`)
}
