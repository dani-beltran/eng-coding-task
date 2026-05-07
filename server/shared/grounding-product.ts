export type GroundingProduct = {
  id: number
  title: string
  description: string
  price: number
  brand: string | null
  sku: string | null
  availabilityStatus: string | null
  stock: number | null
  tags: string[]
  category: string | null
  rating: number | null
  discountPercentage: number | null
  shippingInformation: string | null
  warrantyInformation: string | null
  returnPolicy: string | null
  reviews: Array<{
    rating: number | null
    comment: string
  }>
  images: string[]
  thumbnail: string
}

/**
 * Converts an array of raw product objects into an array of GroundingProduct objects.
 * This function ensures that each product has the expected fields with the correct types, so
 * that the resulting array can be safely used as grounding context for the Gemini model without 
 * risking malformed data causing issues in the prompt and **avoiding leaking sensitive information** like emails. 
 */
export const toGroundingProducts = (products: Array<Record<string, unknown>>): GroundingProduct[] => {
  return products.map(product => ({
    id: typeof product.id === 'number' ? product.id : Number(product.id),
    title: typeof product.title === 'string' ? product.title : '',
    description: typeof product.description === 'string' ? product.description : '',
    price: typeof product.price === 'number' ? product.price : Number(product.price),
    brand: typeof product.brand === 'string' ? product.brand : null,
    sku: typeof product.sku === 'string' ? product.sku : null,
    availabilityStatus: typeof product.availabilityStatus === 'string' ? product.availabilityStatus : null,
    stock: typeof product.stock === 'number' ? product.stock : null,
    tags: Array.isArray(product.tags) ? product.tags.filter(tag => typeof tag === 'string') : [],
    category: typeof product.category === 'string' ? product.category : null,
    rating: typeof product.rating === 'number' ? product.rating : null,
    discountPercentage: typeof product.discountPercentage === 'number' ? product.discountPercentage : null,
    shippingInformation: typeof product.shippingInformation === 'string' ? product.shippingInformation : null,
    warrantyInformation: typeof product.warrantyInformation === 'string' ? product.warrantyInformation : null,
    returnPolicy: typeof product.returnPolicy === 'string' ? product.returnPolicy : null,
    // Stripping out user emails and names from reviews to avoid leaking personally identifiable information.
    reviews: Array.isArray(product.reviews) ? product.reviews.map(review => ({
      rating: typeof review.rating === 'number' ? review.rating : null,
      comment: typeof review.comment === 'string' ? review.comment : '',
    })) : [],
    images: Array.isArray(product.images) ? product.images.filter(image => typeof image === 'string') : [],
    thumbnail: typeof product.thumbnail === 'string' ? product.thumbnail : '',
  }))
}