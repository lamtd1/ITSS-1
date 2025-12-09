import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const AssignmentSubmission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'submission_id'
  },
  // Chỉ cần khai báo cột userId là Integer, không cần references ở đây
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  // Tương tự cho assignmentId
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'assignment_id'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'submission_status'
  },
  score: {
    type: DataTypes.INTEGER,
    field: 'submission_score'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'submission_submitted_at'
  }
}, {
  tableName: 'Assignment_Submission',
  timestamps: true,
  createdAt: 'submission_submitted_at',
  updatedAt: false,
  freezeTableName: true
});

export default AssignmentSubmission;