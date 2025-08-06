const express = require('express');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { generateCustomId } = require('../utils/id-generator');

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends Express.Request {
  query: { code?: string };
  cookies?: { refreshToken?: string };
}

interface AuthResponse extends Express.Response {
  redirect(url: string): void;
  cookie(name: string, value: string, options: any): void;
  clearCookie(name: string, options?: any): void;
  json(body: any): AuthResponse;
  status(code: number): AuthResponse;
}

// Discord Auth
router.get('/discord', (_req: AuthRequest, res: AuthResponse) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI is not set');
  }

  const scope = 'identify email';
  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}`;

  res.redirect(url);
});

/**
 * @param {AuthRequest} req
 * @param {Response} res
 */
router.get('/callback', async (req: AuthRequest, res: AuthResponse) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
      throw new Error('Discord configuration missing');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: DISCORD_REDIRECT_URI
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Discord token error:', error);
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error('No access token received');
    }

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error('Discord user info error:', error);
      throw new Error('Failed to get user info');
    }

    const {
      id: providerId,
      email,
      username: name,
      avatar: avatarId
    } = await userResponse.json();

    if (!email) {
      throw new Error('Email is required from Discord');
    }

    // Generate Discord avatar URL
    const avatar = avatarId
      ? `https://cdn.discordapp.com/avatars/${providerId}/${avatarId}.png`
      : null;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: 'discord',
          providerId
        }
      }
    });

    // Create new user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: generateCustomId(),
          email,
          name,
          avatar,
          provider: 'discord',
          providerId,
          updatedAt: new Date() // Add updatedAt field
        }
      });
    }

    const tokenService = require('../utils/token-service');
    const { cookieOptions } = require('../middleware/security');

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await tokenService.generateTokenPair(user);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Redirect to frontend with access token
    const FRONTEND_URL = process.env.FRONTEND_URL;
    if (!FRONTEND_URL) {
      throw new Error('Frontend URL is missing');
    }

    res.redirect(`${FRONTEND_URL}/auth/callback?token=${accessToken}`);
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(err?.message || 'Unknown error');
    console.error('Discord auth error:', error);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent(error.message)}`);
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: AuthRequest, res: AuthResponse) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const tokenService = require('../utils/token-service');
    const newRefreshToken = await tokenService.rotateRefreshToken(refreshToken);

    if (!newRefreshToken) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await prisma.user.findFirst({
      where: {
        refreshTokens: {
          some: {
            token: newRefreshToken,
            revokedAt: null,
            expiresAt: { gt: new Date() }
          }
        }
      }
    });

    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'User not found' });
    }

    const { cookieOptions } = require('../middleware/security');
    const { generateAccessToken } = require('../utils/jwt');
    const accessToken = generateAccessToken(user);
    
    // Set new refresh token
    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    
    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout endpoint
router.post('/logout', async (req: AuthRequest, res: AuthResponse) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenService = require('../utils/token-service');
      await tokenService.revokeRefreshToken(refreshToken);
    }
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/refresh'
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;
