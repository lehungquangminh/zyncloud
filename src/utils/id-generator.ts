const crypto = require('crypto');

/**
 * Generates a random string of specified length using only alphanumeric characters
 * @param length Length of the random string (not including prefix)
 * @returns Random string
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  
  return result;
}

/**
 * Generates a custom ID with the specified prefix from environment variables
 * @returns Generated ID string
 */
function generateCustomId(): string {
  const prefix = process.env.PREFIX_ID || 'zyncloud_';
  const randomPart = generateRandomString(8); // 8 characters after prefix
  return `${prefix}${randomPart}`;
}

module.exports = { generateCustomId };
