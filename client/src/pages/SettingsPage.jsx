import { useState } from 'react';
import { Settings, Shield, Server, Database, Save, CheckCircle2, Loader2, LogOut, ChevronDown, Globe, AlertTriangle, X } from 'lucide-react';
import useTheme from '../hooks/useTheme.js';
import useAuth from '../hooks/useAuth.js';
import Badge from '../components/common/Badge.jsx';
import SelectCurrencyModal, { CURRENCY_LIST } from '../components/common/SelectCurrencyModal.jsx';
import SelectRiskToleranceModal, { RISK_TOLERANCE_OPTIONS } from '../components/common/SelectRiskToleranceModal.jsx';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updatePreferences, logout } = useAuth();

  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD');
  const [riskTolerance, setRiskTolerance] = useState(user?.preferences?.riskTolerance || 'moderate');
  const [defaultLeverage, setDefaultLeverage] = useState(user?.preferences?.defaultLeverage || 1);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await updatePreferences({
        theme,
        currency,
        riskTolerance,
        defaultLeverage: Number(defaultLeverage),
      });
      setSuccessMsg('User preferences successfully synchronized to MongoDB!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            System & User Preferences
          </h1>
          <p className="text-sm text-slate-400">
            Manage your trading parameters, risk tolerance, and profile settings stored in MongoDB.
          </p>
        </div>

        {/* Top Right Red Sign Out Button */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all active:scale-95 self-start sm:self-auto"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* User Preferences Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Settings className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Trading Preferences</h2>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Base Currency
              </label>
              <button
                type="button"
                onClick={() => setIsCurrencyModalOpen(true)}
                className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-white hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-400 truncate">
                  <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {currency} ({CURRENCY_LIST.find((c) => c.code === currency)?.symbol || '$'} - {CURRENCY_LIST.find((c) => c.code === currency)?.name || 'US Dollar'})
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ml-2" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Risk Tolerance
              </label>
              <button
                type="button"
                onClick={() => setIsRiskModalOpen(true)}
                className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-white hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold capitalize text-amber-400 truncate">
                  <Shield className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {RISK_TOLERANCE_OPTIONS.find((r) => r.id === riskTolerance)?.title || 'Moderate'} ({RISK_TOLERANCE_OPTIONS.find((r) => r.id === riskTolerance)?.subtitle || 'Balanced Growth'})
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors shrink-0 ml-2" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Default Leverage (x)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={defaultLeverage}
                onChange={(e) => setDefaultLeverage(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Theme Preference
              </label>
              <div className="mt-1.5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                <span className="text-sm font-medium text-white capitalize">{theme} Mode</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:text-white"
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>

        {/* Account Info & Architecture Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-md">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Server className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Authenticated Session Info</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="text-slate-400">Logged In User</span>
              <span className="font-semibold text-white">{user?.name} ({user?.email})</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="flex items-center gap-2 text-slate-300">
                <Database className="h-4 w-4 text-emerald-400" /> Password Security
              </span>
              <Badge variant="success">Bcrypt Hashed (Select: False)</Badge>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="flex items-center gap-2 text-slate-300">
                <Shield className="h-4 w-4 text-emerald-400" /> JWT Token Mechanism
              </span>
              <Badge variant="info">Short Access + HTTP-Only Refresh</Badge>
            </div>
          </div>
        </div>
      </form>
      {/* Responsive Base Currency Select Modal */}
      <SelectCurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        selectedCurrency={currency}
        onSelectCurrency={(selectedCode) => setCurrency(selectedCode)}
      />

      {/* Responsive Risk Tolerance Select Modal */}
      <SelectRiskToleranceModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        selectedRisk={riskTolerance}
        onSelectRisk={(selectedRiskId) => setRiskTolerance(selectedRiskId)}
      />

      {/* Sign Out Confirmation Popup Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-950 p-6 shadow-2xl space-y-5 text-center">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Are you sure?</h2>
              <p className="text-xs text-slate-400">
                Are you sure you want to sign out of your trading account? You will need to log back in to access live trading signals and session tracking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                No, Cancel
              </button>

              <button
                type="button"
                onClick={logout}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
