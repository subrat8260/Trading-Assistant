import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, Settings, X, Activity } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Trade Log', path: '/trades', icon: Receipt },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed bottom-0 top-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-transform duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30 lg:translate-x-0 lg:shrink-0 ${
          mobileOpen ? 'left-0 translate-x-0' : '-left-64 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 lg:hidden">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Activity className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            Navigation
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm font-bold'
                        : 'border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 p-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-3 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">System Status</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Clean Architecture Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
