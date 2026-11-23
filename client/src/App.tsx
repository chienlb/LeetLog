import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  fetchStats,
  updateEntry,
} from './api';
import { useAuth } from './auth/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { EntryList } from './components/EntryList';
import { Heatmap } from './components/Heatmap';
import { Hero } from './components/Hero';
import { ProfilePage } from './components/ProfilePage';
import { useI18n } from './i18n/I18nContext';
import type { Entry, EntryFilters, EntryInput, Stats } from './types';

const emptyFilters: EntryFilters = {
  difficulty: '',
  status: '',
  topic: '',
  q: '',
};

type View = 'home' | 'profile';

export default function App() {
  const { t } = useI18n();
  const { user, loading: authLoading, logout } = useAuth();
  const [view, setView] = useState<View>('home');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<EntryFilters>(emptyFilters);
  const [debouncedFilters, setDebouncedFilters] = useState<EntryFilters>(emptyFilters);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);

  useEffect(() => {
    if (!user) setView('home');
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedFilters(filters), 250);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  const loadEntries = useCallback(async () => {
    if (!user) return;
    setLoadingEntries(true);
    try {
      const data = await fetchEntries(debouncedFilters);
      setEntries(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoadingEntries(false);
    }
  }, [debouncedFilters, user]);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setStats(null);
      return;
    }
    void loadEntries();
  }, [loadEntries, user]);

  useEffect(() => {
    if (!user) return;
    void loadStats();
  }, [loadStats, user]);

  const topicOptions = useMemo(() => {
    const fromStats = stats?.topicBreakdown.map((item) => item.topic) ?? [];
    const fromEntries = entries.flatMap((e) => e.topics);
    return [...new Set([...fromStats, ...fromEntries])].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [stats, entries]);

  function requireAuthAction(action: () => void) {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    action();
  }

  function openCreate() {
    requireAuthAction(() => {
      setEditing(null);
      setFormOpen(true);
    });
  }

  function openEdit(entry: Entry) {
    requireAuthAction(() => {
      setEditing(entry);
      setFormOpen(true);
    });
  }

  async function handleSave(data: EntryInput, id?: string) {
    if (id) {
      await updateEntry(id, data);
    } else {
      await createEntry(data);
    }
    await Promise.all([loadEntries(), loadStats()]);
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
    await Promise.all([loadEntries(), loadStats()]);
  }

  if (authLoading) {
    return (
      <div className="boot-screen">
        <div className="boot-mark">LeetLog</div>
        <p>{t('bootLoading')}</p>
      </div>
    );
  }

  if (user && view === 'profile') {
    return (
      <div className="app">
        <ProfilePage
          user={user}
          onLogout={logout}
          onHome={() => setView('home')}
        />
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
    <div className="app">
      <Hero
        onLog={openCreate}
        userName={user?.name}
        onLogout={logout}
        onSignIn={() => setAuthOpen(true)}
        onProfile={() => setView('profile')}
        onHome={() => setView('home')}
      />

      {error && <div className="error-banner">{error}</div>}

      {!user ? (
        <section className="auth-gate section">
          <div className="auth-gate-card">
            <p className="eyebrow">
              <span className="dot" /> {t('authGateEyebrow')}
            </p>
            <h2 className="section-title">{t('authGateTitle')}</h2>
            <p className="section-sub">{t('authGateSub')}</p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAuthOpen(true)}
              >
                {t('signInUp')}
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <Dashboard stats={stats} loading={loadingStats} />
          <Heatmap activity={stats?.activity ?? []} />
          <EntryList
            entries={entries}
            filters={filters}
            loading={loadingEntries}
            onFiltersChange={setFilters}
            onSelect={openEdit}
            topics={topicOptions}
          />
        </>
      )}

      <footer className="site-footer">
        <span>
          <strong>LeetLog</strong> — {t('footerLeft')}
        </span>
        <span>{t('footerRight')}</span>
      </footer>

      {formOpen && user && (
        <EntryForm
          entry={editing}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {authOpen && (
        <AuthModal initialMode="login" onClose={() => setAuthOpen(false)} />
      )}
    </div>
  );
}
