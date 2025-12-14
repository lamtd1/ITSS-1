const API_URL = "http://localhost:5000/api/auth";

const AuthService = {
    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Đăng nhập thất bại');
        }
        return data; // { success, message, token, user }
    },

    register: async (userData) => {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Đăng ký thất bại'); // BE trả về message lỗi
        }
        return data; // { success, message, data: { id, username, email, ... }
    },

    logout: async (token) => {
        const res = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Đăng xuất thất bại');
        }
        return data; // { success, message }
    }
};

export default AuthService;