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
import { leetCodeProblemUrl, normalizeLeetCodeSlug } from '../utils/leetcode';
import { CodeEditor } from './CodeEditor';

interface EntryFormProps {
  entry: Entry | null;
  onClose: () => void;
  onSave?: (data: EntryInput, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  /** Permanently read-only (e.g. public share). */
  viewOnly?: boolean;
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
    SQL: '',
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

function entryToForm(entry: Entry): EntryInput {
  return {
    title: entry.title,
    slug: entry.slug || '',
    difficulty: entry.difficulty,
    topics: entry.topics,
    status: entry.status,
    solvedAt: toDateInput(entry.solvedAt),
    timeSpentMinutes: entry.timeSpentMinutes,
    notes: entry.notes || '',
    solutions: entry.solutions ?? [],
  };
}

export function EntryForm({
  entry,
  onClose,
  onSave,
  onDelete,
  viewOnly = false,
}: EntryFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<EntryInput>(emptyForm);
  const [topicsText, setTopicsText] = useState('');
  const [codeByLang, setCodeByLang] = useState(emptySolutions);
  const [activeLang, setActiveLang] = useState<SolutionLanguage>('TypeScript');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Existing entries open read-only until Edit; new entries start editable.
  const [editing, setEditing] = useState(() => !entry && !viewOnly);

  useEffect(() => {
    if (entry) {
      setForm(entryToForm(entry));
      setTopicsText(entry.topics.join(', '));
      const map = solutionsToMap(entry.solutions);
      setCodeByLang(map);
      const firstFilled =
        SOLUTION_LANGUAGES.find((lang) => map[lang].trim()) ?? 'TypeScript';
      setActiveLang(firstFilled);
      setEditing(false);
    } else {
      setForm(emptyForm());
      setTopicsText('');
      setCodeByLang(emptySolutions());
      setActiveLang('TypeScript');
      setEditing(!viewOnly);
    }
    setError('');
  }, [entry, viewOnly]);

  const canEdit = editing && !viewOnly;
  const problemUrl = leetCodeProblemUrl(form.slug || '');
  const filledLangs = SOLUTION_LANGUAGES.filter((lang) => codeByLang[lang].trim());
  const hasAnyCode = filledLangs.length > 0;
  const visibleLangs = canEdit ? SOLUTION_LANGUAGES : filledLangs;

  function applySlug(raw: string) {
    setForm((prev) => ({ ...prev, slug: normalizeLeetCodeSlug(raw) }));
  }

  function cancelEdit() {
    if (!entry) {
      onClose();
      return;
    }
    setForm(entryToForm(entry));
    setTopicsText(entry.topics.join(', '));
    setCodeByLang(solutionsToMap(entry.solutions));
    setError('');
    setEditing(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canEdit || !onSave) return;
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
        slug: normalizeLeetCodeSlug(form.slug || ''),
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
    if (!entry || !onDelete || viewOnly) return;
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

  const titleText = viewOnly
    ? entry?.title || t('formViewTitle')
    : !entry
      ? t('formCreateTitle')
      : canEdit
        ? t('formEditTitle')
        : t('formViewTitle');

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
            {titleText}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('close')}>
            ×
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="form-split" onSubmit={handleSubmit}>
          <div className={`form-pane form-pane-meta${canEdit ? '' : ' is-readonly'}`}>
            <label className="label">
              {t('formTitle')}
              <input
                className="field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Two Sum"
                required={canEdit}
                readOnly={!canEdit}
              />
            </label>

            <div className="slug-field-wrap">
              <label className="label">
                {t('formSlug')}
                <input
                  className="field"
                  value={form.slug || ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  onBlur={(e) => {
                    if (canEdit) applySlug(e.target.value);
                  }}
                  placeholder="two-sum or https://leetcode.com/problems/two-sum"
                  readOnly={!canEdit}
                />
              </label>
              {problemUrl && (
                <a
                  className="slug-open-link"
                  href={problemUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('formOpenLeetCode')}
                  <span aria-hidden="true"> →</span>
                </a>
              )}
            </div>

            <div className="form-row">
              <label className="label">
                {t('formDifficulty')}
                <select
                  className="field-select"
                  value={form.difficulty}
                  disabled={!canEdit}
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
                  disabled={!canEdit}
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
                  required={canEdit}
                  readOnly={!canEdit}
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
                  readOnly={!canEdit}
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
                readOnly={!canEdit}
              />
            </label>

            <label className="label label-grow">
              {t('formNotes')}
              <textarea
                className="textarea notes-editor"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t('formNotesPlaceholder')}
                readOnly={!canEdit}
              />
            </label>
          </div>

          <div className="form-pane form-pane-code solution-block">
            <div className="solution-head">
              <span className="label-text">{t('formSolutions')}</span>
              <p className="solution-hint">
                {canEdit
                  ? t('formSolutionsHint')
                  : hasAnyCode
                    ? t('formSolutionsViewHint')
                    : t('formSolutionsNoneHint')}
              </p>
            </div>

            {!canEdit && !hasAnyCode ? (
              <div className="solution-empty-state" role="status">
                <span className="solution-empty-mark" aria-hidden="true">
                  {'</>'}
                </span>
                <strong>{t('formCodeEmptyTitle')}</strong>
                <p>{t('formCodeEmpty')}</p>
              </div>
            ) : (
              <>
                <div className="lang-tabs" role="tablist" aria-label={t('formSolutions')}>
                  {visibleLangs.map((lang) => {
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
                  language={
                    visibleLangs.includes(activeLang) ? activeLang : (visibleLangs[0] ?? 'TypeScript')
                  }
                  value={
                    codeByLang[
                      visibleLangs.includes(activeLang)
                        ? activeLang
                        : (visibleLangs[0] ?? 'TypeScript')
                    ]
                  }
                  readOnly={!canEdit}
                  onChange={(code) =>
                    setCodeByLang({
                      ...codeByLang,
                      [activeLang]: code,
                    })
                  }
                  placeholder={t('formCodePlaceholder').replace('{lang}', activeLang)}
                  aria-label={`${activeLang} ${t('formSolutions')}`}
                />
              </>
            )}
          </div>

          <div className="panel-actions form-split-actions">
            {viewOnly ? (
              <button type="button" className="btn btn-primary" onClick={onClose}>
                {t('close')}
              </button>
            ) : canEdit ? (
              <>
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
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  {t('formCancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? t('formSaving') : entry ? t('formSave') : t('formCreate')}
                </button>
              </>
            ) : (
              <>
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
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  {t('close')}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  {t('formEdit')}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
