import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { id: string; role?: string };
}

interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided',
        code: 'AUTH_NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as TokenPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true },
      });

      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          code: 'AUTH_USER_NOT_FOUND',
        });
      }

      req.user = { id: user.id, role: user.role };
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          code: 'AUTH_TOKEN_EXPIRED',
        });
      }
      return res.status(401).json({
        error: 'Invalid token',
        code: 'AUTH_INVALID_TOKEN',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'AUTH_INTERNAL_ERROR',
    });
  }
};

export const admin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Admin access required',
      code: 'AUTH_ADMIN_REQUIRED',
    });
  }
  next();
};
