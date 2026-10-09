import { call } from '../bridge'

export function writeText(text: string): Promise<void> {
  return call('clipboard.writeText', text)
}

export function writeHtml(html: string, altText?: string): Promise<void> {
  return call('clipboard.writeHtml', html, altText ?? '')
}

export function readText(): Promise<string> {
  return call<string>('clipboard.readText')
}
