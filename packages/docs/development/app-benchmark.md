---
title: App Benchmark
description: Measure the desktop app's startup, memory, document opening, artboard cost and gesture smoothness, on a modern machine and an emulated old one.
---

# App benchmark

`bun run bench` starts the desktop app with Playwright's Electron driver, as a user would, and measures what a person feels and what the machine pays: how long the app takes to start, how much memory every process holds, how long documents take to open, what each artboard costs, and how smooth panning, zooming, dragging, resizing and typing stay. It writes `report.json` and a Markdown summary, `report.md`. The tool lives in `tools/dev/app-benchmark`.

It complements the [navigation benchmark](./navigation-performance.md), which replays recorded trackpad gestures in Chromium to study the canvas's navigation pipeline in depth. This one covers the whole desktop app, on one command, and is the baseline for the performance work of beta 4.

## Run it

```sh
bun run build                      # the renderer the app loads
bun run --cwd electron build       # main process, preload, bundled MCP server
bun run bench                      # every scenario, profiles modern, old-4x and old-6x
```

Options, all optional:

| Option           | Meaning                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--profile NAME` | `modern`, `old-4x` or `old-6x`; repeat for several. Default: all three.                                                              |
| `--only LIST`    | `startup`, `documents`, `artboards`, comma-separated.                                                                                |
| `--doc LIST`     | Only these documents, by name prefix (`layers-2k`, `demo`).                                                                          |
| `--steps LIST`   | Artboard counts for the artboard scenario. Default `1,5,10,30,50`.                                                                   |
| `--runs N`       | Startup launches per profile. Default 3; the median is reported.                                                                     |
| `--app PATH`     | A packaged app's binary (`electron/release/mac-arm64/Kalka.app/Contents/MacOS/Kalka`) instead of `electron/` on the workspace build. |
| `--output DIR`   | Where reports go. Default `artifacts/app-benchmark`.                                                                                 |
| `--settle MS`    | Idle time before each memory sample. Default 3000.                                                                                   |

One app runs at a time, each launch in a fresh copy of a profile directory that a first launch primed (English, first-run screens seen), and every process the app started is killed when it closes. A full run of three profiles takes about half an hour. Close other heavy apps first: memory numbers are per process, but timings share the CPU. Gold-preview needs Git LFS (`git lfs pull --include tests/fixtures/gold-preview.fig`); it is skipped when only its pointer is checked out.

## Profiles

| Profile  | CPU                | GPU             | Memory                        |
| -------- | ------------------ | --------------- | ----------------------------- |
| `modern` | as is              | hardware        | as is                         |
| `old-4x` | renderer ×4 slower | `--disable-gpu` | V8 old space capped at 512 MB |
| `old-6x` | renderer ×6 slower | `--disable-gpu` | V8 old space capped at 512 MB |

What the emulation can and cannot do:

- **CPU.** `Emulation.setCPUThrottlingRate` slows the editor's renderer process only, from the moment its window exists. The main process, the GPU process, the bundled MCP server and the worker that parses `.fig` files run at full speed, and the first few hundred milliseconds of page load are not throttled. Throttled timings are therefore a lower bound for an old machine.
- **GPU.** `--disable-gpu` moves compositing and rasterisation to software, as on machines whose GPU Chromium blocklists. It does not reproduce a slow integrated GPU.
- **RAM.** macOS cannot cap a process tree's physical memory, so the bench does not pretend to: it measures each process's footprint and the reader compares it with what a small machine leaves free. A 1 GB machine running Windows 10 or a current Linux desktop has roughly 300–500 MB free for an app, a 2 GB one roughly 0.8–1.2 GB; beyond that the OS compresses and swaps, and everything slows down. Capping V8's old space at 512 MB makes a heap that would not fit fail loudly instead of swapping quietly.
- **Display.** Frames are paced by the Mac's display. On a 120 Hz panel the frame budget is 8.3 ms; the report states the measured interval and counts dropped frames against it.

## Metrics

### Startup

Measured from the moment Playwright launches the binary:

- **First window**: the window exists.
- **App mounted**: Vue mounted the app into `#app`.
- **Home rendered**: the home screen's New design button is in the page, under the splash.
- **Splash gone**: the boot splash left. It fades for 160 ms once the first screen is painted with its fonts (`src/app/shell/support/splash.ts`), so this is when a person can use the home screen.
- **Empty document ready**: from clicking New design to an editor whose canvas settled.
- **Launch with a document**: launching with `gold-preview.fig` as an argument, as the Finder does, until its canvas settled.

