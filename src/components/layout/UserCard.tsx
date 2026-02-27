import { Link } from 'react-router';
import { useAuth } from '../../app/providers/AuthProvider';

interface UserCardProps {
  collapsed?: boolean;
}

export function UserCard({ collapsed = false }: UserCardProps) {
  const { user } = useAuth();

  if (!user) return null;

  // Get initials from display name or email
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0].toUpperCase() || '?';
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';

  if (collapsed) {
    return (
      <Link to="/profile" className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-glow-orange">
          {getInitials()}
        </div>
      </Link>
    );
  }

  return (
    <Link to="/profile" className="glass-panel p-3 mx-3 mb-2 flex block hover:bg-white/5 transition-colors border border-transparent hover:border-primary-500/30">
      <div className="flex items-center gap-3 w-full">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-glow-orange flex-shrink-0">
          {getInitials()}
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {displayName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Premium</span>
            <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-500 text-[9px] font-bold rounded-full">
              PRO
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

