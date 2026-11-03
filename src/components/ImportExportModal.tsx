import React, { useState } from 'react';
import { Product } from '../types';
import { parseCSV, parseJSON, exportToCSV, exportToJSON, ParseResult } from '../utils/validation';
import { X, Upload, Download, RotateCcw, AlertTriangle, CheckCircle2, FileText, Code } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onImportProducts: (newProducts: Product[], mode: 'merge' | 'replace') => void;
  onResetToSample: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  products,
  onImportProducts,
  onResetToSample,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'reset'>('import');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('json');
  const [inputText, setInputText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      // Auto detect format from filename
      if (file.name.endsWith('.csv')) {
        setImportFormat('csv');
      } else if (file.name.endsWith('.json')) {
        setImportFormat('json');
      }
    };
    reader.readAsText(file);
  };

  const handleValidateAndPreview = () => {
    setSuccessMessage(null);
    if (!inputText.trim()) {
      setParseResult({ validProducts: [], errors: [{ row: 0, reason: 'Input cannot be empty.' }] });
      return;
    }

    const res = importFormat === 'csv' ? parseCSV(inputText) : parseJSON(inputText);
    setParseResult(res);
  };

  const handleCommitImport = () => {
    if (!parseResult || parseResult.validProducts.length === 0) return;
    onImportProducts(parseResult.validProducts, importMode);
    setSuccessMessage(`Successfully imported ${parseResult.validProducts.length} listing(s) (${importMode === 'replace' ? 'replaced entire catalog' : 'merged with current catalog'})!`);
    setParseResult(null);
    setInputText('');
  };

  const handleDownloadExport = (format: 'json' | 'csv') => {
    const content = format === 'json' ? exportToJSON(products) : exportToCSV(products);
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_student_marketplace_export_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#DEDCD4] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#DEDCD4] flex items-center justify-between bg-[#F7F5F0]">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#252722]">Dataset Import, Export & Reset</h3>
            <p className="text-xs text-[#898980]">
              Import 20–30 organizer records via CSV/JSON with automatic column normalization
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE3D8] text-[#898980] hover:text-[#252722] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#DEDCD4] px-6 text-xs font-semibold bg-[#F7F5F0]/50">
          <button
            onClick={() => { setActiveTab('import'); setSuccessMessage(null); }}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'import' ? 'border-[#426B55] text-[#426B55]' : 'border-transparent text-[#898980] hover:text-[#252722]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Dataset</span>
          </button>
          <button
            onClick={() => { setActiveTab('export'); setSuccessMessage(null); }}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'export' ? 'border-[#426B55] text-[#426B55]' : 'border-transparent text-[#898980] hover:text-[#252722]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog</span>
          </button>
          <button
            onClick={() => { setActiveTab('reset'); setSuccessMessage(null); }}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'reset' ? 'border-[#426B55] text-[#426B55]' : 'border-transparent text-[#898980] hover:text-[#252722]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#42433E]">Input Format:</span>
                  <button
                    type="button"
                    onClick={() => setImportFormat('json')}
                    className={`px-3 py-1 rounded-md text-xs font-medium border ${
                      importFormat === 'json'
                        ? 'bg-[#426B55] text-white border-[#426B55]'
                        : 'bg-white text-[#42433E] border-[#DEDCD4]'
                    }`}
                  >
                    JSON Array
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportFormat('csv')}
                    className={`px-3 py-1 rounded-md text-xs font-medium border ${
                      importFormat === 'csv'
                        ? 'bg-[#426B55] text-white border-[#426B55]'
                        : 'bg-white text-[#42433E] border-[#DEDCD4]'
                    }`}
                  >
                    CSV Text
                  </button>
                </div>

                <label className="cursor-pointer text-xs font-medium text-[#426B55] hover:underline flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload .json or .csv</span>
                  <input
                    type="file"
                    accept=".json,.csv,text/csv,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste or Upload Area */}
              <div>
                <label className="block font-semibold text-[#42433E] mb-1">
                  Paste {importFormat.toUpperCase()} Data:
                </label>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    importFormat === 'json'
                      ? '[\n  {\n    "title": "Laptop A",\n    "category": "Electronics",\n    "price": 22000,\n    "age": 2,\n    "condition": "Good"\n  }\n]'
                      : 'item,currentPrice,category,age,condition,originalPrice\n"Laptop A",22000,"Electronics",2,"Good",45000'
                  }
                  className="w-full font-mono text-xs p-3 bg-[#F7F5F0] border border-[#DEDCD4] rounded-lg focus:outline-hidden focus:border-[#426B55]"
                />
              </div>

              {/* Import Mode: Merge vs Replace */}
              <div className="flex items-center gap-4 p-3 bg-[#F7F5F0] rounded-lg border border-[#DEDCD4]">
                <span className="font-semibold text-[#42433E]">Import Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="accent-[#426B55]"
                  />
                  <span>Append / Merge with existing items</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="accent-[#426B55]"
                  />
                  <span>Replace entire catalog</span>
                </label>
              </div>

              {/* Validate / Parse Button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleValidateAndPreview}
                  className="px-4 py-2 bg-[#EAE3D8] hover:bg-[#DEDCD4] text-[#252722] font-semibold rounded-lg transition-colors"
                >
                  Parse & Validate Schema
                </button>
              </div>

              {/* Parse Results Preview & Validation Errors */}
              {parseResult && (
                <div className="space-y-3 pt-3 border-t border-[#DEDCD4]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#252722]">Validation Result:</span>
                    <span className="font-mono tabular-nums text-[#426B55] font-bold">
                      {parseResult.validProducts.length} valid product(s) identified
                    </span>
                  </div>

                  {parseResult.errors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                      <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-700" />
                        <span>{parseResult.errors.length} Record Validation Issue(s) Detected (Not Silently Discarded):</span>
                      </div>
                      <ul className="list-disc pl-5 text-[11px] text-rose-800 space-y-0.5 max-h-32 overflow-y-auto">
                        {parseResult.errors.map((err, i) => (
                          <li key={i}>{err.reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parseResult.validProducts.length > 0 && (
                    <div className="space-y-2">
                      <div className="max-h-40 overflow-y-auto border border-[#DEDCD4] rounded-lg divide-y divide-[#DEDCD4]">
                        {parseResult.validProducts.slice(0, 5).map((p, idx) => (
                          <div key={idx} className="p-2.5 flex justify-between items-center text-[11px] bg-[#F7F5F0]/40">
                            <div>
                              <span className="font-bold text-[#252722]">{p.title}</span>
                              <span className="text-[#898980] ml-2">({p.category})</span>
                            </div>
                            <div className="tabular-nums font-semibold text-[#252722]">
                              ₹{p.price.toLocaleString('en-IN')} · {p.condition || 'N/A'} · {p.age !== undefined ? `${p.age}y` : 'N/A'}
                            </div>
                          </div>
                        ))}
                        {parseResult.validProducts.length > 5 && (
                          <div className="p-2 text-center text-[10px] text-[#898980] italic">
                            + {parseResult.validProducts.length - 5} more valid product(s)
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleCommitImport}
                        className="w-full py-2.5 bg-[#426B55] hover:bg-[#294C3A] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Commit {parseResult.validProducts.length} Items to Marketplace</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#252722]">Export Current Catalog</h4>
                <p className="text-[#898980] text-xs mt-1">
                  Download the current live database containing {products.length} products (including user additions and edits) in standard formats.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadExport('json')}
                  className="p-4 bg-[#F7F5F0] hover:bg-[#EAE3D8] border border-[#DEDCD4] rounded-xl text-left transition-colors flex items-start gap-3"
                >
                  <Code className="w-5 h-5 text-[#426B55] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm text-[#252722] block">Export as JSON</span>
                    <span className="text-[11px] text-[#42433E]">
                      Full structured JSON array format. Ideal for backup and organizer testing.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadExport('csv')}
                  className="p-4 bg-[#F7F5F0] hover:bg-[#EAE3D8] border border-[#DEDCD4] rounded-xl text-left transition-colors flex items-start gap-3"
                >
                  <FileText className="w-5 h-5 text-[#426B55] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm text-[#252722] block">Export as CSV</span>
                    <span className="text-[11px] text-[#42433E]">
                      Tabular comma-separated values. Compatible with Excel and Google Sheets.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RESET */}
          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Reset to Official Benchmark Sample Data</span>
                </div>
                <p className="text-xs leading-relaxed">
                  This will restore the marketplace dataset back to the baseline sample dataset (including mandatory Laptops A through E from Problem Statement §5, textbooks, bicycles, gadgets, and edge cases).
                </p>
                <p className="text-[11px] text-amber-800">
                  Any manually added prototype listings stored in LocalStorage will be reset.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Confirm reset? This will revert the catalog to the initial sample dataset.')) {
                    onResetToSample();
                    setSuccessMessage('Marketplace has been reset to the original sample dataset!');
                  }
                }}
                className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Confirm Reset to Benchmark Data</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#F7F5F0] border-t border-[#DEDCD4] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#252722] bg-white border border-[#DEDCD4] hover:bg-[#EAE3D8] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
