/**
 * The showcase page: a music player app authored entirely in JSX. Exercises
 * masks, gradients, drop shadows, a glassmorphic player bar, blend-mode
 * overlays, corner smoothing, vector icons, outlined buttons, and
 * component/instance — all as natural parts of one design.
 */
export const SHOWCASE_JSX = `
<Section name="App — Player" x={1560} y={60} w={560} h={760} bg="#12121A">

  {/* Hero: gradient cover masked into a smooth-rounded card, with a
      blend-mode legibility overlay and masked listener avatars. */}
  <Frame name="Hero" x={32} y={32} w={496} h={300} rounded={20} cornerSmoothing={0.6}
         overflow="hidden" effects={[dropShadow({ x: 0, y: 12, radius: 32, color: '"#4C1A8066"' })]}
         fill={linearGradient([['#734FF2', 0], ['#F2598C', 1]])}>
    <Rectangle name="Overlay" x={0} y={160} w={496} h={140} blendMode="multiply"
               fill={linearGradient([['"#00000000"', 0], ['"#00000099"', 1]])} />
    <Group name="Listeners" x={24} y={246}>
      <Ellipse mask w={36} h={36} stroke="#fff" strokeWidth={2}
               fill={linearGradient([['#F2B366', 0], ['#B3834A', 1]])} />
      <Rectangle w={36} h={36} fill={linearGradient([['#F2B366', 0], ['#B3834A', 1]])} />
      <Ellipse mask x={28} w={36} h={36} stroke="#fff" strokeWidth={2}
               fill={linearGradient([['#66CCF2', 0], ['#3A8AB3', 1]])} />
      <Rectangle x={28} w={36} h={36} fill={linearGradient([['#66CCF2', 0], ['#3A8AB3', 1]])} />
      <Ellipse mask x={56} w={36} h={36} stroke="#fff" strokeWidth={2}
               fill={linearGradient([['#B3E67F', 0], ['#7AB34D', 1]])} />
      <Rectangle x={56} w={36} h={36} fill={linearGradient([['#B3E67F', 0], ['#7AB34D', 1]])} />
    </Group>
    <Text name="Track" x={108} y={252} size={20} weight="bold" color="#FFFFFF">Midnight Reverie</Text>
    <Text name="Artist" x={108} y={278} size={13} color=""#FFFFFFBF"">Aurora Bloom</Text>
  </Frame>

  {/* Up-next: album art masked into rounded squares. */}
  <Text name="Label" x={32} y={356} size={14} weight="bold" color="#FFFFFF">Up next</Text>
  <Frame name="List" x={32} y={384} w={496} flex="col" gap={8}>
    <Frame name="Track" w={496} h={56} rounded={12} cornerSmoothing={0.5} bg="#21212E"
           flex="row" items="center" gap={12} pl={8} pr={12}>
      <Frame name="Art" w={40} h={40} rounded={9} overflow="hidden"
             fill={linearGradient([['#4D99F2', 0], ['#994DE6', 1]])}
             effects={[dropShadow({ x: 0, y: 2, radius: 6, color: '"#0000004C"' })]} />
      <Frame name="Meta" flex="col" gap={2}>
        <Text name="Title" size={14} weight="medium" color="#FFFFFF">Glass Cities</Text>
        <Text name="Artist" size={12} color="#A6A6B8">Nocturne</Text>
      </Frame>
      <svg name="Like" x={440} y={16} viewBox="0 0 24 24" w={22} h={22} color="#FA6685">
        <path d="M12 21s-7-4.5-9.5-9C0.5 8 2 4 6 4c2.5 0 4 1.5 6 3 2-1.5 3.5-3 6-3 4 0 5.5 4 3.5 8-2.5 4.5-9.5 9-9.5 9z"/>
      </svg>
    </Frame>
    <Frame name="Track" w={496} h={56} rounded={12} cornerSmoothing={0.5} bg="#21212E"
           flex="row" items="center" gap={12} pl={8} pr={12}>
      <Frame name="Art" w={40} h={40} rounded={9} overflow="hidden"
             fill={linearGradient([['#33D9B3', 0], ['#3380F2', 1]])}
             effects={[dropShadow({ x: 0, y: 2, radius: 6, color: '"#0000004C"' })]} />
      <Frame name="Meta" flex="col" gap={2}>
        <Text name="Title" size={14} weight="medium" color="#FFFFFF">Slow Waves</Text>
        <Text name="Artist" size={12} color="#A6A6B8">Tidal Form</Text>
      </Frame>
      <svg name="Like" x={440} y={16} viewBox="0 0 24 24" w={22} h={22} color="#66667A">
        <path d="M12 21s-7-4.5-9.5-9C0.5 8 2 4 6 4c2.5 0 4 1.5 6 3 2-1.5 3.5-3 6-3 4 0 5.5 4 3.5 8-2.5 4.5-9.5 9-9.5 9z"/>
      </svg>
    </Frame>
    <Frame name="Track" w={496} h={56} rounded={12} cornerSmoothing={0.5} bg="#21212E"
           flex="row" items="center" gap={12} pl={8} pr={12}>
      <Frame name="Art" w={40} h={40} rounded={9} overflow="hidden"
             fill={linearGradient([['#FA804D', 0], ['#E64080', 1]])}
             effects={[dropShadow({ x: 0, y: 2, radius: 6, color: '"#0000004C"' })]} />
      <Frame name="Meta" flex="col" gap={2}>
        <Text name="Title" size={14} weight="medium" color="#FFFFFF">Ember Days</Text>
        <Text name="Artist" size={12} color="#A6A6B8">Solstice</Text>
      </Frame>
      <svg name="Like" x={440} y={16} viewBox="0 0 24 24" w={22} h={22} color="#66667A">
        <path d="M12 21s-7-4.5-9.5-9C0.5 8 2 4 6 4c2.5 0 4 1.5 6 3 2-1.5 3.5-3 6-3 4 0 5.5 4 3.5 8-2.5 4.5-9.5 9-9.5 9z"/>
      </svg>
    </Frame>
  </Frame>

  {/* Player bar: glassmorphism (background blur + translucent fill). */}
  <Frame name="Player Bar" x={32} y={640} w={496} h={88} rounded={18} cornerSmoothing={0.6}
         fill=""#29293DD9""
         effects={[backgroundBlur(16), dropShadow({ x: 0, y: 8, radius: 24, color: '"#00000066"' })]}
         flex="col" gap={12} pt={14} pb={14} pl={20} pr={20}>
    <Frame name="Progress Track" w={456} h={4} rounded={2} bg="#4D4D66">
      <Rectangle name="Progress Fill" w={300} h={4} rounded={2}
                 fill={linearGradient([['#8066FA', 0], ['#F26699', 1]])} />
    </Frame>
    <Frame name="Controls" w={456} h={40} flex="row" justify="center" items="center" gap={28}>
      <Polygon name="Back" w={18} h={18} rotation={270} fill="#CCCCD9" pointCount={3} />
      <Ellipse name="Play" w={40} h={40}
               fill={linearGradient([['#8066FA', 0], ['#F26699', 1]])}
               effects={[dropShadow({ x: 0, y: 4, radius: 12, color: '"#6633CC80"' })]} />
      <Polygon name="Forward" w={18} h={18} rotation={90} fill="#CCCCD9" pointCount={3} />
    </Frame>
  </Frame>
</Section>
`
