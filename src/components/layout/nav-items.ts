export interface NavItem {
  icon: string;
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'chat', label: 'Chat', path: '/chat' },
  { icon: 'menu_book', label: 'Lições', path: '/lessons' },
  { icon: 'calendar_today', label: 'Agenda', path: '/schedule' },
  { icon: 'insights', label: 'Progresso', path: '/progress' },
];
