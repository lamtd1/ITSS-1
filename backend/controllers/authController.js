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
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};
