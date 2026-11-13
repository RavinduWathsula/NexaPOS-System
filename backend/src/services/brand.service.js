import { prisma } from '../config/prisma.js'

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export async function listBrands() {
  return await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getBrandById(id) {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          sku: true,
          retailPrice: true,
          isSerialized: true,
        },
      },
    },
  })

  if (!brand) {
    const error = new Error('Brand not found.')
    error.statusCode = 404
    throw error
  }

  return brand
}

export async function createBrand(data) {
  const slug = data.slug || generateSlug(data.name)

  const existing = await prisma.brand.findFirst({
    where: {
      OR: [{ name: data.name }, { slug }],
    },
  })

  if (existing) {
    const error = new Error(`Brand '${data.name}' already exists.`)
    error.statusCode = 409
    throw error
  }

  return await prisma.brand.create({
    data: {
      name: data.name,
      slug,
      country: data.country,
      logoUrl: data.logoUrl,
    },
  })
}

export async function updateBrand(id, data) {
  const updateData = { ...data }
  if (data.name && !data.slug) {
    updateData.slug = generateSlug(data.name)
  }

  return await prisma.brand.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteBrand(id) {
  const productCount = await prisma.product.count({
    where: { brandId: id },
  })

  if (productCount > 0) {
    const error = new Error(
      `Cannot delete brand: ${productCount} product(s) are assigned to it.`
    )
    error.statusCode = 400
    throw error
  }

  return await prisma.brand.delete({
    where: { id },
  })
}

