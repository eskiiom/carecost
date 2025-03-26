import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token d\'authentification manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Compte bloqué' });
    }

    req.user = { id: user.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}; 