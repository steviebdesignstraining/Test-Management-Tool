"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastStyles: Record<ToastType, string> = {
  success: "bg-[#E3F2EA] text-[#14633E] border-[#14633E]/20",
  error: "bg-[#FBE7E4] text-[#8F2A20] border-[#8F2A20]/20",
  warning: "bg-[#FBEFD9] text-[#7A4600] border-[#7A4600]/20",
  info: "bg-[#E4F0F4] text-[#134F63] border-[#134F63]/20",
};

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export default function Toast({ message, type = "info", duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => setVisible(true), 10);
    const hideTimeout = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, duration);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-200 ${
        toastStyles[type]
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      role="alert"
      aria-live="polite"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
        {icons[type]}
      </span>
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 200);
        }}
        className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

let toastListener: ((toasts: ToastMessage[]) => void) | null = null;
let toasts: ToastMessage[] = [];

export function toast(message: string, type: ToastType = "info", duration?: number) {
  const id = Math.random().toString(36).substring(2);
  const newToast = { id, message, type, duration };
  toasts = [...toasts, newToast];
  toastListener?.(toasts);
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  toastListener?.(toasts);
}

export function clearToasts() {
  toasts = [];
  toastListener?.(toasts);
}

export function subscribeToToasts(listener: (toasts: ToastMessage[]) => void) {
  toastListener = listener;
  return () => {
    if (toastListener === listener) {
      toastListener = null;
    }
  };
}