The last launch also reloads the home screen under a trace and reports how long the renderer's main thread was busy, module evaluation and compilation, and WebAssembly compilation; whether `canvaskit.wasm` was fetched at home or after an empty document; and how many windows exist at idle (hidden raster windows would count).

### Memory

Every process descending from the app's main process, classified by Electron's `app.getAppMetrics()` type, or by command line for children Electron does not know (the bundled MCP server runs as `ELECTRON_RUN_AS_NODE`). For each: RSS, and on macOS the physical footprint from `footprint(1)`, which is what Activity Monitor shows and what decides whether the machine swaps. The total footprint counts shared memory once; RSS totals count it in every process. JS heap and DOM counters come from the renderer's `Performance.getMetrics`; artboard iframes share the editor's renderer process and heap. Idle CPU is the sum of every Electron process's `percentCPUUsage` over two idle seconds, in percent of one core.

### Bundle

Every `.js`, `.css` and `.wasm` file in `dist`, split into what the home screen loaded, what an empty document added, and what nothing loaded (lazy), from the page's resource timing and its script and stylesheet elements.

### Opening documents

The demo (a Kalka folder), `gold-preview.fig`, and generated `.fig` files: `layers-2k` and `layers-20k` (20 artboards of cards of ten layers, a third of them text, every fourth card with a shadow) and `flat-500` (500 empty top-level frames). Each opens in a running app through the same `open-file` event the Finder sends, and is timed in two parts:

- **Import**: until a new editor's graph holds the page's top-level layers: reading, parsing in the worker, building the graph.
- **First render**: until every artboard iframe loaded its document and fonts and two frames passed.

A trace over the whole open attributes the time to the parse worker, main-thread JS, style, layout, paint, compositing and GPU. JS heap is read when the graph is ready, before the canvas draws, and again with memory once the document is idle. As a reference for import alone, the bench also parses each `.fig` in Bun (JavaScriptCore, not V8, so compare trends, not values).

### Cost per artboard

Each top-level layer of a page is an iframe. Generated documents of 1, 5, 10, 30 and 50 artboards of a hundred layers each open one after the other; for each, the bench samples memory and pans with every artboard on screen, then zooms into the first at 100 % and does it again. The slope of a value over the artboard count is the cost of one more artboard.

### Gestures

On `layers-2k` and `layers-20k`: a pan (60 wheel events), a pinch zoom (Control and wheel), dragging a card, resizing a card from its corner, and typing 43 characters into a text layer, input arriving every 16 ms like a mouse or trackpad. Each gesture reports:

- **Frame pacing** from a `requestAnimationFrame` loop in the page: p50, p95 and maximum interval, display frames dropped against the measured display interval, long tasks, and the time from each input event to the next frame. The rAF loop shows when the main thread could produce a frame, not when the compositor presented it; compositor-only jank is not in it.
- **Work per display frame** from a Chromium trace: main-thread self time filed as JS, style, layout, paint, composite (Blink's `Layerize`, `Commit` and layer updates) or other (work devtools does not name, such as IPC and task scheduling), plus the renderer's compositor thread (composite) and the GPU process's main and viz threads (GPU), bucketed into display-frame windows, with p50 and p95. The events with the most main-thread self time over the gesture are listed by name, which says which Blink step or script dominates.
- **Rendering cost by document**: layouts per input event, the layout objects each layout dirtied out of the document's total, full-document layouts, and style elements, separately for the editor's own document (panels, overlay) and the artboard iframes. A gesture previewed with transforms would lay out nothing in the artboard per move; one that patches the artboard's DOM lays out the dirty part, or all of it.
- **Took**: whether the gesture did what it plays (the view moved, the card moved or grew, the text grew); a gesture that did not take measures nothing.

## Comparing runs

Absolute numbers depend on the machine, its power state and what else runs. Compare runs on the same machine, alternating baseline and candidate builds, and read p95 and dropped frames rather than averages. Do not gate CI on these timings.
