import type { ReactNode } from 'react';

interface SectionHeadProps {
  id: string;
  title: string;
  sub?: string;
  aside?: ReactNode;
  split?: boolean;
}

export function SectionHead({
  id,
  title,
  sub,
  aside,
  split = false,
}: SectionHeadProps) {
  return (
    <div className={`section-head ${split ? 'section-head-split' : ''}`}>
      <div className="section-head-main">
        <h2 className="section-title" id={id}>
          {title}
        </h2>
        {sub ? <p className="section-sub">{sub}</p> : null}
      </div>
      {aside}
    </div>
  );
}
