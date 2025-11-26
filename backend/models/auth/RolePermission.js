import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'role_permission_id'
  },
  // roleId và permissionId sẽ được tự động xử lý trong index.js, 
  // nhưng khai báo rõ ràng ở đây để map đúng tên cột (field) nếu cần
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'role_id',
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'permission_id',
  }
}, {
  tableName: 'Role_Permission',
  timestamps: false,
  freezeTableName: true
});

export default RolePermission;