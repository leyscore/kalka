<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  devResourceName,
  inheritedDevResources,
  isDevResourceURL,
  type SceneNode
} from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

/**
 * A layer's dev resources: links for developers, added, renamed and removed here, undoable like
 * any change to the layer. An instance also lists its main component's, which only it changes.
 */
const { node } = defineProps<{ node: SceneNode }>()

const store = useEditorStore()
const messages = useCommentsMessages()
const url = ref('')
const name = ref('')
const invalid = ref(false)

const inherited = computed(() => {
  void store.state.sceneVersion
  return inheritedDevResources(store.graph, node)
})

const LABEL = 'Dev resources'

function add() {
  const address = url.value.trim()
  if (!isDevResourceURL(address)) {
    invalid.value = true
    return
  }
  store.updateNodeWithUndo(
    node.id,
    { devResources: [...node.devResources, { name: name.value.trim(), url: address }] },
    LABEL
  )
  url.value = ''
  name.value = ''
  invalid.value = false
}

function remove(index: number) {
  store.updateNodeWithUndo(
    node.id,
    { devResources: node.devResources.filter((_, at) => at !== index) },
    LABEL
  )
}
</script>

<template>
  <div class="flex flex-col gap-1.5" data-slot="dev-resources">
    <ul v-if="node.devResources.length > 0 || inherited.length > 0" class="flex flex-col gap-0.5">
      <li
        v-for="(resource, index) in node.devResources"
        :key="`${index}:${resource.url}`"
        class="group flex items-center gap-1 text-[11px]"
        data-slot="dev-resource"
      >
        <icon-hugeicons-link class="size-3 shrink-0 text-muted" />
        <a
          :href="resource.url"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 flex-1 truncate text-accent hover:underline"
        >
          {{ devResourceName(resource) }}
        </a>
        <IconButton
          :label="messages.removeResource"
          class="size-5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          @click="remove(index)"
        >
          <icon-hugeicons-cancel-01 class="size-3" />
        </IconButton>
      </li>
      <li
        v-for="(entry, index) in inherited"
        :key="`inherited:${index}:${entry.resource.url}`"
        class="flex items-center gap-1 text-[11px]"
        data-slot="dev-resource-inherited"
      >
        <icon-hugeicons-link class="size-3 shrink-0 text-muted" />
        <a
          :href="entry.resource.url"
          target="_blank"
          rel="noopener noreferrer"
          class="min-w-0 flex-1 truncate text-accent hover:underline"
        >
          {{ devResourceName(entry.resource) }}
        </a>
        <span class="shrink-0 truncate text-[10px] text-muted">
          {{ messages.inheritedFrom({ name: entry.from.name }) }}
        </span>
      </li>
    </ul>
    <form class="flex flex-col gap-1" novalidate @submit.prevent="add">
      <AppInput
        v-model="url"
        type="url"
        size="sm"
        :aria-label="messages.resourceURL"
        placeholder="https://"
        :state="invalid ? 'invalid' : 'idle'"
        data-test-id="dev-resource-url"
        @input="invalid = false"
      />
      <div class="flex items-center gap-1">
        <AppInput
          v-model="name"
          size="sm"
          class="min-w-0 flex-1"
          :aria-label="messages.resourceName"
          :placeholder="messages.resourceName"
          data-test-id="dev-resource-name"
        />
        <AppButton
          type="submit"
          size="xs"
          variant="soft"
          :disabled="!url.trim()"
          data-test-id="dev-resource-add"
        >
          {{ messages.addResource }}
        </AppButton>
      </div>
      <p v-if="invalid" role="alert" class="text-[10px] text-error">{{ messages.invalidURL }}</p>
    </form>
  </div>
</template>
