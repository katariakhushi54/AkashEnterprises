'use client';

import React, { useState, KeyboardEvent, ClipboardEvent } from 'react';
import { X, Plus, Sparkles, Check, RotateCcw } from 'lucide-react';
import { normalizeSizes, parseSizesInput, SIZE_PRESETS, COMMON_NUMBER_SIZES, COMMON_ALPHA_SIZES } from '@/lib/sizes';

interface SizeTagEditorProps {
  sizes: string[];
  onChange: (sizes: string[]) => void;
  defaultCategorySizes?: string[];
  label?: string;
  placeholder?: string;
}

export function SizeTagEditor({
  sizes = [],
  onChange,
  defaultCategorySizes,
  label = "Available Sizes",
  placeholder = "Type size & press Enter, Space or Comma"
}: SizeTagEditorProps) {
  const [inputValue, setInputValue] = useState('');

  // Add one or more sizes (handles space/comma separated)
  const addSizes = (raw: string) => {
    if (!raw.trim()) return;
    const newItems = parseSizesInput(raw);
    if (newItems.length > 0) {
      const merged = Array.from(new Set([...sizes, ...newItems]));
      onChange(merged);
    }
    setInputValue('');
  };

  const removeSize = (sizeToRemove: string) => {
    onChange(sizes.filter(s => s !== sizeToRemove));
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      removeSize(size);
    } else {
      onChange([...sizes, size]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addSizes(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && sizes.length > 0) {
      removeSize(sizes[sizes.length - 1]);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      addSizes(pastedText);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addSizes(inputValue);
    }
  };

  const hasCategoryDefaults = defaultCategorySizes && defaultCategorySizes.length > 0;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Label and Live Status Header */}
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-bold text-[#555] dark:text-[#AAA] uppercase tracking-wider">
          {label}
        </label>
        {sizes.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check size={13} strokeWidth={2.5} />
              {sizes.length} {sizes.length === 1 ? 'size' : 'sizes'} selected
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-1"
            >
              Clear
            </button>
          </div>
        ) : hasCategoryDefaults ? (
          <span className="text-[11px] font-medium text-[#888] dark:text-[#777]">
            Inherits: {defaultCategorySizes.join(', ')}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-[#888] dark:text-[#777]">
            No sizes (Free item)
          </span>
        )}
      </div>

      {/* Main Tag Input Box */}
      <div className="w-full bg-[#F8F6F0] dark:bg-[#111111] rounded-2xl p-2.5 border border-black/10 dark:border-white/10 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all">
        {/* Active Size Chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {sizes.map((s, idx) => (
            <span
              key={`${s}-${idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#111111] dark:bg-[#F8F6F0] text-white dark:text-[#111111] font-bold text-[13px] shadow-sm animate-in fade-in zoom-in-95 duration-150"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => removeSize(s)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                aria-label={`Remove size ${s}`}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}

          {/* Typing Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={handleBlur}
            placeholder={sizes.length === 0 ? placeholder : "+ Add size..."}
            className="flex-1 min-w-[120px] bg-transparent text-[13px] font-bold text-[#111111] dark:text-[#EBEBEB] border-none outline-none px-2 py-1 placeholder:text-[#999] dark:placeholder:text-[#666]"
          />
        </div>
      </div>

      {/* Quick Category Defaults Helper if applicable */}
      {hasCategoryDefaults && sizes.length === 0 && (
        <button
          type="button"
          onClick={() => onChange(defaultCategorySizes)}
          className="text-left text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw size={12} />
          Click to load & customize Category Defaults: ({defaultCategorySizes.join(', ')})
        </button>
      )}

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-[#888] dark:text-[#666] mr-1">Presets:</span>
        {SIZE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.sizes)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-[#333] dark:text-[#CCC]"
          >
            + {preset.label}
          </button>
        ))}
      </div>

      {/* Click-to-Toggle Common Sizes */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-bold text-[#888] dark:text-[#666] w-12 shrink-0">Pants:</span>
          {COMMON_NUMBER_SIZES.map((num) => {
            const isActive = sizes.includes(num);
            return (
              <button
                key={num}
                type="button"
                onClick={() => toggleSize(num)}
                className={`h-6 min-w-[28px] px-1.5 rounded-md text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-xs'
                    : 'bg-black/5 dark:bg-white/10 text-[#555] dark:text-[#AAA] hover:bg-black/10 dark:hover:bg-white/15'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-bold text-[#888] dark:text-[#666] w-12 shrink-0">Tops:</span>
          {COMMON_ALPHA_SIZES.map((alpha) => {
            const isActive = sizes.includes(alpha);
            return (
              <button
                key={alpha}
                type="button"
                onClick={() => toggleSize(alpha)}
                className={`h-6 min-w-[28px] px-1.5 rounded-md text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-[#111111] text-white dark:bg-[#F8F6F0] dark:text-[#111111] shadow-xs'
                    : 'bg-black/5 dark:bg-white/10 text-[#555] dark:text-[#AAA] hover:bg-black/10 dark:hover:bg-white/15'
                }`}
              >
                {alpha}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
