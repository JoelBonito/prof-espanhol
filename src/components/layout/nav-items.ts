export interface NavItem {
  icon: string;
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { icon: 'grid_view', label: 'Dashboard', path: '/' },
  { icon: 'auto_stories', label: 'Lições', path: '/lessons' },
  { icon: 'chat_bubble', label: 'Tutor IA', path: '/chat' },
  { icon: 'analytics', label: 'Progresso', path: '/progress' },
  { icon: 'calendar_month', label: 'Agenda', path: '/schedule' },
  { icon: 'person', label: 'Perfil', path: '/profile' },
];
