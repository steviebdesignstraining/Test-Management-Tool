import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const ENCRYPTION_KEY_ENV = "ENCRYPTION_KEY";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer | null {
  const key = process.env[ENCRYPTION_KEY_ENV];
  if (!key) return null;
  return Buffer.from(key, "hex");
}

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return scryptAsync(password, salt, KEY_LENGTH) as Promise<Buffer>;
}

export interface EncryptedValue {
  iv: string;
  salt: string;
  ciphertext: string;
  tag: string;
}

export async function encrypt(plaintext: string): Promise<string | null> {
  const key = getEncryptionKey();
  if (!key) return null;

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(key.toString("hex"), salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, derivedKey, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    salt: salt.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    tag: tag.toString("hex"),
  });
}

export async function decrypt(encrypted: string): Promise<string | null> {
  const key = getEncryptionKey();
  if (!key) return null;

  let parsed: EncryptedValue;
  try {
    parsed = JSON.parse(encrypted);
  } catch {
    return null;
  }

  const derivedKey = await deriveKey(key.toString("hex"), Buffer.from(parsed.salt, "hex"));
  const decipher = createDecipheriv(
    ALGORITHM,
    derivedKey,
    Buffer.from(parsed.iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(parsed.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.ciphertext, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function isEncryptionConfigured(): boolean {
  return Boolean(getEncryptionKey());
}
