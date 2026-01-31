import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

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

// GET all products or filter by category/search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    let products = [...mockProducts]

    if (category && category !== 'All') {
      products = products.filter(p => p.category === category)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      )
    }

    if (featured === 'true') {
      products = products.filter(p => p.featured)
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST create a new product (Admin only - demo)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, image, category, stock, tags } = body

    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Demo: return mock created product
    const product = {
      id: `demo_${Date.now()}`,
      name,
      description,
      price: parseFloat(price),
      image: image || null,
      category,
      stock: parseInt(stock) || 0,
      tags: tags || [],
      featured: false,
      createdAt: new Date(),
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
