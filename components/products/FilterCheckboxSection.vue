<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  CheckboxGroupRoot,
  CheckboxIndicator,
  CheckboxRoot,
} from 'reka-ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  sectionValue: string
  label: string
  options: string[]
  modelValue: string[]
  bordered?: boolean
}>(), {
  bordered: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selectedValues = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})
</script>

<template>
  <AccordionItem :value="sectionValue" :class="bordered ? 'border-b border-slate-300' : ''">
    <AccordionHeader>
      <AccordionTrigger class="flex w-full items-center justify-between px-5 py-4 text-left text-lg font-medium text-slate-700">
        <span>{{ label }}</span>
        <svg class="h-5 w-5 shrink-0 text-slate-500 transition-transform data-[state=open]:rotate-180" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3.5 6.5L8 11L12.5 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent class="max-h-64 overflow-y-auto px-5 pb-4">
      <CheckboxGroupRoot v-model="selectedValues" class="space-y-2">
        <label
          v-for="option in options"
          :key="option"
          class="flex cursor-pointer items-center gap-3 text-base text-slate-600"
        >
          <CheckboxRoot
            :value="option"
            class="flex h-5 w-5 items-center justify-center rounded border border-slate-400 bg-white data-[state=checked]:border-slate-700 data-[state=checked]:bg-slate-700"
          >
            <CheckboxIndicator class="text-white">
              <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M3 8L6.2 11.2L13 4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </CheckboxIndicator>
          </CheckboxRoot>
          <span>{{ option }}</span>
        </label>
      </CheckboxGroupRoot>
    </AccordionContent>
  </AccordionItem>
</template>
