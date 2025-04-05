import { DataTypes } from 'sequelize';
import  sequelize  from '../config/database.js';

const User = sequelize.define('User', {
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^\+?[0-9]{10,15}$/
        }
    },
    toiseNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
            min: 1,
            max: 150
        }
    },
    secretCode: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
            is: /^\d{4}$/
        }
    }
});

export default User;