<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { openFolderFile } from '@/app/document/folder/view'
import { INSTRUCTIONS_DIR } from '@/app/document/instructions/layout'
import { useInstructions } from '@/app/document/instructions/use'
import { useEditorStore } from '@/app/editor/active-store'
import FolderEntryIcon from '@/components/folder/FolderEntryIcon.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import { useGlide } from '@/components/ui/motion/useGlide'
import { glidePills } from '@/theme/motion/glide'
import { instructionsPanel } from '@/theme/panel/instructions'

const { panels, common } = useI18n()
const store = useEditorStore()
const {
  state,
  listing,
  kalka,
  own,
  replaced,
  error,
  openBuiltIn,
  openOwn,
  addOwn,
  removeOwn,
  setSkillEnabled,
  open,
  start,
  addDocument
} = useInstructions(store)
const styles = instructionsPanel()

// The open row's pill slides to the row chosen; a soft one follows the pointer.
const list = useTemplateRef<HTMLElement>('list')
useGlide(list, {
  items: '[data-slot="row"]',
  active: '[data-slot="row"][data-active]',
  pillClass: glidePills.selected
})
useGlide(list, { items: '[data-slot="row"]', hover: true, pillClass: glidePills.selectedHover })

/** Which group is being given a new file, and the name typed for it. */
const adding = ref<'skill' | 'document' | null>(null)
const newName = ref('')
/** The own skill whose removal waits for a second press. */
const confirming = ref<string | null>(null)

async function create(): Promise<void> {
  const kind = adding.value
  const name = newName.value
  if (!kind || !name.trim()) return
  if (kind === 'skill') {
    if (!addOwn(name)) return
  } else await addDocument(name)
  adding.value = null
  newName.value = ''
}

function startAdding(kind: 'skill' | 'document'): void {
  adding.value = adding.value === kind ? null : kind
  newName.value = ''
}

/** The first press asks, the second removes: a skill someone wrote is not lost to one click. */
function remove(name: string): void {
  if (confirming.value !== name) {
    confirming.value = name
    return
  }
  confirming.value = null
  removeOwn(name)
}

function isOpen(path: string): boolean {
  return openFolderFile.value?.path === path
}

function withoutExtension(file: string): string {
  return file.replace(/\.(md|txt)$/i, '')
}
</script>

