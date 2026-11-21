import { mix, role, white } from './colors'
import { codrops, cult, fancy } from './sources'
import type { FreshComponent } from './types'

const LABEL = `font-family:'Geist';font-weight:500;font-size:15px;line-height:1;white-space:nowrap`
const STATES = { State: ['Rest', 'Hover'] }

const haloButton: FreshComponent = {
  key: 'halo-button',
  name: 'Halo button',
  category: 'buttons',
  description: 'A frosted pill with a pool of the accent glowing up from inside its lower edge.',
  use: 'The one primary action of a calm page, where a flat button would disappear and a coloured one would shout.',
  tags: ['button', 'cta', 'halo', 'glow', 'frosted', 'pill', 'primary', 'action', 'soft'],
  source: cult('halo-button'),
  variants: STATES,
  texts: { Label: 'Start a project' },
  html: (values) => {
    const hover = values.State === 'Hover'
    return `<div id="Halo button" style="position:relative;width:220px;height:56px;border-radius:999px;overflow:hidden;border:1px solid ${mix('ink', 14)};box-sizing:border-box;background:${role('ground')}">
  <div id="Halo" style="position:absolute;left:${hover ? 10 : 30}px;top:${hover ? 20 : 26}px;width:${hover ? 200 : 160}px;height:56px;border-radius:50%;background:${role('accent')};filter:blur(${hover ? 12 : 14}px);opacity:${hover ? 1 : 0.9}"></div>
  <div id="Halo 2" style="position:absolute;left:70px;top:36px;width:80px;height:40px;border-radius:50%;background:${mix('accent', 60, role('ink'))};filter:blur(12px);opacity:.7"></div>
  <div id="Surface" style="position:absolute;left:0;top:0;width:218px;height:54px;border-radius:999px;background:linear-gradient(to bottom, ${mix('ground', 86)}, ${mix('ground', hover ? 30 : 42)});backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center">
    <p style="${LABEL};color:${role('ink')}">Start a project</p>
  </div>
</div>`
  }
}

const TEXTURE_FACES: Readonly<Record<string, { rim: string; face: string; text: string }>> = {
  Primary: {
    rim: `linear-gradient(to bottom, ${mix('ink', 70)}, ${role('ink')})`,
    face: `linear-gradient(to bottom, ${mix('ink', 82, role('ground'))}, ${role('ink')})`,
    text: role('ground')
  },
  Accent: {
    rim: `linear-gradient(to bottom, ${mix('accent', 60, role('ground'))}, ${role('accent')})`,
    face: `linear-gradient(to bottom, ${mix('accent', 82, role('ground'))}, ${role('accent')})`,
    text: role('ground')
  },
  Secondary: {
    rim: mix('ground', 50),
    face: `linear-gradient(to bottom, ${role('ground')}, ${mix('ground', 90, role('ink'))})`,
    text: role('ink')
  }
}

const textureButton: FreshComponent = {
  key: 'texture-button',
  name: 'Texture button',
  category: 'buttons',
  description: 'A button with a rim and a lit face, as if pressed out of plastic or metal.',
  use: 'Hardware, tools, audio and finance products, where controls should feel physical and exact.',
  tags: ['button', 'tactile', 'skeuomorphic', 'rim', 'hardware', 'tool', 'pressed', 'cta'],
  source: cult('texture-button'),
  variants: { Kind: ['Primary', 'Accent', 'Secondary'] },
  texts: { Label: 'Add to order' },
  html: (values) => {
    const face = TEXTURE_FACES[values.Kind] ?? TEXTURE_FACES.Primary
    return `<div id="Texture button" style="display:flex;width:fit-content;padding:1px;border-radius:12px;border:1px solid ${mix('ink', 12)};background:${face.rim}">
  <div id="Face" style="display:flex;align-items:center;justify-content:center;padding:12px 22px;border-radius:10px;background:${face.face};box-shadow:inset 0 1px 0 ${white(0.18)}">
    <p style="${LABEL};color:${face.text}">Add to order</p>
  </div>
</div>`
  }
}

const offsetButton: FreshComponent = {
  key: 'offset-button',
  name: 'Offset button',
  category: 'buttons',
  description:
    'A flat face lifted off its own dark shadow block, which it climbs further on hover.',
  use: 'Brutalist, zine, game or developer pages where a hard offset suits better than a soft shadow.',
  tags: ['button', 'brutalist', 'offset', 'hard shadow', 'block', 'zine', 'retro', 'cta'],
  source: codrops('ButtonHoverStyles'),
  variants: STATES,
  texts: { Label: 'Activate card' },
  html: (values) => {
    const lift = values.State === 'Hover' ? 8 : 4
    return `<div id="Offset button" style="position:relative;width:200px;height:60px">
  <div id="Block" style="position:absolute;left:0;top:0;width:200px;height:60px;border-radius:5px;background:${role('ink')}"></div>
  <div id="Face" style="position:absolute;left:${-lift}px;top:${-lift}px;width:200px;height:60px;border-radius:5px;border:1px solid ${role('ink')};box-sizing:border-box;background:${role('accent')};display:flex;align-items:center;justify-content:center">
    <p style="${LABEL};font-weight:700;color:${role('ground')}">Activate card</p>
  </div>
</div>`
  }
}

