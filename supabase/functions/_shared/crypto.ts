// AES-GCM encryption utilities for secure API key storage

export interface EncryptedBundle {
  alg: 'AES-GCM';
  salt: string;
  iv: string;
  ct: string;
}

export async function deriveKey(secret: Uint8Array, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey('raw', secret, 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 200_000 },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function aesGcmEncrypt(plain: Uint8Array, secretString: string): Promise<EncryptedBundle> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(new TextEncoder().encode(secretString), salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  
  return {
    alg: 'AES-GCM',
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    ct: btoa(String.fromCharCode(...ct)),
  };
}

export async function aesGcmDecrypt(bundle: { salt: string; iv: string; ct: string }, secretString: string): Promise<string> {
  const salt = Uint8Array.from(atob(bundle.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(bundle.iv), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(bundle.ct), c => c.charCodeAt(0));
  const key = await deriveKey(new TextEncoder().encode(secretString), salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plain);
}

export function isLegacyEncryption(record: any): boolean {
  return !record.salt || !record.iv || !record.alg;
}

export async function migrateLegacyKey(legacyEncryptedKey: string, secretString: string): Promise<EncryptedBundle> {
  // Attempt to decode legacy base64 key
  try {
    const plainKey = atob(legacyEncryptedKey);
    return await aesGcmEncrypt(new TextEncoder().encode(plainKey), secretString);
  } catch (error) {
    throw new Error('Failed to migrate legacy key: invalid base64 encoding');
  }
}