<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'

/**
 * Offers to keep the fonts a design names with the document, when the free catalogue has them:
 * one click downloads them, with their licences, and the design draws as intended.
 */
const {
  families,
  adding = false,
  error = null
} = defineProps<{
  /** Families the free catalogue has that the document does not carry. */
  families: readonly string[]
  adding?: boolean
  error?: string | null
}>()

const emit = defineEmits<{ add: []; dismiss: [] }>()
const { fonts } = useI18n()
</script>

<template>
  <section
    v-if="families.length > 0"
    :aria-label="
      families.length === 1
        ? fonts.missingFontTitle
        : fonts.missingFontsTitle({ count: families.length })
    "
    class="mx-2 mt-2 flex flex-col gap-2 rounded-[10px] border border-border bg-panel px-3 py-2.5 text-xs text-surface backdrop-blur-[28px]"
  >
    <div class="flex items-start gap-2">
      <icon-hugeicons-text-font class="mt-px size-3.5 shrink-0 text-primary" />
      <div class="min-w-0 flex-1">
        <p class="font-medium">
          {{
            families.length === 1
              ? fonts.missingFontTitle
              : fonts.missingFontsTitle({ count: families.length })
          }}
        </p>
        <p class="mt-0.5 text-muted">{{ fonts.missingFontsDescription }}</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2 ps-5.5">
      <ul class="flex min-w-0 flex-1 flex-wrap gap-1.5">
        <li
          v-for="family in families"
          :key="family"
          class="rounded-md bg-input px-2 py-0.5 text-[13px]"
          :style="{ fontFamily: `'${family}', var(--font-sans)` }"
        >
          {{ family }}
        </li>
      </ul>
      <div class="ms-auto flex shrink-0 items-center gap-1.5">
        <AppButton size="sm" variant="ghost" :disabled="adding" @click="emit('dismiss')">
          {{ fonts.dismiss }}
        </AppButton>
        <AppButton size="sm" variant="solid" color="primary" :loading="adding" @click="emit('add')">
          <icon-hugeicons-download-01 v-if="!adding" class="size-3.5" />
          {{
            adding
              ? fonts.addingFonts
              : families.length === 1
                ? fonts.addMissingFont
                : fonts.addMissingFonts
          }}
        </AppButton>
      </div>
    </div>
    <p v-if="error" role="alert" class="ps-5.5 text-error">{{ error }}</p>
  </section>
</template>
