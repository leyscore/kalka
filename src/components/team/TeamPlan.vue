<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useCollaborationMessages, useI18n } from '@kalka/vue'

import { serverAccount } from '@/app/collab/server/account'
import {
  cloudBilling,
  cloudWorkspaceOf,
  type CloudInterval,
  type CloudPlan,
  type CloudPrices,
  type CloudWorkspaceBilling,
  type PaidCloudPlan
} from '@/app/collab/server/cloud-billing'
import { openExternalLink } from '@/app/shell/ui'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsRow from '@/components/settings/layout/SettingsRow.vue'
import TeamPage from '@/components/team/TeamPage.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'
import { IS_BROWSER } from '@/constants'
import { teamPlan } from '@/theme/team'

/**
 * A Kalka Cloud workspace's plan: what it is and uses, the paid plans to choose from while it is
 * free, and Stripe's billing portal once it pays. Opened outside the Cloud's own address, as in
 * the desktop app, billing opens on the Cloud in the browser.
 */
const messages = useCollaborationMessages()
const { locale } = useI18n()
const ui = teamPlan()
const workspace = ref<CloudWorkspaceBilling | null>(null)
const prices = ref<CloudPrices | null>(null)
const interval = ref<CloudInterval>('year')
const error = ref('')
const busy = ref<string | null>(null)

const cloud = computed(() => {
  const url = serverAccount.value?.url
  return url ? cloudWorkspaceOf(url) : null
})
/** The Cloud's session cookie reaches it only from the address it serves the app at. */
const servedHere = computed(
  () => IS_BROWSER && cloud.value !== null && cloud.value.origin === window.location.origin
)
const billing = computed(() => workspace.value?.billing)
const plan = computed<CloudPlan>(() => workspace.value?.plan ?? 'free')

onMounted(async () => {
  const place = cloud.value
  if (!place || !servedHere.value) return
  try {
    ;[workspace.value, prices.value] = await Promise.all([
      cloudBilling.workspace(place.origin, place.id),
      cloudBilling.prices(place.origin)
    ])
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : String(failure)
  }
})

function planName(value: CloudPlan | string | null | undefined): string {
  if (value === 'pro') return messages.value.planPro
  if (value === 'team') return messages.value.planTeam
  return messages.value.planFree
}

function date(time: number): string {
  return new Date(time).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function money(cents: number): string {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2
  }).format(cents / 100)
}

function bytes(value: number): string {
  const gigabytes = value / 1024 ** 3
  return gigabytes >= 1
    ? `${gigabytes.toLocaleString(locale.value, { maximumFractionDigits: 1 })} GB`
    : `${Math.round(value / 1024 ** 2).toLocaleString(locale.value)} MB`
}

function price(paid: PaidCloudPlan): string {
  const cents = prices.value?.prices[paid][interval.value] ?? 0
  return interval.value === 'year'
    ? messages.value.pricePerYear({ price: money(cents) })
    : messages.value.pricePerMonth({ price: money(cents) })
}

const status = computed(() => {
  const current = billing.value
  if (!current) return ''
  if (current.compPlan && current.compUntil) {
    return messages.value.planOffered({
      plan: planName(current.compPlan),
      date: date(current.compUntil)
    })
  }
  if (current.status === 'past_due') return messages.value.planPastDue
  if (current.periodEnd && current.cancelAtPeriodEnd) {
    return messages.value.planEnding({ date: date(current.periodEnd) })
  }
  if (current.periodEnd) return messages.value.planRenews({ date: date(current.periodEnd) })
  return messages.value.planActive
})

const usage = computed(() => {
  const value = workspace.value?.usage
  if (!value) return []
  return [
    {
      label: messages.value.usageEditors,
      text:
        value.editorLimit === null
          ? String(value.editors)
          : `${value.editors} / ${value.editorLimit}`,
      share: value.editorLimit ? value.editors / value.editorLimit : null
    },
    {
      label: messages.value.usageFiles,
      text:
        value.limits.documents === null
          ? `${value.documents}`
          : `${value.documents} / ${value.limits.documents}`,
      share: value.limits.documents ? value.documents / value.limits.documents : null
    },
    {
      label: messages.value.usageStorage,
      text: `${bytes(value.storageBytes)} / ${bytes(value.storageLimit)}`,
      share: value.storageLimit ? value.storageBytes / value.storageLimit : null
    }
  ]
})

