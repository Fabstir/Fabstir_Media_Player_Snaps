const CID_TYPE_ENCRYPTED_LENGTH = 1;
const ENCRYPTION_ALGORITHM_LENGTH = 1;
const CHUNK_LENGTH_AS_POWEROF2_LENGTH = 1;
const ENCRYPTED_BLOB_HASH_LENGTH = 33;
const KEY_LENGTH = 32;
const PADDING_LENGTH = 4;
const ORIGINAL_CID_LENGTH = 37;

/**
 * Extracts the encryption key from an encrypted CID.
 * @param {string} encryptedCid - The encrypted CID to get the key from.
 * @returns {string} The encryption key from the CID.
 */
export function getKeyFromEncryptedCid(encryptedCid) {
  encryptedCid = removeS5Prefix(encryptedCid);
  const extensionIndex = encryptedCid.lastIndexOf('.');

  let cidWithoutExtension;
  if (extensionIndex !== -1) {
    cidWithoutExtension = encryptedCid.slice(0, extensionIndex);
  } else {
    cidWithoutExtension = encryptedCid;
  }
  console.log('getKeyFromEncryptedCid: encryptedCid = ', encryptedCid);
  console.log(
    'getKeyFromEncryptedCid: cidWithoutExtension = ',
    cidWithoutExtension,
  );

  cidWithoutExtension = cidWithoutExtension.slice(1);
  const cidBytes = convertBase64urlToBytes(cidWithoutExtension);
  const startIndex =
    CID_TYPE_ENCRYPTED_LENGTH +
    ENCRYPTION_ALGORITHM_LENGTH +
    CHUNK_LENGTH_AS_POWEROF2_LENGTH +
    ENCRYPTED_BLOB_HASH_LENGTH;

  const endIndex = startIndex + KEY_LENGTH;

  const selectedBytes = cidBytes.slice(startIndex, endIndex);

  const key = convertBytesToBase64url(selectedBytes);
  console.log('getKeyFromEncryptedCid: key = ', key);

  return key;
}

/**
 * Removes the encryption key from an encrypted CID.
 * @param {string} encryptedCid - The encrypted CID to remove the key from.
 * @returns {string} The CID with the encryption key removed.
 */
export function removeKeyFromEncryptedCid(encryptedCid) {
  encryptedCid = removeS5Prefix(encryptedCid);

  const extensionIndex = encryptedCid.lastIndexOf('.');
  const cidWithoutExtension =
    extensionIndex === -1
      ? encryptedCid
      : encryptedCid.slice(0, extensionIndex);

  // remove 'u' prefix as well
  const cidWithoutExtensionBytes = convertBase64urlToBytes(
    cidWithoutExtension.slice(1),
  );

  const part1 = cidWithoutExtensionBytes.slice(
    0,
    CID_TYPE_ENCRYPTED_LENGTH +
      ENCRYPTION_ALGORITHM_LENGTH +
      CHUNK_LENGTH_AS_POWEROF2_LENGTH +
      ENCRYPTED_BLOB_HASH_LENGTH,
  );
  const part2 = cidWithoutExtensionBytes.slice(part1.length + KEY_LENGTH);

  const combinedBytes = new Uint8Array(
    cidWithoutExtensionBytes.length - KEY_LENGTH,
  );
  combinedBytes.set(part1);
  combinedBytes.set(part2, part1.length);

  const cidWithoutKey = 'u' + convertBytesToBase64url(combinedBytes);
  return addS5Prefix(cidWithoutKey);
}

/**
 * Removes the extension from a filename.
 * @param {string} cid - The filename from which to remove the extension.
 * @returns {string} The filename without its extension.
 */
export function removeExtensionFromCid(cid) {
  const extensionIndex = cid.lastIndexOf('.');
  return extensionIndex === -1 ? cid : cid.slice(0, extensionIndex);
}

/**
 * Combines an encryption key with an encrypted CID.
 * @param {string} key - The encryption key to combine with the encrypted CID.
 * @param {string} encryptedCidWithoutKey - The encrypted CID without the encryption key.
 * @returns {string} The encrypted CID with the encryption key combined.
 */
