import { json, error } from "@/lib/api-response";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;

  if (!clientId) {
    return error("GitHub OAuth is not configured. Set GITHUB_CLIENT_ID.", 503);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl || "",
    scope: "read:user,user:email,repo,workflow",
    allow_signup: "true",
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return json({ url: githubAuthUrl });
}
