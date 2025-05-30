'use strict';

// ! S5 web proxy service worker (version 11)

// ! WASM bindings (generated) START
let wasm;

const cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * @param {Uint8Array} key
 * @param {Uint8Array} nonce
 * @param {Uint8Array} ciphertext
 * @returns {Uint8Array}
 */
function decrypt_xchacha20poly1305(key, nonce, ciphertext) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(nonce, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(ciphertext, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    wasm.decrypt_xchacha20poly1305(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var v3 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return v3;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
function hash_blake3(input) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.hash_blake3(retptr, ptr0, len0);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var v1 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return v1;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @param {Uint8Array} chunk_bytes
 * @param {bigint} offset
 * @param {Uint8Array} bao_outboard_bytes
 * @param {Uint8Array} blake3_hash
 * @returns {number}
 */
function verify_integrity(
  chunk_bytes,
  offset,
  bao_outboard_bytes,
  blake3_hash,
) {
  const ptr0 = passArray8ToWasm0(chunk_bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(bao_outboard_bytes, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(blake3_hash, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ret = wasm.verify_integrity(ptr0, len0, offset, ptr1, len1, ptr2, len2);
  return ret;
}

async function load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get('Content-Type') != 'application/wasm') {
          console.warn(
            '`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
            e,
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

function getImports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };

  return imports;
}

function initMemory(imports, maybe_memory) {}

function finalizeInit(instance, module) {
  wasm = instance.exports;
  init.__wbindgen_wasm_module = module;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;

  return wasm;
}

function initSync(module) {
  const imports = getImports();

  initMemory(imports);

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }

  const instance = new WebAssembly.Instance(module, imports);

  return finalizeInit(instance, module);
}

async function init(input) {
  if (typeof input === 'undefined') {
    input = new URL('rust_lib.wasm', self.location.origin);
  }
  const imports = getImports();

  if (
    typeof input === 'string' ||
    (typeof Request === 'function' && input instanceof Request) ||
    (typeof URL === 'function' && input instanceof URL)
  ) {
    input = fetch(input);
  }

  initMemory(imports);

  const { instance, module } = await load(await input, imports);

  return finalizeInit(instance, module);
}
// ! WASM bindings (generated) END

let availableDirectoryFiles = {};
let chunkCache = {};
let downloadingChunkLock = {};

function _base64ToUint8Array(base64) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

let streamingUrlCache = {};

async function getStreamingLocation(hash, types) {
  let val = streamingUrlCache[hash];
  if (val !== undefined) {
    return val;
  }

  // TODO Expiry

  console.debug(
    'fetch',
    'https://s5.cx/api/locations/' + hash + '?types=' + types,
  );
  const res = await fetch(
    'https://s5.cx/api/locations/' + hash + '?types=' + types,
  );
  const parts = (await res.json())['locations'][0]['parts'];

  streamingUrlCache[hash] = parts;

  return parts;
}

// ! Default cache limit: ~ 512 MB
async function runCacheCleaner(cache, keys) {
  let additionalKeys = await cache.keys();

  for (const akeyRaw of additionalKeys) {
    const akey = new URL(akeyRaw.url).pathname.substr(1);
    if (!keys.includes(akey)) {
      keys.unshift(akey);
    }
  }
  console.debug('CacheCleaner', 'length', keys.length);
  while (keys.length > 2048) {
    let key = keys.shift();
    cache.delete(key);
    console.debug('CacheCleaner', 'delete', key);
  }
}

let chunkCacheKeys = [];
let smallFileCacheKeys = [];

let bao_outboard_bytes_cache = {};

function equal(buf1, buf2) {
  if (buf1.byteLength != buf2.byteLength) return false;

  for (var i = 0; i != buf1.byteLength; i++) {
    if (buf1[i] != buf2[i]) return false;
  }
  return true;
}

const nonceBytes = 24;

function numberToArrayBuffer(value) {
  const view = new DataView(new ArrayBuffer(nonceBytes));
  for (var index = nonceBytes - 1; index >= 0; --index) {
    view.setUint8(nonceBytes - 1 - index, value % 256);
    value = value >> 8;
  }
  return view.buffer;
}

function hashToBase64UrlNoPadding(hashBytes) {
  return btoa(String.fromCharCode.apply(null, hashBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=/g, '');
}

function safeDivision(start, chunkSize) {
  const startN = BigInt(start);
  const chunkSizeN = BigInt(chunkSize);
  return Number((startN - (startN % chunkSizeN)) / chunkSizeN);
}

// ============= START OF REPLACEMENT CODE =============
// Replace the entire openRead function and add these helper functions

// Simplified openRead function with better error handling and state management
function openRead(cid, start, end, totalSize, limit, encryptionMetadata) {
  console.debug('openRead', {
    cid,
    start,
    end,
    totalSize,
    limit,
    isEncrypted: !!encryptionMetadata,
  });

  const isEncrypted = encryptionMetadata !== undefined;
  const chunkSize = encryptionMetadata?.chunkSize || 262144;

  const hashBytes = _base64ToUint8Array(
    cid.substring(1).replace(/-/g, '+').replace(/_/g, '/'),
  ).slice(1, 34);

  const hash_b64 = hashToBase64UrlNoPadding(
    isEncrypted ? encryptionMetadata.hash : hashBytes,
  );

  // For small files, handle them separately
  if (totalSize <= chunkSize && !isEncrypted) {
    return handleSmallFile(cid, hash_b64, hashBytes, start, end);
  }

  return new ReadableStream({
    async start(controller) {
      const streamState = {
        currentPosition: start,
        targetEnd: end,
        downloadedData: new Uint8Array(),
        isDownloading: false,
        httpReader: null,
        abortController: new AbortController(),
      };

      try {
        await streamLargeFile(controller, streamState, {
          cid,
          hash_b64,
          hashBytes,
          chunkSize,
          totalSize,
          isEncrypted,
          encryptionMetadata,
          limit,
        });
      } catch (error) {
        console.error('openRead error:', error);
        controller.error(error);
      } finally {
        // Cleanup
        streamState.abortController.abort();
        if (streamState.httpReader) {
          await streamState.httpReader.cancel();
        }
      }
    },
  });
}

async function handleSmallFile(cid, hash_b64, hashBytes, start, end) {
  return new ReadableStream({
    async start(controller) {
      try {
        const s5Cache = await caches.open('s5-small-files');

        // Check cache first
        const cachedResponse = await s5Cache.match(cid);
        if (cachedResponse) {
          const bytes = new Uint8Array(await cachedResponse.arrayBuffer());
          controller.enqueue(bytes.slice(start, end));
          controller.close();
          return;
        }

        // Download file
        const parts = await getStreamingLocation(hash_b64, '3,5');
        const response = await fetch(parts[0]);
        const bytes = new Uint8Array(await response.arrayBuffer());

        // Verify integrity
        const bytes_b3_hash = hash_blake3(bytes);
        if (!equal(hashBytes.slice(1), bytes_b3_hash)) {
          throw new Error('File integrity check failed (BLAKE3)');
        }

        // Cache and serve
        await s5Cache.put(cid, new Response(bytes));
        controller.enqueue(bytes.slice(start, end));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

async function streamLargeFile(controller, state, params) {
  const {
    cid,
    hash_b64,
    hashBytes,
    chunkSize,
    totalSize,
    isEncrypted,
    encryptionMetadata,
    limit,
  } = params;

  const s5Cache = await caches.open(
    isEncrypted ? 's5-large-files-encrypted' : 's5-large-files',
  );

  // Load BAO outboard bytes if not encrypted
  let baoOutboardBytes;
  if (!isEncrypted) {
    baoOutboardBytes = await loadBaoOutboardBytes(hash_b64);
  }

  // Apply limit for video streaming
  if (
    limit &&
    !isEncrypted &&
    state.targetEnd - state.currentPosition > chunkSize * 64
  ) {
    state.targetEnd = state.currentPosition + chunkSize * 64;
  }

  while (state.currentPosition < state.targetEnd) {
    if (state.abortController.signal.aborted) break;

    const chunk = Math.floor(state.currentPosition / chunkSize);
    const offset = state.currentPosition % chunkSize;
    const chunkCacheKey = `0/${hash_b64}/${chunk}`;

    try {
      // Try to get from cache
      const cachedChunk = await getCachedChunk(s5Cache, chunkCacheKey);

      if (cachedChunk) {
        const bytesToSend = sliceChunkForRange(
          cachedChunk,
          offset,
          state.currentPosition,
          state.targetEnd,
          chunkSize,
        );
        controller.enqueue(bytesToSend);
        state.currentPosition += bytesToSend.length;
        continue;
      }

      // Download chunk(s)
      await downloadAndProcessChunk(controller, state, s5Cache, {
        chunk,
        offset,
        chunkCacheKey,
        hash_b64,
        hashBytes,
        chunkSize,
        totalSize,
        isEncrypted,
        encryptionMetadata,
        baoOutboardBytes,
      });
    } catch (error) {
      console.error(`Error processing chunk ${chunk}:`, error);
      throw error;
    }
  }

  controller.close();
}

async function getCachedChunk(cache, key) {
  const response = await cache.match(key);
  if (!response) return null;

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length === 0) {
    await cache.delete(key);
    return null;
  }

  return bytes;
}

async function downloadAndProcessChunk(controller, state, cache, params) {
  const {
    chunk,
    offset,
    chunkCacheKey,
    hash_b64,
    hashBytes,
    chunkSize,
    totalSize,
    isEncrypted,
    encryptionMetadata,
    baoOutboardBytes,
  } = params;

  // Check if another request is already downloading this chunk
  const lockKey = chunkCacheKey;
  if (downloadingChunkLock[lockKey]) {
    await waitForChunkDownload(lockKey, cache, chunkCacheKey);
    const cachedChunk = await getCachedChunk(cache, chunkCacheKey);
    if (cachedChunk) {
      const bytesToSend = sliceChunkForRange(
        cachedChunk,
        offset,
        state.currentPosition,
        state.targetEnd,
        chunkSize,
      );
      controller.enqueue(bytesToSend);
      state.currentPosition += bytesToSend.length;
      return;
    }
  }

  // Lock and download
  downloadingChunkLock[lockKey] = true;

  try {
    const parts = await getStreamingLocation(
      hash_b64,
      isEncrypted ? '3,5' : '5',
    );
    const url = parts[0];

    // Calculate download range
    const startByte = chunk * chunkSize;
    const encStartByte = isEncrypted ? chunk * (chunkSize + 16) : startByte;
    const encChunkSize = isEncrypted ? chunkSize + 16 : chunkSize;

    // Download with retry logic
    let chunkData = await downloadChunkWithRetry(
      url,
      encStartByte,
      encChunkSize,
      totalSize,
      state.abortController,
    );

    // Process chunk (decrypt if needed)
    if (isEncrypted) {
      chunkData = await decryptChunk(
        chunkData,
        chunk,
        encryptionMetadata,
        totalSize,
        startByte,
      );
    } else {
      // Verify integrity
      const integrityResult = verify_integrity(
        chunkData,
        BigInt(startByte),
        baoOutboardBytes,
        hashBytes.slice(1),
      );
      if (integrityResult !== 42) {
        throw new Error('Chunk integrity verification failed');
      }
    }

    // Cache the chunk
    await cache.put(chunkCacheKey, new Response(chunkData));
    chunkCacheKeys.push(chunkCacheKey);

    // Send to stream
    const bytesToSend = sliceChunkForRange(
      chunkData,
      offset,
      state.currentPosition,
      state.targetEnd,
      chunkSize,
    );
    controller.enqueue(bytesToSend);
    state.currentPosition += bytesToSend.length;
  } finally {
    delete downloadingChunkLock[lockKey];
  }
}

async function downloadChunkWithRetry(
  url,
  startByte,
  chunkSize,
  totalSize,
  abortController,
  maxRetries = 3,
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const isLastChunk = startByte + chunkSize > totalSize;
      const rangeEnd = isLastChunk ? '' : startByte + chunkSize - 1;
      const rangeHeader = `bytes=${startByte}-${rangeEnd}`;

      const response = await fetch(url, {
        headers: { Range: rangeHeader },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
      console.error(`Download attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries - 1) throw error;
      if (abortController.signal.aborted) throw new Error('Download aborted');

      // Wait before retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    }
  }
}

async function decryptChunk(
  encryptedData,
  chunkIndex,
  encryptionMetadata,
  totalSize,
  startByte,
) {
  const nonce = new Uint8Array(numberToArrayBuffer(chunkIndex));
  let decrypted = decrypt_xchacha20poly1305(
    encryptionMetadata.key,
    nonce,
    encryptedData,
  );

  // Handle padding for last chunk
  const isLastChunk = startByte + encryptionMetadata.chunkSize > totalSize;
  if (isLastChunk && encryptionMetadata.padding > 0) {
    decrypted = decrypted.slice(
      0,
      decrypted.length - encryptionMetadata.padding,
    );
  }

  if (decrypted.length === 0) {
    throw new Error('Decrypted chunk is empty');
  }

  return decrypted;
}

async function loadBaoOutboardBytes(hash_b64) {
  const parts = await getStreamingLocation(hash_b64, '5');
  const baoUrl = parts[1] || `${parts[0]}.obao`;

  if (bao_outboard_bytes_cache[baoUrl]) {
    return bao_outboard_bytes_cache[baoUrl];
  }

  const response = await fetch(baoUrl);
  const bytes = new Uint8Array(await response.arrayBuffer());
  bao_outboard_bytes_cache[baoUrl] = bytes;
  return bytes;
}

async function waitForChunkDownload(lockKey, cache, cacheKey, timeout = 30000) {
  const startTime = Date.now();

  while (downloadingChunkLock[lockKey]) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for chunk download');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

function sliceChunkForRange(
  chunkData,
  offset,
  currentPos,
  targetEnd,
  chunkSize,
) {
  const chunkEnd = currentPos - offset + chunkData.length;

  if (chunkEnd > targetEnd) {
    return chunkData.slice(offset, offset + (targetEnd - currentPos));
  } else {
    return offset > 0 ? chunkData.slice(offset) : chunkData;
  }
}

// Add request timeout handling
function addTimeoutToFetch() {
  const originalFetch = self.fetch;

  self.fetch = function (url, options = {}) {
    const timeout = options.timeout || 30000; // 30 second default
    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return originalFetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  };
}

// Initialize timeout handling
addTimeoutToFetch();

// Monitor for network changes
function addConnectionMonitoring() {
  // Monitor for network changes that might affect downloads
  if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
      console.log(
        'Network connection changed:',
        navigator.connection.effectiveType,
      );
      // Clear any stuck download locks on network change
      Object.keys(downloadingChunkLock).forEach((key) => {
        if (downloadingChunkLock[key] === true) {
          console.warn('Clearing stuck download lock:', key);
          delete downloadingChunkLock[key];
        }
      });
    });
  }

  // Add periodic health check
  setInterval(() => {
    const now = Date.now();
    Object.keys(downloadingChunkLock).forEach((key) => {
      if (downloadingChunkLock[key] === true) {
        console.warn('Long-running download detected:', key);
      }
    });
  }, 10000);
}

// ============= END OF REPLACEMENT CODE =============

function decodeBase64(base64String) {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  var rawData = atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function decodeEndian(bytes) {
  let total = 0n;

  for (let i = 0; i < bytes.length; i++) {
    total += BigInt(bytes[i]) * 256n ** BigInt(i);
  }

  return Number(total);
}

// 5. Enhanced error handling for the respond function
async function respond(url, req) {
  console.log('🔍 SW: Request received:', url.pathname);

  try {
    if (url.pathname.startsWith('/s5/blob/')) {
      console.log('✅ SW: Processing S5 blob request');

      if (wasm === undefined) {
        console.log('⚡ SW: Initializing WASM...');
        await init();
        console.log('✅ SW: WASM initialized');
      }

      const fullCID = url.pathname.substr(9);
      let cid = fullCID.split('.')[0];

      console.log('🔍 SW: CID:', cid);

      if (!cid.startsWith('u')) {
        console.error('❌ SW: Invalid CID format:', cid);
        throw new Error('Invalid CID format');
      }

      let bytes = decodeBase64(cid.substr(1));
      let encryptionMetadata;

      // Handle encrypted files
      if (bytes[0] == 0xae) {
        console.log('🔒 SW: Encrypted file detected');
        if (bytes[1] != 0xa6) {
          throw new Error('Encryption algorithm not supported');
        }
        encryptionMetadata = {
          algorithm: bytes[1],
          chunkSize: Math.pow(2, bytes[2]),
          hash: bytes.subarray(3, 36),
          key: bytes.subarray(36, 68),
          padding: decodeEndian(bytes.subarray(68, 72)),
        };
        bytes = bytes.subarray(72);
        cid = 'u' + hashToBase64UrlNoPadding(bytes);
      }

      const totalSize = decodeEndian(bytes.subarray(34));
      console.log('📊 SW: File size:', totalSize, 'bytes');

      const urlParams = new URLSearchParams(url.search);
      const mediaType = urlParams.get('mediaType') || 'video/mp4'; // Default to video/mp4

      console.log('🎬 SW: Media type:', mediaType);

      let contentDisposition = 'inline';
      if (urlParams.get('filename')) {
        contentDisposition =
          'attachment; filename="' + urlParams.get('filename') + '"';
      }

      const resOpt = {
        headers: {
          'Content-Type': mediaType,
          'Content-Disposition': contentDisposition,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000',
        },
      };

      let start = 0;
      let end = totalSize;

      const range = req.headers.get('range');
      if (range) {
        console.log('📍 SW: Range request:', range);
        const m = range.match(/bytes=(\d+)-(\d*)/);
        if (m) {
          start = +m[1];
          end = m[2] ? +m[2] + 1 : totalSize;

          resOpt.status = 206;
          resOpt.headers['Content-Range'] =
            `bytes ${start}-${end - 1}/${totalSize}`;

          console.log(
            '📍 SW: Serving range:',
            start,
            '-',
            end - 1,
            '/',
            totalSize,
          );
        }
      } else {
        console.log('📍 SW: Serving entire file:', totalSize, 'bytes');
      }

      resOpt.headers['Content-Length'] = end - start;

      console.log('🚀 SW: Creating response stream...');

      const stream = openRead(
        cid,
        start,
        end,
        totalSize,
        mediaType.startsWith('video/'),
        encryptionMetadata,
      );

      console.log('✅ SW: Response created successfully');
      return new Response(stream, resOpt);
    }

    console.log('❌ SW: Not an S5 blob request');
    return;
  } catch (error) {
    console.error('💥 SW: Error in respond function:', error);
    return new Response(`Service Worker Error: ${error.message}`, {
      status: 500,
    });
  }
}

addConnectionMonitoring();

onfetch = (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (url.origin !== location.origin) {
    return;
  }

  if (url.pathname.startsWith('/s5/blob/')) {
    e.respondWith(respond(url, req));
    return;
  }
  return;

  // ! used for web apps
  /*  if (availableDirectoryFiles[url.pathname] === undefined) {
     return
   }
 
   e.respondWith(respond(url, req)) */
};

// TODO Migrate to S5 encryption
onmessage = (e) => {
  /*   console.log('onmessage', e);
  
    const path = e.data['path'];
    const directoryFile = e.data['file'];
  
    if (e.data['ciphertext'] !== undefined) {
      console.log(e.data);
  
      const secretKey =
        _base64ToUint8Array(e.data['key'].replace(/-/g, '+')
          .replace(/_/g, '/'));
  
      const ciphertext =
        _base64ToUint8Array(e.data['ciphertext'].replace(/-/g, '+')
          .replace(/_/g, '/'));
  
  
      let bytes = sodium.crypto_secretbox_open_easy(ciphertext, new Uint8Array(24), secretKey);
  
      console.log(bytes);
      availableDirectoryFiles = JSON.parse(new TextDecoder().decode(bytes));
      availableDirectoryFiles['/'] = availableDirectoryFiles['/index.html'];
      availableDirectoryFiles[''] = availableDirectoryFiles['/index.html'];
  
      e.source.postMessage({ 'success': true })
  
    } else {
      if (availableDirectoryFiles[path] === undefined) {
        availableDirectoryFiles[path] = directoryFile;
        e.source.postMessage({ 'success': true })
      }
    } */
};

onactivate = () => {
  clients.claim();
};
