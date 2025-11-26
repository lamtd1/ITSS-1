import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'permission_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'permission_name'
  },
  description: {
    type: DataTypes.STRING(255),
    field: 'permission_description'
  }
}, {
  tableName: 'Permission',
  timestamps: false,
  freezeTableName: true
});

export default Permission;