import { useMemo, useState, type FocusEvent, type MouseEvent } from 'react';
import { useReveal } from '../hooks/useReveal';
import { useI18n } from '../i18n/I18nContext';
import type { Stats } from '../types';
import { SectionHead } from './SectionHead';

interface HeatmapProps {
  activity: Stats['activity'];
}

interface HeatTip {
  date: string;
  count: number;
  x: number;
  y: number;
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

function formatHeatDate(isoDay: string, lang: string): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function Heatmap({ activity }: HeatmapProps) {
  const sectionRef = useReveal<HTMLElement>();
  const { t, lang } = useI18n();
  const weeks = Math.max(1, Math.ceil(activity.length / 7));
  const labels = useMemo(() => monthLabels(activity, lang), [activity, lang]);
  const [tip, setTip] = useState<HeatTip | null>(null);

  function showTip(
    day: Stats['activity'][number],
    event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({
      date: day.date,
      count: day.count,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  const tipCountLabel =
    tip == null
      ? ''
      : tip.count <= 0
        ? t('heatTipNone')
        : tip.count === 1
          ? t('heatTipOne')
          : t('heatTipMany').replace('{count}', String(tip.count));

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
            <button
              key={day.date}
              type="button"
              className={`heat-cell level-${levelFor(day.count)}`}
              aria-label={`${formatHeatDate(day.date, lang)}: ${
                day.count <= 0
                  ? t('heatTipNone')
                  : day.count === 1
                    ? t('heatTipOne')
                    : t('heatTipMany').replace('{count}', String(day.count))
              }`}
              onMouseEnter={(e) => showTip(day, e)}
              onFocus={(e) => showTip(day, e)}
              onMouseMove={(e) => showTip(day, e)}
              onMouseLeave={() => setTip(null)}
              onBlur={() => setTip(null)}
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

      {tip && (
        <div
          className="heat-tip"
          style={{
            left: tip.x,
            top: tip.y,
          }}
          role="tooltip"
        >
          <strong className="heat-tip-count">{tipCountLabel}</strong>
          <span className="heat-tip-date">{formatHeatDate(tip.date, lang)}</span>
        </div>
      )}
    </section>
  );
}
