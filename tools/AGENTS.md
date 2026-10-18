# Repo tooling, CI, and releases

Private tooling lives under `tools/<role>/<domain>/{src,tests}`; Steiger enforces the layout and kebab-case domain names. Every tool is a workspace named `@kalka/<domain>-tools`, listed literally in the root `workspaces` (the manifest schema rejects globs on purpose), so it can declare dependencies and run through `bun --filter`. `bun run check:tools` type-checks every tool through `tools/tsconfig.json`; `bun run test:tools` runs every tool with a `test` script. A tool imports its own files through its package.json `imports` alias (`#ci/*`, `#release/*`), other tools through their package name, and the docs site config through the shared `#docs-config/*` path.

| Role        | Contract                                                                                                               | Domains                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `checks/`   | Read the tree and exit non-zero; never write inside the repository except an own baseline behind an explicit `--write` | `architecture`, `lint`, `i18n`, `secret-scan`, `type-shapes`, `docs`, `test-homes`, `package-quality` |
| `generate/` | Write generated files or artifacts, idempotently                                                                       | `brand`, `demo`, `tauri-menu`, `authoring-reference`, `visual-oracles`                                |
| `release/`  | Build, verify, and publish packages (desktop installers come from electron-builder)                                    | `package-artifacts`, `release-packages`                                                               |
| `ci/`       | Consumed by workflows: path classification and gate policy, container images, the review-guidance bot                  | `policy`, `images`, `pr-review-guidance`                                                              |
| `dev/`      | Test running and benchmarks for humans                                                                                 | `unit-tests`, `navigation-benchmark`, `dev-server`                                                    |

- Nothing under `generate/` or `release/` runs from `bun run check` except through a check entrypoint; `generate/authoring-reference` keeps its `check.ts` beside `generate.ts` until it splits.
- Resolve the workspace with `resolveWorkspaceRoot` from `@kalka/package-artifacts-tools`, not parent-directory traversal. Keep sibling imports relative.
- `checks/test-homes` owns `engine-baseline.txt` and `check:test-homes`; `dev/unit-tests` owns the shard map and runner (`tests/AGENTS.md`).
- No `scripts/` entrypoints: root `package.json` scripts call tool files directly.

## CI

- `.github/workflows/ci.yml` and `heavy-tests.yml` define validation gates; `ci.yml` also runs on pushes to `main`, comparing with the commit they replace, and `heavy-tests.yml` runs only by `workflow_dispatch`. CI always classifies changed paths through `tools/ci/policy/src/policy.ts`: root docs, package READMEs, every `AGENTS.md`, `packages/docs` Markdown and assets, and skill Markdown are docs-only; runtime prompt Markdown, executable examples, configuration, and unknown paths require code validation.
- Docs-only changes run documentation integrity and the docs build; everything else runs the full suites. The aggregate `CI result` gate requires successful classification and every applicable job; failures, cancellations, and unexpected skips cannot pass. Do not restore workflow-level path filtering on required CI.
- `commitlint.config.ts` enforces commit structure in the **Commit messages** job; the separate **PR title** workflow validates titles. Preserve the `Release vX.Y.Z` exception and product casing when changing rules; the known AI co-author check does not rewrite base history. Gate policy lives in `tools/ci/policy/src/policy.ts`.
- `tools/ci/policy` runs right after Bun is set up, before any install, so it imports only Node built-ins; `oxlint.json` switches `kalka/prefer-es-toolkit` off there. Other CI tools install their workspace first, through `.github/actions/setup-bun`.
- Required checks must also run on `merge_group`, the merge queue's event; read base and head from `merge_group.base_sha`/`head_sha` there (`ci.yml`, `pr-title.yml`).
- A passing pull request run records the tree it tested as the `CI verified tree` status on the PR head; a merge queue commit with that exact tree is classified `verified` and runs only the always-on checks. Any other tree, including a group with other PRs ahead, gets the full run (`tools/ci/policy/src/verified-tree/`).
- `e2e-baselines.yml` and `fig-baselines.yml` are manual `workflow_dispatch` writers, not gates: the first reruns the given Playwright specs on Linux (`kalka`, `kalka-webkit`, or both) on one worker with `--update-snapshots=changed` (`update=false` only compares) and uploads the rewritten `*-linux.png` files, the second writes `.fig` import baselines and the `fig-import` page captures that need `material3.fig`. Their artifacts unpack at the repository root and last one day; review and commit them by hand (`tests/AGENTS.md`, Browser runs).
- LFS objects live in this private repository: jobs that pull them keep the checkout's credentials, and `.github/actions/setup-bun` caches them by pointer so the metered LFS bandwidth is spent only when a fixture changes.

## Releases

- Update versions in the root and publishable package manifests plus `electron/package.json`; move `Unreleased` into `## x.y.z — YYYY-MM-DD`; commit `Release vX.Y.Z`; tag and push `vX.Y.Z`.
- There is no release workflow yet: the inherited Tauri `build.yml` was removed with the move to Electron, and `tools/release/release-packages` still describes it. Build installers with `bun run package:desktop`.
- Public workspace packages are discovered by the package-artifacts catalog. Bun source exports require the complete `src` directory in package contents; Node exports use `dist`. Release preparation must preserve resolution maps. Prepared publish directories receive the root `LICENSE` when a package has none of its own, and every package needs a `README.md` because npm renders it. Publishing uses prepared npm tarballs verified through the shared Node/Bun consumer checks; never publish package directories manually. `test:packages` first runs the packaging guards in `tools/checks/package-quality/src/smoke/guards.ts`: fixture manifests packed with the real `npm pack` that must trip the tarball inspector and the Node/Bun consumer checks before those checks vouch for real packages.
- Ensure Tauri and Apple signing/notarization secrets are configured. Verify the draft title, body, and artifacts, then publish. Release titles are exactly the tag (`vX.Y.Z`) without a product-name prefix.
- Homebrew's `kalka` cask is managed upstream: BrewTestBot proposes bumps and Homebrew merges them. Check the upstream cask PR after publication; do not push to the archived custom tap or add bump automation. Users install the app with `brew install --cask kalka` and the CLI through npm or Bun.

## Demo document

The `/demo` document is Kalka's landing page, the Kalka folder `assets/demo/kalka-design`, zipped into the ignored `public/demo.kalka` and opened like any `.kalka` file. The engine showcase the browser tests open at `/demo?fixture` is built from `tools/generate/demo/src/document/` into `.cache/demo/fixture.fig`, which only the dev server serves (`demoFixturePlugin`), so installers never carry it. `ensureDemoDocument` runs from `vite.config.ts`, rebuilds each output only when its inputs' fingerprint changes, and runs the fixture build in Bun; `bun run generate:demo` forces both. A section that needs something new from the engine adds that package's `src` to the fingerprint in `tools/generate/demo/src/ensure.ts`.

## Brand assets

Canonical artwork lives in `assets/brand/` (main mark and optical micro master; see its README). `tools/generate/brand/` derives web, docs, and native icons with RealFaviconGenerator and Tauri; generated assets are ignored, not committed. Vite and VitePress configs prepare their own targets; the desktop installers use the icons in `electron/build`.
