---
layout: home
title: Kalka developer docs
description: How Kalka is built, and how to script it, extend it and contribute to it.

hero:
  name: Kalka
  text: Developer docs
  tagline: Kalka is a design editor whose canvas is real HTML and CSS. These pages cover how it is built and how to script, extend and contribute to it.
  actions:
    - theme: brand
      text: Contributing
      link: /development/contributing
    - theme: alt
      text: Architecture
      link: /development/architecture
    - theme: alt
      text: GitHub
      link: https://github.com/leyscore/kalka

features:
  - title: Architecture
    details: The scene graph, the DOM canvas, layout, the editor and the packages that own each part.
    link: /development/architecture
  - title: MCP server and AI tools
    details: The tools agents call to read the canvas, write HTML, change styles and check their work.
    link: /programmable/mcp-server
  - title: CLI
    details: Inspect, query, lint, convert and export design files without opening the editor, or drive the running app.
    link: /reference/cli
  - title: Vue SDK
    details: Headless components and composables for building editor surfaces on the same core.
    link: /programmable/sdk/
  - title: File formats
    details: Kalka folders of HTML, CSS and JSON, and the .fig files Kalka reads and writes.
    link: /reference/file-format
  - title: Testing
    details: Where each kind of test lives, which suite proves what, and how to run them.
    link: /development/testing
---
