export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { error } from "@/lib/api-response";
import { createSession } from "@/lib/auth";
import { auditLog, getClientIp } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const ip = getClientIp(req);

  if (errorParam || !code) {
    return error(`GitHub OAuth failed: ${errorParam || "missing code"}`, 400);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;

  if (!clientId || !clientSecret) {
    return error("GitHub OAuth is not configured on the server.", 503);
  }

  // Exchange the authorization code for an access token.
  let tokenResponse: Response;
  try {
    tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl || "",
      }),
    });
  } catch {
    return error("Failed to contact GitHub.", 502);
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    return error(tokenData.error_description || "Failed to get access token.", 400);
  }

  const accessToken = tokenData.access_token;

  // Fetch the authenticated user's profile from GitHub.
  let userResponse: Response;
  try {
    userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "TestHub",
        Accept: "application/vnd.github+json",
      },
    });
  } catch {
    return error("Failed to fetch GitHub profile.", 502);
  }

  if (!userResponse.ok) {
    return error("Failed to authenticate with GitHub.", 401);
  }

  const githubUser = (await userResponse.json()) as {
    id: number;
    login: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  };

  // Fetch the user's primary email (covers cases where email is not public on profile).
  let githubEmail = githubUser.email;
  try {
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "TestHub",
        Accept: "application/vnd.github+json",
      },
    });
    if (emailResponse.ok) {
      const emails = (await emailResponse.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find((e) => e.primary && e.verified);
      if (primary) githubEmail = primary.email;
    }
  } catch {
    // Non-fatal; continue without email.
  }

  const githubId = String(githubUser.id);
  const githubUsername = githubUser.login;
  const name = githubUser.name || githubUsername;
  const email = githubEmail || `${githubUsername}@users.noreply.github.com`;
  const avatarUrl = githubUser.avatar_url || null;

  // Encrypt the GitHub access token before storing.
  const encryptedToken = await encrypt(accessToken);

  // Check if an account is already linked to this GitHub account.
  let user = await prisma.user.findUnique({ where: { githubId } });

  if (!user) {
    // Check if an account with the same email already exists.
    user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link the existing account to this GitHub account.
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId,
          githubUsername,
          githubAccessToken: encryptedToken ?? accessToken,
          githubEmail,
          avatarUrl,
          emailVerified: user.emailVerified || new Date(),
        },
      });
    } else {
      // Create a new TestHub account from the GitHub profile.
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: avatarUrl,
          githubId,
          githubUsername,
          githubAccessToken: encryptedToken ?? accessToken,
          githubEmail,
          avatarUrl,
          emailVerified: new Date(), // GitHub-verified email counts as verified
          role: "USER",
          passwordHash: null,
        },
      });
    }
  } else {
    // Refresh the stored GitHub access token and profile data for linked account.
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        githubAccessToken: encryptedToken ?? accessToken,
        githubEmail,
        avatarUrl,
        name: name || user.name,
        image: avatarUrl || user.image,
      },
    });
  }

  await createSession(user.id, user.role, true);

  await auditLog({
    userId: user.id,
    action: "USER.GITHUB_LOGIN",
    entity: "User",
    entityId: user.id,
    metadata: { githubUsername, email },
    ip,
  });

  // Redirect the browser to the dashboard after successful GitHub sign-in.
  return new Response(null, {
    status: 302,
    headers: { Location: "/overview" },
  });
}
