import { User, Role } from '../../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  // Lấy danh sách tên role để đưa vào token (nếu cần)
  const roleNames = user.roles ? user.roles.map(r => r.name) : [];
  
  return jwt.sign(
    { id: user.id, roles: roleNames }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const registerUser = async (userData) => {
  const { username, email, password, phone } = userData;

  const userExists = await User.findOne({ where: { email } });
  if (userExists) throw new Error('Email đã tồn tại');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //Tạo User
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    phone
  });

  //Gán Role mặc định
  //đảm bảo trong DB bảng Role đã có role này rồi
  const defaultRole = await Role.findOne({ where: { name: 'User' } }); 
  
  if (defaultRole) {
    await user.addRole(defaultRole); 
  }
  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ 
    where: { email },
    include: [{
      model: Role,
      as: 'roles', 
      attributes: ['name'], 
      through: { attributes: [] } // Bỏ qua các cột bảng trung gian
    }]
  });
  
  if (!user) throw new Error('Email hoặc mật khẩu không chính xác');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Email hoặc mật khẩu không chính xác');

  const token = generateToken(user);   
  return { user, token };
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  // 1. Tìm user trong DB
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User không tồn tại');

  // 2. Kiểm tra mật khẩu cũ có đúng không
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error('Mật khẩu cũ không chính xác');

  // 3. Hash mật khẩu mới
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 4. Lưu mật khẩu mới vào DB
  user.password = hashedPassword;
  await user.save();

  return true;
};

//Lấy thông tin profile của user hiện tại 
export const getProfile = async(userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }, // Không trả về password
    include: [{
      model: Role,
      as: 'roles',
      attributes: ['name'],
      through: { attributes: [] } // Bỏ qua các cột bảng trung gian
    }]
  });
  if(!user) throw new Error('User không tồn tại');
  return user;
};

export const updateProfile = async(userId, updateData) => {
  const user = await User.findByPk(userId);
  if(!user) throw new Error('User không tồn tại');

  if (updateData.phone) user.phone = updateData.phone;

  await user.save();
  
  // Trả về user mới (đã update) nhưng bỏ password
  const updatedUser = user.toJSON();
  delete updatedUser.password;
  return updatedUser;
}