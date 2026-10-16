"use client";

import { useEffect, useState } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className = "" }: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
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
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={onClose}
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-xl border border-[#C9D0D8] bg-white shadow-2xl transition-all duration-200 ${
          visible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-2"
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[#C9D0D8] px-5 py-4 bg-[#F5F7F9]">
            <h2 id="modal-title" className="text-lg font-semibold text-[#1B2430]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430] transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
