<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { startWithHTML } from '@/app/home/start'
import AppButton from '@/components/ui/button/AppButton.vue'
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot
} from '@/components/ui/dialog'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppTextarea from '@/components/ui/input/AppTextarea.vue'

const open = defineModel<boolean>('open', { default: false })
const { welcome, common } = useI18n()
const html = ref('')
const error = ref<string | null>(null)

async function submit(): Promise<void> {
  error.value = null
  try {
    await startWithHTML(html.value, welcome.value.pasteHTML)
    open.value = false
    html.value = ''
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : String(failure)
  }
}
</script>

<template>
  <AppDialogRoot v-model:open="open" size="md">
    <AppDialogHeader
      :heading="welcome.pasteHTML"
      :description="welcome.pasteHTMLHint"
      :close-label="common.close"
    />
    <AppDialogBody>
      <AppTextarea
        v-model="html"
        :rows="12"
        class="font-mono text-[11px]"
        placeholder='<section class="hero">…</section>'
        :aria-label="welcome.pasteHTML"
      />
      <AppAlert v-if="error" tone="error" :heading="error" class="mt-3" />
    </AppDialogBody>
    <AppDialogFooter>
      <AppButton size="md" @click="open = false">{{ welcome.cancel }}</AppButton>
      <AppButton size="md" color="primary" variant="solid" :disabled="!html.trim()" @click="submit">
        {{ welcome.importAction }}
      </AppButton>
    </AppDialogFooter>
  </AppDialogRoot>
</template>
