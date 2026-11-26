"use client";

import {
  useId,
  useRef,
  useState,
  type DragEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircleIcon, CheckIcon, ChevronDownIcon, CloseIcon, FileIcon, UploadIcon } from "./Icons";
import { cn } from "./cn";

/* -------------------------------------------------------------------------- */
/* FieldWrapper                                                               */
/* -------------------------------------------------------------------------- */

export interface FieldWrapperProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel,
  children,
  className,
}: FieldWrapperProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ash-200">
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-1 text-accent">
              *
            </span>
          ) : null}
        </label>
        {!required && optionalLabel ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint rtl:font-sans rtl:tracking-normal rtl:normal-case">
            {optionalLabel}
          </span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 text-xs text-danger"
        >
          <AlertCircleIcon size={14} />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const INPUT_BASE = cn(
  "w-full rounded-[var(--radius-sm)] border bg-bg-elevated px-3.5 text-sm text-text placeholder:text-faint/75",
  "transition-[border-color,box-shadow,background-color] duration-200",
  "border-line-strong hover:border-ash-500/45",
  "focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/45",
  "disabled:cursor-not-allowed disabled:opacity-45",
);

/* -------------------------------------------------------------------------- */
/* TextInput                                                                  */
/* -------------------------------------------------------------------------- */

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  wrapperClassName?: string;
}

export function TextInput({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel,
  wrapperClassName,
  className,
  ...props
}: TextInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = [hint && !error ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optionalLabel={optionalLabel}
      className={wrapperClassName}
    >
      <div className="group/input relative">
        <input
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            INPUT_BASE,
            "h-11",
            error && "border-danger/70 focus:border-danger focus:ring-danger/40",
            className,
          )}
          {...props}
        />
        {/* Subtle bottom molten edge when focused */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 bottom-0 h-px scale-x-0 opacity-0 transition-all duration-300 group-focus-within/input:scale-x-100 group-focus-within/input:opacity-100"
          style={{ background: "var(--gradient-heat-seam)" }}
        />
      </div>
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/* Textarea                                                                   */
/* -------------------------------------------------------------------------- */

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  wrapperClassName?: string;
}

