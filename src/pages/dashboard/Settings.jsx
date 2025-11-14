import { useState } from 'react';
import Card from '../../components/common/Card';
import Toggle from '../../components/common/Toggle';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [profile, setProfile] = useState({ name: 'Demo User', email: 'demo@ebudget.az', currency: settings.currency });

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    updateSettings({ currency: profile.currency });
  };

  return (
    <div className="space-y-6">
      <Card title={t('settings.profile')}>
        <form onSubmit={handleProfileSubmit} className="grid gap-4 md:grid-cols-2">
          {['name', 'email'].map((field) => (
            <label key={field} className="space-y-2 text-sm">
              <span className="font-medium text-slate-500">{t(`forms.${field}`)}</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-800"
                value={profile[field]}
                onChange={(event) => setProfile((prev) => ({ ...prev, [field]: event.target.value }))}
              />
            </label>
          ))}
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-500">{t('forms.currency')}</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
              value={profile.currency}
              onChange={(event) => setProfile((prev) => ({ ...prev, currency: event.target.value }))}
            >
              {['AZN', 'USD', 'EUR', 'TRY'].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white">{t('forms.save')}</button>
          </div>
        </form>
      </Card>

      <Card title={t('settings.preferences')}>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label={`${t('settings.theme')}: ${theme === 'dark' ? t('common.dark') : t('common.light')}`} description="Açıq və ya tünd mövzunu seçin" checked={theme === 'dark'} onChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
          <Toggle label={t('settings.compact')} description="Cədvəllərdə boşluqları azaldır" checked={settings.compactMode} onChange={(value) => updateSettings({ compactMode: value })} />
          <Toggle label={t('settings.animations')} description="Animasiya effeklərini aç / bağla" checked={settings.enableAnimations} onChange={(value) => updateSettings({ enableAnimations: value })} />
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
