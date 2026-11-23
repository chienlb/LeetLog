import { useEffect, useRef } from 'react';

export function useReveal<T extends HTMLElement>(delayMs = 0) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => el.classList.add('is-visible'), delayMs);
        observer.unobserve(el);
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return ref;
}
