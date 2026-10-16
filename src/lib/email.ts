import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  const transport = getTransporter();
  if (!transport) {
    // Dev-mode fallback: log verification/password-reset links to console
    // when SMTP is not configured, so the flow can still be tested locally.
    if (options.subject.includes("Verify your email")) {
      const match = options.html.match(/href="([^"]*verify-email\/[^"]+)"/);
      const url = match ? match[1] : options.text?.match(/https?:\/\/[^\s]+/)?.[0];
      console.log("\n" + "=".repeat(60));
      console.log("[DEV EMAIL] Verification email (SMTP not configured):");
      console.log("  To:", options.to);
      console.log("  Subject:", options.subject);
      console.log("  Verify URL:", url);
      console.log("=".repeat(60) + "\n");
    } else if (options.subject.includes("Reset your password")) {
      const match = options.html.match(/href="([^"]*reset-password[^"]+)"/);
      const url = match ? match[1] : options.text?.match(/https?:\/\/[^\s]+/)?.[0];
      console.log("\n" + "=".repeat(60));
      console.log("[DEV EMAIL] Password reset email (SMTP not configured):");
      console.log("  To:", options.to);
      console.log("  Subject:", options.subject);
      console.log("  Reset URL:", url);
      console.log("=".repeat(60) + "\n");
    }
    return {
      ok: false,
      error: "SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.",
    };
  }

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM!,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

export function verificationEmailHtml(token: string, baseUrl: string): string {
  const verifyUrl = `${baseUrl}/verify-email/${token}`;
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Verify your email</title></head>
    <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1B2430; margin: 0; padding: 28px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #C9D0D8; border-radius: 6px; padding: 28px;">
        <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">Verify your email address</h1>
        <p style="margin: 0 0 20px; font-size: 14px; color: #5B6675;">
          Thanks for creating an account with TestHub. Click the button below to verify your email address.
        </p>
        <table style="margin: 0 0 24px;" width="100%">
          <tr>
            <td>
              <a href="${verifyUrl}" style="background: #1F6F8B; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 4px; display: inline-block;">Verify email</a>
            </td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 12px; color: #5B6675;">
          If you didn’t create this account, you can ignore this email. This link expires in 24 hours.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function verificationEmailText(token: string, baseUrl: string): string {
  const verifyUrl = `${baseUrl}/verify-email/${token}`;
  return `
Verify your email address

Thanks for creating an account with TestHub. Click the link below to verify your email address:

${verifyUrl}

If you didn’t create this account, you can ignore this email. This link expires in 24 hours.
  `;
}

export function resetPasswordEmailHtml(token: string, baseUrl: string): string {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Reset your password</title></head>
    <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #1B2430; margin: 0; padding: 28px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #C9D0D8; border-radius: 6px; padding: 28px;">
        <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">Reset your password</h1>
        <p style="margin: 0 0 20px; font-size: 14px; color: #5B6675;">
          You requested a password reset for your TestHub account. Click the button below to set a new password.
        </p>
        <table style="margin: 0 0 24px;" width="100%">
          <tr>
            <td>
              <a href="${resetUrl}" style="background: #1F6F8B; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 4px; display: inline-block;">Reset password</a>
            </td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 12px; color: #5B6675;">
          If you didn’t request this reset, you can ignore this email. This link expires in 1 hour.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function resetPasswordEmailText(token: string, baseUrl: string): string {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  return `
Reset your password

You requested a password reset for your TestHub account. Click the link below to set a new password:

${resetUrl}

If you didn’t request this reset, you can ignore this email. This link expires in 1 hour.
  `;
}