export function Textarea({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel,
  wrapperClassName,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = [hint && !error ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optionalLabel={optionalLabel}
      className={wrapperClassName}
    >
      <div className="group/input relative">
        <textarea
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            INPUT_BASE,
            "min-h-[112px] py-3 leading-relaxed resize-y",
            error && "border-danger/70 focus:border-danger focus:ring-danger/40",
            className,
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 bottom-1.5 h-px scale-x-0 opacity-0 transition-all duration-300 group-focus-within/input:scale-x-100 group-focus-within/input:opacity-100"
          style={{ background: "var(--gradient-heat-seam)" }}
        />
      </div>
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  id?: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  wrapperClassName?: string;
}

export function Select({
  id,
  label,
  options,
  placeholder,
  hint,
  error,
  required,
  optionalLabel,
  wrapperClassName,
  className,
  ...props
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = [hint && !error ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optionalLabel={optionalLabel}
      className={wrapperClassName}
    >
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            INPUT_BASE,
            "h-11 appearance-none pe-10",
            error && "border-danger/70 focus:border-danger focus:ring-danger/40",
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled={required} className="bg-obsidian-900 text-muted">
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-obsidian-900 text-text"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute top-1/2 end-3.5 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkbox                                                                   */
/* -------------------------------------------------------------------------- */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  id?: string;
  label: ReactNode;
  description?: string;
  error?: string;
}

export function Checkbox({
  id,
  label,
  description,
  error,
  className,
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="group flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            id={fieldId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            className="peer sr-only"
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-[4px] border border-line-strong bg-bg-elevated transition-all duration-200",
              "group-hover:border-line-lava-strong",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
              "peer-checked:border-accent peer-checked:bg-accent peer-checked:text-obsidian-950",
              "peer-disabled:opacity-45",
              error && "border-danger",
            )}
          >
            <CheckIcon
              size={13}
              className="scale-75 opacity-0 transition-all duration-150 group-has-[:checked]:scale-100 group-has-[:checked]:opacity-100"
            />
          </span>
        </span>
        <span className="flex flex-col gap-0.5 text-sm leading-snug text-ash-200">
          <span>{label}</span>
          {description ? <span className="text-xs text-faint">{description}</span> : null}
        </span>
      </label>
      {error ? (
        <p role="alert" className="ps-8 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RadioCards                                                                 */
/* -------------------------------------------------------------------------- */

export interface RadioCardOption {
  value: string;
  title: string;
  description?: string;
  meta?: string;
}

export interface RadioCardsProps {
  name: string;
  legend: string;
  options: RadioCardOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  columns?: 1 | 2 | 3;
  error?: string;
  required?: boolean;
  className?: string;
}

export function RadioCards({
  name,
  legend,
  options,
  value,
  defaultValue,
  onChange,
  columns = 2,
  error,
  required,
  className,
}: RadioCardsProps) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const selected = value !== undefined ? value : internal;

  const handleSelect = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const gridCols =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : columns === 1
        ? "grid-cols-1"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="text-sm font-medium text-ash-200">
        {legend}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-accent">
            *
          </span>
        ) : null}
      </legend>

      <div className={cn("grid gap-3", gridCols)}>
        {options.map((opt) => {
          const isChecked = selected === opt.value;
          return (
            <label
              key={opt.value}
              data-cursor="pointer"
              className={cn(
                "group relative flex cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded-[var(--radius-md)] border p-4 text-start transition-all duration-250",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                isChecked
                  ? "border-line-lava-strong bg-surface shadow-[var(--lava-glow-sm)]"
                  : "border-line bg-bg-elevated hover:border-line-strong hover:bg-surface/65",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isChecked}
                required={required}
                onChange={() => handleSelect(opt.value)}
                className="sr-only"
              />

              {/* Active top heat rim */}
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-[1.5px] transition-opacity duration-300",
                  isChecked ? "opacity-100" : "opacity-0",
                )}
                style={{ background: "var(--gradient-heat-seam)" }}
              />

              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-text">{opt.title}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isChecked ? "border-accent bg-accent" : "border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full bg-obsidian-950 transition-transform",
                      isChecked ? "scale-100" : "scale-0",
                    )}
                  />
                </span>
              </div>

              {opt.description ? (
                <p className="text-xs leading-relaxed text-muted">{opt.description}</p>
              ) : null}

              {opt.meta ? (
                <span className="mt-1 font-mono text-[11px] text-accent rtl:font-sans">
                  {opt.meta}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* FileDropZone                                                               */
/* -------------------------------------------------------------------------- */

export interface FileDropZoneProps {
  id?: string;
  label: string;
  dropTitle?: string;
  dropHint?: string;
  removeLabel?: (fileName: string) => string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  error?: string;
  optionalLabel?: string;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropZone({
  id,
  label,
  dropTitle = "Drop files here or click to browse",
  dropHint,
  removeLabel = (name) => `Remove ${name}`,
  accept,
  multiple = true,
  maxFiles = 5,
  maxSizeMb = 10,
  files: controlledFiles,
  onFilesChange,
  error,
  optionalLabel,
  className,
}: FileDropZoneProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();

  const fileList = controlledFiles ?? internalFiles;
  const activeError = error ?? localError;

  const commitFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const valid: File[] = [];
    let rejectedMsg: string | undefined;

    for (const f of arr) {
      if (f.size > maxBytes) {
        rejectedMsg = `${f.name} exceeds ${maxSizeMb} MB`;
        continue;
      }
      valid.push(f);
    }

    const merged = multiple ? [...fileList, ...valid].slice(0, maxFiles) : valid.slice(0, 1);
    setLocalError(rejectedMsg);
    if (controlledFiles === undefined) setInternalFiles(merged);
    onFilesChange?.(merged);
  };

  const removeAt = (idx: number) => {
    const next = fileList.filter((_, i) => i !== idx);
    setLocalError(undefined);
    if (controlledFiles === undefined) setInternalFiles(next);
    onFilesChange?.(next);
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      commitFiles(e.dataTransfer.files);
    }
  };

  return (
    <FieldWrapper
      id={fieldId}
      label={label}
      error={activeError}
      optionalLabel={optionalLabel}
      className={className}
    >
      <input
        ref={inputRef}
        id={fieldId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) commitFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        data-cursor="pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-2.5 rounded-[var(--radius-md)] border border-dashed px-5 py-7 text-center transition-all duration-250",
          isDragging
            ? "border-accent bg-lava-900/20 shadow-[var(--lava-glow-sm)]"
            : "border-line-strong bg-bg-elevated hover:border-line-lava-strong hover:bg-surface/75",
          activeError && "border-danger/70",
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-surface text-accent transition-colors group-hover:border-line-lava-strong group-hover:text-ember">
          <UploadIcon size={18} />
        </span>
        <span className="text-sm font-medium text-text">{dropTitle}</span>
        <span className="text-xs text-faint">
          {dropHint ?? `Up to ${maxFiles} files · ${maxSizeMb} MB max each`}
        </span>
      </button>

      {fileList.length > 0 ? (
        <ul aria-live="polite" className="mt-1 flex flex-col gap-2">
          {fileList.map((file, idx) => (
            <li
              key={`${file.name}-${file.size}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-ash-200">
                <FileIcon size={15} className="text-accent" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-faint tabular-nums">
                  {formatBytes(file.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={removeLabel(file.name)}
                onClick={() => removeAt(idx)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-obsidian-700 hover:text-text"
              >
                <CloseIcon size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </FieldWrapper>
  );
}
