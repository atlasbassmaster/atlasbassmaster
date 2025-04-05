import express from 'express';
import Catch from '../models/Catch.js';

const router = express.Router();

// POST - Ajouter une nouvelle prise
router.post('/', async (req, res) => {
  try {
    const newCatch = await Catch.create({
      length: req.body.length,
      userId: req.user.id  // À adapter selon votre système d'authentification
    });
    res.status(201).json(newCatch);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: "La longueur doit être entre 30cm et 200cm" });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET - Classement personnel (top 5 prises)
router.get('/my-ranking', async (req, res) => {
  try {
    const topCatches = await Catch.findAll({
      where: { userId: req.user.id },
      order: [['points', 'DESC']],
      limit: 5
    });
    
    const totalPoints = topCatches.reduce((sum, c) => sum + c.points, 0);
    
    res.json({ totalPoints, catches: topCatches });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;