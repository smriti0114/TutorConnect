import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      const storedUser = localStorage.getItem('tutoring_current_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'parent') navigate('/parent/dashboard');
        else if (user.role === 'teacher') navigate('/teacher/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
      }
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo123!');
    setIsLoading(true);
    const success = await login(demoEmail, 'Demo123!');
    setIsLoading(false);
    if (success) {
      const user = mockUserByEmail(demoEmail);
      if (user?.role === 'parent') navigate('/parent/dashboard');
      else if (user?.role === 'teacher') navigate('/teacher/dashboard');
      else if (user?.role === 'admin') navigate('/admin/dashboard');
    }
  };

  const mockUserByEmail = (e) => {
    if (e.includes('parent')) return { role: 'parent' };
    if (e.includes('teacher')) return { role: 'teacher' };
    if (e.includes('admin')) return { role: 'admin' };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-brand-500/20">
            ★
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900 tracking-tight">
          Welcome to StellarTutors
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          Connect your child with expert extracurricular mentors.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-brand-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-rose-500 font-bold">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-rose-800 font-medium">{validationError || error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-stone-850"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-stone-850"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-stone-500 font-semibold">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700 underline decoration-2 cursor-pointer">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Account quick access */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 text-center">
              Quick Demo Access
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => handleQuickLogin('parent@example.com')}
                className="w-full flex items-center justify-between px-4 py-3 bg-brand-50 hover:bg-brand-100/70 border border-brand-100 rounded-xl text-stone-700 text-xs font-semibold transition-all group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-brand-900 font-bold">Parent Dashboard</span>
                  <span className="text-[10px] text-stone-505">parent@example.com</span>
                </div>
                <span className="text-brand-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => handleQuickLogin('teacher@example.com')}
                className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl text-stone-700 text-xs font-semibold transition-all group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-indigo-900 font-bold">Teacher Dashboard</span>
                  <span className="text-[10px] text-stone-505">teacher@example.com</span>
                </div>
                <span className="text-indigo-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => handleQuickLogin('admin@example.com')}
                className="w-full flex items-center justify-between px-4 py-3 bg-teal-50/50 hover:bg-teal-50 border border-teal-100 rounded-xl text-stone-700 text-xs font-semibold transition-all group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-teal-900 font-bold">Admin Dashboard</span>
                  <span className="text-[10px] text-stone-505">admin@example.com</span>
                </div>
                <span className="text-teal-500 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
