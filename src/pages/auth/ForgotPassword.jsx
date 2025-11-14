import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const response = await forgotPassword(email);
      setStatus('success');
      setMessage(response?.message || 'Check your inbox for the reset link.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Unable to send reset link');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">{t('auth.forgotPassword')}</p>
        <h2 className="text-3xl font-semibold text-slate-900">{t('auth.sendLink')}</h2>
        <p className="text-sm text-slate-500">{t('auth.resetIntro')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-500">{t('forms.email')}</span>
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-brand-500 focus:outline-none"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        {message && (
          <p className={`rounded-2xl px-4 py-3 text-sm ${status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {message}
          </p>
        )}
        <button type="submit" className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          {status === 'loading' ? '...' : t('auth.sendLink')}
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

export default ForgotPasswordPage;
