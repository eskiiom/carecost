#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration de la base de données CareCost...\n');

// Vérifier si .env existe, sinon le créer
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Création du fichier .env...');
  
  const envContent = `# Database
DATABASE_URL="postgresql://postgres:generik@127.0.0.1:5432/carecost?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development

# Email (optionnel pour les notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File upload (pour les documents)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760 # 10MB

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# External APIs (optionnel)
FUEL_API_KEY=""
FUEL_API_URL=""
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Fichier .env créé avec succès');
  console.log('⚠️  N\'oubliez pas de modifier les valeurs par défaut !\n');
} else {
  console.log('✅ Fichier .env déjà existant\n');
}

// Vérifier que Prisma est installé
try {
  console.log('🔍 Vérification de Prisma...');
  execSync('npx prisma --version', { stdio: 'pipe' });
  console.log('✅ Prisma est installé\n');
} catch (error) {
  console.log('❌ Prisma n\'est pas installé. Installation...');
  execSync('npm install prisma --save-dev', { stdio: 'inherit' });
  console.log('✅ Prisma installé\n');
}

// Générer le client Prisma
try {
  console.log('🔧 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Client Prisma généré\n');
} catch (error) {
  console.error('❌ Erreur lors de la génération du client Prisma:', error.message);
  process.exit(1);
}

// Effectuer la migration
try {
  console.log('🔄 Application des migrations...');
  execSync('npx prisma migrate dev --name "add_new_features"', { stdio: 'inherit' });
  console.log('✅ Migrations appliquées avec succès\n');
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
  console.log('\n💡 Assurez-vous que :');
  console.log('   1. PostgreSQL est installé et en cours d\'exécution');
  console.log('   2. La base de données "carecost" existe');
  console.log('   3. Les identifiants dans DATABASE_URL sont corrects');
  process.exit(1);
}

// Vérifier le statut
try {
  console.log('📊 Statut de la base de données...');
  execSync('npx prisma migrate status', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erreur lors de la vérification du statut:', error.message);
}

console.log('\n🎉 Configuration terminée !');
console.log('\n📋 Prochaines étapes :');
console.log('   1. Modifier les valeurs dans .env selon votre configuration');
console.log('   2. Lancer le serveur : npm run dev');
console.log('   3. Lancer le client : cd client && npm start'); 