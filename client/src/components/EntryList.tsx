import { useReveal } from '../hooks/useReveal';
import { useI18n } from '../i18n/I18nContext';
import type { Difficulty, Entry, EntryFilters, Status } from '../types';
import { SectionHead } from './SectionHead';

interface EntryListProps {
  entries: Entry[];
  filters: EntryFilters;
  loading: boolean;
  onFiltersChange: (next: EntryFilters) => void;
  onSelect: (entry: Entry) => void;
  topics: string[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function EntryList({
  entries,
  filters,
  loading,
  onFiltersChange,
  onSelect,
  topics,
}: EntryListProps) {
  const sectionRef = useReveal<HTMLElement>();
  const { t } = useI18n();

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
            {entries.length} {t('shown')}
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
      </div>

      {loading ? (
        <p className="loading">{t('loadingEntries')}</p>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <strong>{t('emptyTitle')}</strong>
          {t('emptyCopy')}
        </div>
      ) : (
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
      )}
    </section>
  );
}
