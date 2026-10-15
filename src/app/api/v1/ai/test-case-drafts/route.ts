import { json } from "@/lib/api-response";

export async function POST() {
  return json({ message: "AI test case draft endpoint" });
}
