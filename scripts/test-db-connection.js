#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Test de connexion à PostgreSQL...\n');

// Fonction pour demander une entrée utilisateur
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    // Demander les paramètres de connexion
    const host = await askQuestion('Host (localhost): ') || 'localhost';
    const port = await askQuestion('Port (5432): ') || '5432';
    const database = await askQuestion('Database (carecost): ') || 'carecost';
    const username = await askQuestion('Username (postgres): ') || 'postgres';
    const password = await askQuestion('Password: ');

    if (!password) {
      console.log('❌ Le mot de passe est requis !');
      rl.close();
      return;
    }

    // Construire la DATABASE_URL
    const databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
    
    console.log('\n🔧 Test de la connexion...');
    
    // Tester la connexion avec psql
    try {
      const psqlPath = 'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe';
      const testCommand = `"${psqlPath}" -U ${username} -h ${host} -p ${port} -d ${database} -c "SELECT version();"`;
      
      // Définir la variable d'environnement PGPASSWORD
      const env = { ...process.env, PGPASSWORD: password };
      
      const result = execSync(testCommand, { 
        env,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      console.log('✅ Connexion réussie !');
      console.log('📊 Version PostgreSQL:', result.trim());
      
      // Mettre à jour le fichier .env
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Remplacer la ligne DATABASE_URL
      const newDatabaseUrl = `DATABASE_URL="${databaseUrl}"`;
      envContent = envContent.replace(/DATABASE_URL="[^"]*"/, newDatabaseUrl);
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Fichier .env mis à jour avec succès !');
      
      // Tester la migration Prisma
      console.log('\n🔄 Test de la migration Prisma...');
      try {
        execSync('npx prisma migrate dev --name "add_new_features"', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: databaseUrl }
        });
        console.log('✅ Migration Prisma réussie !');
      } catch (migrationError) {
        console.error('❌ Erreur lors de la migration Prisma:', migrationError.message);
      }
      
    } catch (psqlError) {
      console.error('❌ Erreur de connexion PostgreSQL:', psqlError.message);
      console.log('\n💡 Vérifiez :');
      console.log('   1. Que PostgreSQL est bien démarré');
      console.log('   2. Que les identifiants sont corrects');
      console.log('   3. Que la base de données existe');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

main(); 