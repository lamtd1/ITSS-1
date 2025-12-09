import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const FlashcardSet = sequelize.define('FlashcardSet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'set_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'set_title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'set_description'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'set_created_at'
  }
}, {
  tableName: 'Flashcard_Set',
  timestamps: true,
  createdAt: 'set_created_at',
  updatedAt: false,
  freezeTableName: true
});

export default FlashcardSet;
