import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Translation = sequelize.define('Translation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    input_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    input_source: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    input_target: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    output: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('word', 'sentence', 'list'),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'translations',
    timestamps: false // We are managing created_at manually or via default
});

export default Translation;
