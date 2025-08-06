import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: { id: string; role?: string };
}

const router = Router();
const prisma = new PrismaClient();

router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        phone: true,
        status: true,
        email_verified: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'USER_INTERNAL_ERROR',
    });
  }
});

export default router;
