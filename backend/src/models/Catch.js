import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./User.js";

const Catch = sequelize.define("Catch", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  length: { type: DataTypes.FLOAT, allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
});

export default Catch;
