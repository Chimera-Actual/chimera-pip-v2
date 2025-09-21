// Tests for AES-GCM crypto utilities
import { assertEquals, assertNotEquals, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { aesGcmEncrypt, aesGcmDecrypt, migrateLegacyKey, isLegacyEncryption } from "../_shared/crypto.ts";

Deno.test("AES-GCM encryption/decryption round trip", async () => {
  const plaintext = "my-secret-api-key-12345";
  const secret = "super-secret-kdf-key-for-testing-purposes";
  
  // Encrypt
  const encrypted = await aesGcmEncrypt(new TextEncoder().encode(plaintext), secret);
  
  // Verify structure
  assertEquals(encrypted.alg, "AES-GCM");
  assertNotEquals(encrypted.salt, "");
  assertNotEquals(encrypted.iv, "");
  assertNotEquals(encrypted.ct, "");
  
  // Decrypt
  const decrypted = await aesGcmDecrypt(encrypted, secret);
  assertEquals(decrypted, plaintext);
});

Deno.test("AES-GCM with different secrets fails", async () => {
  const plaintext = "my-secret-api-key";
  const secret1 = "secret-key-1";
  const secret2 = "secret-key-2";
  
  const encrypted = await aesGcmEncrypt(new TextEncoder().encode(plaintext), secret1);
  
  // Should fail with wrong secret
  await assertRejects(
    () => aesGcmDecrypt(encrypted, secret2),
    Error
  );
});

Deno.test("Legacy key migration", async () => {
  const originalKey = "my-legacy-api-key";
  const legacyEncrypted = btoa(originalKey); // Base64 encoding
  const secret = "migration-test-secret";
  
  // Test legacy detection
  const legacyRecord = { encrypted_key: legacyEncrypted };
  assertEquals(isLegacyEncryption(legacyRecord), true);
  
  const modernRecord = { 
    encrypted_key: "ct", 
    salt: "salt", 
    iv: "iv", 
    alg: "AES-GCM" 
  };
  assertEquals(isLegacyEncryption(modernRecord), false);
  
  // Test migration
  const migrated = await migrateLegacyKey(legacyEncrypted, secret);
  assertEquals(migrated.alg, "AES-GCM");
  
  // Verify migrated key can be decrypted
  const decrypted = await aesGcmDecrypt(migrated, secret);
  assertEquals(decrypted, originalKey);
});

Deno.test("Invalid legacy key migration fails", async () => {
  const invalidB64 = "not-valid-base64!@#";
  const secret = "test-secret";
  
  await assertRejects(
    () => migrateLegacyKey(invalidB64, secret),
    Error,
    "Failed to migrate legacy key"
  );
});