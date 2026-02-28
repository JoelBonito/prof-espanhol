import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';
import { NAV_ITEMS } from './nav-items';
import { UserCard } from './UserCard';
import { preloadRoute } from '../../app/routePreload';

export function Sidebar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sidebar is collapsed if manually collapsed OR on lg breakpoint (not xl)
  const collapsedClass = isCollapsed ? 'w-[72px]' : 'w-[72px] xl:w-[320px]';

  return (
    <aside
      className={cn(
        'hidden xl:flex fixed left-0 top-0 bottom-0 z-30',
        'glass-panel rounded-none border-r border-border-subtle',
        'flex-col',
        collapsedClass,
        'transition-all duration-300'
      )}
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Logo + Brand + Toggle wrapper */}
      <div className={cn(
        'border-b border-border-subtle relative',
        isCollapsed ? 'p-3' : 'p-4 xl:px-6 xl:py-6'
      )}>
        {!isCollapsed ? (
          // Expanded layout
          <div className="flex items-center min-h-[48px] w-full">
            {/* Logo Mark (visible only on lg) */}
            <div className="xl:hidden w-12 h-12 flex-shrink-0">
              <img
                src="/brand/elite-espanhol-logo-mark.svg"
                alt="Elite Español"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,138,66,0.15)]"
              />
            </div>

            {/* Logo Full (visible only on xl) - premium proportions */}
            <div className="hidden xl:flex w-full items-center justify-center">
              <img
                src="/brand/elite-espanhol-logo-full.svg"
                alt="Elite Español"
                width={240}
                height={120}
                className="h-[120px] w-auto object-contain drop-shadow-[0_0_24px_rgba(255,138,66,0.15)]"
              />
            </div>
          </div>
        ) : (
          // Collapsed layout
          <div className="flex flex-col items-center">
            {/* Logo Mark */}
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src="/brand/elite-espanhol-logo-mark.svg"
                alt="Elite Español"
                width={48}
                height={48}
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,138,66,0.15)]"
              />
            </div>
          </div>
        )}

        {/* Floating Toggle Button - Positioned exactly on the border line */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hidden xl:flex absolute -right-3 bottom-0 translate-y-1/2 z-50",
            "w-6 h-6 rounded-full",
            "bg-surface-dark border-2 border-primary-500/50",
            "items-center justify-center text-primary-500 hover:text-primary-400 hover:border-primary-500",
            "shadow-[0_0_15px_rgba(0,0,0,0.8)] shadow-primary-500/10",
            "transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          )}
          aria-label={isCollapsed ? "Expandir menu" : "Colapsar menu"}
        >
          <div className={cn(
            "transition-transform duration-300",
            isCollapsed ? "rotate-180" : "rotate-0"
          )}>
            <Icon name="chevron_left" size={14} />
          </div>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 p-3">
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
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                'min-h-[48px]',
                isActive
                  ? 'bg-primary-500/10 text-primary-500 border-l-4 border-primary-500'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary border-l-4 border-transparent',
                isCollapsed && 'justify-center'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                name={item.icon}
                size={24}
                fill={isActive}
                className="flex-shrink-0"
              />

              {/* Label (hidden when collapsed) */}
              {!isCollapsed && (
                <span className="hidden xl:block text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card Footer */}
      <div className="border-t border-border-subtle pt-2">
        <UserCard collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
