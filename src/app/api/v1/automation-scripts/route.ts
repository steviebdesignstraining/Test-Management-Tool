import { json } from "@/lib/api-response";

export async function GET() {
  return json([]);
}

export async function POST() {
  return json({ message: "Automation script endpoint" }, 201);
}
