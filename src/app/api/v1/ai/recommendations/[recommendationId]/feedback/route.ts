export const dynamicParams = false;
export async function generateStaticParams() {
  return [];
}
export const dynamic = 'error';
import { json } from "@/lib/api-response";

export async function POST() {
  return json({ message: "Feedback recorded" });
}
