// Relays a Kalka server's sign-in redirect (?code= or ?error=) to the editor that started it,
// which trades the one-time code for a session, then closes this window.
const channel = new BroadcastChannel('kalka:server-oauth')
channel.postMessage(window.location.search)
channel.close()
window.close()
