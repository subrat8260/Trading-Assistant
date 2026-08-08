export const APP_NAME = 'Trading Assistant';

export const TRADE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
};

export const TRADE_TYPE = {
  BUY: 'BUY',
  SELL: 'SELL',
};

export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { name: 'Trade Log', path: '/trades', icon: 'Receipt' },
  { name: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  { name: 'Settings', path: '/settings', icon: 'Settings' },
];
