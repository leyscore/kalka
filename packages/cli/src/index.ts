#!/usr/bin/env bun
import { defineCommand, runMain } from 'citty'

import exportCmd from './commands/export'
import info from './commands/info'
import find from './commands/find'
import tree from './commands/tree'

const main = defineCommand({
  meta: {
    name: 'open-pencil',
    description: 'OpenPencil CLI — inspect, export, and lint .fig design files',
    version: '0.1.0'
  },
  subCommands: {
    export: exportCmd,
    info,
    find,
    tree
  }
})

runMain(main)
