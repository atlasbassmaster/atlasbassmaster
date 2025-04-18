import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const State = sequelize.define('State', {
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'state',
  timestamps: false,

});
State.removeAttribute('id');
export default State;
