import { useCallback, useEffect, useRef } from 'react';

// --- Word map types ---

interface WordEntry {
  start: number;
  end: number;
  index: number;
}

// --- Pure helpers ---

function buildWordEntries(text: string): WordEntry[] {
  const entries: WordEntry[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    entries.push({ start: match.index, end: match.index + match[0].length, index });
    index++;
  }

  return entries;
}

function findWordIndex(entries: WordEntry[], charIndex: number): number {
  if (entries.length === 0) return -1;

  // Binary-ish: charIndex falls inside or after the word whose start <= charIndex
  for (let i = entries.length - 1; i >= 0; i--) {
    if (charIndex >= entries[i].start) return entries[i].index;
  }

  return 0;
}

/**
 * Walk every text node inside `container`, wrapping each word in a
 * `<span data-word-index="N">`. Whitespace is preserved as bare text nodes.
 */
export function wrapWordsInContainer(container: HTMLElement): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  let wordIndex = 0;

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? '';
    if (!text.trim()) continue;

    const fragment = document.createDocumentFragment();
    const parts = text.split(/(\s+)/);

    for (const part of parts) {
      if (/^\s*$/.test(part)) {
        if (part) fragment.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement('span');
        span.dataset.wordIndex = String(wordIndex);
        span.textContent = part;
        fragment.appendChild(span);
        wordIndex++;
      }
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  }

  return wordIndex;
}

// --- Hook ---

interface UseHighlightSyncReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onBoundary: (charIndex: number) => void;
  reset: () => void;
}

/**
 * Karaoke word-by-word highlight hook.
 *
 * - Builds a char-index → word-index map from `plainText`
 *   (the string fed to SpeechSynthesis).
 * - `onBoundary(charIndex)` toggles `.word-active` / `.word-read`
 *   on `<span data-word-index>` elements inside the container —
 *   zero React re-renders.
 * - `reset()` clears all highlights.
 */
export function useHighlightSync(plainText: string): UseHighlightSyncReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordEntriesRef = useRef<WordEntry[]>([]);
  const activeIndexRef = useRef(-1);

  // Rebuild word map whenever the spoken text changes
  useEffect(() => {
    wordEntriesRef.current = buildWordEntries(plainText);
  }, [plainText]);

  const onBoundary = useCallback((charIndex: number) => {
    const container = containerRef.current;
    if (!container) return;

    const entries = wordEntriesRef.current;
    const newIndex = findWordIndex(entries, charIndex);
    if (newIndex < 0 || newIndex === activeIndexRef.current) return;

    // Deactivate previous word
    if (activeIndexRef.current >= 0) {
      const prev = container.querySelector<HTMLElement>(
        `[data-word-index="${activeIndexRef.current}"]`,
      );
      if (prev) {
        prev.classList.remove('word-active');
        prev.classList.add('word-read');
      }
    }

    // Activate current word
    const curr = container.querySelector<HTMLElement>(
      `[data-word-index="${newIndex}"]`,
    );
    if (curr) {
      curr.classList.add('word-active');
      curr.classList.remove('word-read');
      curr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    activeIndexRef.current = newIndex;
  }, []);

  const reset = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container
      .querySelectorAll('.word-active, .word-read')
      .forEach((el) => el.classList.remove('word-active', 'word-read'));

    activeIndexRef.current = -1;
  }, []);

  return { containerRef, onBoundary, reset };
}
