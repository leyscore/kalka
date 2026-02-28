<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  EditableRoot,
  EditableArea,
  EditableInput,
  EditablePreview
} from 'reka-ui'

import { colorToHexRaw } from '@/engine/color'
import { useEditorStore } from '@/stores/editor'
import type { Variable, VariableType, Color } from '@/engine/scene-graph'

const open = defineModel<boolean>('open', { default: false })
const store = useEditorStore()

const collections = computed(() => {
  void store.state.sceneVersion
  return [...store.graph.variableCollections.values()]
})

const activeTab = ref(collections.value[0]?.id ?? '')
watch(collections, (cols) => {
  if (!activeTab.value && cols[0]) activeTab.value = cols[0].id
})

const variables = computed(() => {
  if (!activeTab.value) return []
  return store.graph.getVariablesForCollection(activeTab.value)
})

const groupedVariables = computed(() => {
  const groups = new Map<string, Variable[]>()
  for (const v of variables.value) {
    const parts = v.name.split('/')
    const group = parts.length > 1 ? parts.slice(0, -1).join('/') : ''
    const arr = groups.get(group) ?? []
    if (!groups.has(group)) groups.set(group, arr)
    arr.push(v)
  }
  return groups
})

function activeCollection() {
  return store.graph.variableCollections.get(activeTab.value)
}

function formatValue(variable: Variable): string {
  const modeId = store.graph.getActiveModeId(variable.collectionId)
  const value = variable.valuesByMode[modeId]
  if (value === undefined) return '—'
  if (typeof value === 'object' && 'r' in value) return colorToHexRaw(value as Color)
  if (typeof value === 'object' && 'aliasId' in value) {
    const aliased = store.graph.variables.get(value.aliasId)
    return aliased ? `→ ${aliased.name}` : '→ ?'
  }
  return String(value)
}

function getSwatchColor(variable: Variable): string | null {
  if (variable.type !== 'COLOR') return null
  const resolved = store.graph.resolveColorVariable(variable.id)
  if (!resolved) return null
  return `rgb(${Math.round(resolved.r * 255)}, ${Math.round(resolved.g * 255)}, ${Math.round(resolved.b * 255)})`
}

function shortName(variable: Variable): string {
  const parts = variable.name.split('/')
  return parts[parts.length - 1] ?? variable.name
}

function commitNameEdit(variable: Variable, newName: string) {
  if (newName && newName !== variable.name) {
    store.graph.variables.set(variable.id, { ...variable, name: newName })
    store.requestRender()
  }
}

function commitValueEdit(variable: Variable, newValue: string) {
  const modeId = store.graph.getActiveModeId(variable.collectionId)

  if (variable.type === 'COLOR') {
    const hex = newValue.replace('#', '')
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      variable.valuesByMode[modeId] = { r, g, b, a: 1 }
    }
  } else if (variable.type === 'FLOAT') {
    const num = parseFloat(newValue)
    if (!isNaN(num)) variable.valuesByMode[modeId] = num
  } else if (variable.type === 'BOOLEAN') {
    variable.valuesByMode[modeId] = newValue === 'true'
  } else {
    variable.valuesByMode[modeId] = newValue
  }
  store.requestRender()
}

function addVariable(type: VariableType) {
  const collection = activeCollection()
  if (!collection) return

  const defaults: Record<VariableType, import('@open-pencil/core').VariableValue> = {
    COLOR: { r: 0, g: 0, b: 0, a: 1 },
    FLOAT: 0,
    STRING: '',
    BOOLEAN: false
  }

  const id = `var:${Date.now()}`
  store.graph.addVariable({
    id,
    name: `New ${type.toLowerCase()}`,
    type,
    collectionId: collection.id,
    valuesByMode: { [collection.defaultModeId]: defaults[type] },
    description: '',
    hiddenFromPublishing: false
  })
  store.requestRender()
}

function addCollection() {
  const id = `col:${Date.now()}`
  store.graph.addCollection({
    id,
    name: 'New collection',
    modes: [{ modeId: 'default', name: 'Default' }],
    defaultModeId: 'default',
    variableIds: []
  })
  activeTab.value = id
}

