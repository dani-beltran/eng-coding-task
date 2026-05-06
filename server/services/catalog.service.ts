type CatalogApiResponse<TProduct> = {
  products: TProduct[]
  total: number
  skip: number
  limit: number
}

// URL source for the product catalog - using a dummy API for demonstration purposes
// Limit forced to 1000 to get all products in one request, as the dummy API limits to 30 by default
const CATALOG_URL = 'https://dummyjson.com/products?limit=1000'

export const fetchCatalog = async () => {
  const response = await $fetch<CatalogApiResponse<Record<string, unknown>>>(CATALOG_URL)

  if (!Array.isArray(response.products)) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Invalid catalog response from provider',
    })
  }

  return response
}
