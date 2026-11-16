/**
 * Whether `codesign -dv` describes an ad-hoc signature. Squirrel.Mac installs an update only when
 * it meets the running app's designated requirement, and an ad-hoc one names the app's own code
 * hash, which no other build has.
 */
export function isAdhocSignature(codesignOutput: string): boolean {
  return /^Signature=adhoc$/m.test(codesignOutput)
}
