# testing Specification

## Purpose
Test infrastructure. Playwright visual regression (E2E with Figma CDP reference), bun:test unit tests, no-chrome test mode, data-ready synchronization, and page reuse optimization.
## Requirements
### Requirement: Playwright visual regression testing
E2E tests SHALL use Playwright to create shapes and compare screenshots against baseline snapshots.

#### Scenario: Visual regression test pass
- **WHEN** `bun run test` is executed
- **THEN** Playwright tests create shapes, take screenshots, and compare against baseline PNGs

### Requirement: Figma CDP reference tests
A separate Playwright project SHALL connect to Figma via Chrome DevTools Protocol (CDP) to capture reference screenshots for pixel-perfect comparison.

#### Scenario: Figma reference capture
- **WHEN** `bun run test:figma` is executed with Figma running in debug mode
- **THEN** Playwright connects to Figma via CDP and captures reference screenshots

### Requirement: No-chrome test mode
The editor SHALL support a test mode (activated via URL param or environment) that hides Chrome/UI elements for clean screenshot capture.

#### Scenario: Test mode rendering
- **WHEN** the editor loads in test mode
- **THEN** only canvas content is rendered, without toolbar, panels, or other UI chrome

### Requirement: Data-ready optimization
The editor SHALL signal readiness via a `data-ready` attribute for E2E test synchronization, replacing unreliable timeouts.

#### Scenario: Wait for ready
- **WHEN** a Playwright test waits for the data-ready attribute
- **THEN** it proceeds only when the canvas is fully rendered

### Requirement: Page reuse for speed
E2E tests SHALL reuse the browser page across test cases to minimize overhead. Target: all E2E tests complete in <3s.

#### Scenario: Fast E2E execution
- **WHEN** the full E2E test suite runs
- **THEN** it completes in under 3 seconds by reusing the page

### Requirement: bun:test unit tests
Engine unit tests SHALL use bun:test and complete in <50ms.

#### Scenario: Unit test speed
- **WHEN** `bun test ./tests/engine` is run
- **THEN** all unit tests pass in under 50ms

### Requirement: Fig-import unit tests
Unit tests SHALL verify the .fig import pipeline: node type mapping, transform extraction, fill/stroke/effect import, gradient stops, image fills, arc data, stroke properties, and nested frame hierarchies.

#### Scenario: Run fig-import tests
- **WHEN** `bun test ./tests/engine/fig-import.test.ts` is executed
- **THEN** all import pipeline tests pass covering tier 1 rendering features

### Requirement: Layout unit tests
Unit tests SHALL verify Yoga auto-layout computation: direction, gap, padding, justify, align, child sizing (fixed/fill/hug), cross-axis sizing, wrap, and nested layouts.

#### Scenario: Run layout tests
- **WHEN** `bun test ./tests/engine/layout.test.ts` is executed
- **THEN** all layout computation tests pass

### Requirement: Layers panel E2E tests
E2E tests SHALL verify the layers panel: node visibility in tree, expand/collapse frames, selection sync between canvas and layers panel.

#### Scenario: Run layers panel E2E
- **WHEN** the layers panel E2E tests run
- **THEN** all tests pass verifying tree structure, visibility toggles, and selection sync

### Requirement: Component-instance sync unit tests
Unit tests SHALL cover the component-instance sync lifecycle: instance creation with `componentId` mapping on children, sync propagation of property changes, override preservation during sync, new child addition to instances, and detach breaking the link.

#### Scenario: Instance child mapping test
- **WHEN** `bun test ./tests/engine/scene-graph.test.ts` runs
- **THEN** the test verifies instance children have `componentId` pointing to component children

#### Scenario: Sync propagation test
- **WHEN** a component's text child changes and sync is triggered
- **THEN** the test verifies instance children receive the updated text and fontSize

#### Scenario: Override preservation test
- **WHEN** an instance child has an overridden text value
- **THEN** the test verifies the override is preserved while non-overridden properties sync

#### Scenario: New child addition test
- **WHEN** a new child is added to a component and sync runs
- **THEN** the test verifies existing instances gain the new child

#### Scenario: Detach test
- **WHEN** an instance is detached
- **THEN** the test verifies type becomes FRAME, componentId is null, and the component's instance list no longer includes it

