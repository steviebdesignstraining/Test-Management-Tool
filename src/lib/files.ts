import { basename } from "path";

/** Strip directories and unsafe characters so a client filename can never escape the upload dir. */
export function safeFileName(name: string): string {
  const base = basename(String(name).replace(/\\/g, "/"));
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "").slice(0, 100);
  return cleaned || "file";
}
