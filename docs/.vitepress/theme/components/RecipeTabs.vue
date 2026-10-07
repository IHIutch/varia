<script setup lang="ts">
import { ref, useId } from 'vue'

const tabs = ['Preview', 'HTML'] as const
const activeTab = ref(0)
const id = useId()

function onKeydown(event: KeyboardEvent) {
  let next: number
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowLeft':
      next = 1 - activeTab.value
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = 1
      break
    default:
      return
  }
  event.preventDefault()
  activeTab.value = next
  const tablist = (event.currentTarget as HTMLElement).parentElement
  tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
}
</script>

<template>
  <div class="recipe-tabs">
    <div class="recipe-tablist" role="tablist" aria-label="Recipe example">
      <button
        v-for="(tab, index) in tabs"
        :id="`${id}-tab-${index}`"
        :key="tab"
        type="button"
        role="tab"
        :aria-selected="activeTab === index"
        :aria-controls="`${id}-panel-${index}`"
        :tabindex="activeTab === index ? 0 : -1"
        @click="activeTab = index"
        @keydown="onKeydown"
      >
        {{ tab }}
      </button>
    </div>
    <div
      v-for="(tab, index) in tabs"
      :id="`${id}-panel-${index}`"
      :key="tab"
      role="tabpanel"
      :aria-labelledby="`${id}-tab-${index}`"
      :hidden="activeTab !== index"
      tabindex="0"
    >
      <slot :name="index === 0 ? 'preview' : 'usage'" />
    </div>
  </div>
</template>

<style scoped>
.recipe-tabs {
  margin: 24px 0;
}

.recipe-tablist {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.recipe-tablist button {
  position: relative;
  padding: 12px 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.recipe-tablist button:hover,
.recipe-tablist button[aria-selected='true'] {
  color: var(--vp-c-text-1);
}

.recipe-tablist button[aria-selected='true']::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--vp-c-brand-1);
  content: '';
}

.recipe-tablist button:focus-visible,
[role='tabpanel']:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
}

[role='tabpanel'][hidden] {
  display: none;
}
</style>
