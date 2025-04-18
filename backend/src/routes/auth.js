import express from 'express';
import { Sequelize, Op } from 'sequelize';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import Toise from '../models/Toise.js';

const router = express.Router();



// [POST] /auth/login
router.post('/login', async (req, res) => {
    const { toise_id, code } = req.body;

    if (!toise_id || !code) {
        return res.status(400).json({
            success: false,
            message: 'Toise et code requis'
        });
    }

    try {

        console.log("Login ", toise_id, code);
        let toise = await Toise.findOne({ where: { id:toise_id, code} });
        if (!toise) {
            return res.status(401).json({
            success: false,
                message: 'Identifiants incorrects'
            });
        }

        let user = await User.findOne({ where: {toise_id} });

        if (!user) {
            return res.status(401).json({
            success: false,
                message: 'Compte introuvable'
            });
        }



        res.json({ success: true, user });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
        success: false,
            message: 'Erreur serveur'
        });
    }
});




// [POST] /auth/login
router.post('/staff', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: 'username et password requis'
        });
    }

    try {


        let staff = await Staff.findOne({ where: {username, password } });

        if (!staff) {
            return res.status(401).json({
                success: false,
                message: 'Compte introuvable'
            });
        }



        res.json({ success: true, staff });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            error: 'Erreur serveur'
        });
    }
});

export default router;