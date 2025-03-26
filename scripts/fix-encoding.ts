import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fixDescriptions: { [key: string]: string } = {
  "Contr�le technique": "Contrôle technique",
  "Contr�le technique initial": "Contrôle technique initial",
  "Inspection syst�me �lectrique": "Inspection système électrique",
  "Entretien syst�me hybr": "Entretien système hybride",
  "Vidange huile et filtres": "Vidange huile et filtres",
  "Inspection annuelle et": "Inspection annuelle et entretien",
  "Remplacement plaquettes": "Remplacement plaquettes de frein"
};

async function checkEncoding() {
  try {
    const result = await prisma.$queryRaw`SHOW client_encoding;`;
    console.log('Encodage client:', result);
    
    const serverResult = await prisma.$queryRaw`SHOW server_encoding;`;
    console.log('Encodage serveur:', serverResult);
    
    const dbResult = await prisma.$queryRaw`SELECT current_database(), pg_encoding_to_char(encoding) AS encoding FROM pg_database WHERE datname = current_database();`;
    console.log('Encodage base de données:', dbResult);
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'encodage:', error);
  }
}

async function fixEncodings() {
  try {
    console.log('Vérification de l\'encodage de la base de données...');
    await checkEncoding();

    console.log('\nDébut de la correction des encodages...');

    // Récupérer toutes les entrées de maintenance
    const entries = await prisma.maintenanceEntry.findMany();
    console.log(`Nombre d'entrées trouvées: ${entries.length}`);

    for (const entry of entries) {
      // Trouver la bonne description
      const correctDescription = Object.entries(fixDescriptions).find(([incorrect]) => 
        entry.description.includes(incorrect)
      );

      if (correctDescription) {
        // Mettre à jour avec la bonne description
        await prisma.maintenanceEntry.update({
          where: { id: entry.id },
          data: { description: correctDescription[1] }
        });
        console.log(`Corrigé: ${entry.description} -> ${correctDescription[1]}`);
      } else {
        console.log(`Pas de correction nécessaire pour: ${entry.description}`);
      }
    }

    console.log('Correction des encodages terminée !');
  } catch (error) {
    console.error('Erreur lors de la correction des encodages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEncodings(); 