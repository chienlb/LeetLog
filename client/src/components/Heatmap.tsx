import { useMemo } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useI18n } from '../i18n/I18nContext';
import type { Stats } from '../types';
import { SectionHead } from './SectionHead';

interface HeatmapProps {
  activity: Stats['activity'];
}

function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function monthLabels(activity: Stats['activity'], lang: string) {
  if (activity.length === 0) return [];

  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  const weeks = Math.ceil(activity.length / 7);

  for (let week = 0; week < weeks; week += 1) {
    const day = activity[week * 7];
    if (!day) continue;
    const date = new Date(`${day.date}T00:00:00Z`);
    const month = date.getUTCMonth();
    if (month === lastMonth) continue;
    lastMonth = month;
    labels.push({
      weekIndex: week,
      label: date.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
        month: 'short',
        timeZone: 'UTC',
      }),
    });
  }

  return labels;
}

export function Heatmap({ activity }: HeatmapProps) {
  const sectionRef = useReveal<HTMLElement>();
  const { t, lang } = useI18n();
  const weeks = Math.max(1, Math.ceil(activity.length / 7));
  const labels = useMemo(() => monthLabels(activity, lang), [activity, lang]);

  return (
    <section
      className="section reveal"
      id="activity"
      ref={sectionRef}
      aria-labelledby="activity-title"
    >
      <SectionHead
        id="activity-title"
        title={t('rhythmTitle')}
        sub={t('rhythmSub')}
      />

      <div className="heatmap-card">
        <div
          className="heatmap-months"
          style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
        >
          {labels.map((item) => (
            <span
              key={`${item.label}-${item.weekIndex}`}
              className="heatmap-month"
              style={{ gridColumn: item.weekIndex + 1 }}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div
          className="heatmap"
          role="img"
          aria-label={t('rhythmAria')}
          style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
        >
          {activity.map((day, index) => (
            <div
              key={day.date}
              className={`heat-cell level-${levelFor(day.count)}`}
              title={`${day.date}: ${day.count}`}
              style={{
                gridColumn: Math.floor(index / 7) + 1,
                gridRow: (index % 7) + 1,
                animationDelay: `${Math.min(index, 120) * 4}ms`,
              }}
            />
          ))}
        </div>

        <div className="heat-legend">
          <span>{t('less')}</span>
          <span className="swatch" />
          <span className="swatch l1" />
          <span className="swatch l2" />
          <span className="swatch l3" />
          <span className="swatch l4" />
          <span>{t('more')}</span>
        </div>
      </div>
    </section>
  );
}
