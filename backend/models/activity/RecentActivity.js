import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const RecentActivity = sequelize.define('RecentActivity', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'activity_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'activity_type'
    },
    detail: {
        type: DataTypes.TEXT,
        field: 'activity_detail'
    },
    time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'activity_time'
    }
}, {
    tableName: 'Recent_Activitie',
    timestamps: false,
    freezeTableName: true
});

export default RecentActivity;