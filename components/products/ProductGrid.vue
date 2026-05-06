<script setup lang="ts">
import type { Product } from '~/types/product'
import ProductCard from '~/components/products/ProductCard.vue'

defineProps<{
  products: Product[]
  isLoadingInitial: boolean
  formatPrice: (price: number) => string
}>()
</script>

<template>
  <div
    v-if="isLoadingInitial"
    class="space-y-6"
  >
    <div class="flex items-center justify-center gap-3 text-slate-600" aria-live="polite">
      <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      <span class="text-sm font-medium">Loading products...</span>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="skeleton in 6"
      :key="skeleton"
      class="animate-pulse"
    >
      <div class="aspect-[4/3] rounded-none bg-slate-200" />
      <div class="mt-5 h-8 w-4/5 rounded bg-slate-200" />
      <div class="mt-3 h-6 w-2/3 rounded bg-slate-200" />
      <div class="mt-6 h-6 w-3/4 rounded bg-slate-200" />
      <div class="mt-2 h-6 w-2/3 rounded bg-slate-200" />
    </article>
    </div>
  </div>

  <div
    v-else-if="products.length > 0"
    class="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3"
  >
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :format-price="formatPrice"
    />
  </div>

  <div
    v-else
    class="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-slate-500"
  >
    No products match the current search and filters.
  </div>
</template>
