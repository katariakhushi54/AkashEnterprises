'use client';

import React, { useState, useMemo, KeyboardEvent } from 'react';
import { RotateCcw, Check, X, SlidersHorizontal } from 'lucide-react';
import { normalizeSizes, parseSizesInput } from '@/lib/sizes';

interface ProductSpecEditorProps {
  sizes: string[];
  onSizesChange: (sizes: string[]) => void;
  bottomWidth: string;
  onBottomWidthChange: (width: string) => void;
  sizeBottomWidths: Record<string, string>;
  onSizeBottomWidthsChange: (mapping: Record<string, string>) => void;
  defaultCategorySizes?: string[];
  defaultCategoryBottomWidth?: string;
  defaultCategorySizeBottomWidths?: Record<string, string>;
  isCategoryLevel?: boolean;
}

const COMMON_PANT_SIZES = ['28', '30', '32', '34', '36', '38', '40'];
const COMMON_TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export function ProductSpecEditor({
  sizes = [],
  onSizesChange,
  bottomWidth = '',
  onBottomWidthChange,
  sizeBottomWidths = {},
  onSizeBottomWidthsChange,
  defaultCategorySizes = [],
  defaultCategoryBottomWidth = '',
  defaultCategorySizeBottomWidths = {},
  isCategoryLevel = false,
}: ProductSpecEditorProps) {
  // Garment type selector: 'pants' | 'tops' | 'custom'
  const [garmentType, setGarmentType] = useState<'pants' | 'tops' | 'custom'>(() => {
    if (sizes.some(s => COMMON_TOP_SIZES.includes(s))) return 'tops';
    return 'pants';
  });

  const [customSizeInput, setCustomSizeInput] = useState('');

  // Toggle a single size in/out
  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      const updatedSizes = sizes.filter(s => s !== size);
      onSizesChange(updatedSizes);
      // Clean up linked bottom width if any
      if (sizeBottomWidths[size]) {
        const updatedWidths = { ...sizeBottomWidths };
        delete updatedWidths[size];
        onSizeBottomWidthsChange(updatedWidths);
      }
    } else {
      const updatedSizes = normalizeSizes([...sizes, size]);
      onSizesChange(updatedSizes);
    }
  };

  // Add custom size via input
  const handleAddCustomSize = (raw: string) => {
    if (!raw.trim()) return;
    const parsed = parseSizesInput(raw);
    if (parsed.length > 0) {
      const merged = normalizeSizes(Array.from(new Set([...sizes, ...parsed])));
      onSizesChange(merged);
    }
    setCustomSizeInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddCustomSize(customSizeInput);
    }
  };

  // Change individual size width
  const handleIndividualWidthChange = (size: string, val: string) => {
    const updated = { ...sizeBottomWidths };
    if (val === '') {
      delete updated[size];
    } else {
      updated[size] = val;
    }
    onSizeBottomWidthsChange(updated);

    // Update summary badge / bottomWidth string
    const values = sizes.map(s => updated[s]?.trim()).filter(Boolean);
    if (values.length > 0) {
      const unique = Array.from(new Set(values));
      if (unique.length === 1) {
        onBottomWidthChange(unique[0]);
      } else {
        onBottomWidthChange(`${unique[0]} - ${unique[unique.length - 1]}`);
      }
    } else {
      onBottomWidthChange('');
    }
  };

  // Load defaults from category
  const handleLoadCategoryDefaults = () => {
    if (defaultCategorySizes.length > 0) {
      onSizesChange(defaultCategorySizes);
    }
    if (defaultCategoryBottomWidth) {
      onBottomWidthChange(defaultCategoryBottomWidth);
    }
    if (defaultCategorySizeBottomWidths && Object.keys(defaultCategorySizeBottomWidths).length > 0) {
      onSizeBottomWidthsChange({ ...defaultCategorySizeBottomWidths });
    }
  };

  const configuredCount = useMemo(() => {
    return sizes.filter(s => !!sizeBottomWidths[s]).length;
  }, [sizes, sizeBottomWidths]);

  const hasCategoryDefaults = !isCategoryLevel && (
    defaultCategorySizes.length > 0 || !!defaultCategoryBottomWidth
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: SIZES
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {/* Header & Garment Type Tabs */}
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold uppercase tracking-wider text-[#555] dark:text-[#AAA]">
            Garment Sizes
          </label>
          {sizes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onSizesChange([]);
                onSizeBottomWidthsChange({});
              }}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Segmented Garment Type Selector */}
        <div className="flex bg-[#F8F6F0] dark:bg-[#111111] p-1 rounded-2xl border border-black/10 dark:border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setGarmentType('pants')}
            className={`flex-1 py-1.5 rounded-xl font-bold text-[12px] transition-all flex items-center justify-center gap-1.5 ${
              garmentType === 'pants'
                ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-sm'
                : 'text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white'
            }`}
          >
            👖 Pants / Jeans
          </button>
          <button
            type="button"
            onClick={() => setGarmentType('tops')}
            className={`flex-1 py-1.5 rounded-xl font-bold text-[12px] transition-all flex items-center justify-center gap-1.5 ${
              garmentType === 'tops'
                ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-sm'
                : 'text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white'
            }`}
          >
            👕 Tops / Shirts
          </button>
          <button
            type="button"
            onClick={() => setGarmentType('custom')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[12px] transition-all flex items-center justify-center gap-1.5 ${
              garmentType === 'custom'
                ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-sm'
                : 'text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Interactive Size Chips */}
        <div className="flex flex-wrap gap-1.5 items-center bg-[#F8F6F0] dark:bg-[#111111] p-2.5 rounded-2xl border border-black/10 dark:border-white/10">
          {(garmentType === 'pants' ? COMMON_PANT_SIZES : garmentType === 'tops' ? COMMON_TOP_SIZES : []).map(s => {
            const isSelected = sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`h-9 min-w-[38px] px-3 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center border-none outline-none cursor-pointer ${
                  isSelected
                    ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-sm scale-105'
                    : 'bg-white dark:bg-[#1F1F1F] text-[#444] dark:text-[#CCC] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            );
          })}

          {/* Any custom sizes already selected that aren't in the common list */}
          {sizes.filter(s => !COMMON_PANT_SIZES.includes(s) && !COMMON_TOP_SIZES.includes(s)).map(s => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1 h-9 rounded-xl bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] font-bold text-[13px] shadow-sm"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => toggleSize(s)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/20"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Inline Input for custom size */}
          <input
            type="text"
            value={customSizeInput}
            onChange={(e) => setCustomSizeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => handleAddCustomSize(customSizeInput)}
            placeholder="+ Custom"
            className="w-20 h-9 bg-transparent text-[12px] font-bold text-[#111111] dark:text-[#EBEBEB] border-none outline-none px-2 placeholder:text-[#999] dark:placeholder:text-[#666]"
          />
        </div>

        {/* Category defaults hint button if available */}
        {hasCategoryDefaults && sizes.length === 0 && (
          <button
            type="button"
            onClick={handleLoadCategoryDefaults}
            className="text-left text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={12} />
            Click to load Category Defaults: ({defaultCategorySizes.join(', ')})
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: BOTTOM WIDTH (Only shown for Pants / numbers or custom)
          ───────────────────────────────────────────────────────────── */}
      {garmentType !== 'tops' && (
        <div className="flex flex-col gap-2.5 pt-2 border-t border-black/10 dark:border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-[#111] dark:text-[#F8F6F0]" />
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#111] dark:text-[#F8F6F0]">
                Bottom Width (Leg Opening)
              </label>
            </div>

            {sizes.length > 0 && configuredCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  onSizeBottomWidthsChange({});
                  onBottomWidthChange('');
                }}
                className="text-[11px] font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Clear Widths
              </button>
            )}
          </div>

          {sizes.length > 0 ? (
            /* Linked Per-Size Bottom Width Grid */
            <div className="flex flex-col gap-2.5 bg-[#F8F6F0]/80 dark:bg-[#111111]/80 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {sizes.map(size => {
                  const currentWidth = sizeBottomWidths[size] || '';
                  return (
                    <div
                      key={size}
                      className="flex items-center justify-between gap-1.5 bg-white dark:bg-[#1A1A1A] px-2.5 py-1.5 rounded-xl border border-black/5 dark:border-white/5 shadow-xs"
                    >
                      <span className="font-bold text-[13px] text-[#111] dark:text-[#F8F6F0] w-7 shrink-0">
                        {size}
                      </span>
                      <span className="text-[#888] text-[11px]">→</span>
                      <input
                        type="text"
                        value={currentWidth}
                        onChange={(e) => handleIndividualWidthChange(size, e.target.value)}
                        placeholder='e.g. 20"'
                        className="w-16 h-7 text-center font-bold text-[12px] bg-[#F8F6F0] dark:bg-[#111111] rounded-lg border-none outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Live Summary Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={12} strokeWidth={2.5} />
                  {configuredCount}/{sizes.length} sizes configured
                </span>
                {bottomWidth && (
                  <span className="font-bold text-[#666] dark:text-[#AAA]">
                    Summary: {bottomWidth}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Fallback single input if no sizes selected yet */
            <div className="flex flex-col gap-1.5 bg-[#F8F6F0]/80 dark:bg-[#111111]/80 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <input
                type="text"
                value={bottomWidth}
                onChange={(e) => onBottomWidthChange(e.target.value)}
                placeholder={defaultCategoryBottomWidth ? `e.g. 20" (Default: ${defaultCategoryBottomWidth})` : 'e.g., 20", 22", Balloon'}
                className="h-10 bg-white dark:bg-[#1A1A1A] rounded-xl px-3 font-bold text-[13px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
              />
              <p className="text-[11px] text-[#888] dark:text-[#777]">
                Select sizes above to configure individual bottom width per size.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
