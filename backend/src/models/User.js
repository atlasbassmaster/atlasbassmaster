import { DataTypes } from 'sequelize';
import  {sequelize} from '../config/database.js';

const User = sequelize.define('User', {
  // 'first_name' for storing user's first name, cannot be null
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // 'last_name' for storing user's last name, cannot be null
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: {
            args: [/^(?:\+?[1-9]\d{1,14}|\d{9,14})$/],
            msg: 'Phone number incorrect'
          }
        },
    },

// 'toise_id' as a foreign key to reference the 'toise' table
  toise_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'toise',  // Name of the table that 'toise_id' references (case-sensitive)
      key: 'id',       // Key from the referenced table (the 'id' column in 'toise' table)
    }
  },

  // 'created_at' is automatically filled with current timestamp when a record is created
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },

  // 'modified_at' is automatically updated with current timestamp whenever a record is updated
  modified_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },

}, {
  // Automatically update 'modified_at' before updating a user
  hooks: {
    beforeUpdate: (user, options) => {
      user.modified_at = new Date();  // Update the 'modified_at' field
    },
  },
  // Model options
  timestamps: false,  // We manage timestamps manually (created_at, modified_at)
  tableName: 'users', // Explicitly specifying the table name (optional)
});

export default User;