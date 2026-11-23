import { useEffect, useState, type FormEvent } from 'react';
import { changePassword, shareUrlForSlug } from '../api';
import { useAuth } from '../auth/AuthContext';
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
  const { ensureShareSlug, regenerateShareSlug } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popupCopied, setPopupCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(!user.shareSlug);
  const [regenerating, setRegenerating] = useState(false);
  const [regenConfirmOpen, setRegenConfirmOpen] = useState(false);
  const [regenPopupOpen, setRegenPopupOpen] = useState(false);
  const publicLink = user.shareSlug ? shareUrlForSlug(user.shareSlug) : '';

  useEffect(() => {
    if (user.shareSlug) {
      setLinkLoading(false);
      return;
    }
    setLinkLoading(true);
    void ensureShareSlug()
      .catch(() => undefined)
      .finally(() => setLinkLoading(false));
  }, [ensureShareSlug, user.shareSlug]);

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

  async function handleCopyShare() {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(t('shareCopyFallback'), publicLink);
    }
  }

  function openRegenConfirm() {
    setError('');
    setSuccess('');
    setRegenConfirmOpen(true);
  }

  async function confirmRegenerateShare() {
    setRegenerating(true);
    setError('');
    setSuccess('');
    try {
      await regenerateShareSlug();
      setCopied(false);
      setPopupCopied(false);
      setRegenConfirmOpen(false);
      setRegenPopupOpen(true);
    } catch (err) {
      setRegenConfirmOpen(false);
      setError(err instanceof Error ? err.message : t('shareRegenerateFailed'));
    } finally {
      setRegenerating(false);
    }
  }

  async function handlePopupCopy() {
    if (!publicLink) return;
    try {
      await navigator.clipboard.writeText(publicLink);
      setPopupCopied(true);
      window.setTimeout(() => setPopupCopied(false), 1800);
    } catch {
      window.prompt(t('shareCopyFallback'), publicLink);
    }
  }

  return (
    <div className="profile-page">
      <TopBar
        userName={user.name}
        shareSlug={user.shareSlug}
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
            <h3 className="profile-card-title">{t('shareCardTitle')}</h3>
            <p className="profile-share-copy">{t('shareCardSub')}</p>
            {publicLink ? (
              <>
                <div className="share-link-row">
                  <input className="field" value={publicLink} readOnly aria-label={t('share')} />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => void handleCopyShare()}
                  >
                    {copied ? t('shareCopied') : t('shareCopy')}
                  </button>
                  <a
                    className="btn btn-ghost btn-sm"
                    href={`/u/${encodeURIComponent(user.shareSlug)}`}
                  >
                    {t('shareOpen')}
                  </a>
                </div>
                <div className="share-regen-row">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={openRegenConfirm}
                    disabled={regenerating}
                  >
                    {regenerating ? t('shareRegenerating') : t('shareRegenerate')}
                  </button>
                  <p className="share-regen-hint">{t('shareRegenerateHint')}</p>
                </div>
              </>
            ) : (
              <p className="profile-share-copy">
                {linkLoading ? t('shareLinkPending') : t('shareLinkMissing')}
              </p>
            )}
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

      {regenConfirmOpen && (
        <div
          className="overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !regenerating) setRegenConfirmOpen(false);
          }}
        >
          <div
            className="panel share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-confirm-title"
          >
            <div className="share-dialog-icon" aria-hidden="true">
              ↻
            </div>
            <h2 className="share-dialog-title" id="share-confirm-title">
              {t('shareRegenerate')}
            </h2>
            <p className="share-dialog-body">{t('shareRegenerateConfirm')}</p>
            <div className="share-dialog-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setRegenConfirmOpen(false)}
                disabled={regenerating}
              >
                {t('formCancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void confirmRegenerateShare()}
                disabled={regenerating}
              >
                {regenerating ? t('shareRegenerating') : t('shareRegenerateConfirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {regenPopupOpen && (
        <div
          className="overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRegenPopupOpen(false);
          }}
        >
          <div
            className="panel share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-regen-title"
          >
            <div className="share-dialog-icon is-success" aria-hidden="true">
              ✓
            </div>
            <h2 className="share-dialog-title" id="share-regen-title">
              {t('shareRegenerated')}
            </h2>
            <p className="share-dialog-body">{t('shareRegeneratedBody')}</p>
            <div className="share-link-stack">
              <input
                className="field"
                value={publicLink}
                readOnly
                aria-label={t('share')}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void handlePopupCopy()}
              >
                {popupCopied ? t('shareCopied') : t('shareCopy')}
              </button>
            </div>
            <div className="share-dialog-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setRegenPopupOpen(false)}
              >
                {t('sharePopupClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
