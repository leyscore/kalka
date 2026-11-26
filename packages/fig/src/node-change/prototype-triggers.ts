import type { PrototypeTrigger, PrototypeTriggerType } from '@kalka/scene-graph'

/**
 * A Figma interaction's `event` as the scene graph's trigger, both ways: its type, delay, keys
 * and the time a Video hits trigger waits for. Figma stores times in seconds.
 */

type Obj = { [key: string]: unknown }

const TRIGGERS: Readonly<Partial<{ [type: string]: PrototypeTriggerType }>> = {
  ON_CLICK: 'ON_CLICK',
  DRAG: 'ON_DRAG',
  ON_HOVER: 'ON_HOVER',
  ON_PRESS: 'ON_PRESS',
  ON_KEY_DOWN: 'ON_KEY_DOWN',
  MOUSE_IN: 'MOUSE_ENTER',
  MOUSE_ENTER: 'MOUSE_ENTER',
  MOUSE_OUT: 'MOUSE_LEAVE',
  MOUSE_LEAVE: 'MOUSE_LEAVE',
  MOUSE_DOWN: 'MOUSE_DOWN',
  MOUSE_UP: 'MOUSE_UP',
  AFTER_TIMEOUT: 'AFTER_TIMEOUT',
  ON_MEDIA_HIT: 'ON_MEDIA_HIT',
  ON_MEDIA_END: 'ON_MEDIA_END'
}

const TRIGGER_EXPORT: { [type in PrototypeTriggerType]: string } = {
  ON_CLICK: 'ON_CLICK',
  ON_DRAG: 'DRAG',
  ON_HOVER: 'ON_HOVER',
  ON_PRESS: 'ON_PRESS',
  ON_KEY_DOWN: 'ON_KEY_DOWN',
  MOUSE_ENTER: 'MOUSE_IN',
  MOUSE_LEAVE: 'MOUSE_OUT',
  MOUSE_DOWN: 'MOUSE_DOWN',
  MOUSE_UP: 'MOUSE_UP',
  AFTER_TIMEOUT: 'AFTER_TIMEOUT',
  ON_MEDIA_HIT: 'ON_MEDIA_HIT',
  ON_MEDIA_END: 'ON_MEDIA_END'
}

function isRecord(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function seconds(value: unknown, fallback: number): number {
  const known = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.round(known * 1000) / 1000
}

/** The trigger an interaction's `event` records, or null for one Kalka does not play. */
export function importTrigger(event: Obj): PrototypeTrigger | null {
  const type =
    typeof event.interactionType === 'string' ? TRIGGERS[event.interactionType] : undefined
  if (!type) return null
  const keyTrigger = isRecord(event.keyTrigger) ? event.keyTrigger : {}
  return {
    type,
    delay: seconds(event.transitionTimeout, type === 'AFTER_TIMEOUT' ? 0.8 : 0),
    keyCodes: Array.isArray(keyTrigger.keyCodes)
      ? keyTrigger.keyCodes.filter((code): code is number => typeof code === 'number')
      : [],
    ...(type === 'ON_MEDIA_HIT'
      ? { mediaHitTime: Math.max(0, seconds(event.mediaHitTime, 0)) }
      : {})
  }
}

/** An interaction's `event` for a trigger. */
export function exportTrigger(trigger: PrototypeTrigger): Obj {
  const event: Obj = { interactionType: TRIGGER_EXPORT[trigger.type] }
  if (trigger.delay > 0) event.transitionTimeout = trigger.delay
  if (trigger.type === 'ON_KEY_DOWN')
    event.keyTrigger = { keyCodes: [...trigger.keyCodes], triggerDevice: 'KEYBOARD' }
  if (trigger.type === 'ON_MEDIA_HIT') event.mediaHitTime = trigger.mediaHitTime ?? 0
  return event
}
