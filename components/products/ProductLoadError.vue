<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-base text-red-700">
    <p>{{ message }}</p>
    <button
      type="button"
      class="mt-3 rounded-md border border-red-300 bg-white px-3 py-1 text-base font-medium text-red-700 hover:bg-red-100"
      @click="$emit('retry')"
    >
      Retry
    </button>
  </div>
</template>
