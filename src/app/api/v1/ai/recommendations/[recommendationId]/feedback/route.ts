export const dynamic = "error";
export const dynamicParams = false;
export async function generateStaticParams() {
  return [{ recommendationId: 'dummy' }];
}
import { json } from "@/lib/api-response";

export async function POST() {
  return json({ message: "Feedback recorded" });
}