<template>
  <div ref="list" :class="styles.root()" data-test-id="instructions-panel">
    <h3 :class="styles.title()">{{ panels.instructions }}</h3>

    <section :class="styles.group()" data-test-id="instructions-skills">
      <h4 :class="styles.heading()">
        {{ panels.instructionsSkills }}
        <span :class="styles.count()">{{ kalka.length + own.length + listing.skills.length }}</span>
        <IconButton
          :label="panels.instructionsAddSkill"
          data-test-id="instructions-add-skill"
          :class="styles.add()"
          @click="startAdding('skill')"
        >
          <icon-hugeicons-plus class="size-3" />
        </IconButton>
      </h4>
      <p :class="styles.hint()">{{ panels.instructionsSkillsHint }}</p>
      <form v-if="adding === 'skill'" :class="styles.form()" @submit.prevent="create">
        <AppInput
          v-model="newName"
          tone="panel"
          autofocus
          :aria-label="panels.instructionsAddSkill"
          placeholder="pricing-page"
        />
        <AppButton type="submit" size="xs" variant="outline">{{ common.ok }}</AppButton>
      </form>

      <!-- The project's own skills, then the person's, then Kalka's. -->
      <div
        v-for="file in listing.skills"
        :key="`project-${file}`"
        data-slot="row"
        :data-active="isOpen(`${INSTRUCTIONS_DIR}/skills/${file}`) || undefined"
        :class="styles.row()"
      >
        <button type="button" :class="styles.open()" @click="open(`skills/${file}`)">
          <FolderEntryIcon type="skill" />
          <span :class="[styles.name(), styles.command()]">/{{ withoutExtension(file) }}</span>
        </button>
        <span :class="styles.tag()">{{ panels.instructionsTagProject }}</span>
      </div>

      <div
        v-for="name in own"
        :key="`own-${name}`"
        data-slot="row"
        data-kind="own"
        :data-active="isOpen(`/${name}`) || undefined"
        :class="styles.row()"
      >
        <button type="button" :class="styles.open()" @click="openOwn(name)">
          <FolderEntryIcon type="skill" />
          <span :class="[styles.name(), styles.command()]">/{{ name }}</span>
        </button>
        <span :class="styles.tag()">{{ panels.instructionsTagYours }}</span>
        <IconButton
          :label="
            confirming === name ? panels.instructionsRemoveConfirm : panels.instructionsRemoveSkill
          "
          :data-confirm="confirming === name || undefined"
          :class="styles.action()"
          @click="remove(name)"
          @blur="confirming = null"
        >
          <icon-hugeicons-delete-02 class="size-3" />
        </IconButton>
      </div>

      <template v-for="skill in kalka" :key="`kalka-${skill.name}`">
        <div
          v-if="!replaced.has(skill.name) && !own.includes(skill.name)"
          data-slot="row"
          data-kind="kalka"
          :data-off="!skill.enabled || undefined"
          :data-active="isOpen(`/${skill.name}`) || undefined"
          :class="styles.row()"
        >
          <button type="button" :class="styles.open()" @click="openBuiltIn(skill.name)">
            <FolderEntryIcon type="skill" />
            <span :class="[styles.name(), styles.command()]">/{{ skill.name }}</span>
          </button>
          <span :class="styles.tag()">Kalka</span>
          <IconButton
            :label="skill.enabled ? panels.instructionsTurnOff : panels.instructionsTurnOn"
            :aria-pressed="skill.enabled"
            :class="styles.action()"
            @click="setSkillEnabled(skill.name, !skill.enabled)"
          >
            <icon-hugeicons-view v-if="skill.enabled" class="size-3" />
            <icon-hugeicons-view-off v-else class="size-3" />
          </IconButton>
        </div>
      </template>
    </section>

    <section :class="styles.group()" data-test-id="instructions-rules">
      <h4 :class="styles.heading()">
        {{ panels.instructionsRules }}
        <span v-if="listing.standing.length" :class="styles.count()">
          {{ listing.standing.length }}
        </span>
      </h4>
      <div
        v-for="file in listing.standing"
        :key="file"
        data-slot="row"
        :data-active="isOpen(`${INSTRUCTIONS_DIR}/${file}`) || undefined"
        :class="styles.row()"
      >
        <button type="button" :class="styles.open()" @click="open(file)">
          <FolderEntryIcon type="instruction" />
          <span :class="styles.name()">{{ file }}</span>
        </button>
      </div>
      <template v-if="state !== 'ready'">
        <p :class="styles.hint()">
          {{ state === 'empty' ? panels.instructionsRulesEmpty : panels.instructionsRulesNone }}
        </p>
        <div v-if="state === 'empty'" class="px-2">
          <AppButton size="sm" variant="outline" data-test-id="instructions-start" @click="start">
            {{ panels.folderInstructionsCreate }}
          </AppButton>
        </div>
      </template>
    </section>

    <section :class="styles.group()" data-test-id="instructions-documents">
      <h4 :class="styles.heading()">
        {{ panels.instructionsDocuments }}
        <span v-if="listing.documents.length" :class="styles.count()">
          {{ listing.documents.length }}
        </span>
        <IconButton
          v-if="state === 'ready'"
          :label="panels.instructionsAddDocument"
          :class="styles.add()"
          @click="startAdding('document')"
        >
          <icon-hugeicons-plus class="size-3" />
        </IconButton>
      </h4>
      <form v-if="adding === 'document'" :class="styles.form()" @submit.prevent="create">
        <AppInput
          v-model="newName"
          tone="panel"
          autofocus
          :aria-label="panels.instructionsAddDocument"
          placeholder="brief"
        />
        <AppButton type="submit" size="xs" variant="outline">{{ common.ok }}</AppButton>
      </form>
      <div
        v-for="file in listing.documents"
        :key="file"
        data-slot="row"
        :data-active="isOpen(`${INSTRUCTIONS_DIR}/documents/${file}`) || undefined"
        :class="styles.row()"
      >
        <button type="button" :class="styles.open()" @click="open(`documents/${file}`)">
          <FolderEntryIcon type="text" />
          <span :class="styles.name()">@{{ file }}</span>
        </button>
      </div>
      <p v-if="listing.documents.length === 0" :class="styles.hint()">
        {{ panels.instructionsDocumentsEmpty }}
      </p>
    </section>

    <AppAlert v-if="error" tone="error" :heading="error" class="mx-4" />
  </div>
</template>
