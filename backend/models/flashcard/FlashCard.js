import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Flashcard = sequelize.define('Flashcard', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'flashcard_id' // Ánh xạ với cột trong SQL
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
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
  
}, {
  tableName: 'Flashcard',
  timestamps: true,
  createdAt: 'flashcard_created_at', // Ánh xạ tên cột created_at
  updatedAt: false, // Trong SQL không có updated_at
  freezeTableName: true
});

export default Flashcard;