function removeVariable(id: string) {
  store.graph.removeVariable(id)
  store.requestRender()
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/50" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 flex h-[70vh] w-[640px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-panel shadow-2xl outline-none"
      >
        <!-- Header -->
        <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <DialogTitle class="text-sm font-semibold text-surface">Local variables</DialogTitle>
          <div class="flex items-center gap-2">
            <button
              class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
              title="Add collection"
              @click="addCollection"
            >
              <icon-lucide-folder-plus class="size-4" />
            </button>
            <DialogClose
              class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
            >
              <icon-lucide-x class="size-4" />
            </DialogClose>
          </div>
        </div>

        <div v-if="collections.length === 0" class="flex flex-1 items-center justify-center">
          <div class="text-center">
            <p class="text-sm text-muted">No variable collections</p>
            <button
              class="mt-2 cursor-pointer rounded bg-hover px-3 py-1.5 text-xs text-surface hover:bg-border"
              @click="addCollection"
            >
              Create collection
            </button>
          </div>
        </div>

        <template v-else>
          <TabsRoot v-model="activeTab" class="flex flex-1 flex-col overflow-hidden">
            <!-- Collection tabs -->
            <TabsList
              class="flex shrink-0 gap-0.5 overflow-x-auto border-b border-border px-3 py-1"
            >
              <TabsTrigger
                v-for="col in collections"
                :key="col.id"
                :value="col.id"
                class="cursor-pointer whitespace-nowrap rounded border-none px-2.5 py-1 text-xs text-muted data-[state=active]:bg-hover data-[state=active]:text-surface"
              >
                {{ col.name }}
                <span class="ml-1 text-[10px] opacity-50">{{ col.variableIds.length }}</span>
              </TabsTrigger>
            </TabsList>

            <!-- Table header -->
            <div
              class="flex shrink-0 items-center border-b border-border bg-surface/5 px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted"
            >
              <span class="w-6" />
              <span class="min-w-0 flex-1">Name</span>
              <span class="w-32 text-right">Value</span>
              <span class="w-8" />
            </div>

            <!-- Variable rows -->
            <TabsContent
              v-for="col in collections"
              :key="col.id"
              :value="col.id"
              class="flex-1 overflow-y-auto outline-none"
            >
              <template v-for="[group, vars] in groupedVariables" :key="group">
                <div
                  v-if="group"
                  class="px-4 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted"
                >
                  {{ group }}
                </div>
                <div
                  v-for="v in vars"
                  :key="v.id"
                  class="group flex items-center gap-2 px-4 py-1.5 hover:bg-hover"
                >
                  <!-- Type indicator -->
                  <div
                    v-if="v.type === 'COLOR'"
                    class="size-4 shrink-0 rounded border border-border"
                    :style="{ background: getSwatchColor(v) ?? '#000' }"
                  />
                  <icon-lucide-hash
                    v-else-if="v.type === 'FLOAT'"
                    class="size-4 shrink-0 text-muted"
                  />
                  <icon-lucide-type
                    v-else-if="v.type === 'STRING'"
                    class="size-4 shrink-0 text-muted"
                  />
                  <icon-lucide-toggle-left v-else class="size-4 shrink-0 text-muted" />

                  <!-- Editable name -->
                  <EditableRoot
                    :default-value="shortName(v)"
                    class="min-w-0 flex-1"
                    @submit="commitNameEdit(v, $event)"
                  >
                    <EditableArea class="flex">
                      <EditablePreview class="min-w-0 flex-1 truncate text-xs text-surface" />
                      <EditableInput
                        class="min-w-0 flex-1 rounded border border-border bg-surface/10 px-1.5 py-0.5 text-xs text-surface outline-none"
                      />
                    </EditableArea>
                  </EditableRoot>

                  <!-- Editable value -->
                  <EditableRoot
                    :default-value="formatValue(v)"
                    class="w-32 shrink-0"
                    @submit="commitValueEdit(v, $event)"
                  >
                    <EditableArea class="flex justify-end">
                      <EditablePreview
                        class="w-full truncate text-right font-mono text-xs text-muted"
                      />
                      <EditableInput
                        class="w-full rounded border border-border bg-surface/10 px-1.5 py-0.5 text-right font-mono text-xs text-surface outline-none"
                      />
                    </EditableArea>
                  </EditableRoot>

                  <!-- Delete -->
                  <button
                    class="flex size-5 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface"
                    @click="removeVariable(v.id)"
                  >
                    <icon-lucide-x class="size-3" />
                  </button>
                </div>
              </template>
            </TabsContent>
          </TabsRoot>

          <!-- Footer: add buttons -->
          <div class="flex shrink-0 gap-1.5 border-t border-border px-4 py-2">
            <button
              class="flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-2 py-1 text-xs text-muted hover:bg-hover hover:text-surface"
              @click="addVariable('COLOR')"
            >
              <div class="size-2.5 rounded-sm bg-current" />
              Color
            </button>
            <button
              class="flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-2 py-1 text-xs text-muted hover:bg-hover hover:text-surface"
              @click="addVariable('FLOAT')"
            >
              <icon-lucide-hash class="size-2.5" />
              Number
            </button>
            <button
              class="flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-2 py-1 text-xs text-muted hover:bg-hover hover:text-surface"
              @click="addVariable('STRING')"
            >
              <icon-lucide-type class="size-2.5" />
              String
            </button>
            <button
              class="flex cursor-pointer items-center gap-1.5 rounded border-none bg-transparent px-2 py-1 text-xs text-muted hover:bg-hover hover:text-surface"
              @click="addVariable('BOOLEAN')"
            >
              <icon-lucide-toggle-left class="size-2.5" />
              Bool
            </button>
          </div>
        </template>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
