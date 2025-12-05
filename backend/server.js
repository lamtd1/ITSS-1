import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import slideRoutes from './routes/slideRoutes.js';
import Role from './models/auth/Role.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/slides', slideRoutes);

sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Đã đồng bộ Database!');

    // Seed data 
    try {
      const userRole = await Role.findOne({ where: { name: 'User' } });
      if (!userRole) {
        await Role.bulkCreate([
          { name: 'User', description: 'Người dùng cơ bản' },
          { name: 'Admin', description: 'Quản trị viên hệ thống' }
        ]);
        console.log('Đã tạo dữ liệu mẫu cho bảng Role');
      }

      // Seed Users
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