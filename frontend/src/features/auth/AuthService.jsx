const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

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
            throw new Error(data.message || 'ログインに失敗しました');
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
            throw new Error(data.message || '登録に失敗しました'); // BE trả về message lỗi
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
            throw new Error(data.message || 'ログアウトに失敗しました');
        }
        return data; // { success, message }
    }
};

export default AuthService;