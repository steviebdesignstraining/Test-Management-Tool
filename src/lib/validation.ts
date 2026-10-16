export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const FORBIDDEN_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^0-9A-Za-z]*)>+<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

export function sanitizeInput(value: string): string {
  if (typeof value !== "string") return "";
  let cleaned = value;
  for (const pattern of FORBIDDEN_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/[<>]/g, (match) =>
    match === "<" ? "&lt;" : "&gt;",
  );
}

export function validateField(value: string | undefined, rules: ValidationRule): ValidationResult {
  if (rules.required && (!value || value.trim().length === 0)) {
    return { valid: false, error: "This field is required" };
  }
  if (value === undefined) return { valid: true };
  if (rules.minLength && value.trim().length < rules.minLength) {
    return { valid: false, error: `Minimum ${rules.minLength} characters required` };
  }
  if (rules.maxLength && value.length > rules.maxLength) {
    return { valid: false, error: `Maximum ${rules.maxLength} characters allowed` };
  }
  if (rules.pattern && !rules.pattern.test(value.trim())) {
    return { valid: false, error: "Invalid format" };
  }
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) return { valid: false, error: customError };
  }
  return { valid: true };
}

export function validateEmail(value?: string): ValidationResult {
  return validateField(value, {
    required: true,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (val) => {
      if (val && val.toLowerCase().includes("..")) return "Email contains invalid consecutive dots";
    },
  });
}

export function validatePassword(value?: string): ValidationResult {
  return validateField(value, {
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (val) => {
      if (!val) return undefined;
      if (!/[A-Z]/.test(val)) return "Password must contain at least one uppercase letter";
      if (!/[a-z]/.test(val)) return "Password must contain at least one lowercase letter";
      if (!/\d/.test(val)) return "Password must contain at least one number";
    },
  });
}

export function validateTitle(value?: string): ValidationResult {
  return validateField(value, {
    required: true,
    minLength: 2,
    maxLength: 200,
  });
}

export function validateText(value?: string, maxLength = 2000): ValidationResult {
  return validateField(value, { maxLength });
}

export function validateKey(value?: string): ValidationResult {
  return validateField(value, {
    required: true,
    maxLength: 50,
    pattern: /^[A-Z0-9][A-Z0-9-]*$/i,
    custom: (val) => {
      if (val && val.startsWith("-")) return "Key must start with a letter or number";
    },
  });
}

export function validatePriority(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const valid = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  if (!valid.includes(value.toUpperCase())) {
    return { valid: false, error: `Priority must be one of: ${valid.join(", ")}` };
  }
  return { valid: true };
}

export function validateSeverity(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const valid = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  if (!valid.includes(value.toUpperCase())) {
    return { valid: false, error: `Severity must be one of: ${valid.join(", ")}` };
  }
  return { valid: true };
}

export function validateStatus(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const valid = ["DRAFT", "ACTIVE", "ARCHIVED", "PASSED", "FAILED", "BLOCKED", "SKIPPED", "NOT_RUN", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  if (!valid.includes(value.toUpperCase())) {
    return { valid: false, error: `Status must be one of: ${valid.join(", ")}` };
  }
  return { valid: true };
}

export function validateTestType(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const valid = [
    "FUNCTIONAL", "UI", "API", "DATABASE", "PERFORMANCE",
    "SECURITY", "ACCESSIBILITY", "FRONTEND", "BACKEND", "GHERKIN",
  ];
  if (!valid.includes(value.toUpperCase())) {
    return { valid: false, error: `Invalid test type` };
  }
  return { valid: true };
}

export function validateTestLevel(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const valid = ["UNIT", "INTEGRATION", "SYSTEM", "ACCEPTANCE"];
  if (!valid.includes(value.toUpperCase())) {
    return { valid: false, error: `Test level must be one of: ${valid.join(", ")}` };
  }
  return { valid: true };
}

export function validateAutomationStatus(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const valid = ["MANUAL", "AUTOMATED", "CANDIDATE", "NOT_SUITABLE"];
  if (!valid.includes(value.toUpperCase())) {
    return { valid: false, error: `Automation status must be one of: ${valid.join(", ")}` };
  }
  return { valid: true };
}

export function validateTestEnvironment(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const valid = ["DEVELOPMENT", "QA", "STAGING", "PRODUCTION"];
  if (!valid.includes(value.toUpperCase())) {
    return { valid: false, error: `Test environment must be one of: ${valid.join(", ")}` };
  }
  return { valid: true };
}

export const FIELD_LIMITS = {
  email: 254,
  password: 128,
  title: 200,
  key: 50,
  description: 2000,
  objective: 1000,
  preconditions: 2000,
  testData: 2000,
  gherkinText: 4000,
  component: 100,
  labels: 500,
  comment: 2000,
  search: 200,
} as const;

export const PROJECT_TYPES = [
  "WEB",
  "MOBILE",
  "API",
  "DATA",
  "PLATFORM",
  "AI",
  "OTHER",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_STATUSES = ["DRAFT", "ACTIVE", "ON_HOLD", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function validateProjectKey(value?: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: "Project key is required" };
  }
  const key = value.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]*$/.test(key)) {
    return { valid: false, error: "Key must start with a letter or number and contain only uppercase letters, numbers and hyphens" };
  }
  if (key.length > FIELD_LIMITS.key) {
    return { valid: false, error: `Maximum ${FIELD_LIMITS.key} characters allowed` };
  }
  return { valid: true };
}

export function validateProjectType(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const upper = value.toUpperCase();
  if (!PROJECT_TYPES.includes(upper as ProjectType)) {
    return { valid: false, error: `Project type must be one of: ${PROJECT_TYPES.join(", ")}` };
  }
  return { valid: true };
}

export function validateProjectStatus(value?: string): ValidationResult {
  if (!value) return { valid: true };
  const upper = value.toUpperCase();
  if (!PROJECT_STATUSES.includes(upper as ProjectStatus)) {
    return { valid: false, error: `Status must be one of: ${PROJECT_STATUSES.join(", ")}` };
  }
  return { valid: true };
}
