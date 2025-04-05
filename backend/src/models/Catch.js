import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./User.js";

const Catch = sequelize.define("Catch", {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  length: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    validate: {
      min: 30,       // 30cm minimum
      max: 200,      // limite maximale réaliste
      isFloat: true  // vérifie que c'est un nombre
    }
  },
  points: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    defaultValue: 0  // sera calculé automatiquement
  },
  userId: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    references: { 
      model: User, 
      key: "id" 
    } 
  },
}, {
  hooks: {
    beforeValidate: (catchInstance) => {
      // Calcule automatiquement les points
      if (catchInstance.length >= 30) {
        catchInstance.points = Math.floor(catchInstance.length * 10);
      }
    }
  }
});

export default Catch;