/**
 * WebCrypto utilities for Quick Access encryption/decryption
 * Uses PBKDF2 + AES-GCM for secure client-side session storage
 */

export interface EncryptedData {
  iv: string;           // base64 IV for AES-GCM
  salt: string;         // base64 salt for PBKDF2  
  ciphertext: string;   // base64 encrypted data
}

export interface SessionPayload {
  refresh_token: string;
  access_token?: string;
  provider: 'supabase';
  user_id: string;
  expires_at?: number;
}

/**
 * Derives an AES-GCM key from PIN using PBKDF2
 */
export async function deriveKey(pin: string, saltB64: string): Promise<CryptoKey> {
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const encoder = new TextEncoder();
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts session data with PIN-derived key
 */
export async function encryptSession(pin: string, payload: SessionPayload): Promise<EncryptedData> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const key = await deriveKey(pin, btoa(String.fromCharCode(...salt)));
  const data = new TextEncoder().encode(JSON.stringify(payload));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return {
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
  };
}

/**
 * Decrypts session data with PIN-derived key
 */
export async function decryptSession(pin: string, encrypted: EncryptedData): Promise<SessionPayload> {
  const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encrypted.ciphertext), c => c.charCodeAt(0));
  
  const key = await deriveKey(pin, encrypted.salt);
  
  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    const jsonString = new TextDecoder().decode(new Uint8Array(decryptedData));
    return JSON.parse(jsonString) as SessionPayload;
  } catch (error) {
    throw new Error('Failed to decrypt session - invalid PIN or corrupted data');
  }
}

/**
 * Validates PIN format (4-8 digits)
 */
export function validatePin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin);
}

/**
 * Validates numeric ID format (3-9 digits)
 */
export function validateNumericId(numericId: string): boolean {
  return /^\d{3,9}$/.test(numericId);
}