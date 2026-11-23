import { useEffect, useState, type FormEvent } from 'react';
import type { Difficulty, Entry, EntryInput, Status } from '../types';

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
  };
}

export function EntryForm({ entry, onClose, onSave, onDelete }: EntryFormProps) {
  const [form, setForm] = useState<EntryInput>(emptyForm);
  const [topicsText, setTopicsText] = useState('');
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
      });
      setTopicsText(entry.topics.join(', '));
    } else {
      setForm(emptyForm());
      setTopicsText('');
    }
    setError('');
  }, [entry]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
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
          .map((t) => t.trim())
          .filter(Boolean),
        solvedAt: new Date(form.solvedAt).toISOString(),
        timeSpentMinutes:
          form.timeSpentMinutes === null || Number.isNaN(Number(form.timeSpentMinutes))
            ? null
            : Number(form.timeSpentMinutes),
      };
      await onSave(payload, entry?._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entry || !onDelete) return;
    if (!window.confirm(`Delete “${entry.title}”?`)) return;
    setSaving(true);
    setError('');
    try {
      await onDelete(entry._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
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
      <div className="panel" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="panel-head">
          <h2 className="panel-title" id="form-title">
            {entry ? 'Edit problem' : 'Log a problem'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="label">
            Title
            <input
              className="field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Two Sum"
              required
            />
          </label>

          <label className="label">
            LeetCode link or slug
            <input
              className="field"
              value={form.slug || ''}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="https://leetcode.com/problems/two-sum"
            />
          </label>

          <div className="form-row">
            <label className="label">
              Difficulty
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
              Status
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
              Date
              <input
                className="field"
                type="date"
                value={form.solvedAt}
                onChange={(e) => setForm({ ...form, solvedAt: e.target.value })}
                required
              />
            </label>
            <label className="label">
              Time (minutes)
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
            Topics (comma-separated)
            <input
              className="field"
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              placeholder="Array, Hash Table, Two Pointers"
            />
          </label>

          <label className="label">
            Notes
            <textarea
              className="textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Approach, pitfalls, follow-ups…"
            />
          </label>

          <div className="panel-actions">
            {entry && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : entry ? 'Save changes' : 'Log problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
