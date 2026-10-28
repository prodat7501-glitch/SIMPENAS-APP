/**
 * Pustaka TOTP (Time-based One-Time Password) RFC 6238
 * Menggunakan Web Crypto API murni (HMAC-SHA1 & Base32) tanpa ketergantungan eksternal
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Mengubah string Base32 menjadi Uint8Array
 */
export function base32Decode(base32: string): Uint8Array {
  const cleaned = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleaned.charAt(i));
    if (val === -1) {
      continue; // Lewati karakter ilegal
    }
    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Mengubah Uint8Array menjadi string Base32
 */
export function base32Encode(buffer: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Menghasilkan secret key Base32 secara acak (160-bit / 20 bytes = 32 karakter Base32)
 */
export function generateTotpSecret(byteLength = 20): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return base32Encode(bytes);
}

/**
 * Menghasilkan URL format otpauth:// untuk pemindaian QR Code pada Google Authenticator
 */
export function generateOtpAuthUrl(
  accountName: string,
  secret: string,
  issuer = "SIMPENAS KPU Kab. Gorontalo",
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Menghitung token TOTP 6 digit untuk waktu tertentu
 */
export async function generateTotpToken(
  secret: string,
  timestampMs = Date.now(),
  windowOffset = 0,
): Promise<string> {
  const epochSeconds = Math.floor(timestampMs / 1000);
  const timeStep = 30;
  const counter = Math.floor(epochSeconds / timeStep) + windowOffset;

  // Konversi counter ke buffer 8-byte big-endian
  const counterBuffer = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }

  const keyBytes = base32Decode(secret);
  const keyBuffer = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength,
  ) as ArrayBuffer;

  const counterRaw = counterBuffer.buffer.slice(
    counterBuffer.byteOffset,
    counterBuffer.byteOffset + counterBuffer.byteLength,
  ) as ArrayBuffer;

  // Gunakan Web Crypto API
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: { name: "SHA-1" } },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, counterRaw);
  const hash = new Uint8Array(signature);

  // Dynamic Truncation (RFC 4226 / 6238)
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Memvalidasi kode 6 digit Google Authenticator dengan toleransi waktu drift (±1 window = ±30 detik)
 */
export async function verifyTotpToken(
  secret: string,
  token: string,
  window = 1,
): Promise<boolean> {
  const sanitizedToken = String(token || "").trim().replace(/\s+/g, "");
  if (!sanitizedToken || sanitizedToken.length !== 6 || !/^\d{6}$/.test(sanitizedToken)) {
    return false;
  }

  const now = Date.now();
  for (let offset = -window; offset <= window; offset++) {
    try {
      const generated = await generateTotpToken(secret, now, offset);
      if (generated === sanitizedToken) {
        return true;
      }
    } catch (err) {
      console.error("Kesalahan verifikasi TOTP:", err);
    }
  }

  return false;
}
