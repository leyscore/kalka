<script setup lang="ts">
import { ref, computed } from 'vue'
import {
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

const store = useEditorStore()

const collections = computed(() => {
  void store.state.sceneVersion
  return [...store.graph.variableCollections.values()]
})

const activeTab = ref(collections.value[0]?.id ?? '')

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
  const collection = store.graph.variableCollections.get(activeTab.value)
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
  <div class="flex h-full flex-col">
    <div class="flex items-center justify-between border-b border-border px-3 py-1.5">
      <span class="text-[11px] font-medium text-muted">Variables</span>
      <button
        class="flex size-5 cursor-pointer items-center justify-center rounded border-none bg-transparent text-xs text-muted hover:bg-hover hover:text-surface"
        title="Add collection"
        @click="addCollection"
      >
        <icon-lucide-folder-plus class="size-3.5" />
      </button>
    </div>

    <div v-if="collections.length === 0" class="px-3 py-4 text-center text-[11px] text-muted">
      No variables yet
    </div>

    <template v-else>
      <TabsRoot v-model="activeTab" class="flex flex-1 flex-col overflow-hidden">
        <TabsList class="flex gap-0.5 overflow-x-auto border-b border-border px-2 py-1">
          <TabsTrigger
            v-for="col in collections"
            :key="col.id"
            :value="col.id"
            class="cursor-pointer whitespace-nowrap rounded border-none px-2 py-0.5 text-[11px] text-muted data-[state=active]:bg-hover data-[state=active]:text-surface"
          >
            {{ col.name }}
            <span class="ml-1 text-[10px] opacity-50">{{ col.variableIds.length }}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          v-for="col in collections"
          :key="col.id"
          :value="col.id"
          class="flex-1 overflow-y-auto outline-none"
        >
          <template v-for="[group, vars] in groupedVariables" :key="group">
            <div
              v-if="group"
              class="px-3 pt-2 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-muted"
            >
              {{ group }}
            </div>
            <div
              v-for="v in vars"
              :key="v.id"
              class="group flex items-center gap-2 px-3 py-1 hover:bg-hover"
            >
              <!-- Type indicator -->
              <div
                v-if="v.type === 'COLOR'"
                class="size-4 shrink-0 rounded border border-border"
                :style="{ background: getSwatchColor(v) ?? '#000' }"
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

              <!-- Editable name -->
              <EditableRoot
                :default-value="shortName(v)"
                class="min-w-0 flex-1"
                @submit="commitNameEdit(v, $event)"
              >
                <EditableArea class="flex">
                  <EditablePreview class="min-w-0 flex-1 truncate text-[11px] text-surface" />
                  <EditableInput
                    class="min-w-0 flex-1 rounded border border-border bg-panel px-1 text-[11px] text-surface outline-none"
                  />
                </EditableArea>
              </EditableRoot>

              <!-- Editable value -->
              <EditableRoot
                :default-value="formatValue(v)"
                class="w-20 shrink-0"
                @submit="commitValueEdit(v, $event)"
              >
                <EditableArea class="flex">
                  <EditablePreview
                    class="w-full truncate text-right font-mono text-[11px] text-muted"
                  />
                  <EditableInput
                    class="w-full rounded border border-border bg-panel px-1 text-right font-mono text-[11px] text-surface outline-none"
                  />
                </EditableArea>
              </EditableRoot>

              <!-- Delete -->
              <button
                class="cursor-pointer border-none bg-transparent p-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-surface"
                @click.stop="removeVariable(v.id)"
              >
                <icon-lucide-x class="size-3" />
              </button>
            </div>
          </template>
        </TabsContent>
      </TabsRoot>

      <!-- Add variable buttons -->
      <div class="flex gap-1 border-t border-border px-2 py-1.5">
        <button
          class="flex cursor-pointer items-center gap-1 rounded border-none bg-transparent px-2 py-0.5 text-[11px] text-muted hover:bg-hover hover:text-surface"
          @click="addVariable('COLOR')"
        >
          <div class="size-2.5 rounded-sm bg-current" />
          Color
        </button>
        <button
          class="flex cursor-pointer items-center gap-1 rounded border-none bg-transparent px-2 py-0.5 text-[11px] text-muted hover:bg-hover hover:text-surface"
          @click="addVariable('FLOAT')"
        >
          <icon-lucide-hash class="size-2.5" />
          Number
        </button>
        <button
          class="flex cursor-pointer items-center gap-1 rounded border-none bg-transparent px-2 py-0.5 text-[11px] text-muted hover:bg-hover hover:text-surface"
          @click="addVariable('STRING')"
        >
          <icon-lucide-type class="size-2.5" />
          String
        </button>
        <button
          class="flex cursor-pointer items-center gap-1 rounded border-none bg-transparent px-2 py-0.5 text-[11px] text-muted hover:bg-hover hover:text-surface"
          @click="addVariable('BOOLEAN')"
        >
          <icon-lucide-toggle-left class="size-2.5" />
          Bool
        </button>
      </div>
    </template>
  </div>
</template>
