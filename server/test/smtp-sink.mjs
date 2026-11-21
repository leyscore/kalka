// A minimal SMTP server that keeps every message, for tests (no TLS, no auth).
import net from 'node:net'

export function startSmtpSink(port = 2525) {
  const messages = []
  const server = net.createServer((socket) => {
    let data = false, buffer = '', current = { from: '', to: [], body: '' }
    socket.write('220 sink ESMTP\r\n')
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      let end
      while ((end = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, end); buffer = buffer.slice(end + 2)
        if (data) {
          if (line === '.') { data = false; messages.push(current); current = { from: '', to: [], body: '' }; socket.write('250 queued\r\n') }
          else current.body += (line.startsWith('..') ? line.slice(1) : line) + '\n'
          continue
        }
        const verb = line.slice(0, 4).toUpperCase()
        if (verb === 'EHLO' || verb === 'HELO') socket.write('250-sink\r\n250 8BITMIME\r\n')
        else if (verb === 'MAIL') { current.from = line; socket.write('250 ok\r\n') }
        else if (verb === 'RCPT') { current.to.push(/<([^>]+)>/.exec(line)?.[1]); socket.write('250 ok\r\n') }
        else if (verb === 'DATA') { data = true; socket.write('354 go\r\n') }
        else if (verb === 'QUIT') { socket.end('221 bye\r\n') }
        else socket.write('250 ok\r\n')
      }
    })
    socket.on('error', () => {})
  })
  server.listen(port, '127.0.0.1')
  return { messages, close: () => server.close() }
}
