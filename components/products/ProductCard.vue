<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  product: Product
  formatPrice: (price: number) => string
}>()
</script>

<template>
  <article class="group">
    <div class="aspect-[4/3] overflow-hidden bg-[#ddd8cf]">
      <img
        :src="product.thumbnail"
        :alt="product.title"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        loading="lazy"
      >
    </div>

    <h2 class="mt-5 line-clamp-2 text-xl font-semibold leading-[1.25] text-slate-800">
      {{ product.title }}
    </h2>
    <p class="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-500">
      {{ product.description }}
    </p>
    <div class="mx-auto mt-8 h-px w-10 bg-slate-700/80" />
    <p class="mt-3 text-center text-2xl font-semibold text-slate-900">
      {{ formatPrice(product.price) }}
    </p>
  </article>
</template>
