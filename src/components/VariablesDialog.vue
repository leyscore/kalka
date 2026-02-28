<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
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
import type { Variable, Color, VariableCollectionMode } from '@/engine/scene-graph'

const open = defineModel<boolean>('open', { default: false })
const store = useEditorStore()
const searchTerm = ref('')

const collections = computed(() => {
  void store.state.sceneVersion
  return [...store.graph.variableCollections.values()]
})

const activeTab = ref(collections.value[0]?.id ?? '')
watch(collections, (cols) => {
  if (!activeTab.value && cols[0]) activeTab.value = cols[0].id
})

const editingCollectionId = ref<string | null>(null)

function startRenameCollection(id: string) {
  editingCollectionId.value = id
  nextTick(() => {
    const input = document.querySelector<HTMLInputElement>('[data-collection-edit]')
    input?.focus()
    input?.select()
  })
}

function commitRenameCollection(id: string, input: HTMLInputElement) {
  if (editingCollectionId.value !== id) return
  const value = input.value.trim()
  const collection = store.graph.variableCollections.get(id)
  if (collection && value && value !== collection.name) {
    store.graph.variableCollections.set(id, { ...collection, name: value })
    store.requestRender()
  }
  editingCollectionId.value = null
}

const activeModes = computed(() => {
  const col = store.graph.variableCollections.get(activeTab.value)
  return col?.modes ?? []
})

