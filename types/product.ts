export interface Product {
  id: number
  title: string
  description: string
  price: number
  thumbnail: string
  brand: string | null
  tags: string[]
  availabilityStatus: string
}
