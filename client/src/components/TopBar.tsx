import { Moon, Share2, Sun, UserRound } from 'lucide-react';
import { useState } from 'react';
import { shareUrlForSlug } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useTheme } from '../theme/ThemeContext';

interface TopBarProps {
  userName?: string;
  shareSlug?: string;
  onLog?: () => void;
  onLogout?: () => void;
  onSignIn?: () => void;
  onProfile?: () => void;
  onHome?: () => void;
  active?: 'home' | 'profile';
  publicMode?: boolean;
}

export function TopBar({
  userName,
  shareSlug,
  onLog,
  onLogout,
  onSignIn,
  onProfile,
  onHome,
  active = 'home',
  publicMode = false,
}: TopBarProps) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { ensureShareSlug } = useAuth();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const slug = shareSlug || (await ensureShareSlug());
    if (!slug) return;
    const url = shareUrlForSlug(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(t('shareCopyFallback'), url);
    }
  }

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <button type="button" className="topnav-brand" onClick={onHome}>
          LeetLog
        </button>
      </div>

      {active === 'home' && !publicMode ? (
        <div className="topnav-center">
          <a href="#dashboard">{t('navProgress')}</a>
          <a href="#activity">{t('navRhythm')}</a>
          <a href="#journal">{t('navJournal')}</a>
        </div>
      ) : (
        <div className="topnav-center" aria-hidden="true" />
      )}

      <div className="topnav-right">
        <div className="topnav-controls" aria-label={t('themeAndLanguage')}>
          <button
            type="button"
            className="ctrl-btn"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? t('themeDark') : t('themeLight')}
            title={theme === 'light' ? t('themeDark') : t('themeLight')}
          >
            {theme === 'light' ? (
              <Moon className="theme-icon" strokeWidth={1.8} />
            ) : (
              <Sun className="theme-icon" strokeWidth={1.8} />
            )}
          </button>

          <div className="lang-switch" role="group" aria-label={t('language')}>
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'is-active' : ''}`}
              onClick={() => setLang('en')}
            >
              {t('langEn')}
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'vi' ? 'is-active' : ''}`}
              onClick={() => setLang('vi')}
            >
              {t('langVi')}
            </button>
          </div>
        </div>

        <div className="topnav-actions">
          {publicMode ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={onHome}>
              {t('shareBackHome')}
            </button>
          ) : userName ? (
            <>
              {userName && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void handleShare()}
                  title={t('share')}
                >
                  <Share2 size={16} strokeWidth={1.8} />
                  <span className="btn-label">{copied ? t('shareCopied') : t('share')}</span>
                </button>
              )}
              <button
                type="button"
                className={`btn btn-ghost btn-sm ${active === 'profile' ? 'is-nav-active' : ''}`}
                onClick={onProfile}
                title={userName}
              >
                <UserRound size={16} strokeWidth={1.8} />
                <span className="btn-label">{t('profile')}</span>
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
                {t('signOut')}
              </button>
              {active === 'home' && onLog && (
                <button type="button" className="btn btn-primary btn-sm" onClick={onLog}>
                  {t('logProblem')}
                </button>
              )}
            </>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={onSignIn}>
              {t('signIn')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
