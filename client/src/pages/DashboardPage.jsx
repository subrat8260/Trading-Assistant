import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Layers,
  Keyboard,
  Wallet,
  PlusCircle,
  X,
  Power,
  Globe,
  ChevronDown,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';
import SelectPairModal from '../components/common/SelectPairModal';
import SelectTimeframeModal from '../components/common/SelectTimeframeModal';
import { calculateMasanielloJS } from '../utils/masanielloCalculator';
import LiveClockWidget from '../components/common/LiveClockWidget';
import useAuth from '../hooks/useAuth';
import { getCurrencySymbol } from '../utils/formatters';
import {
  useCurrentSession,
  useStartSession,
  useRecordResult,
  useResetSession,
  useGenerateSignal,
} from '../hooks/useTrading';

const PAIR_OPTIONS = [
  'USD/BDT (OTC)',
  'EUR/USD (OTC)',
  'USD/BRL (OTC)',
  'USD/INR (OTC)',
  'GBP/USD (OTC)',
  'AUD/JPY (OTC)',
  'CAD/CHF (OTC)',
  'Gold (OTC)',
  'Silver (OTC)',
  'Bitcoin (OTC)',
];

const TIMEFRAME_OPTIONS = [
  '01:00',
  '00:05',
  '00:10',
  '00:15',
  '00:30',
  '02:00',
  '05:00',
  '10:00',
  '30:00',
  '59:00',
];

