// lib/v1/user-settings/crypto.ts
// AES-256-GCM encryption for user API keys.
// Uses CORSAIR_KEK as the master key — same security model as Corsair credentials.
// Keys are encrypted at rest, decrypted only in server memory for the duration of an API call.

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;       // 96 bits — recommended for GCM
const TAG_LENGTH = 16;      // 128 bits
const KEY_LENGTH = 32;      // 256 bits

/**
 * Derive a 256-bit encryption key from the KEK string.
 * Uses SHA-256 to normalize any length KEK into exactly 32 bytes.
 */
function deriveKey(): Buffer {
  const kek = process.env.CORSAIR_KEK;
  if (!kek) throw new Error('CORSAIR_KEK is not set');
  return crypto.createHash('sha256').update(kek).digest();
}

/**
 * Encrypt a plaintext string.
 * Returns { ciphertext, iv, tag } — all base64 encoded.
 */
export function encrypt(plaintext: string): { ciphertext: string; iv: string; tag: string } {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

/**
 * Decrypt a ciphertext back to plaintext.
 * Throws if the key, IV, or tag don't match (tamper detection).
 */
export function decrypt(ciphertext: string, iv: string, tag: string): string {
  const key = deriveKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'base64'),
    { authTagLength: TAG_LENGTH },
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Mask an API key for display — shows first 8 and last 4 chars.
 * e.g., "sk-or-v1-abc123...xyz9"
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return key.slice(0, 8) + '••••••••' + key.slice(-4);
}
