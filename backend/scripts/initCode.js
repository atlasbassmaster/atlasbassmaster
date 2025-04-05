const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

async function resetCompetition(competitionName = "Nouvelle Compétition") {
  try {
    // 1. Suppression totale des données existantes
    await sequelize.query(`
      DELETE FROM users;
      DELETE FROM toise_codes;
      DELETE FROM competitions;
    `);

    // 2. Création de la nouvelle compétition
    const [competition] = await sequelize.query(`
      INSERT INTO competitions (name, date) 
      VALUES (?, ?) 
      RETURNING id
    `, {
      replacements: [competitionName, new Date()],
      type: QueryTypes.INSERT
    });

    const competitionId = competition[0].id;

    // 3. Génération des 150 nouveaux codes
    const codes = [];
    for (let i = 1; i <= 150; i++) {
      codes.push([
        competitionId,
        i, // Numéro de toise
        Math.floor(1000 + Math.random() * 9000).toString(), // Code à 4 chiffres
        new Date()
      ]);
    }

    // 4. Insertion en masse
    await sequelize.query(`
      INSERT INTO toise_codes (competitionId, toiseNumber, secretCode, createdAt)
      VALUES ?
    `, {
      replacements: [codes]
    });

    console.log(`
✅ Compétition recréée avec succès !
ID: ${competitionId}
Nom: ${competitionName}
Codes: 150 nouveaux codes générés
    `);

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation :', error);
  } finally {
    await sequelize.close();
  }
}

// Utilisation
resetCompetition("Atlas Bassmaster 2025");