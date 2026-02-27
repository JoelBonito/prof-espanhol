import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-sm',
  default: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

export function Modal({ open, onClose, title, children, footer, className, size = 'default' }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    contentRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      {/* Dark overlay with blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Premium card content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative premium-card p-6 w-full z-50 focus:outline-none animate-[scale-in_0.2s_ease-out]',
          sizeStyles[size],
          className
        )}
      >
        {title && (
          <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-text-primary)] mb-4">
            {title}
          </h2>
        )}
        <div className="text-[var(--color-text-primary)]">
          {children}
        </div>
        {footer && (
          <div className="flex gap-3 justify-end mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
