"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { buttonClass, paneClass } from "./styles";

type Notice = (message: string, error?: boolean) => void;
const ToastContext = createContext<Notice>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<{ message: string; error?: boolean }>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function notify(message: string, error?: boolean) {
    clearTimeout(timer.current);
    setNotice({ message, error });
    if (!error) timer.current = setTimeout(() => setNotice(undefined), 4500);
  }
  return <ToastContext.Provider value={notify}>
    {children}
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end">
      <div aria-live="polite" aria-atomic="true">
        {notice && <div className={`${paneClass} pointer-events-auto flex max-w-md items-center gap-3 shadow-xl ${notice.error ? "border-danger" : "border-lava-300/50"}`}>
          <p className="text-sm">{notice.message}</p>
          <button aria-label="Dismiss notification" type="button" className={buttonClass} onClick={() => setNotice(undefined)}><X size={16} /></button>
        </div>}
      </div>
    </div>
  </ToastContext.Provider>;
}
