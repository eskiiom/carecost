import bcrypt from 'bcryptjs';

// Exemple de test unitaire pour le hash de mot de passe

describe('Password hashing', () => {
  it('should hash and verify a password correctly', async () => {
    const password = 'SuperSecret123!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });
});

// Exemple de validation d'email simple
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe('Email validation', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co')).toBe(true);
  });

  it('should invalidate incorrect email addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
  });
}); 