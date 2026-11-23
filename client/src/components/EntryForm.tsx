import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '../i18n/I18nContext';
import type {
  Difficulty,
  Entry,
  EntryInput,
  Solution,
  SolutionLanguage,
  Status,
} from '../types';
import { SOLUTION_LANGUAGES } from '../types';
import { CodeEditor } from './CodeEditor';

interface EntryFormProps {
  entry: Entry | null;
  onClose: () => void;
  onSave: (data: EntryInput, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

function toDateInput(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function emptySolutions(): Record<SolutionLanguage, string> {
  return {
    TypeScript: '',
    Go: '',
    Rust: '',
    'C++': '',
  };
}

function solutionsToMap(solutions: Solution[] | undefined): Record<SolutionLanguage, string> {
  const map = emptySolutions();
  for (const item of solutions ?? []) {
    if (SOLUTION_LANGUAGES.includes(item.language)) {
      map[item.language] = item.code;
    }
  }
  return map;
}

function mapToSolutions(map: Record<SolutionLanguage, string>): Solution[] {
  return SOLUTION_LANGUAGES.filter((lang) => map[lang].trim()).map((language) => ({
    language,
    code: map[language],
  }));
}

function emptyForm(): EntryInput {
  return {
    title: '',
    slug: '',
    difficulty: 'Medium',
    topics: [],
    status: 'Solved',
    solvedAt: toDateInput(new Date().toISOString()),
    timeSpentMinutes: null,
    notes: '',
    solutions: [],
  };
}

export function EntryForm({ entry, onClose, onSave, onDelete }: EntryFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<EntryInput>(emptyForm);
  const [topicsText, setTopicsText] = useState('');
  const [codeByLang, setCodeByLang] = useState(emptySolutions);
  const [activeLang, setActiveLang] = useState<SolutionLanguage>('TypeScript');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setForm({
        title: entry.title,
        slug: entry.slug || '',
        difficulty: entry.difficulty,
        topics: entry.topics,
        status: entry.status,
        solvedAt: toDateInput(entry.solvedAt),
        timeSpentMinutes: entry.timeSpentMinutes,
        notes: entry.notes || '',
        solutions: entry.solutions ?? [],
      });
      setTopicsText(entry.topics.join(', '));
      const map = solutionsToMap(entry.solutions);
      setCodeByLang(map);
      const firstFilled =
        SOLUTION_LANGUAGES.find((lang) => map[lang].trim()) ?? 'TypeScript';
      setActiveLang(firstFilled);
    } else {
      setForm(emptyForm());
      setTopicsText('');
      setCodeByLang(emptySolutions());
      setActiveLang('TypeScript');
    }
    setError('');
  }, [entry]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError(t('formTitleRequired'));
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload: EntryInput = {
        ...form,
        title: form.title.trim(),
        slug: form.slug?.trim() || '',
        topics: topicsText
          .split(',')
          .map((topic) => topic.trim())
          .filter(Boolean),
        solvedAt: new Date(form.solvedAt).toISOString(),
        timeSpentMinutes:
          form.timeSpentMinutes === null || Number.isNaN(Number(form.timeSpentMinutes))
            ? null
            : Number(form.timeSpentMinutes),
        solutions: mapToSolutions(codeByLang),
      };
      await onSave(payload, entry?._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('formSaveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry || !onDelete) return;
    if (!window.confirm(`${t('formDeleteConfirm')} “${entry.title}”?`)) return;
    setSaving(true);
    setError('');
    try {
      await onDelete(entry._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('formDeleteFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel panel-wide" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="panel-head">
          <h2 className="panel-title" id="form-title">
            {entry ? t('formEditTitle') : t('formCreateTitle')}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('close')}>
            ×
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="form-split" onSubmit={handleSubmit}>
          <div className="form-pane form-pane-meta">
            <label className="label">
              {t('formTitle')}
              <input
                className="field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Two Sum"
                required
              />
            </label>

            <label className="label">
              {t('formSlug')}
              <input
                className="field"
                value={form.slug || ''}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="https://leetcode.com/problems/two-sum"
              />
            </label>

            <div className="form-row">
              <label className="label">
                {t('formDifficulty')}
                <select
                  className="field-select"
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: e.target.value as Difficulty })
                  }
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </label>
              <label className="label">
                {t('formStatus')}
                <select
                  className="field-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                >
                  <option value="Solved">Solved</option>
                  <option value="Review">Review</option>
                  <option value="Attempted">Attempted</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="label">
                {t('formDate')}
                <input
                  className="field"
                  type="date"
                  value={form.solvedAt}
                  onChange={(e) => setForm({ ...form, solvedAt: e.target.value })}
                  required
                />
              </label>
              <label className="label">
                {t('formTime')}
                <input
                  className="field"
                  type="number"
                  min={0}
                  value={form.timeSpentMinutes ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      timeSpentMinutes: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  placeholder="45"
                />
              </label>
            </div>

            <label className="label">
              {t('formTopics')}
              <input
                className="field"
                value={topicsText}
                onChange={(e) => setTopicsText(e.target.value)}
                placeholder="Array, Hash Table, Two Pointers"
              />
            </label>

            <label className="label label-grow">
              {t('formNotes')}
              <textarea
                className="textarea notes-editor"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t('formNotesPlaceholder')}
              />
            </label>
          </div>

          <div className="form-pane form-pane-code solution-block">
            <div className="solution-head">
              <span className="label-text">{t('formSolutions')}</span>
              <p className="solution-hint">{t('formSolutionsHint')}</p>
            </div>

            <div className="lang-tabs" role="tablist" aria-label={t('formSolutions')}>
              {SOLUTION_LANGUAGES.map((lang) => {
                const filled = Boolean(codeByLang[lang].trim());
                return (
                  <button
                    key={lang}
                    type="button"
                    role="tab"
                    aria-selected={activeLang === lang}
                    className={`lang-tab ${activeLang === lang ? 'is-active' : ''} ${filled ? 'has-code' : ''}`}
                    onClick={() => setActiveLang(lang)}
                  >
                    {lang}
                    {filled && <span className="lang-dot" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <CodeEditor
              language={activeLang}
              value={codeByLang[activeLang]}
              onChange={(code) =>
                setCodeByLang({
                  ...codeByLang,
                  [activeLang]: code,
                })
              }
              placeholder={t('formCodePlaceholder').replace('{lang}', activeLang)}
              aria-label={`${activeLang} ${t('formSolutions')}`}
            />
          </div>

          <div className="panel-actions form-split-actions">
            {entry && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {t('formDelete')}
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              {t('formCancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t('formSaving') : entry ? t('formSave') : t('formCreate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
