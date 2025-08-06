const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

type Request = import('express').Request;
type Response = import('express').Response;

interface AuthRequest extends Request {
  user?: { id: string; role?: string };
}

const router = express.Router();
const prisma = new PrismaClient();

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'USER_INTERNAL_ERROR'
    });
  }
});

module.exports = router;
