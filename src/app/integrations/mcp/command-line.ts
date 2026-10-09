/** A command line split into its program and arguments. */
export interface CommandLine {
  command: string
  args: string[]
}

/**
 * Splits a command line as a shell would for plain words: whitespace separates arguments,
 * single and double quotes keep spaces, and a backslash escapes the next character outside
 * single quotes. Nothing is expanded; the program is started directly, never through a shell.
 */
export function parseCommandLine(text: string): CommandLine | null {
  const words: string[] = []
  let current = ''
  let started = false
  let quote: '"' | "'" | null = null
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (quote) {
      if (char === quote) quote = null
      else if (char === '\\' && quote === '"' && index + 1 < text.length) current += text[++index]
      else current += char
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      started = true
    } else if (char === '\\' && index + 1 < text.length) {
      current += text[++index]
      started = true
    } else if (/\s/.test(char)) {
      if (started) words.push(current)
      current = ''
      started = false
    } else {
      current += char
      started = true
    }
  }
  if (quote) return null
  if (started) words.push(current)
  const [command, ...args] = words
  return command ? { command, args } : null
}

/** Writes a command line back, quoting the words that need it. */
export function formatCommandLine({ command, args }: CommandLine): string {
  return [command, ...args]
    .map((word) =>
      word === '' || /[\s"'\\]/.test(word) ? `'${word.replaceAll("'", `'"'"'`)}'` : word
    )
    .join(' ')
}
