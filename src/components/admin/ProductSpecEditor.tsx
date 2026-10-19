'use client';

import React, { useState, useMemo, KeyboardEvent, ClipboardEvent } from 'react';
import { Sparkles, RotateCcw, Check, X, SlidersHorizontal, Layers, Plus } from 'lucide-react';
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

const UNIFORM_WIDTH_PRESETS = ['18"', '20"', '22"', '24"', 'Balloon', 'Wide Leg'];

// Preset ranges for 1-click graduated bottom widths
const GRADUATED_PRESETS = [
  { label: '18" → 22"', start: 18, end: 22 },
  { label: '19" → 23"', start: 19, end: 23 },
  { label: '20" → 24"', start: 20, end: 24 },
  { label: '18" → 20"', start: 18, end: 20 },
];

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

  // Bottom width mode: 'uniform' (same for all) | 'graduated' (linked per size)
  const [widthMode, setWidthMode] = useState<'uniform' | 'graduated'>(() => {
    return Object.keys(sizeBottomWidths).length > 0 ? 'graduated' : 'uniform';
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
      // If uniform width is set, automatically link it
      if (bottomWidth.trim()) {
        onSizeBottomWidthsChange({
          ...sizeBottomWidths,
          [size]: bottomWidth.trim()
        });
      }
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

  // Select a preset group of sizes (e.g. Standard Jeans 28-36)
  const applyPresetSizes = (presetSizes: string[]) => {
    onSizesChange(presetSizes);
    if (widthMode === 'uniform' && bottomWidth.trim()) {
      const updatedWidths: Record<string, string> = {};
      presetSizes.forEach(s => {
        updatedWidths[s] = bottomWidth.trim();
      });
      onSizeBottomWidthsChange(updatedWidths);
    }
  };

  // Set uniform bottom width (applied across all active sizes)
  const handleSetUniformWidth = (val: string) => {
    onBottomWidthChange(val);
    const updated: Record<string, string> = {};
    sizes.forEach(s => {
      updated[s] = val;
    });
    onSizeBottomWidthsChange(updated);
  };

  // Apply graduated bottom widths (e.g. 18" -> 22" evenly across selected sizes)
  const handleApplyGraduated = (start: number, end: number) => {
    if (sizes.length === 0) return;
    const updated: Record<string, string> = {};
    const count = sizes.length;

    sizes.forEach((size, index) => {
      let widthVal: number;
      if (count === 1) {
        widthVal = start;
      } else {
        const step = (end - start) / (count - 1);
        widthVal = Math.round((start + index * step) * 2) / 2; // round to nearest 0.5"
      }
      updated[size] = `${widthVal}"`;
    });

    onSizeBottomWidthsChange(updated);
    onBottomWidthChange(`${start}" - ${end}"`);
    setWidthMode('graduated');
  };

  // Change individual size width
  const handleIndividualWidthChange = (size: string, val: string) => {
    const updated = { ...sizeBottomWidths };
    if (!val.trim()) {
      delete updated[size];
    } else {
      updated[size] = val.trim();
    }
    onSizeBottomWidthsChange(updated);

    // Update summary badge
    const values = sizes.map(s => updated[s]).filter(Boolean);
    if (values.length > 0) {
      const unique = Array.from(new Set(values));
      if (unique.length === 1) {
        onBottomWidthChange(unique[0]);
      } else {
        onBottomWidthChange(`${unique[0]} - ${unique[unique.length - 1]}`);
      }
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
      setWidthMode('graduated');
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

        {/* Quick Batch Select Pill */}
        {garmentType === 'pants' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#888] font-medium mr-1">Quick Select:</span>
            <button
              type="button"
              onClick={() => applyPresetSizes(['28', '30', '32', '34', '36'])}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#111] dark:text-[#EBEBEB] transition-colors"
            >
              + Standard 28-36
            </button>
            <button
              type="button"
              onClick={() => applyPresetSizes(['28', '30', '32', '34', '36', '38', '40'])}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#111] dark:text-[#EBEBEB] transition-colors"
            >
              + All 28-40
            </button>
          </div>
        )}

        {garmentType === 'tops' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#888] font-medium mr-1">Quick Select:</span>
            <button
              type="button"
              onClick={() => applyPresetSizes(['S', 'M', 'L', 'XL', 'XXL'])}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#111] dark:text-[#EBEBEB] transition-colors"
            >
              + Standard S-XXL
            </button>
            <button
              type="button"
              onClick={() => applyPresetSizes(['Free Size'])}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#111] dark:text-[#EBEBEB] transition-colors"
            >
              + Free Size
            </button>
          </div>
        )}

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
          {/* Header & Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-[#111] dark:text-[#F8F6F0]" />
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#111] dark:text-[#F8F6F0]">
                Bottom Width (Leg Opening)
              </label>
            </div>

            {sizes.length > 0 && (
              <div className="flex bg-[#F8F6F0] dark:bg-[#111111] p-0.5 rounded-xl border border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setWidthMode('uniform')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    widthMode === 'uniform'
                      ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-xs'
                      : 'text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white'
                  }`}
                >
                  Same for All
                </button>
                <button
                  type="button"
                  onClick={() => setWidthMode('graduated')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    widthMode === 'graduated'
                      ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-xs'
                      : 'text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white'
                  }`}
                >
                  Per Size
                </button>
              </div>
            )}
          </div>

          {/* ──── MODE A: UNIFORM (SAME FOR ALL SIZES) ──── */}
          {widthMode === 'uniform' && (
            <div className="flex flex-col gap-2 bg-[#F8F6F0]/80 dark:bg-[#111111]/80 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bottomWidth}
                  onChange={(e) => handleSetUniformWidth(e.target.value)}
                  placeholder={defaultCategoryBottomWidth ? `e.g. 20" (Default: ${defaultCategoryBottomWidth})` : 'e.g., 20", 22", Balloon'}
                  className="flex-1 h-11 bg-white dark:bg-[#1A1A1A] rounded-xl px-3.5 font-bold text-[13px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                />
                {bottomWidth && (
                  <button
                    type="button"
                    onClick={() => handleSetUniformWidth('')}
                    className="h-11 px-3 text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Presets for Uniform */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-[#888] font-medium mr-1">Presets:</span>
                {UNIFORM_WIDTH_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSetUniformWidth(preset)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                      bottomWidth === preset
                        ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111]'
                        : 'bg-white dark:bg-[#1A1A1A] hover:bg-black/10 dark:hover:bg-white/10 text-[#444] dark:text-[#CCC]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {sizes.length > 0 && bottomWidth && (
                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
                  <Check size={12} strokeWidth={2.5} />
                  Applies {bottomWidth} to all {sizes.length} selected sizes ({sizes.join(', ')})
                </div>
              )}
            </div>
          )}

          {/* ──── MODE B: GRADUATED / LINKED TO EACH SIZE ──── */}
          {widthMode === 'graduated' && sizes.length > 0 && (
            <div className="flex flex-col gap-2.5 bg-[#F8F6F0]/80 dark:bg-[#111111]/80 p-3 rounded-2xl border border-black/5 dark:border-white/5">
              {/* 1-Click Auto Scale Bar */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#666] dark:text-[#999] flex items-center gap-1">
                  <Sparkles size={12} /> Auto-Scale:
                </span>
                {GRADUATED_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyGraduated(preset.start, preset.end)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-[#1A1A1A] hover:bg-black/10 dark:hover:bg-white/15 text-[#111] dark:text-[#EBEBEB] transition-colors border border-black/5 dark:border-white/5 shadow-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Compact 2-Column Linked Sizes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 pt-1">
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
                        placeholder='20"'
                        className="w-14 h-7 text-center font-bold text-[12px] bg-[#F8F6F0] dark:bg-[#111] rounded-lg border-none outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
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
                <span className="font-bold text-[#666] dark:text-[#AAA]">
                  Summary: {bottomWidth || 'None'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
