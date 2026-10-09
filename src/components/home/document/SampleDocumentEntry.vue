<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import { startWithSample } from '@/app/home/start'
import { documentEntry } from '@/theme/home/document-entry'

/** The sample file among the recent files, drawn as the brand's mosaic of quarter shapes. */
const { welcome } = useI18n()
const styles = documentEntry({ view: 'grid' })
</script>

<template>
  <div data-slot="document-entry" :class="styles.root()">
    <button
      type="button"
      :aria-label="welcome.openSample"
      :class="styles.trigger()"
      @click="startWithSample"
    >
      <span data-slot="preview" :class="styles.preview({ class: 'bg-brand-blue' })">
        <span
          aria-hidden="true"
          class="grid size-full grid-cols-4 grid-rows-2 p-4 transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        >
          <span class="rounded-tl-full bg-brand-ink" />
          <span class="rounded-full bg-brand-sky" />
          <span class="bg-brand-paper" />
          <span class="rounded-tr-full bg-brand-ink" />
          <span class="rounded-bl-full bg-brand-paper" />
          <span class="bg-brand-ink" />
          <span class="rounded-br-full bg-brand-sky" />
          <span class="rounded-full bg-brand-paper" />
        </span>
      </span>
      <span data-slot="body" :class="styles.body()">
        <span data-slot="name" :class="styles.name()">{{ welcome.sampleFile }}</span>
        <span data-slot="metadata" :class="styles.metadata()">{{ welcome.sampleFileHint }}</span>
      </span>
    </button>
  </div>
</template>
