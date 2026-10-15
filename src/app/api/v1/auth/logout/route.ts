import { cookies } from "next/headers";
import { json } from "@/lib/api-response";

export async function POST() {
  (await cookies()).delete("session");
  return json({ ok: true });
}
