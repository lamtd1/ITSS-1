import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'role_id'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'role_name'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'role_description'
    }
    }, {
    tableName: 'Role',
    timestamps: false, // Bảng này không có created_at trong SQL
    freezeTableName: true
});

export default Role;