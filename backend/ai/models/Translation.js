import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Translation = sequelize.define('Translation', {
    translation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    translation_input_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    translation_input_source: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    translation_input_target: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    translation_output: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    translation_type: {
        type: DataTypes.ENUM('word', 'sentence', 'list'),
        allowNull: true
    },
    translation_created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Translation',
    freezeTableName: true,
    timestamps: false
});

export default Translation;
