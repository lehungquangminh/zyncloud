import { PrismaClient, User, RefreshToken } from '@prisma/client';
import jwt from './jwt';

const prisma = new PrismaClient();

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class TokenService {
  private prisma: PrismaClient;
  // Create a new refresh token for a user
  async createRefreshToken(userId: string): Promise<string> {
    const token = jwt.generateRefreshToken();
    const expiresAt = jwt.calculateTokenExpiry(7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });

    return token;
  }

  // Rotate refresh token - revoke old one and create new one
  async rotateRefreshToken(oldToken: string): Promise<string | null> {
    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true }
    });

    if (!existingToken || existingToken.revokedAt || existingToken.expiresAt < new Date()) {
      return null;
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { revokedAt: new Date() }
    });

    // Create new token
    return this.createRefreshToken(existingToken.user.id);
  }

  // Generate new token pair (access + refresh)
  async generateTokenPair(user: User): Promise<TokenPair> {
    const accessToken = jwt.generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken
    };
  }

  // Revoke a refresh token
  async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { revokedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }

  // Revoke all refresh tokens for a user
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { 
        userId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  // Clean up expired and revoked tokens
  async cleanupTokens(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { lt: thirtyDaysAgo } }
        ]
      }
    });
  }
}

module.exports = new TokenService();
