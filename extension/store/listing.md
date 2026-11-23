# Kalka Snapshot: Chrome Web Store submission

Every field to fill, in the order the dashboard asks for it. Copy each block as it is.

## Package

Upload `extension/release/kalka-snapshot-0.1.0.zip`.

To rebuild it: `bun run --cwd extension package`.

## Store listing tab

**Title** (comes from the manifest): Kalka Snapshot

**Summary** (comes from the manifest, 106 of 132 characters):
Inspect any site and copy an element into Kalka as editable layers, with its tablet and phone breakpoints.

**Category:** Developer Tools

**Language:** English

### Description (English)

```
Kalka Snapshot turns any website into a design you can edit.

Open it on a page, hover to see each element's box, margins, padding, size, fonts, colors and layout, and click the one you want. Press ⌘C and paste it into Kalka: it arrives as editable layers, with its styles, fonts, images and the page's class names as layer names.

Copy with breakpoints
Turn on Tablet and Phone, and one copy also takes the page at 810 and 390 pixels wide. Kalka pastes it as an artboard with a tablet and a phone breakpoint, linked to it, each showing what the site shows at that width: smaller titles, a grid that wraps or stacks, a menu that only appears on mobile.

Inspect precisely
• Hover shows the element's box with its margin and padding
• A panel lists its type, colors and layout
• Arrow keys and the path at the bottom move to the parent, children and siblings
• ⌘C copies for Kalka, ⌥⌘C copies HTML and CSS for any other tool
• The menu also copies the element's CSS or its text

Private by design
Kalka Snapshot runs only on the tab where you start it, from its button or Alt+Shift+K. It collects nothing and sends nothing anywhere: the copy goes to your clipboard and nowhere else.

What the markup cannot describe, such as a WebGL gradient or a patterned background, comes from the screen, so the copy looks the way the site did.

Kalka is a design editor whose canvas is real HTML and CSS: https://kalka.design
```

### Description (French, for the French localization)

In the dashboard: Store listing › Language › Add a language › French.

```
Kalka Snapshot transforme n'importe quel site en design modifiable.

Lancez-le sur une page, survolez pour voir la boîte de chaque élément, ses marges, son padding, sa taille, ses polices, ses couleurs et sa mise en page, puis cliquez sur celui que vous voulez. ⌘C, puis collez-le dans Kalka : il arrive en calques modifiables, avec ses styles, ses polices, ses images, et les classes de la page comme noms de calques.

Copier avec les breakpoints
Activez Tablet et Phone : la même copie prend aussi la page à 810 et 390 pixels de large. Kalka la colle en artboard avec un breakpoint tablette et un breakpoint mobile liés, chacun montrant ce que le site affiche à cette largeur : titres plus petits, grille qui passe à la ligne ou s'empile, menu qui n'apparaît que sur mobile.

Inspecter précisément
• Le survol montre la boîte de l'élément avec sa marge et son padding
• Un panneau donne son type, ses couleurs et sa mise en page
• Les flèches et le chemin en bas passent au parent, aux enfants et aux voisins
• ⌘C copie pour Kalka, ⌥⌘C copie le HTML et le CSS pour tout autre outil
• Le menu copie aussi le CSS de l'élément ou son texte

Privé par conception
Kalka Snapshot ne s'exécute que sur l'onglet où vous le lancez, depuis son bouton ou Alt+Shift+K. Il ne collecte rien et n'envoie rien nulle part : la copie va dans votre presse-papiers, et nulle part ailleurs.

Kalka est un éditeur de design dont le canevas est du vrai HTML et CSS : https://kalka.design
```

French summary (132 characters maximum):
Inspectez n'importe quel site et copiez un élément dans Kalka en calques modifiables, avec ses breakpoints tablette et mobile.

### Graphic assets

- **Store icon (128×128):** `extension/icons/icon-128.png`
- **Screenshots (1280×800):** `extension/store/images/screenshot-1.png` to `screenshot-5.png`, in that order
- **Small promo tile (440×280):** `extension/store/images/promo-440x280.png`
- **Marquee (1400×560):** optional, leave empty

### Additional fields

- **Official URL:** kalka.design, if the domain is verified for your account. Otherwise leave it empty.
- **Homepage URL:** https://kalka.design/tools/kalka-snapshot
- **Support URL:** https://kalka.design/tools/kalka-snapshot

## Privacy practices tab

### Single purpose

```
Kalka Snapshot inspects the element a person selects on the current page and copies it to the clipboard as HTML that the Kalka design editor pastes as editable layers, optionally together with how the page shows that element at tablet and phone widths.
```

### Permission justifications

**activeTab**
```
The inspector runs only on the tab where the person starts it, by clicking the toolbar button or pressing the shortcut. activeTab grants access to that tab for that moment only, so the extension needs no host permissions and never runs on other pages. While copying, it also uses captureVisibleTab on that tab to picture what the page's markup cannot describe, such as a background pattern behind the selected element or a WebGL canvas; the pictures go into the copy on the clipboard and nowhere else.
```

**scripting**
```
Used to inject the inspector script into the active tab when the person starts it from the toolbar button or the shortcut. Nothing is injected into any page otherwise.
```

**storage**
```
Stores two preferences on the device with chrome.storage.local: the copy format (Kalka layers or HTML and CSS) and which breakpoints (tablet, phone) the person turned on. Nothing else is stored.
```

**clipboardWrite**
```
Copying the selected element to the clipboard is what the extension is for: it writes the element as HTML (and the same as plain text) when the person presses ⌘C or clicks Copy.
```

**debugger**
```
Used only while the person copies an element. With the Tablet or Phone breakpoint turned on, the extension attaches to that tab, calls Emulation.setDeviceMetricsOverride to show the page at 810 or 390 pixels wide, as a narrower screen would, reads the selected element's computed styles at that width, then clears the override and detaches, all within about a second. A browser window cannot be made as narrow as a phone, so device emulation is the only way to read how the page lays the element out at those widths. During a copy it also reads again, with Network.loadNetworkResource, the stylesheets, fonts and images the page already shows but whose site refuses to hand them to the page a second time, so the copy keeps the page's typeface and pictures; it attaches for that reading only and detaches after it. No other debugger command is used, the page's network traffic is not watched, and nothing is sent anywhere.
```

**Host permissions:** none requested.

**Remote code:** "No, I am not using remote code." All JavaScript ships in the package.

### Data usage

Tick none of the data types: the extension collects none.

Tick all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://kalka.design/snapshot/privacy

## Distribution tab

- **Payments:** Free of charge
- **Visibility:** Public
- **Regions:** All regions

## Test instructions (if asked)

```
No account is needed. Open any website, click the Kalka Snapshot button and choose Inspect this page (or press Alt+Shift+K). Hover the page, click an element, press Cmd/Ctrl+C. To try breakpoints, turn on Tablet or Phone in the bar under the selection before copying; Chrome shows its debugging bar for about a second while the page is shown at those widths. Paste the copy into Kalka (https://kalka.design) or any editor that accepts HTML.
```
