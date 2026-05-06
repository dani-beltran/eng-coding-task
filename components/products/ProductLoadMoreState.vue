<script setup lang="ts">
defineProps<{
  isLoadingMore: boolean
  hasMoreProducts: boolean
}>()
</script>

<template>
  <div
    v-if="isLoadingMore"
    class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
  >
    <article
      v-for="skeleton in 3"
      :key="`load-more-skeleton-${skeleton}`"
      class="animate-pulse"
    >
      <div class="aspect-[4/3] rounded-none bg-slate-200" />
      <div class="mt-5 h-8 w-4/5 rounded bg-slate-200" />
      <div class="mt-3 h-6 w-2/3 rounded bg-slate-200" />
    </article>
  </div>
  <p
    v-else-if="!hasMoreProducts"
    class="text-center text-base text-slate-500"
  >
    You've reached the end of the catalog.
  </p>
</template>
