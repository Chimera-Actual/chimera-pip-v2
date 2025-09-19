/**
 * Tests for Quick Access crypto utilities
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { 
  encryptSession, 
  decryptSession, 
  validatePin, 
  validateNumericId,
  type SessionPayload 
} from '../crypto';

// Mock WebCrypto for Node.js test environment
const mockCrypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    importKey: vi.fn().mockResolvedValue({}),
    deriveKey: vi.fn().mockResolvedValue({}),
    encrypt: vi.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
    decrypt: vi.fn().mockImplementation(() => Promise.resolve(new ArrayBuffer(32))),
  }
};

beforeAll(() => {
  Object.defineProperty(global, 'crypto', {
    value: mockCrypto,
    writable: true
  });
  
  Object.defineProperty(global, 'TextEncoder', {
    value: class {
      encode(str: string) {
        return new Uint8Array(Buffer.from(str, 'utf8'));
      }
      encodeInto() { return { read: 0, written: 0 }; }
      get encoding() { return 'utf-8'; }
    },
    writable: true
  });
  
  Object.defineProperty(global, 'TextDecoder', {
    value: class {
      decode(buffer: ArrayBuffer | Uint8Array) {
        return Buffer.from(buffer).toString('utf8');
      }
      get encoding() { return 'utf-8'; }
      get fatal() { return false; }
      get ignoreBOM() { return false; }
    },
    writable: true
  });
  
  Object.defineProperty(global, 'atob', {
    value: (str: string) => Buffer.from(str, 'base64').toString('binary'),
    writable: true
  });
  
  Object.defineProperty(global, 'btoa', {
    value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
    writable: true
  });
});

describe('Quick Access Crypto', () => {
  describe('validatePin', () => {
    it('should accept valid PINs', () => {
      expect(validatePin('1234')).toBe(true);
      expect(validatePin('123456')).toBe(true);
      expect(validatePin('12345678')).toBe(true);
    });

    it('should reject invalid PINs', () => {
      expect(validatePin('123')).toBe(false); // too short
      expect(validatePin('123456789')).toBe(false); // too long
      expect(validatePin('12a4')).toBe(false); // contains letters
      expect(validatePin('12.4')).toBe(false); // contains special chars
      expect(validatePin('')).toBe(false); // empty
    });
  });

  describe('validateNumericId', () => {
    it('should accept valid numeric IDs', () => {
      expect(validateNumericId('123')).toBe(true);
      expect(validateNumericId('12345')).toBe(true);
      expect(validateNumericId('123456789')).toBe(true);
    });

    it('should reject invalid numeric IDs', () => {
      expect(validateNumericId('12')).toBe(false); // too short
      expect(validateNumericId('1234567890')).toBe(false); // too long
      expect(validateNumericId('12a')).toBe(false); // contains letters
      expect(validateNumericId('12-3')).toBe(false); // contains special chars
      expect(validateNumericId('')).toBe(false); // empty
    });
  });

  describe('encryptSession and decryptSession', () => {
    const mockSessionPayload: SessionPayload = {
      refresh_token: 'mock_refresh_token',
      access_token: 'mock_access_token',
      provider: 'supabase',
      user_id: 'user123',
      expires_at: 1234567890
    };

    it('should encrypt and decrypt session data successfully', async () => {
      const pin = '1234';
      
      // Mock successful encryption
      const mockEncrypted = {
        iv: 'mock_iv_base64',
        salt: 'mock_salt_base64',
        ciphertext: 'mock_ciphertext_base64'
      };

      // Mock the crypto operations to return predictable results
      const encryptSpy = vi.spyOn(mockCrypto.subtle, 'encrypt').mockResolvedValue(new ArrayBuffer(32));
      const decryptSpy = vi.spyOn(mockCrypto.subtle, 'decrypt').mockResolvedValue(
        new TextEncoder().encode(JSON.stringify(mockSessionPayload))
      );

      const encrypted = await encryptSession(pin, mockSessionPayload);
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted).toHaveProperty('ciphertext');

      const decrypted = await decryptSession(pin, encrypted);
      expect(decrypted).toEqual(mockSessionPayload);
    });

    it('should throw error on decrypt with wrong PIN', async () => {
      const pin = '1234';
      const wrongPin = '5678';
      
      const encrypted = await encryptSession(pin, mockSessionPayload);
      
      // Mock decrypt failure
      const decryptSpy = vi.spyOn(mockCrypto.subtle, 'decrypt').mockRejectedValue(new Error('Decrypt failed'));
      
      await expect(decryptSession(wrongPin, encrypted)).rejects.toThrow(
        'Failed to decrypt session - invalid PIN or corrupted data'
      );
    });

    it('should generate different IVs and salts for each encryption', async () => {
      const pin = '1234';
      
      const encrypted1 = await encryptSession(pin, mockSessionPayload);
      const encrypted2 = await encryptSession(pin, mockSessionPayload);
      
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });
  });
});