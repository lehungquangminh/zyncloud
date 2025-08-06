import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '@prisma/client';

export interface JWTUser {
  userId: string;
  email: string;
  role?: string;
}

// Constants
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days
const JWT_ALGORITHM = 'HS512';
const JWT_ISSUER = 'zyncloud-auth';
const JWT_AUDIENCE = 'zyncloud-api';

interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  iss?: string;
  aud?: string;
  jti?: string;
}

// Helper to generate random token
function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

// Generate access token
function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    jwtid: generateRandomToken(16) // Unique token ID
  });
}

// Generate refresh token
function generateRefreshToken(): string {
  return generateRandomToken(64); // 64 bytes = 128 chars hex string
}

// Verify access token
function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

// Calculate token expiry date
function calculateTokenExpiry(daysOverride?: number): Date {
  const days = daysOverride || parseInt(REFRESH_TOKEN_EXPIRY);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

module.exports = {
  generateRandomToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  calculateTokenExpiry,
  JWT_ALGORITHM,
  JWT_ISSUER,
  JWT_AUDIENCE,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
};
