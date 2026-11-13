import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Store,
  DollarSign,
  ShieldCheck,
  Receipt,
  Printer,
  Bell,
  Save,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'

export function Settings() {
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
            Settings Saved Successfully!
          </Badge>
        )}
      </div>

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
                defaultValue="NexaPOS Mobile & Electronics (Pvt) Ltd"
              />
              <Input
                label="Branch Location"
                defaultValue="No. 142 Galle Road, Colombo 03, Sri Lanka"
              />
              <Input
                label="Contact Hotline"
                defaultValue="+94 11 234 5678 / +94 77 123 4567"
              />
              <Input
                label="Store Email"
                defaultValue="info@nexapos.lk"
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
                defaultValue="LKR (Sri Lankan Rupee)"
                disabled
                helperText="Enforced by business requirements"
              />
              <Input
                label="Currency Symbol"
                defaultValue="Rs."
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
                  defaultChecked
                  disabled
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
                  defaultChecked
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
              <Printer className="w-4 h-4 text-purpleAccent-500" />
              Thermal POS Printer & Invoicing
            </CardTitle>
            <CardDescription>
              Paper width, thermal cutter, and custom footer notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Printer Paper Width"
                defaultValue="80mm"
                options={[
                  { label: '80mm (Standard POS Thermal)', value: '80mm' },
                  { label: '58mm (Compact Mobile POS)', value: '58mm' },
                  { label: 'A4 / A5 Invoice Sheet', value: 'a4' },
                ]}
              />
              <Input
                label="Receipt Footer Note"
                defaultValue="Thank you for shopping at NexaPOS! Keep invoice for warranty."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="sm">
              Restore Defaults
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

