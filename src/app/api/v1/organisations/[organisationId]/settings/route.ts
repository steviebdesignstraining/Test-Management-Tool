export const revalidate = 0;
export const dynamic = "force-dynamic";
import { json } from "@/lib/api-response";

export async function GET() {
  return json({});
}

export async function PATCH() {
  return json({});
}

export async function generateStaticParams() {
  return [];
}
