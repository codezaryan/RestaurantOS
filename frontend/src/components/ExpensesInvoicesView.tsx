import React, { useState } from 'react';
import { Expense, Invoice } from '../types';
import { FileText, Download, Upload, CheckCircle, FileSpreadsheet, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { api } from '../api';

interface ExpensesInvoicesViewProps {
  expenses: Expense[];
  invoices: Invoice[];
  onUploadInvoice: (formData: FormData) => void;
}

export const ExpensesInvoicesView: React.FC<ExpensesInvoicesViewProps> = ({
  expenses,
  invoices,
  onUploadInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses'>('invoices');
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('invoices', e.target.files[i]);
    }

    try {
      await onUploadInvoice(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleExportExcel = () => {
    window.open(api.exportExpenseRegisterExcelUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Invoice Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/30">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white">AI Invoice Processing & Expense Register</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400 animate-spin" /> OCR AI Vision
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Upload printed & handwritten supplier invoices (PDFs/Images). Automated OCR line-item extraction & Excel Expense Register export.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Expense Register (Excel .xlsx)</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Layers className="w-4 h-4" /> Processed AI Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'expenses' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <FileText className="w-4 h-4" /> Expense Ledger ({expenses.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AI INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Upload Drop Zone */}
          <div className="glass-card p-8 rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-blue-500/80 transition-all text-center relative group bg-slate-900/30">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-all">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Upload Supplier Invoices (Printed & Handwritten)</h3>
              <p className="text-xs text-slate-400 max-w-md">Drag & drop JPG, PNG, WebP, or PDF invoice files here. AI OCR will automatically extract supplier name, date, total, and line items.</p>
              {uploading && (
                <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold pt-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Processing Invoice AI Extraction & OCR Engine...</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoices List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Processed Invoices Register</h3>
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedInvoice?.id === inv.id
                        ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{inv.invoiceNumber}</h4>
                          <p className="text-xs text-slate-400">{inv.supplier?.name || 'Nile Hospitality Logistics'}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-400">${inv.totalAmount.toFixed(2)}</span>
                        <div className="flex items-center justify-end space-x-1 text-[10px] text-slate-400 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-blue-400" />
                          <span>{(inv.extractionConfidence * 100).toFixed(0)}% AI Confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Invoice Details Drawer */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">AI Extraction Inspector</h3>
              {selectedInvoice ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice Number:</span>
                    <span className="font-bold text-white">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supplier:</span>
                    <span className="font-bold text-white">{selectedInvoice.supplier?.name || 'Extracted Vendor'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-slate-300">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax / VAT:</span>
                    <span className="text-slate-300">${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-sm">
                    <span className="text-white">Total Amount:</span>
                    <span className="text-emerald-400">${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="pt-3">
                    <p className="font-bold text-slate-300 mb-2">Extracted Line Items:</p>
                    <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                            <span>{item.quantity}x {item.description}</span>
                            <span className="font-bold text-emerald-400">${item.totalAmount.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">No line items extracted</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">Select an invoice to inspect raw AI OCR extracted fields and line items.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSE LEDGER */}
      {activeTab === 'expenses' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Date</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-4 font-bold text-white">{exp.title}</td>
                  <td className="p-4 text-slate-400">{exp.category?.name || 'Raw Food Supplies'}</td>
                  <td className="p-4 text-slate-400">{exp.supplier?.name || 'N/A'}</td>
                  <td className="p-4 text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {exp.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-400">${exp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
