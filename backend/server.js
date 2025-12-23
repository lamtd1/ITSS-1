import dotenv from 'dotenv';
dotenv.config();

// Validate required JWT secrets early to avoid runtime errors
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('[CONFIG ERROR] Missing JWT secrets. Please set JWT_SECRET and JWT_REFRESH_SECRET in backend/.env');
  process.exit(1);
}

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import slideRoutes from './routes/slideRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import Role from './models/auth/Role.js';


const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://itss-1-nine.vercel.app',
    'https://itss-1.vercel.app'
  ],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[DEBUG] Received ${req.method} request for ${req.url} from ${req.headers.origin}`);
  next();
});

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);

app.use('/api/slides', slideRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai', aiRoutes);

sequelize.sync({ alter: false })
  .then(async () => {
    console.log('Đã đồng bộ Database!');

    // Seed data (idempotent) for Roles
    try {
      const [adminRole, createdAdmin] = await Role.findOrCreate({
        where: { name: 'Admin' },
        defaults: { description: 'Quản trị viên hệ thống' }
      });
      if (createdAdmin) console.log('Đã tạo Role: Admin');

      const [studentRole, createdStudent] = await Role.findOrCreate({
        where: { name: 'Student' },
        defaults: { description: 'Học sinh - Quyền sử dụng và tra cứu' }
      });
      if (createdStudent) console.log('Đã tạo Role: Student');

      // Seed Users (example IDs)
      const User = sequelize.models.User;
      const adminUser = await User.findByPk(1);
      if (!adminUser) {
        // Create Admin (ID 1)
        await User.create({
          id: 1,
          username: 'Admin',
          email: 'admin@kakehashi.com',
          password: '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', // Dummy hash
          phone: '0000000000'
        });
        console.log('Đã tạo Admin User (ID 1)');
      }

      const studentUser = await User.findByPk(2);
      if (!studentUser) {
        // Create Student (ID 2)
        await User.create({
          id: 2,
          username: 'Nguyen Van B',
          email: 'student@kakehashi.com',
          password: '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', // Dummy hash
          phone: '0000000000'
        });
        console.log('Đã tạo Student User (ID 2)');
      }

    } catch (error) {
      console.error('Lỗi tạo dữ liệu mẫu:', error);
    }

    app.listen(PORT, () => console.log(`Server chạy tại port ${PORT}`));
  })
  .catch(err => console.error('Lỗi kết nối DB:', err));