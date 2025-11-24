import sequelize from '../config/db.js';
import User from './auth/User.js';
import Role from './auth/Role.js';
import UserRole from './auth/UserRole.js';

User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles' // Alias để dùng trong câu query (user.roles)
});

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
});

export { sequelize, User, Role, UserRole };