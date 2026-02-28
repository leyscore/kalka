# desktop-app Specification

## Purpose
Tauri v2 desktop shell. Cross-platform native menu bar with wired events, Developer Tools access, and `desktop/` directory structure for Tauri configuration and Rust source.
## Requirements
### Requirement: Tauri v2 desktop shell
The editor SHALL run as a native desktop app via Tauri v2 with the web frontend loaded in a webview.

#### Scenario: Desktop app launch
- **WHEN** user runs `bun run tauri dev`
- **THEN** a native desktop window opens with the editor UI and CanvasKit rendering

### Requirement: Native macOS menu bar
The desktop app SHALL display a native menu bar. On macOS, an app-level submenu (OpenPencil) with About, Services, Hide, Hide Others, Show All, and Quit items SHALL be shown. On Windows and Linux, this submenu SHALL be omitted. File, Edit, View, Object, Window, and Help menus SHALL be present on all platforms.

#### Scenario: Menu bar on macOS
- **WHEN** the desktop app launches on macOS
- **THEN** a native menu bar with the OpenPencil app submenu and all standard menus is visible

#### Scenario: Menu bar on Windows
- **WHEN** the desktop app launches on Windows
- **THEN** a native menu bar with File, Edit, View, Object, Window, and Help menus is visible and no macOS-specific app submenu is present

#### Scenario: Menu bar on Linux
- **WHEN** the desktop app launches on Linux
- **THEN** a native menu bar with File, Edit, View, Object, Window, and Help menus is visible and no macOS-specific app submenu is present

### Requirement: Menu events wired to frontend
Menu item clicks SHALL fire events that the Vue frontend handles (e.g., Undo, Redo, Zoom In/Out).

#### Scenario: Menu undo
- **WHEN** user clicks Edit → Undo in the menu bar
- **THEN** the frontend receives the undo event and performs undo

### Requirement: Developer tools menu item
The menu SHALL include a Developer Tools item (⌘⌥I) that opens the webview inspector.

#### Scenario: Open dev tools
- **WHEN** user selects View → Developer Tools or presses ⌘⌥I
- **THEN** the webview developer tools panel opens

### Requirement: Desktop directory structure
The Tauri configuration and Rust source SHALL live in `desktop/` (not `src-tauri/`). Tauri CLI SHALL find it by scanning.

#### Scenario: Build from desktop directory
- **WHEN** `bun run tauri build` is run
- **THEN** Tauri finds configuration in `desktop/` and produces a native binary

### Requirement: Cross-platform build
The desktop app SHALL compile and build on macOS, Windows, and Linux without platform-specific errors.

#### Scenario: Windows build
- **WHEN** `bun run tauri build` is run on Windows with MSVC toolchain installed
- **THEN** the build completes successfully and produces a Windows executable

#### Scenario: Linux build
- **WHEN** `bun run tauri build` is run on Linux with required system libraries installed
- **THEN** the build completes successfully and produces a Linux binary

### Requirement: Platform prerequisites documentation
The README SHALL document platform-specific prerequisites for building the desktop app on macOS, Windows, and Linux.

#### Scenario: Windows prerequisites documented
- **WHEN** a developer reads the README on Windows
- **THEN** they find instructions for installing Rust (stable-msvc), Visual Studio Build Tools, and WebView2

#### Scenario: macOS prerequisites documented
- **WHEN** a developer reads the README on macOS
- **THEN** they find instructions for installing Xcode Command Line Tools

#### Scenario: Linux prerequisites documented
- **WHEN** a developer reads the README on Linux
- **THEN** they find instructions for installing required system libraries (webkit2gtk, etc.)

