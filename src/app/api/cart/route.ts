import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// In-memory cart storage for demo
const cartStorage: Map<string, Array<{ productId: string; quantity: number }>> = new Map()

// Mock product lookup
const mockProducts: Record<string, { id: string; name: string; price: number; image: string; stock: number }> = {
  '1': { id: '1', name: 'Wireless Bluetooth Headphones', price: 199.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', stock: 50 },
  '2': { id: '2', name: 'Smart Fitness Watch', price: 299.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', stock: 30 },
  '3': { id: '3', name: 'Ergonomic Office Chair', price: 449.99, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400', stock: 15 },
  '4': { id: '4', name: 'Portable Power Bank', price: 49.99, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', stock: 100 },
  '5': { id: '5', name: 'Mechanical Gaming Keyboard', price: 149.99, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', stock: 45 },
  '6': { id: '6', name: 'Minimalist Desk Lamp', price: 79.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', stock: 60 },
}

// GET user's cart
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userCart = cartStorage.get(session.userId) || []
    const cartItems = userCart.map(item => ({
      ...item,
      product: mockProducts[item.productId] || null,
    })).filter(item => item.product)

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = mockProducts[productId]
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    let userCart = cartStorage.get(session.userId) || []
    const existingItem = userCart.find(item => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      userCart.push({ productId, quantity })
    }

    cartStorage.set(session.userId, userCart)

    return NextResponse.json({ 
      productId, 
      quantity: existingItem ? existingItem.quantity : quantity,
      product 
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

// PUT update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let userCart = cartStorage.get(session.userId) || []

    if (quantity <= 0) {
      userCart = userCart.filter(item => item.productId !== productId)
    } else {
      const item = userCart.find(item => item.productId === productId)
      if (item) {
        item.quantity = quantity
      }
    }

    cartStorage.set(session.userId, userCart)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

// DELETE remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    let userCart = cartStorage.get(session.userId) || []
    userCart = userCart.filter(item => item.productId !== productId)
    cartStorage.set(session.userId, userCart)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
