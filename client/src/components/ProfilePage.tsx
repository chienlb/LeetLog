import { useState, type FormEvent } from 'react';
import { changePassword } from '../api';
import { useI18n } from '../i18n/I18nContext';
import type { User } from '../types';
import { SectionHead } from './SectionHead';
import { TopBar } from './TopBar';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
  onHome: () => void;
}

export function ProfilePage({ user, onLogout, onHome }: ProfilePageProps) {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError(t('profilePassTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('profilePassMismatch'));
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(t('profilePassChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profilePassFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <TopBar
        userName={user.name}
        onLogout={onLogout}
        onProfile={() => undefined}
        onHome={onHome}
        active="profile"
      />

      <section className="section profile-section">
        <SectionHead id="profile-title" title={t('profileTitle')} sub={t('profileSub')} />

        <div className="profile-grid">
          <div className="profile-card">
            <h3 className="profile-card-title">{t('profileInfo')}</h3>
            <dl className="profile-meta">
              <div>
                <dt>{t('authName')}</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>{t('authEmail')}</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          </div>

          <div className="profile-card">
            <h3 className="profile-card-title">{t('profileChangePass')}</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="label">
                {t('profileCurrentPass')}
                <input
                  className="field"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  required
                  autoComplete="current-password"
                />
              </label>

              <label className="label">
                {t('profileNewPass')}
                <input
                  className="field"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder={t('authPasswordHint')}
                />
              </label>

              <label className="label">
                {t('profileConfirmPass')}
                <input
                  className="field"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="success-banner" role="status">
                  {success}
                </div>
              )}

              <div className="panel-actions profile-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t('authSubmitting') : t('profileSavePass')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
