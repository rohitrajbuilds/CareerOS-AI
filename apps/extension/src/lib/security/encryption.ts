const PROFILE_ENCRYPTION_KEY_STORAGE = 'profileEncryptionKey';
const AES_ALGORITHM = 'AES-GCM';
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

type EncryptedEnvelope = {
  iv: string;
  cipherText: string;
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function createKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: AES_ALGORITHM,
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return bytesToBase64(new Uint8Array(raw));
}

async function importKey(rawKey: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    base64ToBytes(rawKey),
    {
      name: AES_ALGORITHM,
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

async function getStoredKeyMaterial(): Promise<string | null> {
  const result = await chrome.storage.local.get(PROFILE_ENCRYPTION_KEY_STORAGE);
  const key = result[PROFILE_ENCRYPTION_KEY_STORAGE];
  return typeof key === 'string' ? key : null;
}

async function persistKeyMaterial(rawKey: string): Promise<void> {
  await chrome.storage.local.set({
    [PROFILE_ENCRYPTION_KEY_STORAGE]: rawKey,
  });
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const existing = await getStoredKeyMaterial();
  if (existing) {
    return importKey(existing);
  }

  const key = await createKey();
  await persistKeyMaterial(await exportKey(key));
  return key;
}

export async function encryptJson<TValue>(value: TValue): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = ENCODER.encode(JSON.stringify(value));
  const encrypted = await crypto.subtle.encrypt(
    {
      name: AES_ALGORITHM,
      iv,
    },
    key,
    payload,
  );

  const envelope: EncryptedEnvelope = {
    iv: bytesToBase64(iv),
    cipherText: bytesToBase64(new Uint8Array(encrypted)),
  };

  return JSON.stringify(envelope);
}

export async function decryptJson<TValue>(serializedEnvelope: string): Promise<TValue> {
  const key = await getEncryptionKey();
  const envelope = JSON.parse(serializedEnvelope) as EncryptedEnvelope;
  const decrypted = await crypto.subtle.decrypt(
    {
      name: AES_ALGORITHM,
      iv: base64ToBytes(envelope.iv),
    },
    key,
    base64ToBytes(envelope.cipherText),
  );

  return JSON.parse(DECODER.decode(decrypted)) as TValue;
}
