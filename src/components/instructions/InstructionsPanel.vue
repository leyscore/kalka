<script setup lang="ts">
import { ref } from 'vue'

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
import { instructionsPanel } from '@/theme/panel/instructions'

const { panels, common } = useI18n()
const store = useEditorStore()
const { state, listing, builtIn, replaced, error, openBuiltIn, open, start, add } =
  useInstructions(store)
const styles = instructionsPanel()

/** Which group is being given a new file, and the name typed for it. */
const adding = ref<'skill' | 'document' | null>(null)
const newName = ref('')

async function create(): Promise<void> {
  const kind = adding.value
  if (!kind || !newName.value.trim()) return
  await add(kind, newName.value)
  adding.value = null
  newName.value = ''
}

function startAdding(kind: 'skill' | 'document'): void {
  adding.value = adding.value === kind ? null : kind
  newName.value = ''
}

function isOpen(path: string): boolean {
  return openFolderFile.value?.path === path
}
</script>

<template>
  <div :class="styles.root()" data-test-id="instructions-panel">
    <h3 :class="styles.title()">{{ panels.instructions }}</h3>

    <section :class="styles.group()" data-test-id="instructions-skills">
      <h4 :class="styles.heading()">
        {{ panels.instructionsSkills }}
        <span :class="styles.count()">{{ builtIn.length + listing.skills.length }}</span>
        <IconButton
          v-if="state === 'ready'"
          :label="panels.instructionsAddSkill"
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
      <button
        v-for="file in listing.skills"
        :key="file"
        type="button"
        :class="styles.row()"
        :data-active="isOpen(`${INSTRUCTIONS_DIR}/skills/${file}`) || undefined"
        @click="open(`skills/${file}`)"
      >
        <FolderEntryIcon type="skill" />
        <span :class="[styles.name(), styles.command()]"
          >/{{ file.replace(/\.(md|txt)$/i, '') }}</span
        >
      </button>
      <template v-for="name in builtIn" :key="name">
        <button
          v-if="!replaced.has(name)"
          type="button"
          :class="styles.row()"
          :data-active="isOpen(`/${name}`) || undefined"
          @click="openBuiltIn(name)"
        >
          <FolderEntryIcon type="skill" />
          <span :class="[styles.name(), styles.command()]">/{{ name }}</span>
          <span :class="styles.tag()">Kalka</span>
        </button>
      </template>
    </section>

    <section :class="styles.group()" data-test-id="instructions-rules">
      <h4 :class="styles.heading()">
        {{ panels.instructionsRules }}
        <span v-if="listing.standing.length" :class="styles.count()">
          {{ listing.standing.length }}
        </span>
      </h4>
      <button
        v-for="file in listing.standing"
        :key="file"
        type="button"
        :class="styles.row()"
        :data-active="isOpen(`${INSTRUCTIONS_DIR}/${file}`) || undefined"
        @click="open(file)"
      >
        <FolderEntryIcon type="instruction" />
        <span :class="styles.name()">{{ file }}</span>
      </button>
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
      <button
        v-for="file in listing.documents"
        :key="file"
        type="button"
        :class="styles.row()"
        :data-active="isOpen(`${INSTRUCTIONS_DIR}/documents/${file}`) || undefined"
        @click="open(`documents/${file}`)"
      >
        <FolderEntryIcon type="text" />
        <span :class="styles.name()">@{{ file }}</span>
      </button>
      <p v-if="listing.documents.length === 0" :class="styles.hint()">
        {{ panels.instructionsDocumentsEmpty }}
      </p>
    </section>

    <AppAlert v-if="error" tone="error" :heading="error" class="mx-4" />
  </div>
</template>