const BLOB_REST =
  'M154.5,88.5 C131,113.5 62.5,110 30,89.5 C-2.5,69 -3.5,42 4.5,25.5 C12.5,9 33.5,-6 85,3.5 C136.5,13 178,63.5 154.5,88.5 Z'
const BLOB_HOVER =
  'M143,77 C117,96 74,100.5 45.5,91.5 C17,82.5 -10.5,57 5.5,31.5 C21.5,6 79,-5.5 130.5,4 C182,13.5 169,58 143,77 Z'

const blobButton: FreshComponent = {
  key: 'blob-button',
  name: 'Blob button',
  category: 'buttons',
  description: 'An organic blob with a loose outline ring that reshapes and darkens on hover.',
  use: 'A friendly, hand-made action for food, kids, wellness or a studio with a soft voice.',
  tags: ['button', 'blob', 'organic', 'playful', 'hand-made', 'soft', 'friendly', 'cta'],
  source: codrops('ButtonHoverStyles'),
  variants: STATES,
  texts: { Label: 'Reshape' },
  html: (values) => {
    const hover = values.State === 'Hover'
    return `<div id="Blob button" style="position:relative;width:175px;height:120px">
  <div id="Ring" style="position:absolute;left:3px;top:${hover ? 1 : 6}px;width:170px;height:103px;border-radius:58% 42% 55% 45% / 56% 45% 55% 44%;border:1px solid ${role('ink')};box-sizing:border-box;transform:rotate(-20deg)"></div>
  <div id="Blob" style="position:absolute;left:0;top:0;width:175px;height:120px;clip-path:path('${hover ? BLOB_HOVER : BLOB_REST}');background:${hover ? role('ink') : mix('ink', 10, role('ground'))}"></div>
  <div id="Label" style="position:absolute;left:0;top:${hover ? 34 : 44}px;width:160px;display:flex;justify-content:center">
    <p style="font-family:'Young Serif';font-size:22px;line-height:1;color:${hover ? role('ground') : role('ink')}">Reshape</p>
  </div>
</div>`
  }
}

const marqueePill: FreshComponent = {
  key: 'marquee-pill',
  name: 'Marquee pill',
  category: 'buttons',
  description: 'An outlined oval whose label turns into a tilted, repeating italic strip on hover.',
  use: 'A newsletter or booking action for an editorial, fashion or culture page with a serif voice.',
  tags: ['button', 'marquee', 'oval', 'editorial', 'serif', 'italic', 'subscribe', 'fashion'],
  source: codrops('ButtonHoverStyles'),
  variants: STATES,
  texts: { Label: 'Subscribe' },
  html: (values) => {
    const hover = values.State === 'Hover'
    const word = `<p style="font-family:'Young Serif';font-style:italic;font-size:20px;line-height:1;color:${role('ink')};white-space:nowrap">Subscribe</p>`
    const inner = hover
      ? `<div id="Strip" style="position:absolute;left:-60px;top:28px;width:340px;display:flex;gap:18px;transform:rotate(-2.75deg)">${word}${word}${word}</div>`
      : `<div id="Label" style="position:absolute;left:0;top:0;width:216px;height:76px;display:flex;align-items:center;justify-content:center"><p style="font-family:'Young Serif';font-size:20px;line-height:1;color:${role('ink')}">Subscribe</p></div>`
    return `<div id="Marquee pill" style="position:relative;width:220px;height:80px;border-radius:50%;border:2px solid ${role('ink')};box-sizing:border-box;overflow:hidden;background:${hover ? mix('accent', 16, role('ground')) : 'transparent'}">${inner}</div>`
  }
}

const underlineLink: FreshComponent = {
  key: 'underline-link',
  name: 'Underline link',
  category: 'buttons',
  description: 'A text link whose underline grows into a full background on hover.',
  use: 'Inline and footer links, or a secondary action next to a primary button, where an arrow would be the cliché.',
  tags: ['link', 'underline', 'text link', 'inline', 'secondary', 'hover', 'navigation'],
  source: fancy('text/underline-to-background'),
  variants: STATES,
  texts: { Label: 'Read the case study' },
  html: (values) => {
    const hover = values.State === 'Hover'
    return `<div id="Underline link" style="position:relative;display:flex;width:fit-content;padding:2px 4px">
  <div id="Underline" style="position:absolute;left:0;bottom:0;width:100%;height:${hover ? '100%' : '2px'};background:${role(hover ? 'accent' : 'ink')}"></div>
  <p style="position:relative;font-family:'Geist';font-weight:500;font-size:20px;line-height:1.3;color:${role(hover ? 'ground' : 'ink')}">Read the case study</p>
</div>`
  }
}

export const BUTTONS: readonly FreshComponent[] = [
  haloButton,
  textureButton,
  offsetButton,
  blobButton,
  marqueePill,
  underlineLink
]
