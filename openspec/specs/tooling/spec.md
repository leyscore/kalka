# tooling Specification

## Purpose
Build and development tooling. Vite 7 build system, oxlint linting, oxfmt formatting, typescript-go type checking, and Tailwind CSS 4 integration.
## Requirements
### Requirement: Vite 7 build system
The project SHALL use Vite 7 as the build tool with dev server at port 1420 and HMR support. VitePress SHALL be installed as a devDependency for the documentation site. The `docs:dev`, `docs:build`, and `docs:preview` scripts SHALL be added to package.json.

#### Scenario: Dev server
- **WHEN** `bun run dev` is executed
- **THEN** Vite dev server starts at http://localhost:1420 with hot module replacement

#### Scenario: Docs scripts available
- **WHEN** `bun run docs:dev` is executed
- **THEN** VitePress dev server starts for the documentation site

#### Scenario: Docs build
- **WHEN** `bun run docs:build` is executed
- **THEN** VitePress builds the documentation site to `docs/.vitepress/dist/`

#### Scenario: Docs preview
- **WHEN** `bun run docs:preview` is executed
- **THEN** a static server previews the built documentation site

### Requirement: oxlint linting
The project SHALL use oxlint for fast linting with project-specific configuration in oxlint.json.

#### Scenario: Lint check
- **WHEN** `bun run lint` is executed
- **THEN** oxlint checks src/ for issues based on oxlint.json rules

### Requirement: oxfmt formatting
The project SHALL use oxfmt for code formatting with configuration in .oxfmtrc.json.

#### Scenario: Format code
- **WHEN** `bun run format` is executed
- **THEN** oxfmt formats all files in src/ according to project rules

### Requirement: typescript-go type checking
The project SHALL use typescript-go (tsgo) for type checking via `bun run typecheck`.

#### Scenario: Type check
- **WHEN** `bun run typecheck` is executed
- **THEN** tsgo --noEmit checks all TypeScript files for type errors

### Requirement: Combined check command
`bun run check` SHALL run both lint and typecheck sequentially.

#### Scenario: Full check
- **WHEN** `bun run check` is executed
- **THEN** oxlint runs first, then tsgo, and both must pass

### Requirement: Tailwind CSS 4 integration
Tailwind CSS 4 SHALL be integrated via @tailwindcss/vite plugin.

#### Scenario: Tailwind classes work
- **WHEN** a Vue component uses Tailwind utility classes
- **THEN** the corresponding CSS is generated and applied

