<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  CheckboxGroupRoot,
  CheckboxIndicator,
  CheckboxRoot,
} from 'reka-ui'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Product {
  id: number
  title: string
  description: string
  price: number
  thumbnail: string
  brand: string | null
  tags: string[]
  availabilityStatus: string
}

interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

// This forces the dummy API to return all products currently available, 
// since we don't have the total number of products beforehand and it would missinform the user about the number of results.
// NOTE: In a real-world scenario, you would typically implement server-side filtering and pagination or infinite scrolling.
const PAGE_SIZE = 1000

const products = ref<Product[]>([])
const totalProducts = ref<number | null>(null)
const loadedCount = ref(0)
const query = ref('')
const selectedStatuses = ref<string[]>([])
const selectedTags = ref<string[]>([])
const selectedBrands = ref<string[]>([])
const isLoadingInitial = ref(false)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const sentinelRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

const statusOptions = computed(() =>
  Array.from(new Set(products.value.map(product => product.availabilityStatus))).sort(),
)
const tagOptions = computed(() =>
  Array.from(new Set(products.value.flatMap(product => product.tags))).sort(),
)
const brandOptions = computed(() =>
  Array.from(new Set(products.value.map(product => product.brand).filter(Boolean) as string[])).sort(),
)

const filteredProducts = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return products.value.filter((product) => {
    const matchesQuery
      = normalizedQuery.length === 0
        || product.title.toLowerCase().includes(normalizedQuery)
        || product.description.toLowerCase().includes(normalizedQuery)

    const matchesStatus
      = selectedStatuses.value.length === 0
        || selectedStatuses.value.includes(product.availabilityStatus)

    const matchesTags
      = selectedTags.value.length === 0
        || product.tags.some(tag => selectedTags.value.includes(tag))

    const matchesBrand
      = selectedBrands.value.length === 0
        || (product.brand !== null && selectedBrands.value.includes(product.brand))

    return matchesQuery && matchesStatus && matchesTags && matchesBrand
  })
})

const hasMoreProducts = computed(() => (
  totalProducts.value === null || loadedCount.value < totalProducts.value
))

const resultCountLabel = computed(() => `${filteredProducts.value.length} Results`)

const productPriceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function formatPrice(price: number) {
  return productPriceFormatter.format(price)
}

function clearError() {
  errorMessage.value = ''
}

async function fetchProductsBatch(skip: number) {
  const response = await $fetch<ProductsResponse>('https://dummyjson.com/products', {
    query: {
      limit: PAGE_SIZE,
      skip,
    },
  })

  return response
}

async function loadInitialProducts() {
  if (isLoadingInitial.value)
    return

  clearError()
  isLoadingInitial.value = true

  try {
    const response = await fetchProductsBatch(0)
    products.value = response.products
    totalProducts.value = response.total
    loadedCount.value = response.products.length
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load products.'
    errorMessage.value = `Failed to load products: ${message}`
  }
  finally {
    isLoadingInitial.value = false
  }
}

async function loadMoreProducts() {
  if (isLoadingMore.value || isLoadingInitial.value || !hasMoreProducts.value)
    return

  clearError()
  isLoadingMore.value = true

  try {
    const response = await fetchProductsBatch(loadedCount.value)
    products.value = [...products.value, ...response.products]
    totalProducts.value = response.total
    loadedCount.value += response.products.length
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load more products.'
    errorMessage.value = `Failed to load more products: ${message}`
  }
  finally {
    isLoadingMore.value = false
  }
}

function retryLoad() {
  if (products.value.length === 0) {
    void loadInitialProducts()
    return
  }

  void loadMoreProducts()
}

function setupObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }

  if (!sentinelRef.value)
    return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          void loadMoreProducts()
        }
      }
    },
    { rootMargin: '200px 0px' },
  )

  observer.observe(sentinelRef.value)
}

watch(sentinelRef, () => {
  setupObserver()
})

