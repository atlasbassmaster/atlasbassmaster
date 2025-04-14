import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./User.js"; // Import User model

const Catch = sequelize.define(
  "Catch",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // Auto-increment primary key
    },
    length: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1, // Ensures length is positive
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
       field: "user_id",
      references: {
        model: User, // References the User table
        key: "id",
      },
      onDelete: "CASCADE", // Deletes catches when the user is deleted
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Auto-generate timestamp
      field: "created_at",
    },
  },
  {
    tableName: "catch", // Ensure table name is not pluralized
    freezeTableName: true, // Prevent automatic pluralization
    timestamps: false, // Enable timestamps (createdAt included)
    updatedAt: false, // Disable updatedAt (optional)
  }
);


// Establish Relationship
User.hasMany(Catch, { foreignKey: "user_id" });
Catch.belongsTo(User, { foreignKey: "user_id" });

export default Catch;
