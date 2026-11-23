import { useCallback, useEffect, useState } from 'react';
import { fetchPublicShare } from '../api';
import { useI18n } from '../i18n/I18nContext';
import type { Entry, PublicProfile, Stats } from '../types';
import { Dashboard } from './Dashboard';
import { Heatmap } from './Heatmap';
import { SectionHead } from './SectionHead';
import { TopBar } from './TopBar';

interface PublicSharePageProps {
  slug: string;
  onHome: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function PublicSharePage({ slug, onHome }: PublicSharePageProps) {
  const { t } = useI18n();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPublicShare(slug, { page, limit: 10 });
      setProfile(data.profile);
      setStats(data.stats);
      setEntries(data.entries.items);
      setTotal(data.entries.total);
      setTotalPages(data.entries.totalPages);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('shareNotFound'));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [page, slug, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!loading && (error || !profile)) {
    return (
      <div className="app share-page share-page-miss">
        <TopBar onHome={onHome} active="home" publicMode />

        <section className="share-miss" aria-labelledby="share-miss-title">
          <div className="share-miss-visual" aria-hidden="true">
            <div className="share-miss-orb share-miss-orb-a" />
            <div className="share-miss-orb share-miss-orb-b" />
            <div className="share-miss-card">
              <span className="share-miss-code">404</span>
              <strong>/u/{slug}</strong>
              <small>{t('shareMissBroken')}</small>
            </div>
          </div>

          <div className="share-miss-copy">
            <p className="eyebrow">
              <span className="dot" /> {t('shareMissEyebrow')}
            </p>
            <h1 className="share-miss-title" id="share-miss-title">
              {t('shareMissTitle')}
            </h1>
            <p className="share-miss-body">{t('shareMissBody')}</p>
            <div className="share-miss-actions">
              <button type="button" className="btn btn-primary" onClick={onHome}>
                {t('shareBackHome')}
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void load()}
              >
                {t('shareMissRetry')}
              </button>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          <span>
            <strong>LeetLog</strong> — {t('footerLeft')}
          </span>
          <span>{t('footerRight')}</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="app share-page">
      <TopBar onHome={onHome} active="home" publicMode />

      <section className="section share-hero">
        <p className="eyebrow">
          <span className="dot" /> {t('shareEyebrow')}
        </p>
        <h1 className="share-title">
          {profile ? t('shareTitle').replace('{name}', profile.name) : t('shareLoadingTitle')}
        </h1>
        <p className="section-sub share-sub">{t('shareSub')}</p>
      </section>

      {loading && !stats ? (
        <div className="share-loading">
          <div className="share-loading-pulse" aria-hidden="true" />
          <p className="loading">{t('bootLoading')}</p>
        </div>
      ) : profile ? (
        <>
          <Dashboard stats={stats} loading={loading} />
          <Heatmap activity={stats?.activity ?? []} />

          <section className="section" id="journal" aria-labelledby="share-journal-title">
            <SectionHead
              id="share-journal-title"
              title={t('shareJournalTitle')}
              sub={t('shareJournalSub')}
              split
              aside={
                <p className="section-count">
                  {total} {t('shown')}
                </p>
              }
            />

            {entries.length === 0 ? (
              <div className="empty-state">
                <strong>{t('emptyTitle')}</strong>
                {t('shareEmptyCopy')}
              </div>
            ) : (
              <>
                <div className="entry-list">
                  {entries.map((entry) => (
                    <div
                      key={entry._id}
                      className={`entry-row entry-row-static tone-${entry.difficulty}`}
                    >
                      <div className="entry-title-wrap">
                        <p className="entry-title">{entry.title}</p>
                        <div className="entry-meta">
                          {entry.timeSpentMinutes != null
                            ? `${entry.timeSpentMinutes} min`
                            : t('noTime')}
                          {(entry.languages ?? []).length > 0 && (
                            <span className="lang-chips">
                              {(entry.languages ?? []).map((lang) => (
                                <span key={lang} className="lang-chip">
                                  {lang}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`badge difficulty ${entry.difficulty}`}>
                        {entry.difficulty}
                      </span>
                      <span className={`badge status ${entry.status}`}>{entry.status}</span>
                      <span className="entry-topics">
                        {entry.topics.length ? entry.topics.join(' · ') : t('noTopics')}
                      </span>
                      <span className="entry-date">{formatDate(entry.solvedAt)}</span>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="pagination" aria-label={t('paginationLabel')}>
                    <button
                      type="button"
                      className="page-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      {t('prevPage')}
                    </button>
                    <div className="page-numbers">
                      <span className="page-ellipsis">
                        {page} / {totalPages}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="page-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      {t('nextPage')}
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </>
      ) : null}

      <footer className="site-footer">
        <span>
          <strong>LeetLog</strong> — {t('footerLeft')}
        </span>
        <span>{t('footerRight')}</span>
      </footer>
    </div>
  );
}
