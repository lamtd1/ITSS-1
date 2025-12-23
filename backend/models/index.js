import sequelize from '../config/db.js';
import User from './auth/User.js';
import Role from './auth/Role.js';
import UserRole from './auth/UserRole.js';
import Permission from './auth/Permission.js';
import RolePermission from './auth/RolePermission.js';
import RecentActivity from './activity/RecentActivity.js';
import FlashCard from './flashcard/FlashCard.js';
import FlashcardSet from './flashcard/FlashcardSet.js';
import Slide from './slide/Slide.js';
import SlideNote from './slide/SlideNote.js';
import Tag from './slide/Tag.js';
import SlideTag from './slide/SlideTag.js';
import Assignment from './lesson/Assignment.js';
import Question from './lesson/Question.js';
import AssignmentSubmission from './lesson/AssignmentSubmission.js';
import Answer from './lesson/Answer.js';
import Translation from './ai/Translation.js';

// THIẾT LẬP QUAN HỆ GIỮA CÁC BẢNG

//--- User & Role (m-n) ---
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles' // Alias để dùng trong câu query (user.roles)
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId',
  otherKey: 'userId',
});

// --- Role & Permission (m-n) ---
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

// User & RecentActivity (1-n)
User.hasMany(RecentActivity, { foreignKey: 'userId', as: 'activities' });
RecentActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User & Translation (1-n)
User.hasMany(Translation, { foreignKey: 'user_id', as: 'translations' });
Translation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User & FlashcardSet (1-n)
User.hasMany(FlashcardSet, { foreignKey: 'userId', as: 'flashcardSets', onDelete: 'CASCADE' });
FlashcardSet.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// FlashcardSet & FlashCard (1-n)
FlashcardSet.hasMany(FlashCard, { foreignKey: 'setId', as: 'flashcards', onDelete: 'CASCADE' });
FlashCard.belongsTo(FlashcardSet, { foreignKey: 'setId', as: 'set' });

// User & Slide (1-n)
User.hasMany(Slide, { foreignKey: 'userId', as: 'slides' });
Slide.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// --- Slide & SlideNote (One-to-Many) ---
Slide.hasMany(SlideNote, { foreignKey: 'slideId', as: 'notes' });
SlideNote.belongsTo(Slide, { foreignKey: 'slideId', as: 'slide' });

// --- User & SlideNote (One-to-Many) ---
User.hasMany(SlideNote, { foreignKey: 'userId', as: 'slideNotes' });
SlideNote.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// --- Slide & Tag (Many-to-Many) ---
Slide.belongsToMany(Tag, { through: SlideTag, foreignKey: 'slideId', otherKey: 'tagId', as: 'tags' });
Tag.belongsToMany(Slide, { through: SlideTag, foreignKey: 'tagId', otherKey: 'slideId', as: 'slides' });

// --- Assignment (Bài tập) ---
// User tạo bài tập (GV)
User.hasMany(Assignment, {
  foreignKey: 'userId',
  as: 'createdAssignments',
  onDelete: 'RESTRICT' // Giữ lại assignment nếu user bị xóa (theo SQL: ON DELETE RESTRICT)
});
Assignment.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

// Assignment có nhiều Question
Assignment.hasMany(Question, {
  foreignKey: 'assignmentId',
  as: 'questions',
  onDelete: 'CASCADE' // Xóa assignment xóa luôn câu hỏi
});
Question.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// --- Submission (Nộp bài) ---
// User nộp bài (HS)
User.hasMany(AssignmentSubmission, {
  foreignKey: 'userId',
  as: 'submissions',
  onDelete: 'RESTRICT' // Giữ lại bài nộp nếu user bị xóa
});
AssignmentSubmission.belongsTo(User, { foreignKey: 'userId', as: 'student' });

// Assignment có nhiều bài nộp
Assignment.hasMany(AssignmentSubmission, {
  foreignKey: 'assignmentId',
  as: 'submissions',
  onDelete: 'CASCADE' // Xóa assignment xóa luôn bài nộp
});
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// --- Answer (Câu trả lời) ---
// User trả lời câu hỏi
User.hasMany(Answer, {
  foreignKey: 'userId',
  as: 'answers',
  onDelete: 'RESTRICT' // Giữ lại câu trả lời nếu user bị xóa
});
Answer.belongsTo(User, { foreignKey: 'userId', as: 'student' });

// Question có nhiều câu trả lời
Question.hasMany(Answer, {
  foreignKey: 'questionId',
  as: 'answers',
  onDelete: 'CASCADE' // Xóa câu hỏi xóa luôn câu trả lời
});
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// 3. Export
export {
  sequelize,
  User,
  Role,
  UserRole,
  Permission,
  RolePermission,
  RecentActivity,
  Translation,
  FlashCard,
  FlashcardSet,
  Slide,
  SlideNote,
  Tag,
  SlideTag,
  Assignment,
  Question,
  AssignmentSubmission,
  Answer
};