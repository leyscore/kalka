<script setup lang="ts">
import { colorToCSS } from '@kalka/scene-graph/color'
import type { Color } from '@kalka/scene-graph/primitives'

import { avatar } from '@/theme/collaboration/avatar'
import { avatarStack } from '@/theme/collaboration/avatar-stack'

/** A person's picture, with how many agents they run. */
const {
  name,
  picture,
  color,
  agentCount = 0,
  size = 'sm',
  following = false,
  interactive = false
} = defineProps<{
  name: string
  /** Their photo or pixel creature. */
  picture: string
  color: Color
  agentCount?: number
  size?: 'sm' | 'md'
  following?: boolean
  interactive?: boolean
}>()

const ui = avatarStack()
</script>

<template>
  <span :class="ui.person()">
    <img
      :src="picture"
      :alt="name"
      draggable="false"
      :class="avatar({ size, bordered: true, following, interactive })"
    />
    <span v-if="agentCount > 0" :class="ui.badge()" :style="{ color: colorToCSS(color) }">
      <icon-hugeicons-sparkle :class="ui.badgeIcon()" />{{ agentCount }}
    </span>
  </span>
</template>
