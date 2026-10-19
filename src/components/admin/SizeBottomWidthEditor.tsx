'use client';

import React, { useMemo } from 'react';
import { Sparkles, RotateCcw, Link as LinkIcon, Check } from 'lucide-react';

export const COMMON_BOTTOM_WIDTH_PRESETS = ['18"', '19"', '20"', '21"', '22"', '24"'];
export const RANGE_PRESETS = ['18-20"', '20-22"', '22-24"'];

interface SizeBottomWidthEditorProps {
  sizes: string[];
  bottomWidth: string;
  onBottomWidthChange: (val: string) => void;
  sizeBottomWidths: Record<string, string>;
  onSizeBottomWidthsChange: (mapping: Record<string, string>) => void;
  defaultCategoryBottomWidth?: string;
  defaultCategorySizeBottomWidths?: Record<string, string>;
  label?: string;
}

export function SizeBottomWidthEditor({
  sizes = [],
  bottomWidth = '',
  onBottomWidthChange,
  sizeBottomWidths = {},
  onSizeBottomWidthsChange,
  defaultCategoryBottomWidth,
  defaultCategorySizeBottomWidths,
  label = 'Bottom Width'
}: SizeBottomWidthEditorProps) {
  // Update a single size's bottom width
  const handleSizeWidthChange = (size: string, val: string) => {
    const updated = { ...sizeBottomWidths };
    if (!val.trim()) {
      delete updated[size];
    } else {
      updated[size] = val.trim();
    }
    onSizeBottomWidthsChange(updated);

    // Auto-update summary bottomWidth if all or range exists
    updateSummaryWidth(updated);
  };

  // Quick fill all active sizes with a single preset
  const handleSetAll = (preset: string) => {
    const updated: Record<string, string> = {};
    sizes.forEach(s => {
      updated[s] = preset;
    });
    onSizeBottomWidthsChange(updated);
    onBottomWidthChange(preset);
  };

  // Compute a smart summary (e.g. 18"-22" or 20")
  const updateSummaryWidth = (mapping: Record<string, string>) => {
    const values = sizes.map(s => mapping[s]).filter(Boolean);
    if (values.length === 0) return;
    const uniqueValues = Array.from(new Set(values));
    if (uniqueValues.length === 1) {
      onBottomWidthChange(uniqueValues[0]);
    } else if (uniqueValues.length > 1) {
      onBottomWidthChange(`${uniqueValues[0]} - ${uniqueValues[uniqueValues.length - 1]}`);
    }
  };

  // Load defaults from category if available
  const handleLoadCategoryDefaults = () => {
    if (defaultCategorySizeBottomWidths && Object.keys(defaultCategorySizeBottomWidths).length > 0) {
      onSizeBottomWidthsChange({ ...defaultCategorySizeBottomWidths });
    }
    if (defaultCategoryBottomWidth) {
      onBottomWidthChange(defaultCategoryBottomWidth);
    }
  };

  const configuredCount = useMemo(() => {
    return sizes.filter(s => !!sizeBottomWidths[s]).length;
  }, [sizes, sizeBottomWidths]);

  // If no sizes are selected yet, display the single general input
  if (sizes.length === 0) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-bold uppercase tracking-wider text-[#555] dark:text-[#AAA]">
            {label}
          </label>
          {defaultCategoryBottomWidth && (
            <span className="text-[11px] text-[#888] dark:text-[#777]">
              Default: {defaultCategoryBottomWidth}
            </span>
          )}
        </div>
        <input 
          type="text" 
          value={bottomWidth}
          onChange={(e) => onBottomWidthChange(e.target.value)}
          placeholder={defaultCategoryBottomWidth ? `Bottom Width (Default: ${defaultCategoryBottomWidth})` : 'e.g., 20", 22", Balloon, Wide Leg'}
          className="w-full h-12 bg-[#F8F6F0] dark:bg-[#111111] rounded-2xl px-4 font-bold text-[14px] border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
        />
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-[#888] font-medium mr-1">Presets:</span>
          {[...COMMON_BOTTOM_WIDTH_PRESETS, ...RANGE_PRESETS].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => onBottomWidthChange(preset)}
              className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                bottomWidth === preset
                  ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                  : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border-transparent text-[#444] dark:text-[#ccc]'
              }`}
            >
              {preset}
            </button>
          ))}
          {bottomWidth && (
            <button
              type="button"
              onClick={() => onBottomWidthChange('')}
              className="text-[11px] font-medium px-2 py-1 text-red-500 hover:text-red-600 ml-auto"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-[11px] text-[#888] dark:text-[#777] italic mt-1">
          Select sizes above to link specific bottom widths to each size.
        </p>
      </div>
    );
  }

  // When sizes are selected: show size-to-width linkage
  return (
    <div className="flex flex-col gap-3 w-full border border-black/10 dark:border-white/10 rounded-2xl p-3.5 bg-[#F8F6F0]/60 dark:bg-[#111111]/60">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LinkIcon size={14} className="text-[#111] dark:text-[#F8F6F0]" />
          <label className="text-[12px] font-bold uppercase tracking-wider text-[#111] dark:text-[#F8F6F0]">
            Link Bottom Width to Sizes
          </label>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Check size={12} strokeWidth={2.5} />
          {configuredCount}/{sizes.length} linked
        </span>
      </div>

      {/* Quick Set All Bar */}
      <div className="flex items-center gap-1.5 flex-wrap bg-white dark:bg-[#1A1A1A] p-2 rounded-xl border border-black/5 dark:border-white/5">
        <span className="text-[11px] font-bold text-[#666] dark:text-[#999] mr-1 flex items-center gap-1">
          <Sparkles size={12} /> Set all to:
        </span>
        {COMMON_BOTTOM_WIDTH_PRESETS.map(preset => (
          <button
            key={preset}
            type="button"
            onClick={() => handleSetAll(preset)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20 text-[#111] dark:text-[#EBEBEB] transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Category Defaults Button if applicable */}
      {defaultCategorySizeBottomWidths && Object.keys(defaultCategorySizeBottomWidths).length > 0 && configuredCount === 0 && (
        <button
          type="button"
          onClick={handleLoadCategoryDefaults}
          className="text-left text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw size={12} />
          Load Category Defaults: ({Object.entries(defaultCategorySizeBottomWidths).map(([s, w]) => `${s}: ${w}`).join(', ')})
        </button>
      )}

      {/* Per-Size Rows */}
      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
        {sizes.map((size) => {
          const currentWidth = sizeBottomWidths[size] || '';
          const categoryInherited = defaultCategorySizeBottomWidths?.[size];
          return (
            <div 
              key={size}
              className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] p-2 rounded-xl border border-black/5 dark:border-white/5 shadow-sm"
            >
              {/* Size Pill */}
              <div className="w-12 h-9 rounded-lg bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] font-bold text-[13px] flex items-center justify-center shrink-0 shadow-sm">
                {size}
              </div>

              {/* Bottom Width Input for this Size */}
              <div className="relative w-24 shrink-0">
                <input 
                  type="text"
                  value={currentWidth}
                  onChange={(e) => handleSizeWidthChange(size, e.target.value)}
                  placeholder={categoryInherited || 'e.g. 20"'}
                  className="w-full h-9 bg-[#F8F6F0] dark:bg-[#111111] rounded-lg px-2.5 font-bold text-[13px] text-center border-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
                />
              </div>

              {/* Quick Size Presets */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
                {COMMON_BOTTOM_WIDTH_PRESETS.map((preset) => {
                  const isSelected = currentWidth === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSizeWidthChange(size, preset)}
                      className={`h-7 px-2 rounded-md text-[11px] font-semibold shrink-0 transition-all ${
                        isSelected
                          ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-sm'
                          : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#555] dark:text-[#AAA]'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>

              {/* Clear button for this size */}
              {currentWidth && (
                <button
                  type="button"
                  onClick={() => handleSizeWidthChange(size, '')}
                  className="text-[11px] font-bold text-[#888] hover:text-red-500 px-1 transition-colors shrink-0"
                  title="Clear size width"
                >
                  &times;
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Field */}
      <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[12px]">
        <span className="font-semibold text-[#666] dark:text-[#999]">
          Overall / Summary Badge:
        </span>
        <input 
          type="text"
          value={bottomWidth}
          onChange={(e) => onBottomWidthChange(e.target.value)}
          placeholder='e.g., 18" - 22"'
          className="w-36 h-8 bg-white dark:bg-[#1A1A1A] rounded-lg px-2 text-right font-bold text-[12px] border-none outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-[#111111] dark:text-[#EBEBEB]"
        />
      </div>
    </div>
  );
}
