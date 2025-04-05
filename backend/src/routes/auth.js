import express from 'express';
import { Sequelize, Op } from 'sequelize';
import User from '../models/User.js';

const router = express.Router();

// [POST] /auth/register
router.post('/register', async (req, res) => {
    const { fullName, phone, toiseNumber, secretCode } = req.body;

    // Validation des données
    if (!fullName || !phone || !toiseNumber || !secretCode) {
        return res.status(400).json({ 
            error: 'Tous les champs sont obligatoires' 
        });
    }

    try {
        // Vérification des doublons
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { phone },
                    { toiseNumber }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                error: existingUser.phone === phone 
                    ? 'Ce numéro de téléphone est déjà utilisé'
                    : 'Ce numéro de toise est déjà attribué'
            });
        }

        // Création de l'utilisateur
        const user = await User.create({
            fullName,
            phone,
            toiseNumber,
            secretCode
        });

        res.status(201).json({
            id: user.id,
            fullName: user.fullName,
            toiseNumber: user.toiseNumber
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur' 
        });
    }
});

// [POST] /auth/login
router.post('/login', async (req, res) => {
    const { toiseNumber, secretCode } = req.body;

    if (!toiseNumber || !secretCode) {
        return res.status(400).json({ 
            error: 'Toise et code requis' 
        });
    }

    try {
        const user = await User.findOne({
            where: { toiseNumber, secretCode },
            attributes: ['id', 'fullName', 'toiseNumber']
        });

        if (!user) {
            return res.status(401).json({ 
                error: 'Identifiants incorrects' 
            });
        }

        res.json(user);

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur serveur' 
        });
    }
});

export default router;