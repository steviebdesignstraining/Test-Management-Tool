import { json } from "@/lib/api-response";

export async function GET() {
  return json({ status: "ok" });
}
