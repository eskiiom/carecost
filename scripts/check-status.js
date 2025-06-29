#!/usr/bin/env node

const { execSync } = require('child_process');
const http = require('http');

console.log('🔍 Vérification de l\'état de CareCost...\n');

// Fonction pour faire une requête HTTP
function makeHttpRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
  });
}

async function checkStatus() {
  // Vérifier la base de données
  console.log('📊 Vérification de la base de données...');
  try {
    const dbStatus = execSync('npx prisma migrate status', { 
      stdio: 'pipe', 
      encoding: 'utf8' 
    });
    console.log('✅ Base de données : OK');
    console.log('   Migrations appliquées avec succès\n');
  } catch (error) {
    console.log('❌ Base de données : ERREUR');
    console.log('   ', error.message, '\n');
  }

  // Vérifier le backend
  console.log('🔧 Vérification du backend...');
  try {
    const response = await makeHttpRequest('http://localhost:3001');
    
    if (response.status === 200) {
      console.log('✅ Backend : OK (port 3001)');
      console.log('   ', response.data.trim());
    } else {
      console.log('⚠️  Backend : Statut inattendu', response.status);
    }
  } catch (error) {
    console.log('❌ Backend : ERREUR');
    console.log('   ', error.message);
    console.log('   Assurez-vous que le serveur backend est démarré (npm run dev)');
  }
  console.log('');

  // Vérifier le frontend
  console.log('🌐 Vérification du frontend...');
  try {
    const response = await makeHttpRequest('http://localhost:3000');
    
    if (response.status === 200) {
      console.log('✅ Frontend : OK (port 3000)');
      console.log('   Application React accessible');
    } else {
      console.log('⚠️  Frontend : Statut inattendu', response.status);
    }
  } catch (error) {
    console.log('❌ Frontend : ERREUR');
    console.log('   ', error.message);
    console.log('   Assurez-vous que le serveur frontend est démarré (cd client && npm start)');
  }
  console.log('');

  // Informations utiles
  console.log('📋 Informations utiles :');
  console.log('   Backend API  : http://localhost:3001');
  console.log('   Frontend App : http://localhost:3000');
  console.log('   Prisma Studio: http://localhost:5555 (npm run db:studio)');
  console.log('');
  console.log('👤 Comptes de test :');
  console.log('   Admin: admin@carecost.com / password123');
  console.log('   User : user@carecost.com / password123');
  console.log('');
  console.log('🚀 Commandes utiles :');
  console.log('   Backend     : npm run dev');
  console.log('   Frontend    : cd client && npm start');
  console.log('   DB Studio   : npm run db:studio');
  console.log('   DB Status   : npm run db:status');
  console.log('   DB Reset    : npm run db:reset');
}

checkStatus().catch(console.error); 