import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Toise = sequelize.define("Toise", {

  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },

  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
}, {
timestamps: false,  // We manage timestamps manually (created_at, modified_at)
  tableName: 'toise',
  freezeTableName: true,
});



export default Toise;
