import type { Component } from 'vue'

/** One section of Settings in the sidebar, with the id its address and test hooks use. */
export interface SettingsSidebarSection {
  value: string
  label: string
  icon: Component
}

export interface SettingsSidebarGroup {
  id: string
  label: string
  sections: SettingsSidebarSection[]
}
