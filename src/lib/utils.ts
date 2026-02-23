import DOMPurify from 'dompurify';

// Merge CSS class names (lightweight cn utility)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Sanitize Gemini HTML output before inserting into DOM (G-SEC-03)
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span', 'code', 'pre'];
const ALLOWED_ATTR = ['class', 'lang'];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
  });
}

// Format a date for display in pt-BR
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
