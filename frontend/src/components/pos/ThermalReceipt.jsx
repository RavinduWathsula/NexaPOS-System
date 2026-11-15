import React, { useRef, useState, useEffect } from 'react'
import {
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Receipt,
  FileText,
  Building2,
  Smartphone,
  Calendar,
  User,
  CreditCard,
  QrCode,
  Store,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatLKR } from '@/utils/currency'
import { settingsAPI } from '@/services/api'

export function ThermalReceipt({ sale, onClose }) {
  const [format, setFormat] = useState('a4') // 'a4' (default full-color bill) or 'thermal' (80mm roll)
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'NexaPOS Mobile & Electronics (Pvt) Ltd',
    store_address: 'No. 142, Galle Road, Colombo 03, Sri Lanka',
    store_phone: '+94 11 234 5678',
    store_email: 'sales@nexapos.lk',
    receipt_footer_note: 'Thank you for choosing NexaPOS! Please preserve this invoice for all warranty claims.',
  })

  const a4PrintRef = useRef(null)
  const thermalPrintRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    settingsAPI
      .get()
      .then((res) => {
        if (!isMounted) return
        const map = res.data?.data?.map || {}
        if (Object.keys(map).length > 0) {
          setStoreSettings((prev) => ({
            ...prev,
            store_name: map.store_name || prev.store_name,
            store_address: map.store_address || prev.store_address,
            store_phone: map.store_phone || prev.store_phone,
            store_email: map.store_email || prev.store_email,
            receipt_footer_note: map.receipt_footer_note || prev.receipt_footer_note,
          }))
        }
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

  if (!sale) return null

  const subtotal = Number(sale.subtotal) || 0
  const discount = Number(sale.discount) || 0
  const tax = Number(sale.tax) || 0
  const total = Number(sale.totalAmount) || 0
  const paid = Number(sale.paidAmount) || 0
  const change = Number(sale.changeAmount) || 0
  const remaining = Math.max(0, total - paid)

  // Print A4 Professional Invoice
  const handlePrintA4 = () => {
    const printContent = a4PrintRef.current
    if (!printContent) return

    const windowPrint = window.open('', '', 'left=0,top=0,width=1024,height=900,toolbar=0,scrollbars=0,status=0')
    if (!windowPrint) {
      alert('Please allow popups to print invoices.')
      return
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((style) => style.outerHTML)
      .join('\n')

    windowPrint.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Tax Invoice - #${sale.invoiceNumber}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .a4-print-container {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
            .page-break-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900">
          <div class="a4-print-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `)
    windowPrint.document.close()
  }

  // Print 80mm Thermal Receipt
  const handlePrintThermal = () => {
    const printContent = thermalPrintRef.current
    if (!printContent) return

    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
    if (!windowPrint) {
      alert('Please allow popups to print receipts.')
      return
    }

    windowPrint.document.write(`
      <html>
        <head>
          <title>Receipt - #${sale.invoiceNumber}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 76mm;
              margin: 0 auto;
              padding: 4mm 2mm;
              font-size: 11px;
              color: #000;
              line-height: 1.25;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; }
            .border-t { border-top: 1px dashed #000; }
            .my-2 { margin-top: 6px; margin-bottom: 6px; }
            .py-1 { padding-top: 2px; padding-bottom: 2px; }
            .flex { display: flex; justify-content: space-between; }
            .imei-tag { font-size: 9px; font-weight: bold; margin-left: 4px; }
            .warranty-box { border: 1px solid #000; padding: 4px; margin: 4px 0; font-size: 9px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `)
    windowPrint.document.close()
  }

  return (
    <div className="space-y-4">
      {/* Top Format Selector & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-dark-border">
        {/* Toggle between A4 Color Bill and Thermal Slip */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border">
          <button
            type="button"
            onClick={() => setFormat('a4')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              format === 'a4'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A4 Professional Bill (Color)</span>
            <span
              className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                format === 'a4' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              Recommended
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFormat('thermal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              format === 'thermal'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Thermal Slip (80mm)</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          {format === 'a4' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintA4}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print A4 Invoice / PDF
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintThermal}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print 80mm Slip
            </Button>
          )}

          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. PROFESSIONAL A4 INVOICE VIEW (FULL-COLOR CORPORATE BILL)     */}
      {/* ============================================================== */}
      {format === 'a4' && (
        <div className="bg-slate-100 dark:bg-slate-900/80 p-2 sm:p-4 rounded-2xl overflow-x-auto">
          <div
            ref={a4PrintRef}
            className="a4-bill-sheet bg-white text-slate-800 mx-auto rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-8 relative select-none"
            style={{
              maxWidth: '820px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* Top Multi-Color Gradient Brand Accent */}
            <div
              className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 rounded-t-xl -mt-6 sm:-mt-8 -mx-6 sm:-mx-8 mb-6"
              style={{ width: 'calc(100% + 3rem)' }}
            />

            {/* Header: Company Identity & Invoice Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
              {/* Left: Company Details */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      NEXAPOS
                    </h1>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 tracking-wider">
                      RETAIL ENTERPRISE
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                    Mobile Phones & Consumer Electronics
                  </p>
                  <div className="text-[11px] text-slate-500 mt-1.5 space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{storeSettings.store_address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Hotline: <strong>{storeSettings.store_phone}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        WhatsApp: <strong>+94 77 123 4567</strong>
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Business Reg: PV-00289192 | VAT Reg: 1049281-7000 | Web: www.nexapos.lk
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Invoice Meta & Status Badge */}
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs font-black uppercase tracking-wider mb-1.5 shadow-2xs">
                  TAX INVOICE / CASH BILL
                </div>
                <h2 className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  #{sale.invoiceNumber}
                </h2>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Date:{' '}
                  {new Date(sale.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-slate-500">
                  Time:{' '}
                  {new Date(sale.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="mt-2.5 flex sm:justify-end">
                  {remaining === 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      PAID IN FULL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      BALANCE DUE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer & Transaction Meta (2 Colored Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              {/* Card 1: Billed To / Customer */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/30 border border-blue-100 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Billed To (Customer)</span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {sale.customer?.name || 'Walk-in Customer'}
                </div>
                {sale.customer?.phone && (
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{sale.customer.phone}</span>
                  </div>
                )}
                {sale.customer?.email && (
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{sale.customer.email}</span>
                  </div>
                )}
                {sale.customer?.address && (
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{sale.customer.address}</span>
                  </div>
                )}
                {sale.customer?.nic && (
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    NIC / ID: {sale.customer.nic}
                  </div>
                )}
              </div>

              {/* Card 2: Transaction Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Transaction Metadata</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Cashier / Issued By
                    </span>
                    <span className="font-semibold text-slate-800">
                      {sale.cashier?.name || 'Authorized Staff'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Store Location
                    </span>
                    <span className="font-semibold text-slate-800">
                      Colombo Flagship Store
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Payment Mode
                    </span>
                    <span className="font-bold text-blue-700 font-mono">
                      {sale.payments?.map((p) => p.method).join(', ') || 'CASH'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Warranty Registration
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {sale.warranties?.length > 0 ? 'Verified & Active' : 'Store Standard'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center font-bold">#</th>
                    <th className="py-2.5 px-4 font-bold">Item Description & Hardware Specs</th>
                    <th className="py-2.5 px-3 font-bold text-center w-28">Warranty</th>
                    <th className="py-2.5 px-3 text-right font-bold w-28">Unit Price</th>
                    <th className="py-2.5 px-2 text-center font-bold w-14">Qty</th>
                    <th className="py-2.5 px-3 text-right font-bold w-24">Discount</th>
                    <th className="py-2.5 px-4 text-right font-bold w-32">Total (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {sale.items?.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.product?.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {item.product?.brand?.name && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {item.product.brand.name}
                            </span>
                          )}
                          {item.product?.category?.name && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.product.category.name}
                            </span>
                          )}
                          {item.product?.sku && (
                            <span className="text-[10px] font-mono text-slate-400">
                              SKU: {item.product.sku}
                            </span>
                          )}
                        </div>

                        {/* Serialized IMEI devices */}
                        {item.devices?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.devices.map((d, dIdx) => (
                              <div
                                key={dIdx}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-mono font-semibold mr-2 mb-1"
                              >
                                <span className="text-purple-600 font-bold">IMEI:</span>
                                <span>{d.device?.imei1 || d.imei1}</span>
                                {d.device?.storage && (
                                  <span className="text-purple-700">
                                    ({d.device.storage} {d.device.color || ''})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          12 Months
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">
                        {formatLKR(item.unitPrice, false)}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-rose-600">
                        {Number(item.discount || 0) > 0
                          ? `-${formatLKR(item.discount, false)}`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatLKR(item.subtotal, false)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom 2-Column: Left (Payments + Warranty) & Right (Financial Totals) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mb-6">
              {/* Left Column: Payment Details & Official Warranty Certificate */}
              <div className="space-y-4">
                {/* Payment Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs">
                  <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider block border-b border-slate-200 pb-1.5 mb-2 flex items-center justify-between">
                    <span>Payment Settlement</span>
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                  <div className="space-y-1">
                    {sale.payments?.map((p, pIdx) => (
                      <div key={pIdx} className="flex justify-between text-slate-700">
                        <span>
                          {p.method}{' '}
                          {p.cardLastFour ? `(ending *${p.cardLastFour})` : ''}{' '}
                          {p.transactionRef ? `[${p.transactionRef}]` : ''}
                        </span>
                        <span className="font-mono font-semibold">
                          {formatLKR(p.amount, false)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>Total Tendered:</span>
                      <span className="font-mono">{formatLKR(paid, false)}</span>
                    </div>
                    {change > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                        <span>Change Returned:</span>
                        <span className="font-mono">{formatLKR(change, false)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Warranty Registration Certificate Box */}
                {sale.warranties && sale.warranties.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs shadow-2xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Official Warranty Certificate Registration</span>
                    </div>
                    <div className="space-y-1.5">
                      {sale.warranties.map((w, wIdx) => (
                        <div
                          key={wIdx}
                          className="bg-white/90 rounded-lg p-2.5 border border-emerald-200 shadow-2xs"
                        >
                          <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                            <span className="font-mono text-emerald-700">
                              CERT: {w.warrantyCode}
                            </span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                              ACTIVE
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-600 mt-1 flex justify-between">
                            <span>Coverage: 12 Months Hardware</span>
                            <span>
                              Valid Until:{' '}
                              <strong>
                                {new Date(w.endDate).toLocaleDateString('en-GB')}
                              </strong>
                            </span>
                          </div>
                          {w.terms && (
                            <div className="text-[9.5px] text-slate-500 mt-0.5 truncate">
                              {w.terms}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Financial Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200 shadow-2xs text-xs space-y-2.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal (Gross):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatLKR(subtotal, false)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Invoice Discount:</span>
                    <span className="font-mono font-semibold">
                      -{formatLKR(discount, false)}
                    </span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatLKR(tax, false)}
                    </span>
                  </div>
                )}

                {/* Big Net Amount Banner */}
                <div className="pt-2.5 border-t-2 border-blue-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase text-blue-900 tracking-wider">
                      Net Total (LKR)
                    </span>
                    <span className="text-2xl font-black text-blue-600 font-mono tracking-tight">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-blue-100 flex justify-between text-[11px] text-slate-600">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {formatLKR(paid, false)}
                  </span>
                </div>
                {remaining > 0 ? (
                  <div className="flex justify-between text-[11px] font-bold text-rose-700">
                    <span>Balance Remaining:</span>
                    <span className="font-mono">{formatLKR(remaining, false)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                    <span>Balance Remaining:</span>
                    <span>Rs. 0.00 (Fully Settled)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Official Signature Lines */}
            <div className="grid grid-cols-2 gap-8 my-6 pt-4 border-t border-slate-200 text-xs">
              <div className="text-center">
                <div className="h-10 flex items-end justify-center">
                  <div className="w-48 border-b border-dashed border-slate-400"></div>
                </div>
                <p className="mt-1 font-bold text-slate-800 text-[11px]">
                  Authorized Store Signature & Stamp
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  For NexaPOS Electronics (Pvt) Ltd
                </p>
              </div>
              <div className="text-center">
                <div className="h-10 flex items-end justify-center">
                  <div className="w-48 border-b border-dashed border-slate-400"></div>
                </div>
                <p className="mt-1 font-bold text-slate-800 text-[11px]">
                  Customer Acceptance Signature
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Received in sound order with warranty terms
                </p>
              </div>
            </div>

            {/* Official Terms & Conditions Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] text-slate-500">
              <div className="space-y-0.5 leading-relaxed max-w-lg">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">
                  Store Policy & Warranty Terms:
                </p>
                <p>
                  1. Please preserve this original Tax Invoice for all hardware warranty claims and authorized service.
                </p>
                <p>
                  2. Hardware warranty strictly covers manufacturer defects. Physical, water/liquid, and electrical surge damage void all warranty.
                </p>
                <p>
                  3. Accessories eligible for exchange within 3 days in unsealed box. Activated devices cannot be returned.
                </p>
              </div>

              {/* Barcode representation */}
              <div className="text-left sm:text-right shrink-0">
                <div className="font-mono text-xs tracking-widest bg-slate-100 px-3 py-1 rounded border border-slate-200 font-bold text-slate-700">
                  |||| | ||||| || |||||| | ||||
                </div>
                <span className="font-mono text-[9px] text-slate-400 mt-1 block">
                  *{sale.invoiceNumber}*
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. COMPACT 80MM THERMAL RECEIPT VIEW (SLIP PRINTER)            */}
      {/* ============================================================== */}
      {format === 'thermal' && (
        <div className="max-w-[340px] mx-auto bg-white p-5 rounded-xl shadow-lg border border-slate-200 text-black font-mono text-[11px] leading-tight select-none">
          <div ref={thermalPrintRef}>
            {/* Shop Header */}
            <div className="text-center pb-2 border-b border-dashed border-black">
              <h2 className="text-base font-extrabold tracking-wider uppercase">
                {storeSettings.store_name}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-tight">
                Mobile Phones & Electronics
              </p>
              <p className="text-[9px] mt-1 text-slate-700">{storeSettings.store_address}</p>
              <p className="text-[9px] text-slate-700">
                Tel: {storeSettings.store_phone} | WhatsApp: +94 77 123 4567
              </p>
              <p className="text-[9px] text-slate-700">Reg: PV-00289192 | VAT: 1049281-7000</p>
            </div>

            {/* Invoice & Cashier Meta */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>INVOICE: #{sale.invoiceNumber}</span>
                <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  TIME:{' '}
                  {new Date(sale.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>CASHIER: {sale.cashier?.name || 'Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER: {sale.customer?.name || 'Walk-in Customer'}</span>
                <span>{sale.customer?.phone || ''}</span>
              </div>
            </div>

            {/* Items Header */}
            <div className="py-1.5 border-b border-black text-[9px] font-bold flex justify-between uppercase">
              <span className="w-1/2">Item Description</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/3 text-right">Amount (LKR)</span>
            </div>

            {/* Items List */}
            <div className="py-1.5 space-y-2 border-b border-dashed border-black">
              {sale.items?.map((item, idx) => (
                <div key={item.id || idx}>
                  <div className="flex justify-between font-bold text-[10.5px]">
                    <span className="w-7/12 truncate">{item.product?.name}</span>
                    <span className="w-2/12 text-center">{item.quantity}</span>
                    <span className="w-3/12 text-right">{formatLKR(item.subtotal, false)}</span>
                  </div>

                  {/* Serialized IMEIs if present */}
                  {item.devices?.map((d, dIdx) => (
                    <div key={dIdx} className="text-[9px] text-slate-800 pl-1 font-bold">
                      <span>• IMEI: {d.device?.imei1 || d.imei1}</span>
                      {d.device?.storage && (
                        <span>
                          {' '}
                          ({d.device.storage} {d.device.color || ''})
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Unit price & line discount */}
                  <div className="flex justify-between text-[9px] text-slate-600 pl-1">
                    <span>@ {formatLKR(item.unitPrice, false)} each</span>
                    {Number(item.discount || 0) > 0 && (
                      <span className="text-rose-700">Disc: -{formatLKR(item.discount, false)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatLKR(subtotal, false)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Invoice Discount:</span>
                  <span>-{formatLKR(discount, false)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax / VAT:</span>
                  <span>{formatLKR(tax, false)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-black">
                <span>TOTAL (LKR):</span>
                <span>{formatLKR(total, false)}</span>
              </div>
            </div>

            {/* Payments Breakdown */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <span className="font-bold uppercase text-[9px] block">Payment Methods:</span>
              {sale.payments?.map((p, pIdx) => (
                <div key={p.id || pIdx} className="flex justify-between">
                  <span>
                    {p.method} {p.cardLastFour ? `(*${p.cardLastFour})` : ''}{' '}
                    {p.transactionRef ? `[${p.transactionRef}]` : ''}
                  </span>
                  <span>{formatLKR(p.amount, false)}</span>
                </div>
              ))}

              <div className="flex justify-between pt-1 font-bold">
                <span>Tendered / Paid:</span>
                <span>{formatLKR(paid, false)}</span>
              </div>

              {change > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Change Returned:</span>
                  <span>{formatLKR(change, false)}</span>
                </div>
              )}

              {remaining > 0 && (
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Balance Due:</span>
                  <span>{formatLKR(remaining, false)}</span>
                </div>
              )}
            </div>

            {/* Warranty Certificates */}
            {sale.warranties && sale.warranties.length > 0 && (
              <div className="py-2 border-b border-dashed border-black">
                <span className="text-[9px] font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Warranty Registration Certificate
                </span>
                {sale.warranties.map((w, wIdx) => (
                  <div
                    key={w.id || wIdx}
                    className="border border-black p-1 my-1 text-[8.5px] leading-tight"
                  >
                    <div className="flex justify-between font-bold">
                      <span>CODE: {w.warrantyCode}</span>
                      <span>ACTIVE</span>
                    </div>
                    <div>Valid Until: {new Date(w.endDate).toLocaleDateString()}</div>
                    <div className="text-[8px] text-slate-700 truncate">{w.terms}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Note */}
            <div className="pt-3 text-center text-[9px] space-y-1">
              <p className="font-bold">*** THANK YOU FOR YOUR BUSINESS ***</p>
              <p className="text-[8px] text-slate-700 leading-tight">
                {storeSettings.receipt_footer_note}
              </p>
              <p className="text-[7.5px] pt-1 text-slate-500 font-mono">
                Powered by NexaPOS Enterprise
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { ThermalReceipt as InvoiceView }
