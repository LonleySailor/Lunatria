import * as crypto from 'crypto';

const PASSWORD_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a cryptographically-random alphanumeric password.
 * Used for auto-provisioned service accounts (e.g. Jellyfin users).
 */
export function generateRandomPassword(length = 16): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return result;
}
