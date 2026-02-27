import { useLayoutEffect, useRef } from 'react';
import { sanitizeHtml } from '../../../lib/utils';
import { wrapWordsInContainer } from '../hooks/useHighlightSync';

interface HighlightableContentProps {
  html: string;
  className?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Renders sanitised HTML and wraps every word in a `<span data-word-index>`.
 *
 * Uses a local ref (safe for React 19 detach/reattach cycles) and syncs
 * the external `containerRef` inside useLayoutEffect.  innerHTML + TreeWalker
 * word wrapping happen synchronously before paint — no flash.
 */
export function HighlightableContent({
  html,
  className,
  containerRef,
}: HighlightableContentProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const prevHtmlRef = useRef('');

  useLayoutEffect(() => {
    const el = localRef.current;

    // Sync external ref so useHighlightSync can query the DOM
    if (containerRef) {
      (containerRef as { current: HTMLDivElement | null }).current = el;
    }

    if (!el) return;

    const sanitized = sanitizeHtml(html);
    if (sanitized === prevHtmlRef.current) return;

    el.innerHTML = sanitized;
    prevHtmlRef.current = sanitized;
    wrapWordsInContainer(el);

    return () => {
      if (containerRef) {
        (containerRef as { current: HTMLDivElement | null }).current = null;
      }
    };
  }, [html, containerRef]);

  return <div ref={localRef} className={className} />;
}
