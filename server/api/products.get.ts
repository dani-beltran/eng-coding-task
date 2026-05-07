import { fetchCatalog } from '../services/catalog.service'
import { toGroundingProducts } from '../shared/grounding-product'

export default defineEventHandler(async () => {
  // Always return the whole catalog for simplicity, as the dummy API doesn't support filtering or pagination. 
  // In a real-world scenario, you would typically implement server-side filtering and pagination or infinite scrolling.
  const catalog = await fetchCatalog()

  return {
    products: toGroundingProducts(catalog.products),
    total: catalog.total,
  }
})
