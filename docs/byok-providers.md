# BYOK provider & model compatibility

OpenPencil has no backend. When you bring your own API key, the browser talks to the provider
directly — so a provider only works in the **web build** if it sets CORS headers correctly, and a
model is only useful for the AI chat panel if its **streaming tool calls** are well-formed.

Both of those vary a lot between providers, and neither is documented by the providers themselves.
This page records what has actually been measured.

**This is a living list — please add to it.** See [Contributing results](#contributing-results).

Results are dated because providers change behaviour without announcement. Treat anything older
than a few months as unverified.

---

## Provider CORS support

Whether the **web build** can reach the provider at all. The desktop build bypasses CORS entirely
(it routes through `tauriFetch`), so a ❌ here still works on desktop.

| Provider             | Base URL                                          | Browser | Notes                                                                                                                                                | Tested     |
| -------------------- | ------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| OpenRouter           | `https://openrouter.ai/api/v1`                    | ✅      | `ACAO: *`                                                                                                                                            | 2026-07-30 |
| OpenAI               | `https://api.openai.com/v1`                       | ✅      | `ACAO: *`                                                                                                                                            | 2026-07-30 |
| Groq                 | `https://api.groq.com/openai/v1`                  | ✅      | `ACAO: *`                                                                                                                                            | 2026-07-30 |
| Google               | `https://generativelanguage.googleapis.com`       | ✅      | echoes origin                                                                                                                                        | 2026-07-30 |
| DeepSeek             | `https://api.deepseek.com`                        | ✅      | echoes origin                                                                                                                                        | 2026-07-30 |
| Z.ai                 | `https://api.z.ai/api/anthropic`                  | ✅      | echoes origin                                                                                                                                        | 2026-07-30 |
| MiniMax              | `https://api.minimax.io/v1`                       | ✅      | echoes origin                                                                                                                                        | 2026-07-30 |
| Nebius AI Studio     | `https://api.studio.nebius.com/v1`                | ✅      | `ACAO: *`                                                                                                                                            | 2026-07-30 |
| Nebius Token Factory | `https://api.tokenfactory.<region>.nebius.com/v1` | ✅      | `ACAO: *`; catalog differs per region                                                                                                                | 2026-07-30 |
| Anthropic            | `https://api.anthropic.com`                       | ⚠️      | Needs `anthropic-dangerous-direct-browser-access: true`, which we don't yet send — see [#436](https://github.com/open-pencil/open-pencil/issues/436) | 2026-07-30 |
| TensorX              | `https://api.tensorx.ai/v1`                       | ❌      | Sets CORS on the preflight but **not** on the response. Desktop only. Reported to their support                                                      | 2026-07-30 |

### The common failure

A provider that answers the `OPTIONS` preflight correctly but omits `Access-Control-Allow-Origin`
on the **actual response** will fail in the browser with a generic `Failed to fetch`. OpenPencil
surfaces that as _"Could not reach this endpoint from the browser"_ — which is indistinguishable
from a wrong API key. **Always verify with curl before assuming the app is at fault.**

---

## Model tool-calling quality

The AI chat panel is an agent loop, so a model is only usable if it reliably emits **streaming**
tool calls that the AI SDK can parse. Two independent things go wrong:

- **`id` correctness** — if a streamed `tool_calls` delta introduces a new index without an `id`,
  `@ai-sdk/openai` throws `Expected 'id' to be a string.` and the stream dies.
- **Argument validity** — arguments are streamed in fragments and concatenated. If the fragments
  are misrouted, the result isn't valid JSON and the tool silently never fires.

| Model                       | Provider | Emits calls | `id` correct             | Args valid      | Verdict                                       | Tested     |
| --------------------------- | -------- | ----------- | ------------------------ | --------------- | --------------------------------------------- | ---------- |
| `moonshotai/Kimi-K3`        | Nebius   | 3/3         | ✅ 0 bad                 | ✅ 8/8          | **Recommended** — one complete call per chunk | 2026-07-30 |
| `moonshotai/kimi-k3`        | TensorX  | 2/3         | ✅ 0 bad                 | ✅ 7/7          | Good, but desktop-only (CORS)                 | 2026-07-30 |
| `moonshotai/Kimi-K2.7-Code` | Nebius   | 3/3         | ✅ 0/114 bad             | ✅ 4/4          | Good                                          | 2026-07-30 |
| `openai/gpt-oss-120b`       | Nebius   | 3/3         | ❌ misroutes final chunk | ❌ unterminated | Broken — see below                            | 2026-07-30 |
| `moonshotai/Kimi-K2.6`      | Nebius   | 1/3         | ✅                       | —               | Avoid — calls swallowed by the parser         | 2026-07-30 |

### Known issue: vLLM misroutes the final argument chunk

On some vLLM deployments the closing `}` of a tool call's arguments is emitted under `index + 1`
with no `id`:

```
 1  [{"index":0,"id":"chatcmpl-tool-…","function":{"arguments":"","name":"create_node"},"type":"function"}]
 …  deltas 2–11 stream the arguments, all index 0
12  [{"index":1,"function":{"arguments":"}"}}]      ← wrong index, no id
```

This both crashes the stream _and_ leaves call 0's arguments unterminated. A client-side workaround
must reattach argument-only deltas (no `id`, no `function.name`) to the most recently opened call,
ignoring the claimed index — synthesizing a missing `id` alone converts a visible crash into a
silent no-op.

Models that emit one complete tool call per chunk (Kimi-K3 on every provider tested) cannot hit
this bug at all.

### Known issue: reasoning models and the connection test

Some models (e.g. Kimi-K2.6) spend output tokens on `reasoning` before `content`. The connection
test uses `maxOutputTokens: 1`, so `content` comes back `null`. The test still passes because it
only checks that the request didn't throw — but don't tighten it to assert on returned text, or
reasoning models will fail it spuriously.

---

## Contributing results

Add a row, keep it dated, and say how you tested. Negative results are as useful as positive ones.

### 1. Test CORS

Run this from a shell — curl isn't subject to CORS, so you're inspecting headers, not behaviour.
What matters is `access-control-allow-origin` on the **POST**, not the `OPTIONS`.

```bash
BASE="https://api.example.com/v1"
KEY="sk-…"

# The real response — this is the one that counts
curl -sD - -o /dev/null -X POST "$BASE/chat/completions" \
  -H "Origin: https://openpencil.dev" \
  -H "Authorization: Bearer $KEY" \
  -H "content-type: application/json" \
  -d '{"model":"MODEL","max_tokens":5,"messages":[{"role":"user","content":"hi"}]}' \
  | grep -i "^HTTP\|access-control"
```

✅ if `access-control-allow-origin` is present on the POST response (`*` or your origin).
❌ if it only appears on the `OPTIONS` preflight.

### 2. Test tool-call streaming

Ask the model to make several tool calls, then check every call has an `id` and that the
concatenated arguments parse as JSON:

```bash
curl -sN -X POST "$BASE/chat/completions" \
  -H "Authorization: Bearer $KEY" -H "content-type: application/json" \
  -d '{"model":"MODEL","stream":true,"max_tokens":2000,
       "messages":[{"role":"user","content":"Draw a frog: green ellipse body, two white eye circles, a mouth line. Use create_node for each."}],
       "tools":[{"type":"function","function":{"name":"create_node","description":"Create a node on the canvas",
         "parameters":{"type":"object","properties":{"type":{"type":"string","enum":["ELLIPSE","RECTANGLE","LINE","TEXT"]},
         "x":{"type":"number"},"y":{"type":"number"},"width":{"type":"number"},"height":{"type":"number"},
         "fill":{"type":"string"}},"required":["type","x","y"]}}}]}' \
  | grep -o '"tool_calls":\[[^]]*\]'
```

Check each first-delta-per-index has an `id`, and that concatenating every `arguments` fragment
per index yields valid JSON. Use more than one prompt — failures are often intermittent and depend
on where the JSON happens to land on a chunk boundary.

### 3. Add your row

Include the date, the exact model ID and base URL, and a one-line verdict. If something is broken,
say what the failure looks like from the user's side — that's what makes the row actionable.

### A note on regional catalogs

Some providers serve different models per region behind different hostnames. Nebius Token Factory,
for example, carries Kimi-K3 on `eu-west2` but not on `us-central1`. Always record the exact base
URL you tested — "provider X doesn't have model Y" is only true for the endpoint you checked.

---

## Security note

BYOK in a browser means the user's API key lives in browser storage. OpenPencil encrypts it at rest
(AES-GCM in IndexedDB, with a non-extractable `CryptoKey`) and defaults to memory-only unless the
user opts into "remember"; the desktop build uses the OS keychain instead. But any script running
on the origin can still use the key in place, so prefer scoped keys with spend caps where the
provider offers them.
