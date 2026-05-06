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
    class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
  >
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

  <div
    v-else
    class="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3"
  >
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :format-price="formatPrice"
    />
  </div>
</template>
