import type { DesignElement, DesignNode, DesignStyleDeclaration } from '../types'
import { pickStyle } from './css-values'

/** What kind of layer an element becomes in an unmeasured import: text or a box. */

export function textContent(node: DesignNode): string {
  if (node.type === 'text') return node.text
  return node.children.map(textContent).join('')
}

export function isTextLikeElement(node: DesignElement): boolean {
  return [
    'span',
    'p',
    'label',
    'strong',
    'em',
    'button',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6'
  ].includes(node.tagName.toLowerCase())
}

export function hasBoxStyle(style: DesignStyleDeclaration): boolean {
  return [
    'aspect-ratio',
    'background-color',
    'border-color',
    'border-style',
    'border-width',
    'border-top-style',
    'border-top-width',
    'border-right-style',
    'border-right-width',
    'border-bottom-style',
    'border-bottom-width',
    'border-left-style',
    'border-left-width',
    'border-radius',
    'box-shadow',
    'display',
    'height',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'padding-block',
    'padding-inline',
    'width',
    'min-width',
    'max-width',
    'min-height',
    'max-height',
    'object-fit',
    'overflow',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'flex-wrap',
    'align-self'
  ].some((property) => pickStyle(style, property) !== undefined)
}
