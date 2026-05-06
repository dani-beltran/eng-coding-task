<script setup lang="ts">
import { AccordionRoot } from 'reka-ui'
import { computed } from 'vue'
import FilterCheckboxSection from '~/components/products/FilterCheckboxSection.vue'

const props = defineProps<{
  resultCountLabel: string
  query: string
  statusOptions: string[]
  tagOptions: string[]
  brandOptions: string[]
  selectedStatuses: string[]
  selectedTags: string[]
  selectedBrands: string[]
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  'update:selectedStatuses': [value: string[]]
  'update:selectedTags': [value: string[]]
  'update:selectedBrands': [value: string[]]
}>()

const searchQuery = computed({
  get: () => props.query,
  set: value => emit('update:query', value),
})

const statusesModel = computed({
  get: () => props.selectedStatuses,
  set: value => emit('update:selectedStatuses', value),
})

const tagsModel = computed({
  get: () => props.selectedTags,
  set: value => emit('update:selectedTags', value),
})

const brandsModel = computed({
  get: () => props.selectedBrands,
  set: value => emit('update:selectedBrands', value),
})
</script>

<template>
  <aside class="h-fit overflow-hidden rounded-2xl border border-slate-300 bg-[#f1f1f2]">
    <div class="border-b border-slate-300 px-5 py-4 text-lg font-semibold text-slate-900">
      {{ resultCountLabel }}
    </div>

    <div class="border-b border-slate-300 px-5 py-5">
      <label
        for="search-products"
        class="flex items-center gap-3 rounded-full border border-slate-300 bg-[#efefef] px-4 py-3 text-base text-slate-600"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L16.65 16.65" />
        </svg>
        <input
          id="search-products"
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full border-none bg-transparent text-base text-slate-700 placeholder:text-slate-500 focus:outline-none"
        >
      </label>
    </div>

    <AccordionRoot
      type="multiple"
      :default-value="['status', 'tags', 'brand']"
    >
      <FilterCheckboxSection
        section-value="status"
        label="Status"
        :options="statusOptions"
        v-model="statusesModel"
      />
      <FilterCheckboxSection
        section-value="tags"
        label="Tags"
        :options="tagOptions"
        v-model="tagsModel"
      />
      <FilterCheckboxSection
        section-value="brand"
        label="Brand"
        :options="brandOptions"
        :bordered="false"
        v-model="brandsModel"
      />
    </AccordionRoot>
  </aside>
</template>
