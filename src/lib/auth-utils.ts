import { authenticateRequest } from "@/lib/session";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return authenticateRequest();
}