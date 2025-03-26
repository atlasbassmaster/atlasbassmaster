import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  toise: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("competitor", "admin", "judge"), defaultValue: "competitor" },
});

export default User;
