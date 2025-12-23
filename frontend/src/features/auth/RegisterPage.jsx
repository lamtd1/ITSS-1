import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../auth/AuthService.jsx';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const data = await AuthService.register(formData);
      setSuccess('登録に成功しました! ログインしてください。');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-6 lg:gap-32 md:gap-10">
      {/* Left Side: Logo */}
      <div className="hidden md:block">
        <h1 className="text-5xl font-black tracking-widest text-black">KAKEHASHI</h1>
      </div>

      <div className="md:hidden absolute top-10 left-0 w-full text-center">
        <h1 className="text-4xl font-black tracking-widest text-black">KAKEHASHI</h1>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full max-w-[400px] bg-[#9AC5F4] rounded-xl shadow-xl p-8 pt-8 pb-6 relative">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-black tracking-wide" style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>新規登録</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-1 pl-1">ユーザー名</label>
            <input
              name="username"
              className="w-full px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-inner"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Nguyen Van A"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-1 pl-1">Eメール</label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-inner"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-1 pl-1">電話番号</label>
            <input
              name="phone"
              className="w-full px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-inner"
              value={formData.phone}
              onChange={handleChange}
              placeholder="090xxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-1 pl-1">パスワード</label>
            <input
              name="password"
              type="password"
              className="w-full px-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-inner"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••"
            />
          </div>

          {error && <div className="text-red-600 text-sm font-bold bg-white/80 p-2 rounded text-center animate-pulse">{error}</div>}
          {success && <div className="text-green-600 text-sm font-bold bg-white/80 p-2 rounded text-center animate-bounce">{success}</div>}

          <div className="flex justify-center mt-6 mb-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#1E50A2] text-white font-bold text-xl py-2 px-12 rounded-lg hover:bg-blue-900 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '処理中...' : '登録'}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link to="/login" className="text-xs text-white underline font-bold hover:text-blue-900">
              すでにアカウントをお持ちですか？ログイン
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;