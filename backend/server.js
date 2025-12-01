import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import Role from './models/auth/Role.js'; 

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT;

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
    } catch (error) {
      console.error('Lỗi tạo dữ liệu mẫu:', error);
    }

    app.listen(PORT, () => console.log(`Server chạy tại port ${PORT}`));
  })
  .catch(err => console.error('Lỗi kết nối DB:', err));