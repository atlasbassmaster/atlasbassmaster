import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Define the Staff model
const Staff = sequelize.define(
  "Staff",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure each username is unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "staff",       // Explicitly set table name
    freezeTableName: true,    // Disable pluralization (so it remains "staff")
    timestamps: false,         // Enable timestamps (createdAt and updatedAt)
  }
);

// Optional: if you wish to hash passwords before storing them
// import bcrypt from "bcryptjs";
// Staff.beforeCreate(async (staff) => {
//   staff.password = await bcrypt.hash(staff.password, 10);
// });

export default Staff;
