---
title: MCP Server
description: Connect Claude Code, Cursor, Windsurf, and other MCP clients to Kalka for AI-assisted design inspection and editing.
---

# MCP Server

Kalka includes an MCP (Model Context Protocol) server that lets AI coding tools — Claude Code, Cursor, Windsurf, etc. — read and modify designs through the running app.

Two transports: **stdio** for MCP clients, and **Streamable HTTP** for browser extensions and scripts. On macOS and Linux, local clients prefer a private Unix domain socket; Windows and unavailable sockets fall back to localhost TCP.

Tool definitions own native Valibot input schemas, execution/mutation metadata, capabilities, and optional interface exposure exclusions. Tools are included by default; `exposure: { mcp: false, ai: false, webmcp: false }` can exclude them independently from each adapter. Exposure does not bypass execution support or user permissions: WebMCP still requires supported execution and explicit Off, Inspect, or Edit access. AI and MCP consume the same schema through Standard Schema; WebMCP derives its JSON Schema from that input. Numeric strings are accepted consistently across adapters, while non-finite values are rejected. Programmatic integrations use MCP SDK v2; custom tools replace the former `params`/`ParamDef` contract with `input` and execution metadata.

## Tool access settings

Use **Settings → Tool access** (select **Local MCP**) to search and toggle the local server's tools, individually or by read-only/side-effect group. Group switches affect all group members, even during search. **Restore defaults** enables the configurable MCP tools again. Existing MCP preferences are preserved separately from the **Built-in AI** settings.

Restart the MCP server, then reconnect stdio clients, to apply changes. For an externally managed server, restart its owning process. The list reflects the tools discovered from the server; disabling a dedicated tool does not prevent an enabled script tool from performing the same operation. These switches are not a sandbox and do not configure remote MCP servers or WebMCP.

## Share only the selection {#selection-scope}

Turn on **Share only the selection** in **Settings → MCP → Local server** to let MCP clients read only the layers you select. Clients then get `get_selection`, `get_node`, `get_page_tree`, `get_metadata`, `get_variable_defs`, `find_nodes`, `describe`, and `export_image`, and no tools that edit, open files, list documents, or change settings. Every node a call names must be a selected layer or inside one; `describe`, `export_image`, `get_metadata`, and `get_variable_defs` read the selection when given no IDs, `find_nodes` searches only the selection unless its `root_id` names a layer inside it, and `get_page_tree` needs a `root_id` from the selection. `export_image` returns the image but cannot write it to a file. With nothing selected, calls fail and ask the user to select layers.

The server enforces this on every call it sends to the app, including `POST /rpc` and stdio clients, so a client cannot widen it. Restart the MCP server to apply the change. For a server you start yourself, set `KALKA_MCP_SCOPE=selection`; a stdio client can also set it to limit itself while the server shares the whole document.

## Browser-native WebMCP (experimental) {#webmcp}

WebMCP is **off by default**. Open **Settings → MCP → WebMCP** and choose **Inspect** for read-only access or **Edit** to also allow scoped, undoable changes. **Off** unregisters all browser tools; changing modes revokes the previous registrations immediately. This preference is independent of local MCP authentication, tool switches, and outbound connections.