const DashboardPage = () => {
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.preferences?.currency || 'USD');

  // Queries & Mutations
  const { data: sessionData, isLoading: sessionLoading } = useCurrentSession();
  const startSessionMutation = useStartSession();
  const recordResultMutation = useRecordResult();
  const resetSessionMutation = useResetSession();
  const generateSignalMutation = useGenerateSignal();

  const activeSession = sessionData?.data?.session;
  const recentTrades = sessionData?.data?.recentTrades || [];

  // Local sequence override for 0ms instant UI rendering
  const [localSequenceOverride, setLocalSequenceOverride] = useState(null);

  useEffect(() => {
    setLocalSequenceOverride(null);
  }, [activeSession?.sequence?.length, activeSession?._id]);

  const activeSequence = localSequenceOverride ?? (activeSession?.sequence || []);

  const activeTrades = useMemo(() => {
    if (!activeSession) return [];
    return calculateMasanielloJS(
      activeSession.initialCapital,
      activeSession.totalTrades,
      activeSession.winsRequired,
      activeSession.payout,
      activeSequence
    );
  }, [activeSession, activeSequence]);

  const currentBalance = useMemo(() => {
    if (!activeSession) return 0;
    if (activeTrades.length <= 1) return activeSession.initialCapital;
    const lastExecutedTrade = activeTrades[activeTrades.length - 2];
    return lastExecutedTrade?.portfolioBalance ?? activeSession.initialCapital;
  }, [activeSession, activeTrades]);

  const initialCapital = activeSession?.initialCapital ?? 0;
  const sessionProfit = currentBalance - initialCapital;
  const displayedStake = activeTrades.length > 0 ? activeTrades[activeTrades.length - 1].stakeAmount : (activeSession?.nextTradeAmount ?? 0);
  const tradeNum = activeSequence.length + 1;
  const sequence = activeSequence;

  // Form & Selection State
  const [selectedPair, setSelectedPair] = useState('USD/BDT (OTC)');
  const [selectedTimeframe, setSelectedTimeframe] = useState('01:00');
  const [activeSignal, setActiveSignal] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isTimeframeModalOpen, setIsTimeframeModalOpen] = useState(false);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);

  // Start Session Modal Parameters
  const [setupCapital, setSetupCapital] = useState(100);
  const [setupTrades, setSetupTrades] = useState(6);
  const [setupWinsRequired, setSetupWinsRequired] = useState(1);
  const [setupPayout, setSetupPayout] = useState(1.82);

  // UI Toast & Feedback State
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Handler: Start New Trading Session
  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      await startSessionMutation.mutateAsync({
        capital: Number(setupCapital),
        trades: Number(setupTrades),
        winsRequired: Number(setupWinsRequired),
        payout: Number(setupPayout),
      });
      setIsModalOpen(false);
      setLocalSequenceOverride(null);
      showToast('Trading session initialized with ExcelService calculations!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to start trading session', 'error');
    }
  };

  // Handler: Generate Signal
  const handleGenerateSignal = useCallback(async () => {
    setActiveSignal(null);
    try {
      const signalRes = await generateSignalMutation.mutateAsync({
        currencyPair: selectedPair,
        time: selectedTimeframe,
      });

      const signalOutput = signalRes.data;
      setActiveSignal(signalOutput);
      showToast(
        `Signal Generated: ${signalOutput.signal || 'UP'} for ${signalOutput.currencyPair}`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to generate signal from Signal24x7', 'error');
    }
  }, [generateSignalMutation, selectedPair, selectedTimeframe]);

  // Handler: Record Trade Result (WIN / LOSS) - Continuous Sequence Processing
  const handleRecordResult = useCallback(
    async (resultCode) => {
      if (!activeSession) {
        showToast('Please start an active trading session first', 'error');
        setIsModalOpen(true);
        return;
      }

      // INSTANT UI UPDATE (0ms latency!)
      const nextSeq = [...activeSequence, resultCode.toLowerCase()];
      setLocalSequenceOverride(nextSeq);

      // Capture signal metadata before clearing active signal
      const signalDir = activeSignal?.signal || 'BUY';
      const signalStrength = activeSignal?.signalStrength || '0.75';
      const currencyAnalyzer = activeSignal?.currencyAnalyzer || 'neutral';

      // Clear previous signal immediately upon clicking WIN or LOSS
      setActiveSignal(null);

      try {
        const response = await recordResultMutation.mutateAsync({
          sessionId: activeSession._id,
          result: resultCode,
          pair: selectedPair,
          timeframe: selectedTimeframe,
          signal: signalDir,
          strength: signalStrength,
          analyzer: currencyAnalyzer,
        });

        const resData = response.data;

        showToast(
          `Trade #${resData.tradeNumber - 1} (${resultCode === 'W' ? 'WIN' : 'LOSS'}) Recorded! Next stake: ${currencySymbol} ${
            resData.nextTradeAmount?.toFixed(2) || '0.00'
          }`,
          resultCode === 'W' ? 'success' : 'info'
        );
      } catch (err) {
        showToast(err.message || 'Failed to record trade result', 'error');
      }
    },
    [activeSession, activeSequence, activeSignal, recordResultMutation, selectedPair, selectedTimeframe, currencySymbol]
  );

  // Handler: Reset Session
  const handleResetSession = async () => {
    try {
      await resetSessionMutation.mutateAsync({ sessionId: activeSession?._id });
      setActiveSignal(null);
      setLocalSequenceOverride(null);
      showToast('Trading session reset. Ready for a new sequence.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to reset session', 'error');
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="mt-3 text-sm">Loading Trading Workflow Architecture...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      <SelectPairModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        selectedPair={selectedPair}
        onSelectPair={setSelectedPair}
      />

      <SelectTimeframeModal
        isOpen={isTimeframeModalOpen}
        onClose={() => setIsTimeframeModalOpen(false)}
        selectedTimeframe={selectedTimeframe}
        onSelectTimeframe={setSelectedTimeframe}
      />

      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Trading Execution Workflow
          </h1>
          <p className="text-sm text-slate-400">
            Real-time Signal24x7 AI signals & ExcelService Masaniello position sizing engine.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            {activeSession ? 'New Session' : 'Start Trading Session'}
          </button>
          <Badge variant="success">Excel Engine</Badge>
          <Badge variant="info">Signal24x7 Active</Badge>
          <div className="flex items-center gap-1 text-xs text-slate-400 border border-slate-800 bg-slate-900 px-2.5 py-1 rounded-lg">
            <Keyboard className="h-3.5 w-3.5 text-emerald-400" />
            <span>Shortcuts: [G] Signal | [W] Win | [L] Loss</span>
          </div>
        </div>
      </div>

      {/* TOP STATS CARDS ROW (5 CLEAN ALIGNED COLUMNS DISPLAYED FIRST) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Start Balance"
          value={`${currencySymbol} ${initialCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="Session Capital"
          isPositive={true}
          icon={Wallet}
        />

        <StatCard
          title="Current Balance"
          value={`${currencySymbol} ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${sessionProfit >= 0 ? '+' : ''}${((sessionProfit / (initialCapital || 1)) * 100).toFixed(2)}%`}
          isPositive={sessionProfit >= 0}
          icon={DollarSign}
        />

        <div className="rounded-xl border border-emerald-500/40 bg-slate-900/80 p-4 shadow-lg shadow-emerald-500/5 backdrop-blur-sm overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider truncate">
              Current Trade Stake
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-xl font-bold text-emerald-400 tracking-tight truncate">
              {displayedStake !== null
                ? `${currencySymbol} ${displayedStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `${currencySymbol} 0.00`}
            </h3>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {recordResultMutation.isPending ? 'Syncing trade...' : 'Excel Stake'}
            </p>
          </div>
        </div>

        <StatCard
          title="Trade Count #"
          value={`# ${tradeNum}`}
          change={`${activeSession?.winsRequired || 1}W / ${activeSession?.totalTrades || 6} Trades`}
          isPositive={true}
          icon={Layers}
        />

        <StatCard
          title="Session Profit / Loss"
          value={`${sessionProfit >= 0 ? '+' : ''}${currencySymbol} ${sessionProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${sequence.filter((r) => r === 'w').length}W / ${sequence.filter((r) => r === 'l').length}L`}
          isPositive={sessionProfit >= 0}
          icon={TrendingUp}
        />
      </div>

      {/* NO ACTIVE SESSION BANNER CARD (SHOWS BELOW THE 5 STATS CARDS) */}
      {!activeSession && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-emerald-950/40 p-6 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Play className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">No Active Trading Session</h2>
              <p className="text-xs text-slate-400">
                Click &quot;Start Trading Session&quot; to open the configuration popup and initialize position sizes via Excel.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 hover:bg-emerald-500 transition-all"
          >
            <PlusCircle className="h-5 w-5" />
            Start Trading Session
          </button>
        </div>
      )}

      {/* POPUP MODAL DIALOG WINDOW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Configure Masaniello Session</h2>
                  <p className="text-xs text-slate-400">Set initial capital & parameters for Excel calculation</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStartSession} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Initial Capital ({currencySymbol})
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={setupCapital}
                  onChange={(e) => setSetupCapital(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. 100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Total Trades ($N$)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={setupTrades}
                    onChange={(e) => setSetupTrades(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Wins Required ($K$)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={setupWinsRequired}
                    onChange={(e) => setSetupWinsRequired(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Payout Quota Ratio ($Q$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={1.01}
                  value={setupPayout}
                  onChange={(e) => setSetupPayout(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={startSessionMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {startSessionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      Initialize Session
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* END SESSION CONFIRMATION MODAL */}
      {isEndSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl backdrop-blur-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Are you sure?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Do you really want to end the current trading session?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEndSessionModalOpen(false)}
                className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsEndSessionModalOpen(false);
                  await handleResetSession();
                }}
                disabled={resetSessionMutation.isPending}
                className="w-1/2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all disabled:opacity-50"
              >
                {resetSessionMutation.isPending ? 'Ending...' : 'Yes, End Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKFLOW GRID: SIGNAL GENERATION & EXECUTION */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PANEL 1: SIGNAL GENERATOR */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Signal24x7 AI Analyzer</h2>
                <p className="text-xs text-slate-400">Select asset & expiry to generate live trade signal</p>
              </div>
            </div>
            <Badge variant="info">Live Engine</Badge>
          </div>

          {/* Dedicated Live Clock & Timezone Row */}
          <div className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-slate-800/80 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Market Clock
            </span>
            <LiveClockWidget />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Currency / Asset Pair
              </label>
              <button
                type="button"
                onClick={() => setIsPairModalOpen(true)}
                className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 text-sm text-white hover:border-sky-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-sky-400">
                  <Globe className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>{selectedPair}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                Expiration Timeframe
              </label>
              <button
                type="button"
                onClick={() => setIsTimeframeModalOpen(true)}
                className="mt-1.5 flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 text-sm text-white hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-bold text-indigo-400 font-mono">
                  <Clock className="h-4 w-4 text-indigo-400 shrink-0 font-sans" />
                  <span>{selectedTimeframe}</span>
                  <span className="text-xs text-slate-400 font-sans font-normal">
                    ({selectedTimeframe === '01:00' ? '1 Min' : selectedTimeframe === '00:05' ? '5 Sec' : selectedTimeframe})
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateSignal}
            disabled={generateSignalMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            {generateSignalMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Market Signals...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-current" />
                Generate Signal <span className="text-xs font-normal text-indigo-200">[G]</span>
              </>
            )}
          </button>

          {/* ACTIVE SIGNAL DISPLAY CARD */}
          {activeSignal ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 shadow-inner space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recommended Signal</span>
                <span className="text-xs font-mono text-slate-400">Timeframe: {activeSignal.expirationTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-white">{activeSignal.currencyPair}</div>
                  <div className="text-xs text-slate-400">Analyzer: <span className="capitalize text-slate-300">{activeSignal.currencyAnalyzer || 'Neutral'}</span></div>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-extrabold text-xl shadow-lg ${
                    activeSignal.signal?.toUpperCase() === 'SELL' || activeSignal.signal?.toUpperCase() === 'DOWN'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {activeSignal.signal?.toUpperCase() === 'SELL' || activeSignal.signal?.toUpperCase() === 'DOWN' ? (
                    <ArrowDownRight className="h-7 w-7" />
                  ) : (
                    <ArrowUpRight className="h-7 w-7" />
                  )}
                  {activeSignal.signal?.toUpperCase() === 'SELL' || activeSignal.signal?.toUpperCase() === 'DOWN' ? 'SELL / DOWN' : 'BUY / UP'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 p-4 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Current Trade Stake (Trade #{tradeNum})
                  </span>
                  <div className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                    {currencySymbol} {displayedStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Signal Strength
                  </span>
                  <span className="text-lg font-extrabold text-indigo-400 mt-0.5 block">
                    {activeSignal.signalStrength || '0.75'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-5 text-center text-xs text-slate-400">
              {recordResultMutation.isPending ? (
                <>
                  <div className="flex items-center gap-2 font-semibold text-emerald-400 animate-pulse text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Recording Outcome & Pre-calculating Next Trade...
                  </div>
                  {activeSession && (
                    <div className="flex flex-col items-center rounded-xl bg-slate-900/90 border border-slate-800 px-6 py-3 shadow-md">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Current Trade Stake (Trade #{tradeNum})
                      </span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                        {currencySymbol} {displayedStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </>
              ) : generateSignalMutation.isPending ? (
                <>
                  <div className="flex items-center gap-2 font-semibold text-indigo-400 animate-pulse text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Market & Generating AI Signal...
                  </div>
                  {activeSession && (
                    <div className="flex flex-col items-center rounded-xl bg-slate-900/90 border border-slate-800 px-6 py-3 shadow-md">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Current Trade Stake (Trade #{tradeNum})
                      </span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                        {currencySymbol} {displayedStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-400">Click &quot;Generate Signal&quot; or press [G] to fetch real-time AI signal</span>
                  {activeSession && (
                    <div className="flex flex-col items-center rounded-xl bg-slate-900/90 border border-slate-800 px-6 py-3 shadow-md">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Current Trade Stake (Trade #{tradeNum})
                      </span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tight mt-0.5">
                        {currencySymbol} {displayedStake.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* PANEL 2: EXECUTION & CONTINUOUS MASANIELLO RESULT RECORDING */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Manual Execution Panel</h2>
                <p className="text-xs text-slate-400">Execute on broker and record outcome</p>
              </div>
            </div>
            {activeSession && (
              <button
                onClick={() => setIsEndSessionModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm shadow-rose-500/10"
              >
                <Power className="h-3.5 w-3.5" />
                End Session
              </button>
            )}
          </div>

          {/* ACTION BUTTONS: On mobile order-1 (first), on md: order-2 (second) */}
          <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
            {/* LOSS BUTTON FIRST */}
            <button
              onClick={() => handleRecordResult('L')}
              disabled={recordResultMutation.isPending || !activeSession}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-rose-600 py-6 font-bold text-white shadow-xl shadow-rose-600/20 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all disabled:opacity-40"
            >
              {recordResultMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xl">
                    <XCircle className="h-6 w-6" /> LOSS
                  </div>
                  <span className="text-xs font-normal text-rose-100">Shortcut Key [L]</span>
                </>
              )}
            </button>

            {/* WIN BUTTON SECOND */}
            <button
              onClick={() => handleRecordResult('W')}
              disabled={recordResultMutation.isPending || !activeSession}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-emerald-600 py-6 font-bold text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all disabled:opacity-40"
            >
              {recordResultMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xl">
                    <CheckCircle2 className="h-6 w-6" /> WIN
                  </div>
                  <span className="text-xs font-normal text-emerald-100">Shortcut Key [W]</span>
                </>
              )}
            </button>
          </div>

          {/* CONTINUOUS SEQUENCE: On mobile order-2 (below buttons), on md: order-1 (above buttons) */}
          <div className="order-2 md:order-1 rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Continuous Sequence ({sequence.length} Trades Completed):</span>
              <span className="font-semibold text-slate-300">
                Target: {activeSession?.winsRequired || 1} Win
              </span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[36px] items-center">
              {sequence.length === 0 ? (
                <span className="text-xs italic text-slate-500">No trade results recorded yet.</span>
              ) : (
                sequence.map((res, idx) => (
                  <span
                    key={idx}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${
                      res === 'w'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {res.toUpperCase()}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TRADE HISTORY TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h2 className="text-lg font-bold text-white">Execution Trade History Log</h2>
            <p className="text-xs text-slate-400">Real-time audit log of executed trades (Newest first)</p>
          </div>
          <Badge variant="neutral">{recentTrades.length} Trades Recorded</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Time</th>
                <th className="px-6 py-3.5">Pair</th>
                <th className="px-6 py-3.5">Timeframe</th>
                <th className="px-6 py-3.5">Signal</th>
                <th className="px-6 py-3.5">Stake Amount</th>
                <th className="px-6 py-3.5">Result</th>
                <th className="px-6 py-3.5">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-500">
                    No executed trades recorded in history yet. Start a session and execute your first trade!
                  </td>
                </tr>
              ) : (
                recentTrades.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{t.pair}</td>
                    <td className="px-6 py-4 text-xs font-mono">{t.timeframe}</td>
                    <td className="px-6 py-4">
                      <Badge variant={t.signal === 'BUY' || t.signal === 'UP' ? 'success' : 'danger'}>
                        {t.signal}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-emerald-400">
                      {currencySymbol} {t.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          t.result === 'W' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.result === 'W' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {t.result === 'W' ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-white">
                      {currencySymbol} {t.balanceAfter?.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
