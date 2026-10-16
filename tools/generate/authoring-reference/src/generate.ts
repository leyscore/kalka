import { writeReferences } from '#authoring-reference/artifacts'

import { resolveWorkspaceRoot } from '@kalka/package-artifacts-tools'

await writeReferences(await resolveWorkspaceRoot(process.cwd()))
