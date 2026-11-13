import React, { useState, useEffect } from 'react'
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { brandsAPI } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export function Brands() {
  const { user } = useAuthStore()
  const canManage = ['SUPER_ADMIN', 'MANAGER', 'STOCK_KEEPER'].includes(user?.role)

  const [brands, setBrands] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [country, setCountry] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  const fetchBrands = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await brandsAPI.list()
      setBrands(res.data?.data || [])
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load brands.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const handleOpenAdd = () => {
    setEditingBrand(null)
    setName('')
    setSlug('')
    setCountry('')
    setLogoUrl('')
    setModalError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand)
    setName(brand.name)
    setSlug(brand.slug)
    setCountry(brand.country || '')
    setLogoUrl(brand.logoUrl || '')
    setModalError('')
    setIsModalOpen(true)
  }

  const handleNameChange = (val) => {
    setName(val)
    if (!editingBrand) {
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
        country: country.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
      }

      if (editingBrand) {
        await brandsAPI.update(editingBrand.id, payload)
        setSuccessMsg(`Brand "${name}" updated successfully.`)
      } else {
        await brandsAPI.create(payload)
        setSuccessMsg(`Brand "${name}" added successfully.`)
      }

      setIsModalOpen(false)
      fetchBrands()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setModalError(err.response?.data?.error?.message || 'Failed to save brand.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (brand) => {
    if (!window.confirm(`Are you sure you want to delete brand "${brand.name}"?`)) {
      return
    }

    try {
      await brandsAPI.delete(brand.id)
      setSuccessMsg(`Brand "${brand.name}" deleted.`)
      fetchBrands()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not delete brand.')
    }
  }

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.country && b.country.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Tag className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Brand Directory
            </h1>
            <Badge variant="primary" size="sm">
              {brands.length} Brands
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered device manufacturers, warranty terms, and authorized electronics brands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBrands}
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
              Add Brand
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
            <CardTitle>Electronics Brands</CardTitle>
            <CardDescription>Track manufacturers and product volume</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search brand name or country..."
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
          ) : filteredBrands.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No brands found"
              description="No electronics brands match your search criteria."
              actionLabel={canManage ? 'Add First Brand' : undefined}
              onAction={handleOpenAdd}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Slug Identifier</TableHead>
                  <TableHead>Manufacturer Country</TableHead>
                  <TableHead>Catalog Items</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-brand-500" />
                        <span>{b.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 dark:bg-dark-surface px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {b.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {b.country ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {b.country}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">— Unspecified —</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <Package className="w-3 h-3 text-slate-400" />
                        {b._count?.products || 0} Models
                      </span>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(b)}
                            title="Edit Brand"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500 hover:text-brand-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(b)}
                            title="Delete Brand"
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

      {/* Add / Edit Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Brand' : 'Register New Brand'}
        description="Maintain manufacturer identity and authorized distributor partnership."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
              {modalError}
            </div>
          )}

          <Input
            label="Brand Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Apple, Samsung, Anker"
            required
          />

          <Input
            label="Slug Identifier"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. apple"
            helperText="URL-safe unique identifier for this brand"
            required
          />

          <Input
            label="Country of Origin"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United States, South Korea, Japan"
          />

          <Input
            label="Logo Image URL (Optional)"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
          />

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
              {editingBrand ? 'Update Brand' : 'Save Brand'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
