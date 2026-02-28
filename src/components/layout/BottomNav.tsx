import { Link, useLocation } from 'react-router';
import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from './nav-items';
import { preloadRoute } from '../../app/routePreload';

const activeNavStyle = { filter: 'drop-shadow(0 0 8px rgba(255, 140, 66, 0.6))' } as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-30 xl:hidden',
        'glass-panel rounded-none border-t border-border-subtle',
        'flex items-center justify-around h-16',
        'safe-area-pb'
      )}
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
            onMouseEnter={() => preloadRoute(item.path)}
            onFocus={() => preloadRoute(item.path)}
            onTouchStart={() => preloadRoute(item.path)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5',
              'min-w-[56px] min-h-[44px] px-2 py-1 rounded-lg',
              'transition-all',
              isActive
                ? 'text-primary-500'
                : 'text-text-secondary'
            )}
            style={isActive ? activeNavStyle : undefined}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={item.icon} size={24} fill={isActive} />
            <span className="text-[10px] font-medium leading-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
