import { useReveal } from '../hooks/useReveal';
import { useI18n } from '../i18n/I18nContext';
import type { Stats } from '../types';
import { SectionHead } from './SectionHead';

interface DashboardProps {
  stats: Stats | null;
  loading: boolean;
}

export function Dashboard({ stats, loading }: DashboardProps) {
  const sectionRef = useReveal<HTMLElement>();
  const { t } = useI18n();
  const topics = stats?.topicBreakdown ?? [];
  const maxTopic = Math.max(...topics.map((item) => item.count), 1);

  return (
    <section
      className="section reveal"
      id="dashboard"
      ref={sectionRef}
      aria-labelledby="dashboard-title"
    >
      <SectionHead
        id="dashboard-title"
        title={t('progressTitle')}
        sub={t('progressSub')}
      />

      {loading && !stats ? (
        <p className="loading">{t('loadingStats')}</p>
      ) : (
        <>
          <div className="showcase-grid">
            <article className="show-card tone-mint">
              <p className="show-label">Easy</p>
              <p className="show-value">{stats?.byDifficulty.Easy ?? 0}</p>
              <p className="show-note">{t('warmups')}</p>
              <div className="show-orb" />
            </article>
            <article className="show-card tone-peach">
              <p className="show-label">Medium</p>
              <p className="show-value">{stats?.byDifficulty.Medium ?? 0}</p>
              <p className="show-note">{t('corePractice')}</p>
              <div className="show-orb" />
            </article>
            <article className="show-card tone-rose">
              <p className="show-label">Hard</p>
              <p className="show-value">{stats?.byDifficulty.Hard ?? 0}</p>
              <p className="show-note">{t('deepFocus')}</p>
              <div className="show-orb" />
            </article>
            <article className="show-card tone-lavender">
              <p className="show-label">{t('dayStreak')}</p>
              <p className="show-value">{stats?.streak ?? 0}</p>
              <p className="show-note">{t('daysInARow')}</p>
              <div className="show-orb" />
            </article>
          </div>

          <div className="topic-panel">
            <h3 className="topic-panel-title">{t('topicsInMotion')}</h3>
            {topics.length === 0 ? (
              <p className="loading">{t('topicsEmpty')}</p>
            ) : (
              <div className="topic-bars">
                {topics.slice(0, 6).map((item) => (
                  <div className="topic-row" key={item.topic}>
                    <div className="topic-row-meta">
                      <span>{item.topic}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <div className="topic-track">
                      <div
                        className="topic-fill"
                        style={{
                          width: `${Math.max(10, (item.count / maxTopic) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
