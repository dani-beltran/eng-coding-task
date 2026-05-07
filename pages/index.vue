<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Product } from '~/types/product'
import ProductCatalogHero from '~/components/products/ProductCatalogHero.vue'
import ProductFiltersSidebar from '~/components/products/ProductFiltersSidebar.vue'
import ProductGrid from '~/components/products/ProductGrid.vue'
import ProductLoadError from '~/components/products/ProductLoadError.vue'
import ProductLoadMoreState from '~/components/products/ProductLoadMoreState.vue'

interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

const products = ref<Product[]>([])
const totalProducts = ref<number | null>(null)
const loadedCount = ref(0)
const query = ref('')
const selectedStatuses = ref<string[]>([])
const selectedTags = ref<string[]>([])
const selectedBrands = ref<string[]>([])
const isLoadingInitial = ref(true)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const sentinelRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

const STATUS_FILTER_STORAGE_KEY = 'product-status-filters'
const TAG_FILTER_STORAGE_KEY = 'product-tag-filters'
const BRAND_FILTER_STORAGE_KEY = 'product-brand-filters'

const readStoredFilterValues = (key: string) => {
  const storedValue = localStorage.getItem(key)
  if (!storedValue)
    return []

  return storedValue.split(',').filter(Boolean)
}

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

const formatPrice = (price: number) => {
  return productPriceFormatter.format(price)
}

const clearError = () => {
  errorMessage.value = ''
}

const fetchProductsBatch = async () => {
  return $fetch<ProductsResponse>('/api/products', {})
}

const loadInitialProducts = async () => {
  clearError()
  isLoadingInitial.value = true

  try {
    const response = await fetchProductsBatch()
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

const loadMoreProducts = async () => {
  if (isLoadingMore.value || isLoadingInitial.value || !hasMoreProducts.value)
    return

  clearError()
  isLoadingMore.value = true

  try {
    const response = await fetchProductsBatch()
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

const retryLoad = () => {
  if (products.value.length === 0) {
    void loadInitialProducts()
    return
  }

  void loadMoreProducts()
}

const setupObserver = () => {
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
  selectedStatuses.value = readStoredFilterValues(STATUS_FILTER_STORAGE_KEY)
  selectedTags.value = readStoredFilterValues(TAG_FILTER_STORAGE_KEY)
  selectedBrands.value = readStoredFilterValues(BRAND_FILTER_STORAGE_KEY)

  await loadInitialProducts()
  await nextTick()
  setupObserver()
})

watch(selectedStatuses, (values) => {
  if (!import.meta.client)
    return

  localStorage.setItem(STATUS_FILTER_STORAGE_KEY, values.join(','))
}, { deep: true })

watch(selectedTags, (values) => {
  if (!import.meta.client)
    return

  localStorage.setItem(TAG_FILTER_STORAGE_KEY, values.join(','))
}, { deep: true })

watch(selectedBrands, (values) => {
  if (!import.meta.client)
    return

  localStorage.setItem(BRAND_FILTER_STORAGE_KEY, values.join(','))
}, { deep: true })

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <main class="text-slate-900 pt-10 pb-20">
    <section class="mx-auto rounded-[30px] border border-slate-300/70 bg-[#f6f6f7] px-8 pb-12 pt-14 lg:px-10">
      <ProductCatalogHero />

      <div class="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
        <ProductFiltersSidebar
          :result-count-label="resultCountLabel"
          :query="query"
          :status-options="statusOptions"
          :tag-options="tagOptions"
          :brand-options="brandOptions"
          :selected-statuses="selectedStatuses"
          :selected-tags="selectedTags"
          :selected-brands="selectedBrands"
          @update:query="query = $event"
          @update:selected-statuses="selectedStatuses = $event"
          @update:selected-tags="selectedTags = $event"
          @update:selected-brands="selectedBrands = $event"
        />

        <div>
          <ProductLoadError
            v-if="errorMessage"
            :message="errorMessage"
            @retry="retryLoad"
          />

          <ProductGrid
            :products="filteredProducts"
            :is-loading-initial="isLoadingInitial"
            :format-price="formatPrice"
          />

          <div
            ref="sentinelRef"
            class="pt-6"
          >
            <ProductLoadMoreState
              :is-loading-more="isLoadingMore"
              :has-more-products="hasMoreProducts"
            />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
