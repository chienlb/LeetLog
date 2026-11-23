import { useReveal } from '../hooks/useReveal';
import { useI18n } from '../i18n/I18nContext';
import type { Difficulty, Entry, EntryFilters, SolutionLanguage, Status } from '../types';
import { SOLUTION_LANGUAGES } from '../types';
import { SectionHead } from './SectionHead';

interface EntryListProps {
  entries: Entry[];
  filters: EntryFilters;
  loading: boolean;
  onFiltersChange: (next: EntryFilters) => void;
  onSelect: (entry: Entry) => void;
  topics: string[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function pageWindow(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function EntryList({
  entries,
  filters,
  loading,
  onFiltersChange,
  onSelect,
  topics,
  page,
  total,
  totalPages,
  onPageChange,
}: EntryListProps) {
  const sectionRef = useReveal<HTMLElement>();
  const { t } = useI18n();
  const pages = pageWindow(page, totalPages);

  return (
    <section
      className="section reveal"
      id="journal"
      ref={sectionRef}
      aria-labelledby="journal-title"
    >
      <SectionHead
        id="journal-title"
        title={t('journalTitle')}
        sub={t('journalSub')}
        split
        aside={
          <p className="section-count">
            {total} {t('shown')}
          </p>
        }
      />

      <div className="filters">
        <input
          className="field"
          type="search"
          placeholder={t('searchTitle')}
          value={filters.q}
          onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
          aria-label={t('searchTitle')}
        />
        <select
          className="field-select"
          value={filters.difficulty}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              difficulty: e.target.value as '' | Difficulty,
            })
          }
          aria-label={t('allDifficulties')}
        >
          <option value="">{t('allDifficulties')}</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          className="field-select"
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value as '' | Status,
            })
          }
          aria-label={t('allStatuses')}
        >
          <option value="">{t('allStatuses')}</option>
          <option value="Solved">Solved</option>
          <option value="Review">Review</option>
          <option value="Attempted">Attempted</option>
        </select>
        <select
          className="field-select"
          value={filters.topic}
          onChange={(e) => onFiltersChange({ ...filters, topic: e.target.value })}
          aria-label={t('allTopics')}
        >
          <option value="">{t('allTopics')}</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <select
          className="field-select"
          value={filters.language}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              language: e.target.value as '' | SolutionLanguage,
            })
          }
          aria-label={t('allLanguages')}
        >
          <option value="">{t('allLanguages')}</option>
          {SOLUTION_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="loading">{t('loadingEntries')}</p>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <strong>{t('emptyTitle')}</strong>
          {t('emptyCopy')}
        </div>
      ) : (
        <>
          <div className="entry-list">
            {entries.map((entry, index) => (
              <button
                type="button"
                className={`entry-row tone-${entry.difficulty}`}
                key={entry._id}
                onClick={() => onSelect(entry)}
                style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
              >
                <div className="entry-title-wrap">
                  <p className="entry-title">{entry.title}</p>
                  <div className="entry-meta">
                    {entry.timeSpentMinutes != null
                      ? `${entry.timeSpentMinutes} min`
                      : t('noTime')}
                    {((entry.languages?.length
                      ? entry.languages
                      : (entry.solutions ?? []).map((sol) => sol.language)
                    ).length > 0) && (
                      <span className="lang-chips">
                        {(entry.languages?.length
                          ? entry.languages
                          : (entry.solutions ?? []).map((sol) => sol.language)
                        ).map((lang) => (
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
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" aria-label={t('paginationLabel')}>
              <button
                type="button"
                className="page-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                {t('prevPage')}
              </button>

              <div className="page-numbers">
                {pages.map((p, i) => {
                  const prev = pages[i - 1];
                  const showEllipsis = prev != null && p - prev > 1;
                  return (
                    <span key={p} className="page-slot">
                      {showEllipsis && <span className="page-ellipsis">…</span>}
                      <button
                        type="button"
                        className={`page-num ${p === page ? 'is-active' : ''}`}
                        aria-current={p === page ? 'page' : undefined}
                        onClick={() => onPageChange(p)}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              </div>

              <button
                type="button"
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                {t('nextPage')}
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
