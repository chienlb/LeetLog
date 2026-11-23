import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';

type Mode = 'login' | 'register';

interface AuthModalProps {
  initialMode?: Mode;
  onClose?: () => void;
}

export function AuthModal({ initialMode = 'login', onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="panel auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="panel-head">
          <div>
            <p className="eyebrow">
              <span className="dot" /> {t('authWelcome')}
            </p>
            <h2 className="panel-title" id="auth-title">
              {mode === 'login' ? t('authLoginTitle') : t('authRegisterTitle')}
            </h2>
          </div>
          {onClose && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label={t('close')}>
              ×
            </button>
          )}
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            {t('signIn')}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            {t('signUp')}
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="label">
              {t('authName')}
              <input
                className="field"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Chien"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="label">
            {t('authEmail')}
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="you@email.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="label">
            {t('authPassword')}
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder={mode === 'register' ? t('authPasswordHint') : t('authYourPassword')}
              required
              minLength={mode === 'register' ? 6 : undefined}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </label>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="panel-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? t('authSubmitting')
                : mode === 'login'
                  ? t('signIn')
                  : t('signUp')}
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
