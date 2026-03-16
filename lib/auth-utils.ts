// Simple password utilities for preview mode
// In production, you would use proper bcrypt hashing

export function simpleHash(password: string): string {
  // This is NOT secure - only for preview/development
  // In production, use bcrypt or similar
  return Buffer.from(password).toString("base64")
}

export function simpleCompare(password: string, hash: string): boolean {
  // This is NOT secure - only for preview/development
  // In production, use bcrypt.compare
  return Buffer.from(password).toString("base64") === hash
}

export function generateTempPassword(): string {
  // Generate a simple temporary password
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
