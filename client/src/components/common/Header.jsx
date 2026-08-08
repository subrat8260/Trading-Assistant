import { Sun, Moon, Menu, Bell, LogOut } from 'lucide-react';
import useTheme from '../../hooks/useTheme.js';
import useAuth from '../../hooks/useAuth.js';
import rrIcon from '../../assets/rr-icon.webp';

const Header = ({ onMobileMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2.5">
          <img src={rrIcon} alt="Trading Assistant Icon" className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg shrink-0" />
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Trading <span className="text-emerald-400">Assistant</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-400" />
          )}
        </button>

        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500"></span>
        </button>

        {user && (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-md shadow-emerald-600/20">
                {userInitial}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                <div className="text-[10px] text-slate-400 leading-none mt-1">{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
