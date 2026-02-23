import { Link, useLocation } from 'react-router';
import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from './nav-items';

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[72px] bg-white border-r border-neutral-200 flex-col items-center py-4 z-30"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Nav items */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center justify-center p-3 rounded-[10px] transition-colors min-w-[44px] min-h-[44px]',
                isActive
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={item.icon} size={24} fill={isActive} />
            </Link>
          );
        })}
      </nav>

      {/* Separator + Settings */}
      <div className="border-t border-neutral-200 w-10 my-2" />
      <Link
        to="/settings"
        className={cn(
          'flex items-center justify-center p-3 rounded-[10px] transition-colors min-w-[44px] min-h-[44px]',
          pathname.startsWith('/settings')
            ? 'bg-primary-50 text-primary-500'
            : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
        )}
        aria-label="Configurações"
        aria-current={pathname.startsWith('/settings') ? 'page' : undefined}
      >
        <Icon name="settings" size={24} fill={pathname.startsWith('/settings')} />
      </Link>
    </aside>
  );
}
