import React, { useRef } from 'react'
import { Printer, Download, CheckCircle2, ShieldCheck, Phone, MapPin, Receipt, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatLKR } from '@/utils/currency'

export function ThermalReceipt({ sale, onClose }) {
  const receiptRef = useRef()

  if (!sale) return null

  const handlePrint = () => {
    const printContent = receiptRef.current
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')
    if (!windowPrint) {
      alert('Please allow popups to print receipts.')
      return
    }

    windowPrint.document.write(`
      <html>
        <head>
          <title>Receipt - #${sale.invoiceNumber}</title>
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

  const subtotal = Number(sale.subtotal) || 0
  const discount = Number(sale.discount) || 0
  const tax = Number(sale.tax) || 0
  const total = Number(sale.totalAmount) || 0
  const paid = Number(sale.paidAmount) || 0
  const change = Number(sale.changeAmount) || 0
  const remaining = Math.max(0, total - paid)

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-brand-600" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Official POS Sales Receipt
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Print (80mm)
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* 80mm Thermal Receipt Canvas */}
      <div className="max-w-[340px] mx-auto bg-white p-5 rounded-xl shadow-lg border border-slate-200 text-black font-mono text-[11px] leading-tight select-none">
        <div ref={receiptRef}>
          {/* Shop Header */}
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h2 className="text-base font-extrabold tracking-wider uppercase">NexaPOS</h2>
            <p className="text-[10px] font-bold uppercase tracking-tight">Mobile Phones & Electronics</p>
            <p className="text-[9px] mt-1 text-slate-700">No. 124, Galle Road, Colombo 03, Sri Lanka</p>
            <p className="text-[9px] text-slate-700">Tel: +94 11 234 5678 | WhatsApp: +94 77 123 4567</p>
            <p className="text-[9px] text-slate-700">Reg: PV-00289192 | VAT: 1049281-7000</p>
          </div>

          {/* Invoice & Cashier Meta */}
          <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
            <div className="flex justify-between font-bold">
              <span>INVOICE: #{sale.invoiceNumber}</span>
              <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>TIME: {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

                {/* Show Serialized IMEIs if present */}
                {item.devices?.map((d, dIdx) => (
                  <div key={dIdx} className="text-[9px] text-slate-800 pl-1 font-bold">
                    <span>• IMEI: {d.device?.imei1 || d.imei1}</span>
                    {d.device?.storage && <span> ({d.device.storage} {d.device.color || ''})</span>}
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
                <span>{p.method} {p.cardLastFour ? `(*${p.cardLastFour})` : ''} {p.transactionRef ? `[${p.transactionRef}]` : ''}</span>
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
                <div key={w.id || wIdx} className="border border-black p-1 my-1 text-[8.5px] leading-tight">
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
              Please preserve this invoice for warranty claims.<br />
              Goods once sold cannot be returned without original receipt and unsealed box within 3 days.<br />
              Physical & liquid damage not covered by hardware warranty.
            </p>
            <p className="text-[7.5px] pt-1 text-slate-500 font-mono">Powered by NexaPOS Enterprise</p>
          </div>
        </div>
      </div>
    </div>
  )
}