const variables = computed(() => {
  if (!activeTab.value) return []
  const all = store.graph.getVariablesForCollection(activeTab.value)
  if (!searchTerm.value) return all
  const q = searchTerm.value.toLowerCase()
  return all.filter((v) => v.name.toLowerCase().includes(q))
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

function formatModeValue(variable: Variable, modeId: string): string {
  const value = variable.valuesByMode[modeId]
  if (value === undefined) return '—'
  if (typeof value === 'object' && 'r' in value) return colorToHexRaw(value as Color)
  if (typeof value === 'object' && 'aliasId' in value) {
    const aliased = store.graph.variables.get(value.aliasId)
    return aliased ? `→ ${aliased.name}` : '→ ?'
  }
  return String(value)
}

function getModeSwatchColor(variable: Variable, modeId: string): string | null {
  if (variable.type !== 'COLOR') return null
  const value = variable.valuesByMode[modeId]
  if (!value) return null

  if (typeof value === 'object' && 'aliasId' in value) {
    const resolved = store.graph.resolveColorVariable(variable.id)
    if (!resolved) return null
    return `rgb(${Math.round(resolved.r * 255)}, ${Math.round(resolved.g * 255)}, ${Math.round(resolved.b * 255)})`
  }
  if (typeof value === 'object' && 'r' in value) {
    const c = value as Color
    return `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`
  }
  return null
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

function commitValueEdit(variable: Variable, modeId: string, newValue: string) {
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

function addVariable() {
  const col = store.graph.variableCollections.get(activeTab.value)
  if (!col) return

  const id = `var:${Date.now()}`
  const valuesByMode: Record<string, import('@open-pencil/core').VariableValue> = {}
  for (const mode of col.modes) {
    valuesByMode[mode.modeId] = { r: 0, g: 0, b: 0, a: 1 }
  }

  store.graph.addVariable({
    id,
    name: 'New variable',
    type: 'COLOR',
    collectionId: col.id,
    valuesByMode,
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
    modes: [{ modeId: 'default', name: 'Mode 1' }],
    defaultModeId: 'default',
    variableIds: []
  })
  activeTab.value = id
  store.requestRender()
}

function removeVariable(id: string) {
  store.graph.removeVariable(id)
  store.requestRender()
}

function modeColumnWidth(modes: VariableCollectionMode[]): string {
  if (modes.length <= 1) return 'flex-1'
  return `w-[${Math.floor(100 / modes.length)}%]`
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/50" />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 flex h-[75vh] w-[800px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-border bg-panel shadow-2xl outline-none"
      >
        <div v-if="collections.length === 0" class="flex flex-1 flex-col">
          <!-- Header for empty state -->
          <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <DialogTitle class="text-sm font-semibold text-surface">Local variables</DialogTitle>
            <DialogClose
              class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
            >
              <icon-lucide-x class="size-4" />
            </DialogClose>
          </div>
          <div class="flex flex-1 items-center justify-center">
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
        </div>

        <template v-else>
          <TabsRoot v-model="activeTab" class="flex flex-1 flex-col overflow-hidden">
            <!-- Top bar: collection tabs + search + actions -->
            <div class="flex shrink-0 items-center border-b border-border">
              <TabsList class="flex flex-1 gap-0.5 overflow-x-auto px-3 py-1">
                <template v-for="col in collections" :key="col.id">
                  <input
                    v-if="editingCollectionId === col.id"
                    data-collection-edit
                    class="w-24 rounded border border-accent bg-input px-2 py-0.5 text-xs text-surface outline-none"
                    :value="col.name"
                    @blur="commitRenameCollection(col.id, $event.target as HTMLInputElement)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()"
                    @keydown.escape="editingCollectionId = null"
                  />
                  <TabsTrigger
                    v-else
                    :value="col.id"
                    class="cursor-pointer whitespace-nowrap rounded border-none px-2.5 py-1 text-xs text-muted data-[state=active]:bg-hover data-[state=active]:text-surface"
                    @dblclick="startRenameCollection(col.id)"
                  >
                    {{ col.name }}
                  </TabsTrigger>
                </template>
              </TabsList>

              <div class="flex items-center gap-1.5 px-3">
                <div class="flex items-center gap-1 rounded border border-border px-2 py-0.5">
                  <icon-lucide-search class="size-3 text-muted" />
                  <input
                    v-model="searchTerm"
                    class="w-24 border-none bg-transparent text-xs text-surface outline-none placeholder:text-muted"
                    placeholder="Search"
                  />
                </div>
                <button
                  class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
                  title="Add collection"
                  @click="addCollection"
                >
                  <icon-lucide-folder-plus class="size-3.5" />
                </button>
                <DialogClose
                  class="flex size-6 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted hover:bg-hover hover:text-surface"
                >
                  <icon-lucide-x class="size-4" />
                </DialogClose>
              </div>
            </div>

            <!-- Table -->
            <TabsContent
              v-for="col in collections"
              :key="col.id"
              :value="col.id"
              class="flex flex-1 flex-col overflow-hidden outline-none"
            >
              <!-- Column headers -->
              <div class="flex shrink-0 border-b border-border text-[11px] font-medium text-muted">
                <div class="w-[200px] shrink-0 px-4 py-2">Name</div>
                <div
                  v-for="mode in activeModes"
                  :key="mode.modeId"
                  class="flex-1 border-l border-border px-4 py-2"
                >
                  {{ mode.name }}
                </div>
                <!-- Spacer for delete button column -->
                <div class="w-8 shrink-0" />
              </div>

              <!-- Rows -->
              <div class="flex-1 overflow-y-auto">
                <template v-for="[group, vars] in groupedVariables" :key="group">
                  <div
                    v-if="group"
                    class="border-b border-border/50 px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted"
                  >
                    {{ group }}
                  </div>
                  <div
                    v-for="v in vars"
                    :key="v.id"
                    class="group flex items-center border-b border-border/30 hover:bg-hover/50"
                  >
                    <!-- Name column -->
                    <div class="flex w-[200px] shrink-0 items-center gap-2 px-4 py-2">
                      <icon-lucide-circle-dot
                        v-if="v.type === 'COLOR'"
                        class="size-3.5 shrink-0 text-muted"
                      />
                      <icon-lucide-hash
                        v-else-if="v.type === 'FLOAT'"
                        class="size-3.5 shrink-0 text-muted"
                      />
                      <icon-lucide-type
                        v-else-if="v.type === 'STRING'"
                        class="size-3.5 shrink-0 text-muted"
                      />
                      <icon-lucide-toggle-left v-else class="size-3.5 shrink-0 text-muted" />
                      <EditableRoot
                        :default-value="shortName(v)"
                        class="min-w-0 flex-1"
                        @submit="commitNameEdit(v, $event)"
                      >
                        <EditableArea class="flex">
                          <EditablePreview
                            class="min-w-0 flex-1 cursor-text truncate text-xs text-surface"
                          />
                          <EditableInput
                            class="min-w-0 flex-1 rounded border border-border bg-surface/10 px-1 py-0.5 text-xs text-surface outline-none"
                          />
                        </EditableArea>
                      </EditableRoot>
                    </div>

                    <!-- Value columns (one per mode) -->
                    <div
                      v-for="mode in activeModes"
                      :key="mode.modeId"
                      class="flex flex-1 items-center gap-2 border-l border-border/30 px-4 py-2"
                    >
                      <div
                        v-if="v.type === 'COLOR'"
                        class="size-5 shrink-0 rounded border border-border"
                        :style="{ background: getModeSwatchColor(v, mode.modeId) ?? '#000' }"
                      />
                      <EditableRoot
                        :default-value="formatModeValue(v, mode.modeId)"
                        class="min-w-0 flex-1"
                        @submit="commitValueEdit(v, mode.modeId, $event)"
                      >
                        <EditableArea class="flex">
                          <EditablePreview
                            class="min-w-0 flex-1 cursor-text truncate font-mono text-xs text-muted"
                          />
                          <EditableInput
                            class="min-w-0 flex-1 rounded border border-border bg-surface/10 px-1 py-0.5 font-mono text-xs text-surface outline-none"
                          />
                        </EditableArea>
                      </EditableRoot>
                    </div>

                    <!-- Delete -->
                    <div class="flex w-8 shrink-0 items-center justify-center">
                      <button
                        class="flex size-5 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface"
                        @click="removeVariable(v.id)"
                      >
                        <icon-lucide-x class="size-3" />
                      </button>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Footer: create variable -->
              <button
                class="flex w-full shrink-0 cursor-pointer items-center gap-1.5 border-t border-border bg-transparent px-4 py-2 text-xs text-muted hover:bg-hover hover:text-surface"
                @click="addVariable"
              >
                <icon-lucide-plus class="size-3.5" />
                Create variable
              </button>
            </TabsContent>
          </TabsRoot>
        </template>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
