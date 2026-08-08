import { useState, useMemo } from 'react';
import { Search, X, Check, DollarSign } from 'lucide-react';

export const CURRENCY_LIST = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
];

const SelectCurrencyModal = ({ isOpen, onClose, selectedCurrency, onSelectCurrency }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return CURRENCY_LIST;
    const q = searchQuery.toLowerCase().trim();
    return CURRENCY_LIST.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.symbol.includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl overflow-hidden space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Select Base Currency</h2>
              <p className="text-xs text-slate-400">Choose your preferred account trading currency</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search currency code or country..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Currency Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1 custom-scrollbar min-h-0">
          {filteredCurrencies.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              No currencies match &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredCurrencies.map((item) => {
              const isSelected = selectedCurrency === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onSelectCurrency(item.code);
                    setSearchQuery('');
                    onClose();
                  }}
                  className={`flex items-center justify-between rounded-xl p-3 text-left transition-all border ${
                    isSelected
                      ? 'bg-emerald-600/90 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 font-bold text-xs text-emerald-400 border border-slate-800">
                      {item.symbol}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white">{item.code}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        {item.name}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectCurrencyModal;
