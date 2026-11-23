import { useI18n } from '../i18n/I18nContext';
import { leetCodeProblemUrl } from '../utils/leetcode';

interface LeetCodeOpenLinkProps {
  slug?: string;
  className?: string;
}

export function LeetCodeOpenLink({ slug, className = '' }: LeetCodeOpenLinkProps) {
  const { t } = useI18n();
  const url = slug ? leetCodeProblemUrl(slug) : null;
  if (!url) return null;

  return (
    <a
      className={`lc-open-link ${className}`.trim()}
      href={url}
      target="_blank"
      rel="noreferrer"
      title={t('openLeetCode')}
      aria-label={t('openLeetCode')}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="lc-open-glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
          <path
            d="M8.2 16.4 4.8 13a3.2 3.2 0 0 1 0-4.5l5.3-5.3a3.2 3.2 0 0 1 4.5 0l1.1 1.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.8 7.6 19.2 11a3.2 3.2 0 0 1 0 4.5l-5.3 5.3a3.2 3.2 0 0 1-4.5 0l-1.1-1.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 12.8h7.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="lc-open-text">{t('openLeetCodeShort')}</span>
      <span className="lc-open-arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
          <path
            d="M4.5 11.5 11.5 4.5M6.2 4.5h5.3v5.3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}
