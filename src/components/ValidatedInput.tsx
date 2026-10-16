"use client";

import { useState } from "react";
import { sanitizeInput } from "@/lib/validation";

interface ValidatedInputProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  showCounter?: boolean;
  className?: string;
  rows?: number;
  as?: "input" | "textarea";
  sanitize?: boolean;
}

export function ValidatedInput({
  label,
  name,
  type = "text",
  placeholder,
  maxLength,
  maxLengthMessage = "Character limit exceeded",
  initialValue = "",
  onChange,
  required = false,
  error: errorProp,
  showCounter = true,
  className = "",
  rows = 3,
  as = "input",
  sanitize = true,
}: ValidatedInputProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(errorProp || "");
  const charCount = value.length;
  const isOverLimit = maxLength && charCount > maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const processed = sanitize ? sanitizeInput(raw) : raw;
    let truncated = processed;
    if (maxLength && processed.length > maxLength) {
      truncated = processed.slice(0, maxLength);
      if (!error) {
        setError(maxLengthMessage);
      }
    } else {
      if (error && error === maxLengthMessage) {
        setError("");
      }
    }
    setValue(truncated);
    onChange?.(truncated);
  };

  const handleBlur = () => {
    if (required && !value.trim()) {
      setError("This field is required");
    } else if (isOverLimit) {
      setError(maxLengthMessage);
    } else if (error === maxLengthMessage) {
      setError("");
    }
  };

  const inputClasses = `input w-full ${error ? "border-[#8F2A20]" : "border-[#C9D0D8]"} ${className}`;
  const wrapperClasses = "space-y-1";

  const counterColor = isOverLimit
    ? "text-[#8F2A20] font-medium"
    : charCount > (maxLength ? maxLength * 0.8 : Infinity)
      ? "text-[#B8860B]"
      : "text-[#5B6675]";

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">
            {label}{required && " *"}
          </span>
          {showCounter && maxLength && (
            <span className={`text-xs ${counterColor}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </label>
      )}
      {as === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength ? maxLength + 50 : undefined}
          rows={rows}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={`${name}-error`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength ? maxLength + 50 : undefined}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={`${name}-error`}
        />
      )}
      {error && (
        <p id={`${name}-error`} className="text-xs text-[#8F2A20]">
          {error}
        </p>
      )}
    </div>
  );
}
