import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    setSubmitting(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{t('auth.createAccount')}</p>
        <h2 className="text-3xl font-semibold text-slate-900">{t('auth.register')}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'email', 'password', 'confirmPassword'].map((field) => (
          <label key={field} className="block space-y-2">
            <span className="text-sm font-medium text-slate-500">{t(`forms.${field === 'name' ? 'name' : field}`)}</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-brand-500 focus:outline-none"
              type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </label>
        ))}
        {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
          {submitting ? '...' : t('auth.register')}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        {t('auth.alreadyAccount')}{' '}
        <Link to="/login" className="font-semibold text-slate-900 hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
