import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'question_id'
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'assignment_id',
    references: {
        model: 'Assignment',
        key: 'assignment_id'
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'question_type'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'question_score'
  }
}, {
  tableName: 'Question',
  timestamps: false,
  freezeTableName: true
});

export default Question;