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
        <label htmlFor={id} className="text-sm font-semibold text-text">
          {label}
          {required ? (
            <span aria-hidden="true" className="ms-1 text-accent-text">
              *
            </span>
          ) : null}
        </label>
        {!required && optionalLabel ? (
          <span className="text-xs text-faint">{optionalLabel}</span>
        ) : null}
      </div>

      {children}

      {error ? (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-danger"
        >
          <AlertCircleIcon size={14} />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[0.8125rem] text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* White field, 12px radius, 3:1 hairline border, orange focus ring (border + 4px soft halo). */
const INPUT_BASE = cn(
  "w-full rounded-[12px] border border-line-input bg-surface px-4 text-[0.9375rem] text-text shadow-[var(--shadow-xs)] placeholder:text-faint",
  "transition-[border-color,box-shadow,background-color] duration-200",
  "hover:border-text/45",
  "focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/18",
  "disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60",
);
const INPUT_ERROR = "border-danger hover:border-danger focus:border-danger focus:ring-danger/15";

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
            "h-12",
            error && INPUT_ERROR,
            className,
          )}
          {...props}
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
            "min-h-[132px] py-3 leading-relaxed resize-y",
            error && INPUT_ERROR,
            className,
          )}
          {...props}
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
            "h-12 appearance-none pe-11",
            error && INPUT_ERROR,
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute top-1/2 end-4 -translate-y-1/2 text-muted"
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
              "flex h-5 w-5 items-center justify-center rounded-[6px] border border-line-input bg-surface text-on-accent transition-all duration-200",
              "group-hover:border-accent",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
              "peer-checked:border-transparent peer-checked:[background-image:var(--gradient-cta)]",
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
        <span className="flex flex-col gap-0.5 text-sm leading-snug text-text">
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
    <fieldset className={cn("flex flex-col", className)}>
      <legend className="mb-3 text-sm font-semibold text-text">
        {legend}
        {required ? (
          <span aria-hidden="true" className="ms-1 text-accent-text">
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
                "group relative flex cursor-pointer flex-col gap-2 rounded-[var(--radius-md)] border bg-surface p-4 text-start transition-[border-color,box-shadow,transform] duration-250",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                isChecked
                  ? "border-accent shadow-[0_0_0_3px_var(--accent-soft),var(--shadow-card)]"
                  : "border-line-strong shadow-[var(--shadow-xs)] hover:-translate-y-px hover:border-line-lava hover:shadow-[var(--shadow-card)]",
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

              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-text">{opt.title}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isChecked ? "border-transparent text-on-accent [background-image:var(--gradient-cta)]" : "border-line-input bg-surface",
                  )}
                >
                  <CheckIcon
                    size={12}
                    className={cn("transition-transform", isChecked ? "scale-100" : "scale-0")}
                  />
                </span>
              </div>

              {opt.description ? (
                <p className="text-[0.8125rem] leading-relaxed text-muted">{opt.description}</p>
              ) : null}

              {opt.meta ? (
                <span className="mt-auto pt-1 text-xs font-semibold text-accent-text">
                  {opt.meta}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[0.8125rem] font-medium text-danger">
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
          "group flex w-full flex-col items-center justify-center gap-2.5 rounded-[var(--radius-md)] border-[1.5px] border-dashed bg-surface px-5 py-8 text-center transition-[border-color,background-color,box-shadow] duration-250",
          isDragging
            ? "border-accent bg-accent-soft shadow-[0_0_0_4px_var(--accent-soft)]"
            : "border-line-input hover:border-accent hover:bg-[color-mix(in_oklab,var(--accent-soft)_50%,var(--surface))]",
          activeError && "border-danger",
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent-text transition-transform duration-300 group-hover:-translate-y-0.5">
          <UploadIcon size={19} />
        </span>
        <span className="text-sm font-semibold text-text">{dropTitle}</span>
        <span className="text-[0.8125rem] text-faint">
          {dropHint ?? `Up to ${maxFiles} files · ${maxSizeMb} MB max each`}
        </span>
      </button>

      {fileList.length > 0 ? (
        <ul aria-live="polite" className="mt-1 flex flex-col gap-2">
          {fileList.map((file, idx) => (
            <li
              key={`${file.name}-${file.size}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-[12px] border border-line-strong bg-surface px-3.5 py-2.5 text-[0.8125rem] shadow-[var(--shadow-xs)]"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-text">
                <FileIcon size={15} className="text-accent-text" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 font-mono text-[11px] text-faint tabular-nums">
                  {formatBytes(file.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={removeLabel(file.name)}
                onClick={() => removeAt(idx)}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-accent-text"
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
