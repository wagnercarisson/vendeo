"use client";

import { useState } from "react";
import type { IntelligenceSuccessfulPastCta } from "../hooks/useIntelligenceForm";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const inputClassName =
  "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

export function FieldShell({
  label,
  optional,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">
            {label} {optional ? <span className="font-normal text-zinc-500">(Opcional)</span> : null}
          </div>
          {hint ? <div className="mt-1 text-xs leading-5 text-zinc-500">{hint}</div> : null}
        </div>
        {counter ? <div className="text-xs text-zinc-400">{counter}</div> : null}
      </div>
      {children}
      {error ? <div className="mt-2 text-xs font-medium text-rose-600">{error}</div> : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
}: {
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={inputClassName}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value ?? ""}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={cx(inputClassName, "resize-none")}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className={inputClassName}
    >
      <option value="">{placeholder ?? "Selecione"}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ChoiceChips({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: string }>;
  value?: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(active ? null : option.value)}
            className={cx(
              "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
              active
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function MultiSelectChips({
  options,
  values,
  onToggle,
}: {
  options: Array<{ label: string; value: string }>;
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={cx(
              "rounded-full border px-3 py-2 text-sm font-medium transition",
              active
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function CheckboxRow({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="mt-3 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span>
        <span className="block font-medium text-zinc-900">{label}</span>
        {description ? <span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span> : null}
      </span>
    </label>
  );
}

export function SliderField({
  value,
  onChange,
  min,
  max,
  step = 1,
  leftLabel,
  rightLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
      <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
        <span>{leftLabel}</span>
        <span className="rounded-full bg-white px-2 py-1 text-zinc-900 shadow-sm">{value}/10</span>
        <span>{rightLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer accent-emerald-600"
      />
    </div>
  );
}

export function StringListField({
  values,
  onChange,
  placeholder,
  addLabel,
  max,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  addLabel: string;
  max: number;
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const trimmed = draft.trim();
    if (!trimmed || values.length >= max) return;
    onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={`${value}-${values.indexOf(value)}`}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="text-zinc-400 transition hover:text-zinc-700"
            >
              x
            </button>
          </span>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={values.length >= max}
          className="mt-2 shrink-0 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addLabel}
        </button>
      </div>

      <div className="mt-2 text-xs text-zinc-500">Até {max} itens.</div>
    </div>
  );
}

export function CTAListField({
  items,
  onChange,
  max,
}: {
  items: IntelligenceSuccessfulPastCta[];
  onChange: (items: IntelligenceSuccessfulPastCta[]) => void;
  max: number;
}) {
  function updateItem(index: number, patch: Partial<IntelligenceSuccessfulPastCta>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function addItem() {
    if (items.length >= max) return;
    onChange([
      ...items,
      {
        cta: "",
        context: "",
        approval_speed_seconds: null,
      },
    ]);
  }

  return (
    <div className="mt-3 space-y-3">
      {items.map((item, index) => (
        <div key={`cta-${index}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_1.2fr_0.7fr_auto]">
            <input
              value={item.cta}
              onChange={(event) => updateItem(index, { cta: event.target.value })}
              placeholder="Ex: Passe aqui hoje"
              className={inputClassName}
            />
            <input
              value={item.context}
              onChange={(event) => updateItem(index, { context: event.target.value })}
              placeholder="Ex: promoção relâmpago"
              className={inputClassName}
            />
            <input
              type="number"
              min={0}
              value={item.approval_speed_seconds ?? ""}
              onChange={(event) =>
                updateItem(index, {
                  approval_speed_seconds:
                    event.target.value === "" ? null : Number(event.target.value),
                })
              }
              placeholder="Segundos"
              className={inputClassName}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="mt-2 rounded-2xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 transition hover:bg-white hover:text-zinc-900"
            >
              Remover
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        disabled={items.length >= max}
        className="rounded-2xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Adicionar CTA de sucesso
      </button>
    </div>
  );
}