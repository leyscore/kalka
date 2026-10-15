import { omit } from 'es-toolkit'
import * as v from 'valibot'
import { useForm } from 'vee-validate'
import { computed, reactive, ref, watch, type Ref } from 'vue'

import {
  createMCPConnectionDraft,
  validateMCPConnectionURL,
  mcpConnectionSettings,
  MCP_CONNECTION_NAME_MAX_LENGTH
} from '@/app/integrations/mcp'
import { isReservedMCPConnectionName } from '@/app/integrations/mcp/built-in'
import { parseCommandLine } from '@/app/integrations/mcp/command-line'
import { parseEnvironment } from '@/app/integrations/mcp/environment'
import { requiredSetting, type SettingsValidationMessages } from '@/app/settings/validation/schema'

import type { MCPConnectionDraft } from '../types'

interface ConnectionFormMessages {
  connectionNameInvalid: string
  serverURLHint: string
  bearerTokenRequired: string
  serverCommandHint: string
}
export type MCPConnectionField = 'name' | 'url' | 'command' | 'credential'
export type MCPConnectionFieldErrors = Partial<Record<MCPConnectionField, string>>

function isValidURL(value: string): boolean {
  try {
    validateMCPConnectionURL(value)
    return true
  } catch {
    return false
  }
}

/** Whether an environment typed in the form reads as variables; empty counts. */
export function isValidEnvironment(text: string): boolean {
  return parseEnvironment(text).ok
}

/** Only credential availability enters form state, never entered or saved secrets. */
export function useMCPConnectionForm(
  messages: Readonly<Ref<SettingsValidationMessages>>,
  automation: Readonly<Ref<ConnectionFormMessages>>
) {
  const id = ref<MCPConnectionDraft['id']>(null)
  const schema = computed(() =>
    v.pipe(
      v.object({
        name: v.pipe(
          requiredSetting(messages.value.requiredField),
          v.check(
            (name) =>
              name.length <= MCP_CONNECTION_NAME_MAX_LENGTH &&
              !isReservedMCPConnectionName(name) &&
              !mcpConnectionSettings.value.connections.some(
                (connection) =>
                  connection.id !== id.value && connection.name.toLowerCase() === name.toLowerCase()
              ),
            automation.value.connectionNameInvalid
          )
        ),
        transportType: v.picklist(['streamable-http', 'stdio']),
        url: v.string(),
        command: v.string(),
        enabled: v.boolean(),
        authenticationType: v.picklist(['none', 'bearer', 'oauth', 'env']),
        credential: v.boolean()
      }),
      v.forward(
        v.partialCheck(
          [['transportType'], ['url']],
          (value) => value.transportType !== 'streamable-http' || isValidURL(value.url),
          automation.value.serverURLHint
        ),
        ['url']
      ),
      v.forward(
        v.partialCheck(
          [['transportType'], ['command']],
          (value) => value.transportType !== 'stdio' || parseCommandLine(value.command) !== null,
          automation.value.serverCommandHint
        ),
        ['command']
      ),
      v.forward(
        v.partialCheck(
          [['enabled'], ['authenticationType'], ['credential']],
          (value) =>
            !value.enabled ||
            (value.authenticationType !== 'bearer' && value.authenticationType !== 'env') ||
            value.credential,
          automation.value.bearerTokenRequired
        ),
        ['credential']
      )
    )
  )
  const form = useForm({
    initialValues: { ...omit(createMCPConnectionDraft(), ['id']), credential: false },
    validationSchema: schema
  })
  const config = (state: { errors: string[] }) => ({
    validateOnModelUpdate: state.errors.length > 0,
    validateOnChange: false,
    validateOnInput: false
  })
  const [name] = form.defineField('name', config)
  const [transportType] = form.defineField('transportType', config)
  const [url] = form.defineField('url', config)
  const [command] = form.defineField('command', config)
  const [enabled] = form.defineField('enabled', config)
  const [authenticationType] = form.defineField('authenticationType', config)
  form.defineField('credential', config)
  watch([enabled, authenticationType], () => {
    if (form.errors.value.credential) void form.validateField('credential')
  })
  const fields = reactive({ id, name, transportType, url, command, enabled, authenticationType })
  const draft = computed<MCPConnectionDraft>({
    get: () => fields,
    set: (values) => {
      id.value = values.id
      form.resetForm({ values: { ...omit(values, ['id']), credential: false } })
    }
  })

  return {
    draft,
    dirty: computed(() => form.meta.value.dirty),
    errors: form.errors,
    blur: (field: MCPConnectionField) => form.validateField(field),
    setCredentialReady: (ready: boolean) => form.resetField('credential', { value: ready }),
    handleSubmit: form.handleSubmit,
    isSubmitting: form.isSubmitting
  }
}
