"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircleIcon, CheckCircleIcon, CloseIcon, InfoCircleIcon } from "./Icons";
import { cn } from "./cn";

export type ToastTone = "default" | "lava" | "success" | "danger";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Auto-dismiss duration in ms (0 disables auto-dismiss). Default 4600. */
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastInput, "title" | "tone" | "duration">> {
  id: string;
  description?: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => "",
  dismiss: () => {},
  clear: () => {},
});

const TONE_META: Record<
  ToastTone,
  { border: string; iconColor: string; barStyle: string; icon: typeof InfoCircleIcon }
> = {
  default: {
    border: "border-line",
    iconColor: "text-code-blue",
    barStyle: "var(--line-strong)",
    icon: InfoCircleIcon,
  },
  lava: {
    border: "border-line-lava-strong",
    iconColor: "text-accent-text",
    barStyle: "var(--gradient-lava)",
    icon: InfoCircleIcon,
  },
  success: {
    border: "border-success/35",
    iconColor: "text-success",
    barStyle: "var(--success)",
    icon: CheckCircleIcon,
  },
  danger: {
    border: "border-danger/45",
    iconColor: "text-danger",
    barStyle: "var(--danger)",
    icon: AlertCircleIcon,
  },
};

function ToastCard({
  item,
  closeLabel,
  onDismiss,
}: {
  item: ToastItem;
  closeLabel: string;
  onDismiss: (id: string) => void;
}) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const remainingRef = useRef(item.duration);
  const startedAtRef = useRef(0);

  useEffect(() => {
    if (item.duration <= 0) return;

    if (paused) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      remainingRef.current = Math.max(
        350,
        remainingRef.current - (Date.now() - startedAtRef.current),
      );
      return;
    }

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      onDismiss(item.id);
    }, remainingRef.current);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [item.duration, item.id, onDismiss, paused]);

  const meta = TONE_META[item.tone];
  const Icon = meta.icon;

  return (
    <div
      role={item.tone === "danger" ? "alert" : "status"}
      aria-live={item.tone === "danger" ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-[var(--radius-md)] border bg-surface px-4 py-3.5 shadow-[var(--shadow-lift)]",
        meta.border,
      )}
    >
      <Icon size={17} className={cn("mt-0.5 shrink-0", meta.iconColor)} />

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-text">{item.title}</p>
        {item.description ? <p className="text-xs leading-relaxed text-muted">{item.description}</p> : null}
      </div>

      <button
        type="button"
        aria-label={closeLabel}
        onClick={() => onDismiss(item.id)}
        data-cursor="pointer"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-2 hover:text-text"
      >
        <CloseIcon size={13} />
      </button>

      {item.duration > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left rtl:origin-right"
          style={{
            background: meta.barStyle,
            animation: `toast-shrink ${item.duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      ) : null}
    </div>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
  closeLabel?: string;
}

export function ToastProvider({ children, closeLabel = "Close" }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seqRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = `toast-${++seqRef.current}`;
    const entry: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      tone: input.tone ?? "default",
      duration: input.duration ?? 4600,
    };
    setItems((prev) => [...prev.slice(-3), entry]);
    return id;
  }, []);

  const value = useMemo(() => ({ toast, dismiss, clear }), [toast, dismiss, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-5 end-5 z-[var(--z-toast)] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2.5"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} closeLabel={closeLabel} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
