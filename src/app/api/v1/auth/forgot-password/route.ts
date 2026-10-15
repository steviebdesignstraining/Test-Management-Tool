import { json, error } from "@/lib/api-response";

export async function POST() {
  // Password reset flow - sends email (stubbed for now)
  return json({ ok: true, message: "If an account exists, a reset link has been sent." });
}
