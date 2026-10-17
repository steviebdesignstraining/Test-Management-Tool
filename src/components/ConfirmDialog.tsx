"use client";

import { useEffect, useRef, useState, useId } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  requireInput?: boolean;
  expectedInput?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  requireInput = false,
  expectedInput = "",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      setInputValue("");
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        setVisible(true);
        setTimeout(() => {
          dialogRef.current?.focus();
        }, 50);
      });
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 180);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  const canConfirm = !requireInput || inputValue === expectedInput;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full max-w-md overflow-auto rounded-xl border border-[#C9D0D8] bg-white shadow-2xl transition-all duration-200 ${
          visible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-2"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#C9D0D8] bg-[#F5F7F9]">
          <h2 id={titleId} className="text-lg font-semibold text-[#1B2430]">
            {title}
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-[#5B6675] whitespace-pre-line">{message}</p>
          {requireInput && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1B2430]">
                Type <strong>{expectedInput}</strong> to confirm
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-md border border-[#C9D0D8] bg-white px-3 py-2 text-sm text-[#1B2430] shadow-sm focus:border-[#1F6F8B] focus:outline-none focus:ring-2 focus:ring-[#1F6F8B]/20"
                autoFocus
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#C9D0D8] bg-white px-4 py-2 text-sm font-medium text-[#1B2430] shadow-sm hover:bg-[#F5F7F9] transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (canConfirm) {
                  onConfirm();
                }
              }}
              disabled={!canConfirm}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
                destructive
                  ? "bg-[#D64545] hover:bg-[#C93C3C] disabled:opacity-50"
                  : "bg-[#1F6F8B] hover:bg-[#1A5C75] disabled:opacity-50"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
