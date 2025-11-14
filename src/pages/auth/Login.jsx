import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form);
      const redirect = location.state?.from?.pathname || '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{t('auth.welcomeBack')}</p>
        <h2 className="text-3xl font-semibold text-slate-900">{t('auth.login')}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-500">{t('forms.email')}</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-brand-500 focus:outline-none"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-500">{t('forms.password')}</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-brand-500 focus:outline-none"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="rounded border-slate-300" />
            {t('auth.rememberMe')}
          </label>
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-500">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
          {submitting ? '...' : t('auth.login')}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-slate-900 hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