onMounted(async () => {
  await loadInitialProducts()
  await nextTick()
  setupObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <main class="bg-[#f3f3f4] p-6 text-slate-900 lg:p-8">
    <section class="mx-auto max-w-[1320px] rounded-[30px] border border-slate-300/70 bg-[#f6f6f7] px-8 pb-12 pt-14 lg:px-10">
      <div class="mb-14 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-800">
            Explore Our Products
          </h1>
          <p class="mt-3 max-w-2xl text-base text-slate-500">
            Discover expert-led solutions to help you succeed in the cloud.
          </p>
        </div>

        <img
          src="/assets/asset-ui.png"
          alt="Productivity illustration"
          class="h-auto w-full max-w-[360px] max-h-[280px] self-start justify-self-end"
        >
      </div>

      <div class="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
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
                v-model="query"
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
            <AccordionItem value="status" class="border-b border-slate-300">
              <AccordionHeader>
                <AccordionTrigger class="flex w-full items-center justify-between px-5 py-4 text-left text-lg font-medium text-slate-700">
                  <span>Status</span>
                  <svg class="h-5 w-5 shrink-0 text-slate-500 transition-transform data-[state=open]:rotate-180" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 6.5L8 11L12.5 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent class="px-5 pb-4">
                <CheckboxGroupRoot v-model="selectedStatuses" class="space-y-2">
                  <label
                    v-for="status in statusOptions"
                    :key="status"
                    class="flex cursor-pointer items-center gap-3 text-base text-slate-600"
                  >
                    <CheckboxRoot
                      :value="status"
                      class="flex h-5 w-5 items-center justify-center rounded border border-slate-400 bg-white data-[state=checked]:border-slate-700 data-[state=checked]:bg-slate-700"
                    >
                      <CheckboxIndicator class="text-white">
                        <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" aria-hidden="true">
                          <path d="M3 8L6.2 11.2L13 4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </CheckboxIndicator>
                    </CheckboxRoot>
                    <span>{{ status }}</span>
                  </label>
                </CheckboxGroupRoot>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tags" class="border-b border-slate-300">
              <AccordionHeader>
                <AccordionTrigger class="flex w-full items-center justify-between px-5 py-4 text-left text-lg font-medium text-slate-700">
                  <span>Tags</span>
                  <svg class="h-5 w-5 shrink-0 text-slate-500 transition-transform data-[state=open]:rotate-180" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 6.5L8 11L12.5 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent class="max-h-64 overflow-y-auto px-5 pb-4">
                <CheckboxGroupRoot v-model="selectedTags" class="space-y-2">
                  <label
                    v-for="tag in tagOptions"
                    :key="tag"
                    class="flex cursor-pointer items-center gap-3 text-base text-slate-600"
                  >
                    <CheckboxRoot
                      :value="tag"
                      class="flex h-5 w-5 items-center justify-center rounded border border-slate-400 bg-white data-[state=checked]:border-slate-700 data-[state=checked]:bg-slate-700"
                    >
                      <CheckboxIndicator class="text-white">
                        <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" aria-hidden="true">
                          <path d="M3 8L6.2 11.2L13 4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </CheckboxIndicator>
                    </CheckboxRoot>
                    <span>{{ tag }}</span>
                  </label>
                </CheckboxGroupRoot>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="brand">
              <AccordionHeader>
                <AccordionTrigger class="flex w-full items-center justify-between px-5 py-4 text-left text-lg font-medium text-slate-700">
                  <span>Brand</span>
                  <svg class="h-5 w-5 shrink-0 text-slate-500 transition-transform data-[state=open]:rotate-180" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 6.5L8 11L12.5 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent class="max-h-64 overflow-y-auto px-5 pb-4">
                <CheckboxGroupRoot v-model="selectedBrands" class="space-y-2">
                  <label
                    v-for="brand in brandOptions"
                    :key="brand"
                    class="flex cursor-pointer items-center gap-3 text-base text-slate-600"
                  >
                    <CheckboxRoot
                      :value="brand"
                      class="flex h-5 w-5 items-center justify-center rounded border border-slate-400 bg-white data-[state=checked]:border-slate-700 data-[state=checked]:bg-slate-700"
                    >
                      <CheckboxIndicator class="text-white">
                        <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" aria-hidden="true">
                          <path d="M3 8L6.2 11.2L13 4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </CheckboxIndicator>
                    </CheckboxRoot>
                    <span>{{ brand }}</span>
                  </label>
                </CheckboxGroupRoot>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </aside>

        <div>
          <div
            v-if="errorMessage"
            class="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-base text-red-700"
          >
            <p>{{ errorMessage }}</p>
            <button
              type="button"
              class="mt-3 rounded-md border border-red-300 bg-white px-3 py-1 text-base font-medium text-red-700 hover:bg-red-100"
              @click="retryLoad"
            >
              Retry
            </button>
          </div>

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
            <article
              v-for="product in filteredProducts"
              :key="product.id"
              class="group"
            >
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
          </div>

          <div
            ref="sentinelRef"
            class="pt-6"
          >
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
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
