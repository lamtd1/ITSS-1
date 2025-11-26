import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const UserRole = sequelize.define('UserRole', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'user_role_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
    }
    }, {
    tableName: 'User_Role',
    timestamps: false,
    freezeTableName: true
});

export default UserRole;