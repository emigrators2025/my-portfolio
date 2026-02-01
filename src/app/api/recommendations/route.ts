import { NextRequest, NextResponse } from 'next/server'
import { getProductRecommendations } from '@/lib/huggingface'

// Mock products data for demo
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-canceling wireless headphones with 30-hour battery life and superior sound quality.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    stock: 50,
    tags: ['wireless', 'audio', 'premium'],
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Track your health and fitness with this advanced smartwatch featuring heart rate monitoring and GPS.',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
    stock: 30,
    tags: ['fitness', 'smart', 'health'],
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    description: 'Comfortable ergonomic chair with lumbar support, perfect for long working hours.',
    price: 449.99,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    category: 'Furniture',
    stock: 15,
    tags: ['office', 'ergonomic', 'comfort'],
    featured: false,
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Portable Power Bank',
    description: '20000mAh high-capacity power bank with fast charging support for all devices.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
    category: 'Electronics',
    stock: 100,
    tags: ['portable', 'charging', 'travel'],
    featured: false,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches for the ultimate gaming experience.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400',
    category: 'Electronics',
    stock: 45,
    tags: ['gaming', 'mechanical', 'RGB'],
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '6',
    name: 'Minimalist Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness and color temperature.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    category: 'Home',
    stock: 60,
    tags: ['lighting', 'minimal', 'LED'],
    featured: false,
    createdAt: new Date(),
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userPreferences, cartItems, userId } = body

    // Build user preference string from cart items and explicit preferences
    let preferenceText = userPreferences || ''
    
    if (cartItems && cartItems.length > 0) {
      const cartCategories = cartItems.map((item: any) => item.category).join(', ')
      const cartNames = cartItems.map((item: any) => item.name).join(', ')
      preferenceText += ` User has shown interest in: ${cartCategories}. Products in cart: ${cartNames}`
    }

    // Get all products from database
    const products = mockProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
    }))

    // Filter out products already in cart
    const cartProductIds = cartItems?.map((item: any) => item.id) || []
    const availableProducts = products.filter(
      (product) => !cartProductIds.includes(product.id)
    )

    // Get AI-powered recommendations
    const recommendations = await getProductRecommendations(
      preferenceText,
      availableProducts
    )

    // Get full product details for recommended products
    const recommendedProducts = mockProducts.filter(product =>
      recommendations.some(rec => rec.productId === product.id)
    )

    // Add recommendation scores
    const result = recommendedProducts.map((product) => {
      const rec = recommendations.find((r) => r.productId === product.id)
      return {
        ...product,
        recommendationScore: rec?.score || 0,
        recommendationReason: rec?.reason || 'Based on your preferences',
      }
    })

    // Sort by score
    result.sort((a, b) => b.recommendationScore - a.recommendationScore)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting recommendations:', error)
    
    // Fallback to random products if AI fails
    const fallbackProducts = mockProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
    
    return NextResponse.json(fallbackProducts)
  }
}
