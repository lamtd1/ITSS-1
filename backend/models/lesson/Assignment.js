import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'assignment_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id', // Người tạo bài tập (GV)
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'assignment_title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'assignment_description'
  },
  deadline: {
    type: DataTypes.DATEONLY, // Chỉ lưu ngày (DATE trong SQL)
    allowNull: false,
    field: 'assignment_deadline'
  },
  score: {
    type: DataTypes.INTEGER,
    field: 'assignment_score'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'assignment_created_at'
  }
}, {
  tableName: 'Assignment',
  timestamps: true,
  createdAt: 'assignment_created_at',
  updatedAt: false,
  freezeTableName: true
});

export default Assignment;