For local testing, use a Chrome version exposing `document.modelContext`, enable `chrome://flags/#enable-webmcp-testing`, and relaunch the browser. Open a document, enable access in Settings, and connect a WebMCP-capable browser agent or the [Model Context Tool Inspector](https://developer.chrome.com/docs/ai/webmcp). Settings shows browser support and registration status. See the [Chrome WebMCP guide](https://developer.chrome.com/docs/ai/webmcp) for current availability.

In supported browsers, Kalka registers the selected reviewed set of tools directly in the workspace. Browser agents can inspect nodes, JSX, variables, components, and design patterns, and edit existing layer properties and variable values without installing or connecting an MCP server.

Tools target the document and page active when the call starts. Switching tabs does not redirect an in-flight call. Closing the workspace unregisters the tools. Tool inputs are validated and large inspection results require a narrower query. Oversized editing results are omitted with a committed-edit notice rather than reporting a successful edit as failed.

Edits to geometry, paints, layout, text, and variable bindings/values commit synchronously as individual undoable operations. Failed edits roll back, and undo targets the original document/page even after a page switch. Cancellation prevents an edit from starting; cancellation after commit does not reverse it. Font loading finishes separately without holding a mutation transaction open. Atomic editing currently requires a document with at most 10,000 nodes and variables combined; this shared limit also applies when the same editing tools run through app AI/MCP.

This surface does **not** expose structural creation/deletion, arbitrary JavaScript/JSX execution, image loading, filesystem operations, or credentials. Those tools retain their existing AI/MCP paths. WebMCP is an evolving browser proposal, not universally available; unsupported browsers continue to use Kalka normally. The stdio and HTTP integrations below remain independent.

## Connect a client

The desktop app includes its MCP server and starts it itself; nothing needs installing. Open **Settings → MCP** and connect Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Codex, Gemini CLI, LM Studio or opencode in one click. For any other client, copy the configuration shown there. The server is registered as `kalka`.

The stdio server discovers the running app automatically. It prefers the app's Unix domain socket on macOS and Linux and falls back to localhost TCP when needed. Keep the desktop app open with a document loaded.

A client can start the stdio server while Kalka is closed. It still lists the tools it ships with, and each call returns an error that tells the agent to ask the user to open Kalka and a document, then call again; it does not fail to start or hang. Once the app is running, the next call goes through without restarting the client, and the tool list follows the app's tool access and selection settings, announced to the client as a tool list change.

### Claude Code

After connecting Claude Code from Settings, check the connection:

```sh
claude mcp list
```

Claude Code asks before using each MCP tool unless you allow the server's tools. To auto-approve Kalka tools only, add this to `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["mcp__kalka__*"]
  }
}
```

This is narrower than `--permission-mode bypassPermissions`, which skips prompts for every tool. You can also approve tools interactively from Claude's prompt by choosing "Yes, and don't ask again".

Example prompt:

```text
Use the kalka MCP server to look at the current page and add a small hero section with write_html.
```

### From source

To run the stdio server from a checkout instead:

::: code-group
```json [Bun]
{
  "mcpServers": {
    "kalka": {
      "command": "bun",
      "args": ["/path/to/kalka/packages/mcp/src/stdio.ts"]
    }
  }
}
```
```json [Node.js]
{
  "mcpServers": {
    "kalka": {
      "command": "npx",
      "args": ["tsx", "/path/to/kalka/packages/mcp/src/stdio.ts"]
    }
  }
}
```
:::

## HTTP

For browser extensions, scripts, CI, or any HTTP client. The desktop app runs this server itself; to start one yourself from a checkout:

```sh
bun packages/mcp/src/index.ts   # or: npx tsx packages/mcp/src/index.ts
```

Security defaults:

- Unix socket and discovery files are created with owner-only permissions on macOS and Linux.
- TCP binds to `127.0.0.1` and uses port 7600 by default.
- Authentication is enabled by default with a generated token stored in the private discovery file.
- `eval` is disabled.
- File operations are limited to `KALKA_MCP_ROOT` (defaults to the current working directory) and reject symlink escapes.
- Web pages cannot drive the server. A request, CORS preflight or WebSocket handshake that carries an `Origin` header is refused with `403` unless that origin is allowed; MCP clients and scripts send no `Origin` and are not affected. Only the desktop app's own origins (`kalka-app://app`, and the Tauri ones) are allowed by default, so a server you start yourself works from the app without extra configuration. Set `KALKA_MCP_CORS_ORIGIN` to a comma-separated list of exact origins to allow others, such as a worktree dev server; it replaces the default list.
- Requests whose `Host` header is not `localhost`, `127.0.0.1`, `[::1]` or a `*.localhost` name are refused with `403`, which stops DNS rebinding.
- The server does not use OAuth: `/.well-known/oauth-*` probes get an empty `404`, so clients use the bearer token instead of starting an authorization flow.

Set `PORT=0` to disable TCP on macOS and Linux. Windows requires TCP. Set `KALKA_MCP_SOCKET` to override the Unix socket path, or `KALKA_MCP_DISCOVERY_PATH` to override the discovery file location. To provide a stable token, set `KALKA_MCP_AUTH_TOKEN`; an explicitly empty value disables authentication and should only be used with a trusted local socket.

Endpoints are available over both active transports:

- `GET /health` — server and app connection status; never returns the auth token.
- `POST /rpc` — authenticated live-app automation.
- `POST /mcp` — MCP Streamable HTTP. Sessions use the `mcp-session-id` header.
- `GET /assets/<id>.<ext>` — a file a tool call returned, such as a screenshot (see [Files tools return](#returned-files)). Only over TCP.

## Workflow

1. **Discover targets** — call `list_documents` first when more than one document or page may be open. It returns stable `document_id` and page IDs.
2. **Open** — `open_file` to load an existing `.fig`, or `new_document` for a blank canvas. These return target metadata for the opened or created document.
3. **Read** — `get_page_tree`, `find_nodes`, `get_node`, `list_pages`
4. **Create** — `create_shape`, `render` (JSX)
5. **Modify** — `set_fill`, `set_stroke`, `set_layout`, `update_node`, `set_effects`
6. **Structure** — `reparent_node`, `group_nodes`, `clone_node`, `delete_node`
7. **Save** — `save_file` to write back to `.fig`
8. **Close** — `close_file` to close an open document tab. With unsaved changes it fails unless `unsaved` is `"save"` or `"discard"`; it never prompts in the app.

`undo` and `redo` step back through the agent's own changes, and `activate_document` brings a tab to the front when the user should see it.

Each MCP session shows in the app as an agent with a callsign, like the built-in chat: its cursor and outline sit on the layers each tool reads or changes, it rests after a quiet spell and leaves when the session ends, and people can follow it from their avatar. Collaborators in a shared room see it too.

### Working marks {#working-marks}

While an agent builds, the layers it writes keep a dashed outline in its color with its callsign, so the user sees what is still in progress. The app also remembers, for each layer, which agent last read it and which last wrote it; this is presence, never saved in the document or its undo history. Only the outermost layers a call creates are marked, plus existing layers the call names and changes; a parent that only grows to fit new children is not.

The marks go when the agent calls `finish_working_on_nodes`, after a minute without a tool call from it, when its session ends, and for the built-in chat when its reply ends. New layers an agent creates stay hidden until they animate in, so they never show and then vanish; with **Settings → General → Reduce agent animations**, animations turned off, or the system's reduced motion, they show at once.

Agents work best in small visual groups: one `write_html` or `render` call per section (page shell, header, hero, each section, footer) rather than a whole page in one call, so the user watches the design take shape and can stop it early. The server's instructions ask agents to do this.

Most tools accept optional `document_id` and `page_id` fields. Pass them explicitly for agent workflows instead of relying on the visible active tab/page. `create_page` only creates a page; call `switch_page` separately when the workflow should change the active page.

### Which document answered {#document-identity}

Every tool call that runs on a document ends its result with one more text block naming where it ran, after the tool's own blocks, which stay as they were:

```json
{"target":{"documentId":"tab-2","documentName":"Checkout","path":"/designs/checkout.fig","pageId":"0:1","pageName":"Flows","tokensHash":"3f9a1c07b2de"}}
```

`documentId` is the `document_id` other calls take. `tokensHash` is a short fingerprint of the document's variables and collections: their names, types, modes and values. It changes whenever a token is added, removed, renamed or set to another value, so an agent that compares it with the one it saw when it last read the tokens knows whether to read them again. The same object is in the result's `_meta` under `kalka/document` for clients that read results as data. While [only the selection is shared](#selection-scope) the `path` is left out. `save_file`, `close_file`, `activate_document`, `undo` and `redo` keep reporting it as `target` in their own result.

### Files tools return {#returned-files}

`get_screenshot`, `export_image`, `export_pdf` and `diff_visual` return a file. By default it comes inline, an image as MCP image content that clients such as Claude Code show, and a PDF as an embedded resource, followed by a `resource_link` to a copy on the server and a text block with the metadata (`width`, `height`, `byteLength`, and the `url` and `expiresAt` of the copy).

Pass `delivery: "url"` to get only the link and the metadata. The response stays small, and files larger than the inline limit of about 900 KB of base64 still come back; with the default delivery such a file also comes back as a link only, with a note, instead of failing. An agent can fetch the URL with any HTTP client, such as `curl`, to save the file or hand it to code.

The server keeps each file for 5 minutes, at most 32 files and 64 MB in all, the oldest going first. Links name the file by 128 random bits that only the client whose call returned it receives, and that name is what lets a request read it: no bearer token is needed, so the agent can hand the link to a program that does not have one. The `Origin` and `Host` checks above still apply, so web pages cannot read the files. Links point at the TCP listener (`http://127.0.0.1:<port>/assets/…`); a server started with `PORT=0` has none, and returns files inline only. The stdio bridge relays the links of the app's server.

## AI Agent Skill

Teach your AI coding agent to use Kalka tools with the skill in `skills/kalka/` of this repository: copy that folder into your agent's skills directory.

It works with Claude Code, Cursor, Windsurf, Codex, and any agent that supports [skills](https://skills.sh). The skill covers the CLI, MCP tools, JSX rendering, eval, and the running app's automation bridge.

## Tools

Kalka currently registers 100+ shared design tools, plus MCP-only document and prompt operations when applicable.

### Figma-named tools {#figma-named-tools}

Three read tools share their names, arguments, and meaning with the tools of Figma's Dev Mode MCP server, so prompts and agent skills written for Figma work against Kalka. Each also takes Figma's `fileKey`, `clientLanguages`, and `clientFrameworks` and ignores them: Kalka reads the open document. Node IDs are Kalka IDs such as `0:12`; the `0-12` form that Figma links use is accepted too.

| Tool | Arguments | Returns |
|------|-----------|---------|
| `get_metadata` | `nodeId` (optional), `depth` (optional, Kalka only) | `xml`: one element per layer, named after its type (`frame`, `text`, `component-set`), with `id`, `name`, `x` and `y` relative to the parent, `width`, `height`, and `hidden="true"` for hidden layers; children nest inside. Without `nodeId` it outlines the selection, or lists the pages when nothing is selected; a page ID outlines that page. Past `depth`, a layer carries a `children` count instead. An unknown ID returns an `error` with the page list. |
| `get_variable_defs` | `nodeId` (optional) | `definitions`: each variable and style name the node, the selection, or (with neither) the current page uses, including descendants, mapped to its value in the mode the layers are in, with colors as hex and aliases resolved. `variables` adds each variable's collection, mode, and `valuesByMode`; `styles` lists the shared styles with their values. |
| `search_design_system` | `query` (a string or a list of up to 10), `includeComponents`, `includeVariables`, `includeStyles` (all default `true`), `limit` (per kind and query, default 20) | `results`, one per query: matching `components` (document components and component sets, and components of enabled libraries), `variables` with their values by mode, and `styles`. Every word of a query must appear in the name, so `button primary` finds `Button/Primary`. |

Library variables and styles are found once the document holds them, as it does after using them; the library catalog lists components only.

### Find by style or token {#find-nodes}

`find_nodes` finds the layers to change before a bulk edit or a token migration. Its filters combine, and every one is optional:

| Argument | Matches |
|----------|---------|
| `name`, `text` | Layer name, or a text layer's content: a case-insensitive substring, or a whole-value pattern with `*` and `?` (`Button*`, `Icon/2?`) |
| `type` | Node type such as `FRAME`, `TEXT`, or `INSTANCE` |
| `style` | `{ property, value }` against the CSS Kalka writes for the layer: its fields as CSS plus the CSS it keeps as written, the declarations `getCSSAsync` returns. A color matches in any notation (`#2F5BEA`, `rgb(47 91 234)`, `hsl()`, `oklch()`), alpha included, and also inside `border`, `box-shadow`, and gradients; a length matches in `px` or `rem`, and a longhand such as `padding-left` reads from `padding`. `*` and `?` match the whole value as text. Without `property` every declaration is tried; without `value` every layer declaring `property` matches |
| `variable` | A variable's name (`color/primary`), ID, or CSS custom property (`--color-primary`). `variable_match: "bound"` (default) finds layers bound to it directly or through a variable that aliases it, in any mode. `"unbound"` finds layers that hold its value in one of its modes without binding a variable there: solid fill and stroke colors for a color, the fields its scopes allow for a number (corner radius, gap and padding, size, stroke weight, opacity, font size, line height, letter spacing), font family and text for a string. `"any"` returns both |
| `tolerance` | How close values must be: Euclidean distance in 0–255 RGB for colors (default 1), pixels for lengths (default 0.01) |
| `within`, `page`, `root_id` | Where to look: the current page (default), `selection`, or `document`; `page` names another page by name or ID; `root_id` searches one layer and its descendants |
| `limit` | Most nodes returned, 1–1000 (default 100) |

The result has `count`, every layer that matched, `truncated` when there are more than `limit`, and `nodes`, each with `id`, `name`, `type`, and `page` (`id` and `name`). A `style` filter adds `styles`: the matched `property` and declared `value`, and the `variables` bound to the fields it comes from. A `variable` filter adds `tokens`: the binding `field` (`fills/0/color`, `cornerRadius`), the CSS `properties` it gives the layer, the `value`, the `variable`, and `bound`; a bound match names the `mode` the layer reads it in and `throughAlias` when an alias is bound, and an unbound one lists the `modes` whose value it holds. Pass that `field` to `bind_variable` to migrate a layer to the token.

For example, `{ "style": { "property": "background-color", "value": "#2F5BEA" }, "within": "document" }` lists every layer painted that blue and which of them a variable already drives, and `{ "variable": "color/primary", "variable_match": "unbound" }` lists the layers to bind to `color/primary`.

### Document

| Tool | Description |
|------|-------------|
| `open_file` | Open a `.fig` file for editing |
| `close_file` | Close an open document tab; `unsaved: "save"` or `"discard"` decides what happens to unsaved changes |
| `save_file` | Save the current document to a `.fig` file |
| `new_document` | Create a new empty document |
| `list_documents` | List open app documents/tabs and their pages |
| `activate_document` | Bring a document tab to the front, optionally on a given page |

### History

| Tool | Description |
|------|-------------|
| `undo` | Undo the newest change made through MCP or the CLI |
| `redo` | Redo the newest change undone through MCP or the CLI |

The history is shared with the person in the editor. `undo` and `redo` refuse when the newest step was made in the editor, so an agent never reverts the user's work. Each editing tool call is one undo step. An `eval` script is recorded against its target page, so edits it makes after switching `figma.currentPage` are not undoable.

### Settings

| Tool | Description |
|------|-------------|
| `get_settings` | Read editor settings: appearance, snapping, canvas rendering, recovery, AI chat, and design check preferences |
| `update_settings` | Change settings with a partial object shaped like `get_settings` output; invalid keys and values are rejected |

Settings tools never expose credentials, AI models, MCP connections, storage, or tool access. The available keys are listed in [Controlling the App](/programmable/cli/app-control#settings).

### Read

| Tool | Description |
|------|-------------|
| `get_selection` | Get the selected nodes, with their direct children by default; `depth` sets how many levels |
| `get_page_tree` | Get the full node tree of the current page |
| `get_metadata` | XML outline of a node or the selection: ids, types, names, positions, and sizes; see [Figma-named tools](#figma-named-tools) |
| `get_current_page` | Get the current page name and ID |
| `get_node` | Get detailed properties of a node by ID |
| `find_nodes` | Find layers by name, type, text, CSS value, or variable; see [Find by style or token](#find-nodes) |
| `get_components` | List all components in the document |
| `search_design_system` | Search components, variables, and styles of the document and its libraries by name |
| `list_pages` | List all pages |
| `list_variables` | List design variables |
| `list_collections` | List variable collections |
| `list_fonts` | List fonts used in the current page |
| `list_available_fonts` | List font families the current host can render |
| `get_font_status` | Report requested faces, loaded sources, active substitutions, why an installed face could not be loaded, and affected nodes |
| `page_bounds` | Get bounding box of all objects on the current page |
| `node_bounds` | Get bounding box of a node |
| `node_ancestors` | Get ancestor chain of a node |
| `node_children` | Get direct children of a node |
| `node_tree` | Get the subtree rooted at a node |
| `node_bindings` | Get variable bindings on a node |

### Create

| Tool | Description |
|------|-------------|
| `create_shape` | Create a shape (`FRAME`, `RECTANGLE`, `ELLIPSE`, `TEXT`, `LINE`, `STAR`, `POLYGON`, `SECTION`) |
| `create_vector` | Create a vector node from a path string |
| `create_slice` | Create an export slice |
| `create_page` | Create a new page |
| `render` | Render JSX to design nodes — create entire component trees in one call |
| `create_component` | Convert a frame/group into a component |
| `create_instance` | Create an instance of a component |
| `create_slot` | Make a frame inside a main component a slot |
| `set_behaviour` | Make a component behave as a Reka UI control, by its property and slot names; `null` removes it |
| `get_behaviour` | Read a component's behaviour and what it still misses; without an ID, list every kind |
| `node_to_component` | Convert an existing node into a component in-place |

### Modify

| Tool | Description |
|------|-------------|
| `set_fill` | Set fill color (hex) |
| `set_stroke` | Set stroke color, weight, alignment |
| `set_effects` | Add shadow or blur effects |
| `update_node` | Update position, size, opacity, corner radius, text, font |
| `set_layout` | Set auto-layout (flexbox) — direction, spacing, padding, alignment |
| `set_constraints` | Set resize constraints |
| `set_rotation` | Set rotation angle in degrees |
| `set_opacity` | Set opacity (0–1) |
| `set_radius` | Set corner radius (uniform or per-corner) |
| `set_minmax` | Set min/max width and height constraints |
| `set_text` | Set text content of a `TEXT` node |
| `set_font` | Set font family and weight |
| `set_font_range` | Set font properties on a character range |
| `set_text_resize` | Set text auto-resize mode (fixed/auto-width/auto-height) |
| `set_visible` | Show or hide a node |
| `set_blend` | Set blend mode |
| `set_locked` | Lock or unlock a node |
| `set_stroke_align` | Set stroke alignment (inside/center/outside) |
| `set_text_properties` | Set text layout: alignment, auto-resize, text case, decoration, truncation |
| `set_layout_child` | Configure auto-layout child: sizing, grow, alignment, absolute positioning |
| `node_move` | Move a node to a new position |
| `node_resize` | Resize a node |
| `node_replace_with` | Replace a node with another node |
| `arrange` | Align or distribute selected nodes |

### Structure

| Tool | Description |
|------|-------------|
| `delete_node` | Delete a node |
| `clone_node` | Duplicate a node |
| `rename_node` | Rename a node |
| `reparent_node` | Move a node into a different parent |
| `select_nodes` | Select nodes by ID |
| `group_nodes` | Group nodes |
| `ungroup_node` | Ungroup a group |
| `flatten_nodes` | Flatten nodes into a single vector |
| `boolean_union` | Boolean union of two or more nodes |
| `boolean_subtract` | Boolean subtraction |
| `boolean_intersect` | Boolean intersection |
| `boolean_exclude` | Boolean exclusion |

### Vector Path

| Tool | Description |
|------|-------------|
| `path_get` | Get the path data of a vector node |
| `path_set` | Set the path data of a vector node |
| `path_scale` | Scale a vector path |
| `path_flip` | Flip a vector path horizontally or vertically |
| `path_move` | Translate a vector path |

### Export

| Tool | Description |
|------|-------------|
| `export_image` | Export nodes as PNG, JPG, or WEBP, returned inline or as a link ([Files tools return](#returned-files)) |
| `export_svg` | Export nodes as SVG markup |

### Viewport

| Tool | Description |
|------|-------------|
| `viewport_get` | Get current viewport position and zoom level |
| `viewport_set` | Set viewport position and zoom |
| `viewport_zoom_to_fit` | Zoom viewport to fit specified nodes |

### Variables

| Tool | Description |
|------|-------------|
| `get_variable_defs` | Variables and styles a node or the selection uses, with values in every mode |
| `get_variable` | Get a variable by ID or name |
| `find_variables` | Find variables by name pattern or type |
| `create_variable` | Create a new variable in a collection |
| `set_variable` | Set a variable value in a mode |
| `delete_variable` | Delete a variable |
| `bind_variable` | Bind a variable to a node property |
| `get_collection` | Get a variable collection by ID or name |
| `create_collection` | Create a new variable collection |
| `delete_collection` | Delete a variable collection |

### Analyze

| Tool | Description |
|------|-------------|
| `analyze_colors` | Analyze color palette usage across the document |
| `analyze_typography` | Analyze font/size/weight distribution |
| `analyze_spacing` | Analyze gap and padding values |
| `analyze_clusters` | Detect repeated patterns (potential components) |
| `lint` | Check accessibility and consistency issues, with fixes and suggestions |
| `lint_fix` | Apply safe lint fixes, and optionally the first suggestion of each finding |

### Diff

| Tool | Description |
|------|-------------|
| `diff_create` | Patch that turns one node tree into another, as JSX attribute changes |
| `diff_jsx` | Structural diff between two nodes as design JSX |
| `diff_show` | Preview the patch that setting JSX attributes on a node would produce |
| `diff_apply` | Apply a patch after checking the nodes still match its old values |
| `diff_visual` | Pixel diff between two rendered nodes, returned as an image |

### Navigation

| Tool | Description |
|------|-------------|
| `switch_page` | Switch to a page by name or ID |

### Presence

| Tool | Description |
|------|-------------|
| `finish_working_on_nodes` | Release the [working marks](#working-marks) on the given `node_ids` and the layers inside them, or on everything the agent is working on when called without IDs. Returns `released`, the layers let go of |

### Escape Hatch

| Tool | Description |
|------|-------------|
| `eval` | Execute JavaScript with full Figma Plugin API access |

Note: `eval` is available over stdio, but disabled in HTTP mode for security.
