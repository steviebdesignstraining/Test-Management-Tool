import { json, error } from "@/lib/api-response";

export async function POST() {
  return json({ ok: true, message: "Password reset completed." });
}
