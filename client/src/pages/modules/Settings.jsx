import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  ShieldCheck,
  Receipt,
  Printer,
  Bell,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { settingsAPI } from '@/services/api'

export function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [settings, setSettings] = useState({
    store_name: 'NexaPOS Mobile & Electronics (Pvt) Ltd',
    store_address: 'No. 142 Galle Road, Colombo 03, Sri Lanka',
    store_phone: '+94 11 234 5678 / +94 77 123 4567',
    store_email: 'info@nexapos.lk',
    currency_code: 'LKR',
    currency_symbol: 'Rs.',
    printer_paper_width: '80mm',
    printer_footer_note: 'Thank you for shopping at NexaPOS! Keep invoice for warranty.',
    pos_auto_warranty: 'true',
    pos_strict_imei: 'true',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const res = await settingsAPI.get()
        const map = res.data?.data?.map || {}
        if (Object.keys(map).length > 0) {
          setSettings((prev) => ({ ...prev, ...map }))
        }
      } catch (err) {
        console.warn('Could not load persistent settings, using defaults:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      await settingsAPI.update(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Settings & Configuration
            </h1>
            <Badge variant="purple" size="sm">Super Admin</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store profile, default currency, receipt header, barcode format, and IMEI security rules.
          </p>
        </div>

        {saved && (
          <Badge variant="success" size="lg" className="animate-in fade-in">
            Settings Saved to Database!
          </Badge>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-500" />
              Store Identification & Branding
            </CardTitle>
            <CardDescription>
              Details displayed on printed customer receipts and warranty cards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store Trade Name"
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                required
              />
              <Input
                label="Branch Location"
                value={settings.store_address}
                onChange={(e) => handleChange('store_address', e.target.value)}
                required
              />
              <Input
                label="Contact Hotline"
                value={settings.store_phone}
                onChange={(e) => handleChange('store_phone', e.target.value)}
                required
              />
              <Input
                label="Store Email"
                value={settings.store_email}
                onChange={(e) => handleChange('store_email', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Currency & Business Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Currency & Anti-Duplicate IMEI Rules
            </CardTitle>
            <CardDescription>
              Configure the primary accounting currency and serial enforcement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Currency"
                value={settings.currency_code}
                disabled
                helperText="Enforced to LKR (Sri Lankan Rupee)"
              />
              <Input
                label="Currency Symbol"
                value={settings.currency_symbol}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-200 dark:border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Strict Unique IMEI Enforcement
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Blocks selling any device if the IMEI is already marked as SOLD.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pos_strict_imei === 'true'}
                  onChange={(e) => handleChange('pos_strict_imei', String(e.target.checked))}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-surface/60 border border-slate-200 dark:border-dark-border space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Auto-Generate Warranty Certificate on Sale
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Creates digital warranty records instantly upon POS invoice settlement.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pos_auto_warranty === 'true'}
                  onChange={(e) => handleChange('pos_auto_warranty', String(e.target.checked))}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thermal Receipt Printer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Printer className="w-4 h-4 text-purple-500" />
              Thermal POS Printer & Invoicing
            </CardTitle>
            <CardDescription>
              Paper width, thermal cutter, and custom footer notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Printer Paper Width
                </label>
                <Select
                  value={settings.printer_paper_width}
                  onChange={(e) => handleChange('printer_paper_width', e.target.value)}
                >
                  <option value="80mm">80mm (Standard POS Thermal)</option>
                  <option value="58mm">58mm (Compact Mobile POS)</option>
                  <option value="a4">A4 / A5 Invoice Sheet</option>
                </Select>
              </div>

              <Input
                label="Receipt Footer Note"
                value={settings.printer_footer_note}
                onChange={(e) => handleChange('printer_footer_note', e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