export function combineKeytoEncryptedCid(key, encryptedCidWithoutKey) {
  encryptedCidWithoutKey = removeS5Prefix(encryptedCidWithoutKey);

  const extensionIndex = encryptedCidWithoutKey.lastIndexOf('.');
  const cidWithoutKeyAndExtension =
    extensionIndex === -1
      ? encryptedCidWithoutKey
      : encryptedCidWithoutKey.slice(0, extensionIndex);

  const encryptedCidWithoutKeyBytes = convertBase64urlToBytes(
    cidWithoutKeyAndExtension.slice(1),
  );

  const keyBytes = convertBase64urlToBytes(key);

  const combinedBytes = new Uint8Array(
    encryptedCidWithoutKeyBytes.length + keyBytes.length,
  );

  const part1 = encryptedCidWithoutKeyBytes.slice(
    0,
    CID_TYPE_ENCRYPTED_LENGTH +
      ENCRYPTION_ALGORITHM_LENGTH +
      CHUNK_LENGTH_AS_POWEROF2_LENGTH +
      ENCRYPTED_BLOB_HASH_LENGTH,
  );
  const part2 = encryptedCidWithoutKeyBytes.slice(part1.length);

  console.log('combineKeytoEncryptedCid: part1  = ', part1);
  console.log('combineKeytoEncryptedCid: part2  = ', part2);

  combinedBytes.set(part1);
  combinedBytes.set(keyBytes, part1.length);
  combinedBytes.set(part2, part1.length + keyBytes.length);

  const encryptedCid = `u` + convertBytesToBase64url(combinedBytes);
  return addS5Prefix(encryptedCid);
}

export function getBase64UrlEncryptedBlobHash(encryptedCid, fileSize) {
  encryptedCid = removeS5Prefix(encryptedCid);

  const extensionIndex = encryptedCid.lastIndexOf('.');

  let cidWithoutExtension;
  if (extensionIndex !== -1) {
    cidWithoutExtension = encryptedCid.slice(0, extensionIndex);
  } else {
    cidWithoutExtension = encryptedCid;
  }
  console.log('getBase64UrlEncryptedBlobHash: encryptedCid = ', encryptedCid);
  console.log(
    'getBase64UrlEncryptedBlobHash: cidWithoutExtension = ',
    cidWithoutExtension,
  );

  const fileSizeLength = numberOfBytes(fileSize);

  cidWithoutExtension = cidWithoutExtension.slice(1);
  const cidBytes = convertBase64urlToBytes(cidWithoutExtension);
  const startIndex = 3;
  const endIndex =
    cidBytes.length -
    KEY_LENGTH -
    PADDING_LENGTH -
    ORIGINAL_CID_LENGTH -
    fileSizeLength;
  const selectedBytes = cidBytes.slice(startIndex, endIndex);

  const key = convertBytesToBase64url(selectedBytes);
  console.log('getBase64UrlEncryptedBlobHash: key = ', key);

  return key;
}

export function convertBytesToBase64url(hashBytes) {
  const mHash = Buffer.from(hashBytes);

  // Convert the hash Buffer to a Base64 string
  const hashBase64 = mHash.toString('base64');

  // Make the Base64 string URL-safe
  const hashBase64url = hashBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace('=', '');

  return hashBase64url;
}

export function convertBase64urlToBytes2(base64String) {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  var rawData = atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function convertBase64urlToBytes(b64url) {
  // Convert the URL-safe Base64 string to a regular Base64 string
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');

  // Add missing padding
  while (b64.length % 4) {
    b64 += '=';
  }

  // Convert Base64 string to Buffer
  const buffer = Buffer.from(b64, 'base64');

  // Convert Buffer to Uint8Array
  const mHash = Uint8Array.from(buffer);

  return mHash;
}

// Function to remove 's5:// prefix' from a string. If the string is not prefixed with 's5://', the original string is returned.
export function removeS5Prefix(uri) {
  if (uri?.startsWith(process.env.NEXT_PUBLIC_S5_PREFIX)) {
    return uri.slice(process.env.NEXT_PUBLIC_S5_PREFIX.length);
  } else {
    return uri;
  }
}

export function addS5Prefix(uri) {
  if (uri && !uri.startsWith(process.env.NEXT_PUBLIC_S5_PREFIX)) {
    return process.env.NEXT_PUBLIC_S5_PREFIX + uri;
  } else {
    return uri;
  }
}
