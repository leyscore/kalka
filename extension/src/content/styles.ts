// The inspector's own styles, inside its shadow root: Kalka's blue, Geist when the page has it,
// the system font otherwise.
export const STYLES = `
:host, * { box-sizing: border-box; }
* { font-family: Geist, ui-sans-serif, system-ui, -apple-system, sans-serif; }
[data-open="false"] { display: none !important; }
.margin, .padding, .border { position: fixed; pointer-events: none; }
.margin { border-style: solid; border-color: #F9731638; }
.padding { border-style: solid; border-color: #22C55E3D; }
.border { border: 2px solid #2F5BEA; background: #2F5BEA0F; }
.border[data-locked="true"] { border-width: 2px; box-shadow: 0 0 0 4px #2F5BEA33; }
.label { position: fixed; display: flex; gap: 8px; align-items: center; height: 22px; padding: 0 8px; border-radius: 6px; background: #2F5BEA; color: #FFFFFF; font: 500 11px ui-monospace, 'Geist Mono', monospace; white-space: nowrap; }
.label .dim { opacity: 0.75; }
.panel { position: fixed; top: 12px; right: 12px; width: 280px; max-height: calc(100vh - 80px); overflow: auto; border-radius: 14px; background: #141418F2; color: #EDEDF0; font-size: 12px; box-shadow: 0 20px 50px #00000059; pointer-events: auto; }
.head { display: flex; align-items: center; gap: 8px; padding: 12px 14px; }
.head b { font: 500 12px ui-monospace, 'Geist Mono', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.head .dim { margin-left: auto; color: #8B8B95; white-space: nowrap; }
.sec { display: flex; flex-direction: column; gap: 7px; padding: 11px 14px; border-top: 1px solid #FFFFFF12; }
.sec h3 { margin: 0; color: #8B8B95; font: 500 10px ui-monospace, 'Geist Mono', monospace; letter-spacing: 0.08em; }
.kv { display: flex; justify-content: space-between; gap: 10px; }
.kv span:first-child { color: #8B8B95; }
.kv span:last-child { font-family: ui-monospace, 'Geist Mono', monospace; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sw { display: flex; align-items: center; gap: 8px; font-family: ui-monospace, 'Geist Mono', monospace; }
.sw i { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #FFFFFF26; flex: none; }
.sw .role { margin-left: auto; color: #8B8B95; font-family: inherit; }
.crumb { position: fixed; left: 12px; right: 304px; bottom: 12px; display: flex; flex-wrap: nowrap; align-items: center; gap: 4px; min-height: 32px; padding: 0 10px; border-radius: 10px; background: #141418F2; color: #A9A9B3; font: 11px ui-monospace, 'Geist Mono', monospace; overflow: hidden; pointer-events: auto; }
.crumb button { border: 0; background: transparent; color: #A9A9B3; font: inherit; padding: 4px 4px; border-radius: 6px; cursor: pointer; white-space: nowrap; }
.crumb button:hover { color: #FFFFFF; background: #FFFFFF14; }
.crumb button.on { color: #FFFFFF; }
.crumb .keys { margin-left: auto; padding-left: 12px; white-space: nowrap; color: #6B6B75; }
.bar { position: fixed; display: flex; align-items: center; gap: 4px; padding: 5px; border-radius: 12px; background: #141414; color: #FFFFFF; box-shadow: 0 16px 40px #0E122259; pointer-events: auto; }
.bar button { height: 32px; padding: 0 10px; border: 0; border-radius: 8px; background: transparent; color: #FFFFFF; font: 500 12px inherit; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap; }
.bar button:hover { background: #FFFFFF1A; }
.bar button:focus-visible, .menu button:focus-visible, .crumb button:focus-visible { outline: 2px solid #9DB7F5; outline-offset: 1px; }
.bar .go { background: #2F5BEA; font-weight: 600; }
.bar .go:hover { background: #1236B8; }
.bar .chip { color: #A9A9B3; font-weight: 500; }
.bar .chip[aria-pressed="true"] { color: #FFFFFF; background: #FFFFFF24; box-shadow: inset 0 0 0 1px #9DB7F5; }
.bar .chip[hidden] { display: none; }
.bar .sep { width: 1px; height: 20px; background: #FFFFFF2E; margin: 0 2px; }
.k { padding: 1px 5px; border-radius: 5px; background: #FFFFFF24; font: 10px ui-monospace, 'Geist Mono', monospace; color: #DCE6FF; }
.menu { position: fixed; display: flex; flex-direction: column; width: 240px; padding: 4px; border-radius: 12px; background: #FFFFFF; color: #141414; box-shadow: 0 16px 40px #0E122240; pointer-events: auto; }
.menu:not([data-open="true"]) { display: none; }
.menu button { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 0; border-radius: 8px; background: transparent; color: #141414; font: 12px inherit; text-align: left; cursor: pointer; }
.menu button:hover { background: #EEF2FD; }
.menu small { margin-left: auto; color: #6B7086; font: 11px ui-monospace, 'Geist Mono', monospace; }
.toast { position: fixed; left: 50%; bottom: 56px; transform: translateX(-50%); max-width: min(560px, calc(100vw - 32px)); padding: 10px 14px; border-radius: 12px; background: #141414; color: #FFFFFF; font-size: 13px; line-height: 1.45; box-shadow: 0 16px 40px #0E122259; }
.toast[data-done="true"] { border-left: 0; box-shadow: 0 0 0 1px #22C55E80, 0 16px 40px #0E122259; }
@media (prefers-reduced-motion: no-preference) { .bar, .toast, .label { transition: top 0.08s ease-out, left 0.08s ease-out; } }
`
