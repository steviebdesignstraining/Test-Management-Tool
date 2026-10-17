export const dynamic = "force-dynamic";
import { json } from "@/lib/api-response";

export async function POST() {
  return json({ message: "Feedback recorded" });
}
