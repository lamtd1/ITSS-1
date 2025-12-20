import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../../config/db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'user_id' // Ánh xạ đến user_id trong db
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'user_name'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'user_email',
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'user_password'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'user_phone'
    },
    user_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'user_created_at'
    }
}, {
    tableName: 'User',
    timestamps: true,
    createdAt: 'user_created_at',
    updatedAt: false, // <--- QUAN TRỌNG: Tắt cột này vì DB không có
    freezeTableName: true //Ngăn sequelize tự động đổi tên thành 'Users'
});

export default User;