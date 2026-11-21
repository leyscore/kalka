/** Validates the axes and the compatibility matrix, and counts the compatible genomes. */
import { countGenomes, validateAxes } from './genome'

const issues = validateAxes()
for (const issue of issues) console.error(issue)
for (const surface of ['web', 'dashboard', 'mobile'] as const)
  console.log(`${surface}: ${countGenomes(surface).toLocaleString('en')} compatible genomes`)
process.exit(issues.length ? 1 : 0)
