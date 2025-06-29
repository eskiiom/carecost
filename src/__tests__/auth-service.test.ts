import { AuthService } from '../services/auth.service';
import bcrypt from 'bcryptjs';

jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('AuthService', () => {
  const email = 'test@example.com';
  const password = 'Test123!';
  const hashedPassword = bcrypt.hashSync(password, 10);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user and return a token', async () => {
    const prisma = require('@prisma/client').PrismaClient();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-id',
      email,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      loginAttempts: 0,
      lastLoginAttempt: null,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: hashedPassword,
    });
    const result = await AuthService.register({ email, password, firstName: 'Test', lastName: 'User' });
    expect(result.user.email).toBe(email);
    expect(result.token).toBeDefined();
  });

  it('should throw on login with wrong password', async () => {
    const prisma = require('@prisma/client').PrismaClient();
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      loginAttempts: 0,
      lastLoginAttempt: null,
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: hashedPassword,
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-id',
      isBlocked: false,
      loginAttempts: 1,
      lastLoginAttempt: new Date(),
    });
    await expect(AuthService.login({ email, password: 'wrongpass' })).rejects.toThrow('Email ou mot de passe incorrect');
  });
}); 