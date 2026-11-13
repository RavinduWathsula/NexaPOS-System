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

export async function listCategories() {
  return await prisma.category.findMany({
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
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

  if (!category) {
    const error = new Error('Category not found.')
    error.statusCode = 404
    throw error
  }

  return category
}

export async function createCategory(data) {
  const slug = data.slug || generateSlug(data.name)

  const existing = await prisma.category.findUnique({
    where: { slug },
  })

  if (existing) {
    const error = new Error(`Category with slug '${slug}' already exists.`)
    error.statusCode = 409
    throw error
  }

  return await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      parentId: data.parentId || null,
    },
    include: {
      parent: true,
    },
  })
}

export async function updateCategory(id, data) {
  const updateData = { ...data }
  if (data.name && !data.slug) {
    updateData.slug = generateSlug(data.name)
  }

  return await prisma.category.update({
    where: { id },
    data: updateData,
    include: {
      parent: true,
    },
  })
}

export async function deleteCategory(id) {
  // Check if products exist in category
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  })

  if (productCount > 0) {
    const error = new Error(
      `Cannot delete category: ${productCount} product(s) are assigned to it. Reassign or delete them first.`
    )
    error.statusCode = 400
    throw error
  }

  return await prisma.category.delete({
    where: { id },
  })
}

