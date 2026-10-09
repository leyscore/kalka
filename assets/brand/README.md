# Kalka brand sources

- `mark.svg` is the Kalka K from the brand kit: a stem, an arm and a curved leg, each with a `data-part` attribute that derived dark and monochrome artwork recolor. It uses a tight `14 14 72 72` viewBox.
- `mark-micro.svg` is the same geometry at a 16px intrinsic size.
- The K is Kalka blue (`#2F5BEA`) on light surfaces, paper (`#EFEFEC`) on dark ones; monochrome artwork is ink (`#121214`) or paper.

Edit these SVGs, not generated files. The tile color, radius and scales live in `tools/generate/brand/src/config.ts`. The app icon puts the paper K on a blue tile with a 22% corner radius, the K spanning 72% of the tile, as in the brand kit. Native desktop assets retain their platform-specific outer margin. Desktop icons, any-purpose PWA icons, and larger in-app branding share this composition; use `BrandMark` with `variant="app-icon"` for larger placements. The editor header uses a 24px tile. Favicons use the same tile with the micro master inside, in both browser themes. Apple Touch keeps an opaque square for platform rounding; maskable artwork stays opaque and inside the central 80%-diameter safe circle. Electron takes its development icon from `electron/build/`, copied from the brand kit's `app/` folder.

## Generation

```sh
bun run generate:icons                    # All targets
bun run generate:icons --target web       # App/browser/PWA
bun run generate:icons --target docs      # Documentation
bun run generate:icons --target desktop   # Native PNG/ICO/ICNS
bun run generate:icons --force            # Ignore the content cache
bun run check:icons                       # Fresh generation, contracts, reproducibility, types
bun test tools/generate/brand/tests
```

Generation is local using pinned RealFaviconGenerator/Sharp and Tauri versions; no hosted generator or credentials are needed. Generated assets and the cache are ignored by Git. Only the two artwork masters, settings, code, tests, and the normal Playwright visual baseline are tracked.

Vite ensures web assets before app dev/build. VitePress ensures docs assets before docs dev/build. Storybook prepares the assets for its stories. Tauri's dev/build hooks prepare native icons before compilation. Direct Cargo commands bypass those hooks: run `bun run generate:icons --target desktop` before `cargo check` or `cargo build` on a fresh checkout. CI's native-contract job does this explicitly. No icon generation runs in the shipped application.

Outputs are owned by `tools/generate/brand/src/config.ts`: `public/brand/`, `packages/docs/public/brand/`, the root ICO/Apple Touch files in each public directory, and `desktop/icons/`. The app's manifest remains in `vite/pwa.ts`; docs intentionally do not receive an installable-app manifest. Web assets never symlink into desktop output.

Preparation fingerprints the artwork, generator code/settings, lockfile and runtime/tool versions, verifies output hashes, and skips unchanged targets. Missing or corrupted outputs regenerate. A cross-process lock serializes concurrent builds; each file is published atomically and the cache is written last. Destination symlinks are rejected. Native ICNS frame ordering is normalized without re-encoding images.

## Review

Use the **Brand/Mark** Storybook stories for main, micro, dark, and monochrome appearances. `tests/e2e/brand/icons.spec.ts` checks the browser assets, app theme selection, and the main mark's visual baseline. Review intentional changes before updating its snapshot. Run at actual 16/24/32 pixel sizes as well as large sizes.

Do not mechanically replace generic pencil/tool icons or historical screenshots. Social artwork, external profile avatars, and Apple Icon Composer layered icons are separate design/export tasks.
