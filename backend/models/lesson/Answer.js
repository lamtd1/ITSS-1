import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'answer_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'question_id'
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'answer_text'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'answer_submitted_at'
  },
  score: {
    type: DataTypes.INTEGER,
    field: 'answer_score'
  }
}, {
  tableName: 'Answers',
  timestamps: true,
  createdAt: 'answer_submitted_at',
  updatedAt: false,
  freezeTableName: true,

  indexes: [
    {
      unique: true,
      fields: ['user_id', 'question_id']
    }
  ]
});

export default Answer;