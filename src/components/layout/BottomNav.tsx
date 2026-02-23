import { Link, useLocation } from 'react-router';
import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from './nav-items';

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 flex items-center justify-around h-16 lg:hidden z-30 safe-area-pb"
      role="navigation"
      aria-label="Menu principal"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors',
              isActive ? 'text-primary-500' : 'text-neutral-400'
            )}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={item.icon} size={24} fill={isActive} />
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
