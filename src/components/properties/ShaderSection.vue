<script setup lang="ts">
import { computed } from 'vue'

import {
  createShaderLayer,
  SHADER_PRESET_INFO,
  SHADER_PRESETS,
  shaderParameter,
  type Color,
  type ShaderLayer,
  type ShaderPreset
} from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import ColorInput from '@/components/ColorPicker/ColorInput.vue'
import NumberField from '@/components/inputs/NumberField.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/** Layers that paint a background a shader can sit on. */
const SHADER_TYPES = new Set(['FRAME', 'RECTANGLE', 'SECTION', 'COMPONENT', 'INSTANCE'])

const store = useEditorStore()
const { panels } = useI18n()

const node = computed(() => {
  // The graph is not reactive; the scene version tells when it changed.
  void store.state.sceneVersion
  const ids = [...store.state.selectedIds]
  const selected = ids.length === 1 ? store.graph.getNode(ids[0]) : undefined
  return selected && SHADER_TYPES.has(selected.type) ? selected : undefined
})
const layer = computed(() => {
  // The node is edited in place, so its shader is read again on every scene change.
  void store.state.sceneVersion
  return node.value?.shader ?? null
})

const presetLabels = computed<Record<ShaderPreset, string>>(() => ({
  'mesh-gradient': panels.value.shaderMeshGradient,
  'grain-gradient': panels.value.shaderGrainGradient,
  warp: panels.value.shaderWarp
}))
const presetOptions = computed(() =>
  SHADER_PRESETS.map((value) => ({ value, label: presetLabels.value[value] }))
)
const parameterLabels = computed<Record<string, string>>(() => ({
  distortion: panels.value.shaderDistortion,
  swirl: panels.value.shaderSwirl,
  grainOverlay: panels.value.shaderGrain,
  softness: panels.value.shaderSoftness,
  intensity: panels.value.shaderIntensity,
  noise: panels.value.shaderNoise,
  proportion: panels.value.shaderProportion
}))
const parameters = computed(() =>
  layer.value ? SHADER_PRESET_INFO[layer.value.preset].parameters : []
)
const canAddColor = computed(
  () =>
    !!layer.value && layer.value.colors.length < SHADER_PRESET_INFO[layer.value.preset].maxColors
)

function commit(next: ShaderLayer | null, label: string): void {
  if (node.value) store.updateNodeWithUndo(node.value.id, { shader: next }, label)
}

/** While a field is dragged the canvas follows; its end is one undo step. */
function preview(next: ShaderLayer): void {
  if (node.value) store.updateNode(node.value.id, { shader: next })
}

function withChanges(changes: Partial<ShaderLayer>): ShaderLayer | null {
  return layer.value ? { ...layer.value, ...changes } : null
}

function setPreset(preset: ShaderPreset): void {
  const current = layer.value
  if (!current) return
  const fresh = createShaderLayer(preset)
  // The colors and speed carry over; the new preset brings its own parameters.
  commit(
    {
      ...fresh,
      colors: current.colors.slice(0, SHADER_PRESET_INFO[preset].maxColors),
      speed: current.speed
    },
    'Change shader'
  )
}

function scrubParameter(name: string, percent: number): void {
  const next = withChanges({ params: { ...layer.value?.params, [name]: percent / 100 } })
  if (next) preview(next)
}

function commitParameter(name: string, percent: number, previous: number): void {
  const current = layer.value
  if (!current) return
  preview({ ...current, params: { ...current.params, [name]: previous / 100 } })
  commit({ ...current, params: { ...current.params, [name]: percent / 100 } }, 'Shader setting')
}

function scrubSpeed(percent: number): void {
  const next = withChanges({ speed: percent / 100 })
  if (next) preview(next)
}

function commitSpeed(percent: number, previous: number): void {
  const current = layer.value
  if (!current) return
  preview({ ...current, speed: previous / 100 })
  commit({ ...current, speed: percent / 100 }, 'Shader speed')
}

function setColor(index: number, color: Color): void {
  const current = layer.value
  if (!current) return
  commit(
    { ...current, colors: current.colors.map((item, at) => (at === index ? color : item)) },
    'Shader color'
  )
}

function addColor(): void {
  const current = layer.value
  const last = current?.colors.at(-1)
  if (!current || !last) return
  commit({ ...current, colors: [...current.colors, { ...last }] }, 'Add shader color')
}

function removeColor(index: number): void {
  const current = layer.value
  if (!current || current.colors.length <= 1) return
  commit(
    { ...current, colors: current.colors.filter((_, at) => at !== index) },
    'Remove shader color'
  )
}
</script>

<template>
  <PanelSection v-if="node" :label="panels.shader" :empty="!layer" data-test-id="shader-section">
    <template #actions>
      <IconButton
        v-if="!layer"
        :label="panels.addShader"
        data-test-id="shader-add"
        @click="commit(createShaderLayer(), 'Add shader')"
      >
        <icon-lucide-plus class="size-3.5" />
      </IconButton>
      <IconButton
        v-else
        :label="panels.removeShader"
        data-test-id="shader-remove"
        @click="commit(null, 'Remove shader')"
      >
        <icon-lucide-minus class="size-3.5" />
      </IconButton>
    </template>

    <div v-if="layer" class="flex flex-col gap-2">
      <AppSelect
        :model-value="layer.preset"
        :options="presetOptions"
        :label="panels.shader"
        data-property="shader-preset"
        @update:model-value="setPreset"
      />

      <PanelFieldGroup :label="panels.shaderColors">
        <div class="flex flex-col gap-1.5">
          <div
            v-for="(color, index) in layer.colors"
            :key="index"
            class="flex items-center gap-1.5"
          >
            <ColorInput
              class="min-w-0 flex-1"
              :color="color"
              editable
              @update="setColor(index, $event)"
            />
            <IconButton
              v-if="layer.colors.length > 1"
              :label="panels.removeShaderColor"
              @click="removeColor(index)"
            >
              <icon-lucide-minus class="size-3.5" />
            </IconButton>
          </div>
          <IconButton
            v-if="canAddColor"
            class="self-start"
            :label="panels.addShaderColor"
            @click="addColor"
          >
            <icon-lucide-plus class="size-3.5" />
          </IconButton>
        </div>
      </PanelFieldGroup>

      <div class="grid grid-cols-2 gap-1.5">
        <PanelFieldGroup
          v-for="parameter in parameters"
          :key="parameter.name"
          :label="parameterLabels[parameter.name] ?? parameter.name"
        >
          <NumberField
            suffix="%"
            :min="0"
            :max="100"
            :model-value="Math.round(shaderParameter(layer, parameter.name) * 100)"
            :data-property="`shader-${parameter.name}`"
            @update:model-value="scrubParameter(parameter.name, $event)"
            @commit="(value, previous) => commitParameter(parameter.name, value, previous)"
          />
        </PanelFieldGroup>
        <PanelFieldGroup :label="panels.shaderSpeed">
          <NumberField
            suffix="%"
            :min="0"
            :max="200"
            :model-value="Math.round(layer.speed * 100)"
            data-property="shader-speed"
            @update:model-value="scrubSpeed"
            @commit="commitSpeed"
          />
        </PanelFieldGroup>
      </div>
    </div>
  </PanelSection>
</template>
