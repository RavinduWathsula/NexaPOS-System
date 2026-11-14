import React, { useState, useEffect } from 'react'
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { categoriesAPI } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export function Categories() {
  const { user } = useAuthStore()
  const canManage = ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'].includes(user?.role)

  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchCategories = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await categoriesAPI.list()
      setCategories(res.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load categories.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setParentId('')
    setModalError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || '')
    setParentId(cat.parentId || '')
    setModalError('')
    setIsModalOpen(true)
  }

  const handleNameChange = (val) => {
    setName(val)
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    setIsSubmitting(true)

    try {
      const payload = {
        name,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        parentId: parentId || null,
      }

      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, payload)
        setSuccessMsg(`Category "${name}" updated successfully.`)
      } else {
        await categoriesAPI.create(payload)
        setSuccessMsg(`Category "${name}" created successfully.`)
      }

      setIsModalOpen(false)
      fetchCategories()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to save category.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return
    }

    try {
      await categoriesAPI.delete(cat.id)
      setSuccessMsg(`Category "${cat.name}" deleted.`)
      fetchCategories()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not delete category.')
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  const parentCandidates = categories.filter((c) => !editingCategory || c.id !== editingCategory.id)

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Product Categories
            </h1>
            <Badge variant="primary" size="sm">
              {categories.length} Categories
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Department hierarchy, product classification, and catalog organization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
              className="shadow-glow-blue"
            >
              Add Category
            </Button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div>
            <CardTitle>Catalog Hierarchy</CardTitle>
            <CardDescription>All product categories registered in NexaPOS</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search category name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No categories found"
              description="No product categories match your search criteria."
              actionLabel={canManage ? 'Add First Category' : undefined}
              onAction={handleOpenAdd}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Slug Identifier</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Products Count</TableHead>
                  <TableHead>Description</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <FolderTree className="w-3.5 h-3.5 text-brand-500" />
                        <span>{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 dark:bg-dark-surface px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {cat.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {cat.parent ? (
                        <Badge variant="purple" size="sm">
                          {cat.parent.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">— Primary Root —</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <Package className="w-3 h-3 text-slate-400" />
                        {cat._count?.products || 0} Products
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {cat.description || 'No description provided'}
                      </p>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(cat)}
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        description="Configure department or sub-category hierarchy in the product catalog."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
              {modalError}
            </div>
          )}

          <Input
            label="Category Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Smartphones & Handsets"
            required
          />

          <Input
            label="Slug Identifier"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. smartphones"
            helperText="URL-safe unique identifier for this category"
            required
          />

          <Select
            label="Parent Category (Optional)"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— Primary Root (No Parent) —</option>
            {parentCandidates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about what belongs in this category..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingCategory ? 'Update Category' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
