import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (identifier: string, password: string) => Promise<void>;
  loginError: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, loginError }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(identifier, password);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900" dir="rtl">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-white">تسجيل الدخول</h1>
            <p className="mt-2 text-slate-400">أدخل البريد الإلكتروني أو اسم المستخدم للوصول إلى لوحة التحكم</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني أو اسم المستخدم</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-900 placeholder-slate-500 text-slate-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="admin@example.com أو admin_user"
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-slate-700 bg-slate-900 placeholder-slate-500 text-slate-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="password"
              />
            </div>
          </div>

          {loginError && (
              <p className="text-sm text-red-400 text-center">{loginError}</p>
          )}

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:cursor-wait">
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;