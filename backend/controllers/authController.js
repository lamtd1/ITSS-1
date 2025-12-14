import * as authService from '../services/auth/authService.js';

export const register = async(req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: { id: user.id, username: user.username, email: user.email }
        });
    } catch(error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Gọi service để đăng nhập
    const { user, token } = await authService.loginUser(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: { id: user.id, username: user.username, email: user.email, roles: user.roles.map(r => r.name) }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Lấy ID từ token (do middleware authenticate gán vào)

    await authService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json({ 
      success: true, 
      message: 'Đổi mật khẩu thành công' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Trong mô hình Stateless JWT, server không cần xóa gì cả.
    // Client có trách nhiệm xóa token khỏi LocalStorage/Cookie.
    
    res.status(200).json({ 
      success: true, 
      message: 'Đăng xuất thành công' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async(req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ 
      success: true,
      data: user
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export const updateProfile = async(req, res) => {
  try {
    const userId = req.user.id;
    const updatedUser = await authService.updateProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser
    }); 
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}