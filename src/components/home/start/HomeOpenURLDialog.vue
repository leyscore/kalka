<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { parseDocumentURL, startFromURL } from '@/app/home/start'
import AppButton from '@/components/ui/button/AppButton.vue'
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot
} from '@/components/ui/dialog'
import AppInput from '@/components/ui/input/AppInput.vue'

const open = defineModel<boolean>('open', { default: false })
const { welcome, common } = useI18n()
const text = ref('')
const error = ref<string | null>(null)
const url = computed(() => parseDocumentURL(text.value))

async function submit(): Promise<void> {
  error.value = null
  if (!url.value) {
    error.value = welcome.value.invalidURL
    return
  }
  try {
    await startFromURL(url.value)
    open.value = false
    text.value = ''
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : String(failure)
  }
}
</script>

<template>
  <AppDialogRoot v-model:open="open" size="sm">
    <AppDialogHeader
      :heading="welcome.openURL"
      :description="welcome.openURLHint"
      :close-label="common.close"
    />
    <AppDialogBody>
      <form @submit.prevent="submit">
        <AppInput
          v-model="text"
          type="url"
          inputmode="url"
          autocomplete="off"
          placeholder="https://"
          :aria-label="welcome.openURL"
        />
      </form>
      <p v-if="error" class="mt-2 text-xs text-error" role="alert">{{ error }}</p>
    </AppDialogBody>
    <AppDialogFooter>
      <AppButton size="md" @click="open = false">{{ welcome.cancel }}</AppButton>
      <AppButton size="md" color="primary" variant="solid" :disabled="!text.trim()" @click="submit">
        {{ welcome.openAction }}
      </AppButton>
    </AppDialogFooter>
  </AppDialogRoot>
</template>
