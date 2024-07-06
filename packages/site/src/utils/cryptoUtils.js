import CryptoJS from 'crypto-js'

export function encryptWithKey(data, key) {
  try {
    const dataString = JSON.stringify(data)
    const ciphertext = CryptoJS.AES.encrypt(dataString, key).toString()

    console.log('cryptoUtils: encryptWithKey: key', key)
    console.log('cryptoUtils: encryptWithKey: data', data)

    console.log('cryptoUtils: encryptWithKey: Encrypted Data:', ciphertext)
    return ciphertext
  } catch (error) {
    console.error('cryptoUtils: encryptWithKey: Encryption error:', error)
    return
  }
}

export function decryptWithKey(ciphertext, key) {
  try {
    console.log('cryptoUtils: decryptWithKey: ciphertext:', ciphertext)
    console.log('cryptoUtils: decryptWithKey: key', key)

    const bytes = CryptoJS.AES.decrypt(ciphertext, key)
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8)

    if (!decryptedText) {
      console.error(
        'Decryption resulted in an empty string. This often indicates a wrong key or corrupted ciphertext.'
      )
      return
    }

    const decryptedData = JSON.parse(decryptedText)
    console.log('cryptoUtils: Decrypted Data:', decryptedData)
    return decryptedData
  } catch (error) {
    console.error('cryptoUtils: Decryption failed:', error.toString())
    return
  }
}
