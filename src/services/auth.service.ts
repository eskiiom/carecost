import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { config } from '../config/config';
import { RegisterDTO, LoginDTO, ResetPasswordDTO, UpdatePasswordDTO, AuthResponse } from '../types/auth.types';

const prisma = new PrismaClient();

type StringValue = string | undefined;

export class AuthService {
  private static generateToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: '24h'
    };
    
    return jwt.sign({ userId }, config.jwt.secret as Secret, options);
  }

  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      },
    };
  }

  static async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
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

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      },
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
      config.jwt.secret as Secret,
      options
    );

    console.log('Reset token:', resetToken);
  }

  static async updatePassword(data: UpdatePasswordDTO): Promise<void> {
    try {
      const decoded = jwt.verify(data.token, config.jwt.secret as Secret) as { userId: string; purpose: string };

      if (decoded.purpose !== 'reset') {
        throw new Error('Token invalide');
      }

      const hashedPassword = await this.hashPassword(data.newPassword);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          password: hashedPassword,
          loginAttempts: 0,
          lastLoginAttempt: null,
          isBlocked: false,
        },
      });
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }
} 