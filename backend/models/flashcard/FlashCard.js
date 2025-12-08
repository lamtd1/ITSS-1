import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Flashcard = sequelize.define('Flashcard', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'flashcard_id'
  },
  setId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'set_id'
  },
  front: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'flashcard_front'
  },
  back: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'flashcard_back'
  },
  isLearned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'flashcard_is_learned'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'flashcard_created_at'
  }
}, {
  tableName: 'Flashcard',
  timestamps: true,
  createdAt: 'flashcard_created_at',
  updatedAt: false,
  freezeTableName: true
});

export default Flashcard;
