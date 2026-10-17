---
title: Document identity
description: How layers, variables, and collections get IDs, and which of them a saved .fig file keeps.
---

# Document identity

IDs follow Figma's `sessionID:localID` GUIDs, and both halves stay at or below 2^31 − 1 because Figma reads them as signed 32-bit integers and drops records beyond that.

## New IDs

Every process picks a random session at startup, outside sessions 0 and 1, which FIG keeps for document records and counter GUIDs. IDs count up within it, so the editor, the CLI, and MCP never mint the same ID for different layers, whether they share a room or edit copies of one file. Tests and fixtures that need the same IDs on every run call `setIdSession` with a fixed session, or pass a generator to `new SceneGraph()`.

## Imported layers

Reading a `.fig` file gives its layers handles from a counter of their own, `0:1`, `0:2`, and so on, in the order the reader builds them. The same file gets the same handles on every run, which is what lets `kalka tree` print an ID that a later `kalka node` or `diff apply` finds. Pages loaded later continue the counter, and a resumed session carries it in its checkpoint. A handle is not the layer's identity: the GUID the file saved it under is its `source.id`.

## Saving

A layer read from the file keeps its saved GUID. A new layer is saved under its own ID when that ID has the GUID shape and no record in the archive, including records on pages never opened, already uses it. Otherwise it takes a counter GUID past every GUID in the file. Reopening the file makes the saved GUID the layer's `source.id`, so later saves keep it.

## Limits

Random sessions make collisions between separate edits unlikely, not impossible, and nothing reconciles two copies of a file automatically. A shared room stays the authority for its live document; merging offline copies means applying the changes to one of them and sharing the result as a new room.
