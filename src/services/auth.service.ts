import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/config';
import { RegisterDTO, LoginDTO, ResetPasswordDTO, UpdatePasswordDTO, AuthResponse } from '../types/auth.types';

const prisma = new PrismaClient();

export class AuthService {
  private static generateToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, config.jwt.secret as string, {
      expiresIn: '24h'
    });
  }

  static async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        loginAttempts: true,
        lastLoginAttempt: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    const token = this.generateToken(user.id, user.role);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        loginAttempts: true,
        lastLoginAttempt: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    if (user.isBlocked) {
      throw new Error('Votre compte est bloqué. Veuillez contacter le support.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      // Mettre à jour le nombre de tentatives de connexion
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lastLoginAttempt: new Date(),
          isBlocked: user.loginAttempts + 1 >= 5,
        },
      });

      if (updatedUser.isBlocked) {
        throw new Error('Trop de tentatives de connexion. Votre compte a été bloqué.');
      }

      throw new Error('Email ou mot de passe incorrect');
    }

    // Réinitialiser les tentatives de connexion en cas de succès
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lastLoginAttempt: null,
      },
    });

    const { password, ...userWithoutPassword } = user;
    const token = this.generateToken(user.id, user.role);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Pour des raisons de sécurité, nous ne révélons pas si l'email existe ou non
      return;
    }

    const options: SignOptions = {
      expiresIn: '1h'
    };

    // TODO: Implémenter l'envoi d'email avec le lien de réinitialisation
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'reset' },
      config.jwt.secret as string,
      options
    );

    console.log('Reset token:', resetToken);
  }

  static async updatePassword(userId: string, data: UpdatePasswordDTO): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        loginAttempts: true,
        lastLoginAttempt: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(data.password, 10) },
    });
  }
} 