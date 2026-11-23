import { useI18n } from '../i18n/I18nContext';
import { TopBar } from './TopBar';

interface HeroProps {
  onLog: () => void;
  userName?: string;
  shareSlug?: string;
  onLogout?: () => void;
  onSignIn?: () => void;
  onProfile?: () => void;
  onHome?: () => void;
}

export function Hero({
  onLog,
  userName,
  shareSlug,
  onLogout,
  onSignIn,
  onProfile,
  onHome,
}: HeroProps) {
  const { t } = useI18n();

  return (
    <header className="hero">
      <TopBar
        userName={userName}
        shareSlug={shareSlug}
        onLog={onLog}
        onLogout={onLogout}
        onSignIn={onSignIn}
        onProfile={onProfile}
        onHome={onHome}
        active="home"
      />

      <div className="hero-stage" id="top">
        <div className="hero-copy-block">
          <p className="eyebrow">
            <span className="dot" /> {t('eyebrow')}
          </p>
          <h1 className="brand">
            {t('heroLine1')}
            <br />
            {t('heroLine2Before') ? `${t('heroLine2Before')} ` : null}
            <em>{t('heroLine2Em')}</em>
            <br />
            {t('heroLine3')}
          </h1>
          <p className="hero-copy">{t('heroCopy')}</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={onLog}>
              {t('logAProblem')}
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
            <a className="btn btn-ghost" href="#journal">
              {t('browseJournal')}
            </a>
          </div>
        </div>

        <div className="hero-motion" aria-hidden="true">
          <div className="blob blob-lavender" />
          <div className="blob blob-peach" />
          <div className="blob blob-mint" />
          <div className="float-card card-a">
            <span>Medium</span>
            <strong>Two Sum</strong>
            <small>14 min · Hash Map</small>
          </div>
          <div className="float-card card-b">
            <span>Hard</span>
            <strong>Word Ladder</strong>
            <small>Streak +1</small>
          </div>
          <div className="float-card card-c">
            <span>Easy</span>
            <strong>Valid Parens</strong>
            <small>Stack</small>
          </div>
          <svg className="orbit" viewBox="0 0 420 420">
            <circle cx="210" cy="210" r="150" />
            <circle cx="210" cy="210" r="104" />
            <circle className="orbit-dot" cx="360" cy="210" r="7" />
            <circle className="orbit-dot d2" cx="210" cy="60" r="5" />
          </svg>
        </div>
      </div>
    </header>
  );
}
