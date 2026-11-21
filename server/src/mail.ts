import { connect } from 'cloudflare:sockets'

import { setting, type Env } from './env'

/**
 * Sends email through the SMTP server the administrator configured. Cloudflare allows outgoing
 * SMTP on 587 (STARTTLS) and 465 (TLS); only port 25 is blocked.
 *   KALKA_SMTP_HOST, KALKA_SMTP_PORT (587), KALKA_SMTP_SECURE (starttls | tls | none),
 *   KALKA_SMTP_USER, KALKA_SMTP_PASSWORD, KALKA_SMTP_FROM ("Kalka <kalka@example.com>")
 */
export interface Mail {
  to: string
  subject: string
  text: string
}

interface SmtpConfig {
  host: string
  port: number
  secure: 'starttls' | 'tls' | 'none'
  user?: string
  password?: string
  from: string
}

export function smtpConfig(env: Env): SmtpConfig | null {
  const host = setting(env, 'KALKA_SMTP_HOST')
  const from = setting(env, 'KALKA_SMTP_FROM')
  if (!host || !from) return null
  const port = Number(setting(env, 'KALKA_SMTP_PORT') ?? 587)
  const secure = setting(env, 'KALKA_SMTP_SECURE')
  return {
    host,
    port,
    secure: secure === 'none' || secure === 'tls' ? secure : port === 465 ? 'tls' : 'starttls',
    user: setting(env, 'KALKA_SMTP_USER'),
    password: setting(env, 'KALKA_SMTP_PASSWORD'),
    from
  }
}

export function canSendMail(env: Env): boolean {
  return smtpConfig(env) !== null
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

class SmtpConnection {
  private buffer = ''
  private reader: ReadableStreamDefaultReader<Uint8Array>
  private writer: WritableStreamDefaultWriter<Uint8Array>

  constructor(private socket: Socket) {
    this.reader = socket.readable.getReader()
    this.writer = socket.writable.getWriter()
  }

  /** Reads one reply, which may span several lines ("250-…" then "250 …"). */
  async reply(): Promise<{ code: number; text: string }> {
    const lines: string[] = []
    for (;;) {
      const end = this.buffer.indexOf('\r\n')
      if (end === -1) {
        const { value, done } = await this.reader.read()
        if (done) throw new Error('The mail server closed the connection.')
        this.buffer += decoder.decode(value, { stream: true })
        continue
      }
      const line = this.buffer.slice(0, end)
      this.buffer = this.buffer.slice(end + 2)
      lines.push(line)
      if (line[3] !== '-') return { code: Number(line.slice(0, 3)), text: lines.join('\n') }
    }
  }

  async send(line: string, expect: number[]): Promise<string> {
    await this.writer.write(encoder.encode(`${line}\r\n`))
    return this.expect(expect)
  }

  async expect(codes: number[]): Promise<string> {
    const { code, text } = await this.reply()
    if (!codes.includes(code)) throw new Error(`The mail server answered: ${text}`)
    return text
  }

  async upgrade(): Promise<SmtpConnection> {
    this.reader.releaseLock()
    this.writer.releaseLock()
    return new SmtpConnection(this.socket.startTls())
  }

  async close(): Promise<void> {
    try {
      await this.writer.write(encoder.encode('QUIT\r\n'))
      await this.socket.close()
    } catch {
      // Closing is best effort.
    }
  }
}

function addressOf(from: string): string {
  return /<([^>]+)>/.exec(from)?.[1] ?? from
}

function header(value: string): string {
  // Non-ASCII subjects are encoded as RFC 2047 words.
  return /^[\x20-\x7e]*$/.test(value)
    ? value
    : `=?UTF-8?B?${btoa(String.fromCharCode(...encoder.encode(value)))}?=`
}

function body(text: string): string {
  // Dot-stuffing, and CRLF line ends, as SMTP requires.
  return text
    .replace(/\r?\n/g, '\r\n')
    .split('\r\n')
    .map((line) => (line.startsWith('.') ? `.${line}` : line))
    .join('\r\n')
}

export async function sendMail(env: Env, mail: Mail): Promise<void> {
  const config = smtpConfig(env)
  if (!config) throw new Error('Email is not configured on this server.')
  if (/[\r\n]/.test(mail.to + mail.subject)) throw new Error('Invalid email header.')
  const socket = connect(
    { hostname: config.host, port: config.port },
    {
      secureTransport: config.secure === 'tls' ? 'on' : config.secure === 'starttls' ? 'starttls' : 'off',
      allowHalfOpen: false
    }
  )
  let smtp = new SmtpConnection(socket)
  try {
    await smtp.expect([220])
    const hello = `EHLO ${config.host === 'localhost' ? 'localhost' : 'kalka-server'}`
    await smtp.send(hello, [250])
    if (config.secure === 'starttls') {
      await smtp.send('STARTTLS', [220])
      smtp = await smtp.upgrade()
      await smtp.send(hello, [250])
    }
    if (config.user && config.password) {
      const plain = btoa(String.fromCharCode(...encoder.encode(`\0${config.user}\0${config.password}`)))
      await smtp.send(`AUTH PLAIN ${plain}`, [235])
    }
    await smtp.send(`MAIL FROM:<${addressOf(config.from)}>`, [250])
    await smtp.send(`RCPT TO:<${mail.to}>`, [250, 251])
    await smtp.send('DATA', [354])
    const message = [
      `From: ${config.from}`,
      `To: <${mail.to}>`,
      `Subject: ${header(mail.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@kalka-server>`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      body(mail.text),
      '.'
    ].join('\r\n')
    await smtp.send(message, [250])
  } finally {
    await smtp.close()
  }
}

/** Sends a notice, and reports instead of failing when email is not set up or fails. */
export async function tryMail(env: Env, to: string, subject: string, text: string): Promise<boolean> {
  if (!canSendMail(env)) return false
  try {
    await sendMail(env, { to, subject, text })
    return true
  } catch (error) {
    console.error('[kalka] Email failed', error)
    return false
  }
}
