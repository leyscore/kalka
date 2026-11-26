import type {
  OverflowDirection,
  OverlayPositionType,
  PrototypeDirection,
  PrototypeEasingType,
  PrototypeNavigation,
  PrototypeTransitionType,
  PrototypeTriggerType,
  ScrollBehavior
} from '@kalka/scene-graph'
import type { usePrototypeMessages } from '@kalka/vue'

type Messages = ReturnType<typeof usePrototypeMessages>['value']

/** What an action does, as Figma's action menu lists it. */
export type ActionKind =
  | PrototypeNavigation
  | 'BACK'
  | 'CLOSE'
  | 'URL'
  | 'SET_VARIABLE'
  | 'SET_VARIABLE_MODE'
  | 'CONDITIONAL'

export function triggerOptions(m: Messages): { value: PrototypeTriggerType; label: string }[] {
  return [
    { value: 'ON_CLICK', label: m.onClick },
    { value: 'ON_DRAG', label: m.onDrag },
    { value: 'ON_HOVER', label: m.whileHovering },
    { value: 'ON_PRESS', label: m.whilePressing },
    { value: 'ON_KEY_DOWN', label: m.keyGamepad },
    { value: 'MOUSE_ENTER', label: m.mouseEnter },
    { value: 'MOUSE_LEAVE', label: m.mouseLeave },
    { value: 'MOUSE_DOWN', label: m.mouseDown },
    { value: 'MOUSE_UP', label: m.mouseUp },
    { value: 'AFTER_TIMEOUT', label: m.afterDelay }
  ]
}

export function actionOptions(m: Messages): { value: ActionKind; label: string }[] {
  return [
    { value: 'NAVIGATE', label: m.navigateTo },
    { value: 'CHANGE_TO', label: m.changeTo },
    { value: 'BACK', label: m.back },
    { value: 'SCROLL_TO', label: m.scrollTo },
    { value: 'URL', label: m.openLink },
    { value: 'OVERLAY', label: m.openOverlay },
    { value: 'SWAP', label: m.swapOverlay },
    { value: 'CLOSE', label: m.closeOverlay },
    { value: 'SET_VARIABLE', label: m.setVariable },
    { value: 'SET_VARIABLE_MODE', label: m.setVariableMode },
    { value: 'CONDITIONAL', label: m.conditional }
  ]
}

/** `INSTANT` stands for no transition. */
export type AnimationKind = PrototypeTransitionType | 'INSTANT'

export function animationOptions(m: Messages): { value: AnimationKind; label: string }[] {
  return [
    { value: 'INSTANT', label: m.instant },
    { value: 'DISSOLVE', label: m.dissolve },
    { value: 'SMART_ANIMATE', label: m.smartAnimate },
    { value: 'MOVE_IN', label: m.moveIn },
    { value: 'MOVE_OUT', label: m.moveOut },
    { value: 'PUSH', label: m.push },
    { value: 'SLIDE_IN', label: m.slideIn },
    { value: 'SLIDE_OUT', label: m.slideOut }
  ]
}

export function directionOptions(m: Messages): { value: PrototypeDirection; label: string }[] {
  return [
    { value: 'LEFT', label: m.left },
    { value: 'RIGHT', label: m.right },
    { value: 'TOP', label: m.up },
    { value: 'BOTTOM', label: m.down }
  ]
}

export function easingOptions(m: Messages): { value: PrototypeEasingType; label: string }[] {
  return [
    { value: 'LINEAR', label: m.linear },
    { value: 'EASE_IN', label: m.easeIn },
    { value: 'EASE_OUT', label: m.easeOut },
    { value: 'EASE_IN_AND_OUT', label: m.easeInAndOut },
    { value: 'EASE_IN_BACK', label: m.easeInBack },
    { value: 'EASE_OUT_BACK', label: m.easeOutBack },
    { value: 'EASE_IN_AND_OUT_BACK', label: m.easeInAndOutBack },
    { value: 'CUSTOM_CUBIC_BEZIER', label: m.customBezier },
    { value: 'GENTLE', label: m.gentle },
    { value: 'QUICK', label: m.quick },
    { value: 'BOUNCY', label: m.bouncy },
    { value: 'SLOW', label: m.slow },
    { value: 'CUSTOM_SPRING', label: m.customSpring }
  ]
}

export function overflowOptions(m: Messages): { value: OverflowDirection; label: string }[] {
  return [
    { value: 'NONE', label: m.noScrolling },
    { value: 'HORIZONTAL', label: m.horizontal },
    { value: 'VERTICAL', label: m.vertical },
    { value: 'BOTH', label: m.both }
  ]
}

export function scrollBehaviorOptions(m: Messages): { value: ScrollBehavior; label: string }[] {
  return [
    { value: 'SCROLLS', label: m.scrollWithParent },
    { value: 'FIXED', label: m.fixed },
    { value: 'STICKY_SCROLLS', label: m.sticky }
  ]
}

export function overlayPositionOptions(
  m: Messages
): { value: OverlayPositionType; label: string }[] {
  return [
    { value: 'CENTER', label: m.center },
    { value: 'TOP_LEFT', label: m.topLeft },
    { value: 'TOP_CENTER', label: m.topCenter },
    { value: 'TOP_RIGHT', label: m.topRight },
    { value: 'BOTTOM_LEFT', label: m.bottomLeft },
    { value: 'BOTTOM_CENTER', label: m.bottomCenter },
    { value: 'BOTTOM_RIGHT', label: m.bottomRight },
    { value: 'MANUAL', label: m.manual }
  ]
}

/** The directional animations, which take a direction. */
export const DIRECTIONAL: ReadonlySet<AnimationKind> = new Set([
  'MOVE_IN',
  'MOVE_OUT',
  'PUSH',
  'SLIDE_IN',
  'SLIDE_OUT'
])