/** Stripe's pages replace the app in this tab, and bring the person back to this page. */
async function go(action: string, request: () => Promise<{ url: string }>): Promise<void> {
  busy.value = action
  error.value = ''
  try {
    window.location.assign((await request()).url)
  } catch (failure) {
    error.value = failure instanceof Error ? failure.message : String(failure)
    busy.value = null
  }
}

function choose(paid: PaidCloudPlan): void {
  const place = cloud.value
  if (place)
    void go(paid, () => cloudBilling.checkout(place.origin, place.id, paid, interval.value))
}

function manage(): void {
  const place = cloud.value
  if (place) void go('portal', () => cloudBilling.portal(place.origin, place.id))
}

function openOnCloud(): void {
  const place = cloud.value
  if (place) void openExternalLink(`${place.origin}/billing/${place.id}`)
}
</script>

<template>
  <TeamPage
    :heading="messages.teamPlan"
    :description="messages.planDescription"
    data-test-id="team-plan"
  >
    <AppAlert v-if="error" tone="error" :heading="error" />

    <SettingsGroup v-if="!servedHere">
      <SettingsRow :label="messages.billingElsewhere">
        <AppButton variant="outline" @click="openOnCloud">
          <template #leading><icon-hugeicons-link-square-02 class="size-3.5" /></template>
          {{ messages.openBilling }}
        </AppButton>
      </SettingsRow>
    </SettingsGroup>

    <template v-else-if="workspace">
      <section :class="ui.current()" data-test-id="team-plan-current">
        <div :class="ui.currentHead()">
          <span :class="ui.planName()">{{ planName(plan) }}</span>
          <span v-if="status" :class="ui.status({ warning: billing?.status === 'past_due' })">
            {{ status }}
          </span>
          <span class="flex-1" />
          <AppButton
            v-if="billing?.subscribed || billing?.compPlan"
            variant="outline"
            :loading="busy === 'portal'"
            data-test-id="team-plan-manage"
            @click="manage"
          >
            {{ messages.manageBilling }}
          </AppButton>
        </div>
        <p v-if="billing?.subscribed" :class="ui.hint()">{{ messages.manageBillingHint }}</p>
        <div :class="ui.usage()">
          <div v-for="item in usage" :key="item.label" :class="ui.meter()">
            <span :class="ui.meterLabel()">{{ item.label }}</span>
            <span :class="ui.meterValue()">{{ item.text }}</span>
            <span v-if="item.share !== null" :class="ui.track()">
              <span :class="ui.fill()" :style="{ width: `${Math.min(1, item.share) * 100}%` }" />
            </span>
          </div>
        </div>
      </section>

      <section v-if="!billing?.subscribed" class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <SegmentedControl
            v-model="interval"
            required
            :label="messages.teamPlan"
            :options="[
              { value: 'month', label: messages.billingMonthly },
              { value: 'year', label: messages.billingYearly }
            ]"
          />
          <span v-if="prices?.tax" class="text-xs text-muted">{{ messages.taxNote }}</span>
        </div>
        <p v-if="billing && !billing.ready" class="m-0 text-xs text-muted">
          {{ messages.billingNotReady }}
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <article
            v-for="paid in ['pro', 'team'] as const"
            :key="paid"
            :class="ui.offer({ current: plan === paid })"
            :data-plan="paid"
          >
            <span :class="ui.planName()">{{ planName(paid) }}</span>
            <span :class="ui.price()">{{ price(paid) }}</span>
            <span :class="ui.hint()">
              {{ paid === 'pro' ? messages.proFeatures : messages.teamFeatures }}
            </span>
            <AppButton
              :color="paid === 'pro' ? 'primary' : undefined"
              :variant="paid === 'pro' ? 'solid' : 'outline'"
              class="mt-2 self-start"
              :disabled="billing ? !billing.ready : false"
              :loading="busy === paid"
              :data-test-id="`team-plan-choose-${paid}`"
              @click="choose(paid)"
            >
              {{ messages.choosePlan({ plan: planName(paid) }) }}
            </AppButton>
          </article>
        </div>
      </section>
    </template>
  </TeamPage>
</template>
