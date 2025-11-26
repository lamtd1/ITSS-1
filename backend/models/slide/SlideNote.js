import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const SlideNote = sequelize.define('SlideNote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'slide_note_id'
    },
    slideId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'slide_id'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    page: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'slide_note_page'
    },
    content: {
        type: DataTypes.TEXT,
        field: 'slide_note_content'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'slide_note_created_at'
    }
}, {
    tableName: 'Slide_Note',
    timestamps: true,
    createdAt: 'slide_note_created_at',
    updatedAt: false,
    freezeTableName: true
});

export default SlideNote;