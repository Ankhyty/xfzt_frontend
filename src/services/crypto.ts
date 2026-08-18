/**
 * Calculate SHA-256 hash of a File, Blob or ArrayBuffer using browser native Web Crypto API
 */
export async function calculateSha256(data: File | Blob | ArrayBuffer | string): Promise<string> {
  let buffer: ArrayBuffer
  
  if (typeof data === 'string') {
    const encoder = new TextEncoder()
    buffer = encoder.encode(data).buffer as ArrayBuffer
  } else if (data instanceof ArrayBuffer) {
    buffer = data
  } else {
    buffer = await data.arrayBuffer()
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
