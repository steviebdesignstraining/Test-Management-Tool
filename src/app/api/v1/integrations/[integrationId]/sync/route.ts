export const revalidate = 0;
export const dynamic = "force-dynamic";
import { json } from "@/lib/api-response";

export async function POST() {
  return json({ message: "Integration sync endpoint" });
}

export async function generateStaticParams() {
  return [];
}
