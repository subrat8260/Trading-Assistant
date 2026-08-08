import { useState, useMemo } from 'react';
import { Search, X, Star, Check, Globe } from 'lucide-react';

export const TRADE_PAIRS = [
  // CURRENCIES
  { symbol: 'USD/BRL (OTC)', name: 'US Dollar / Brazilian Real', category: 'CURRENCIES' },
  { symbol: 'USD/ARS (OTC)', name: 'US Dollar / Argentine Peso', category: 'CURRENCIES' },
  { symbol: 'USD/BDT (OTC)', name: 'US Dollar / Bangladeshi Taka', category: 'CURRENCIES' },
  { symbol: 'USD/DZD (OTC)', name: 'US Dollar / Algerian Dinar', category: 'CURRENCIES' },
  { symbol: 'USD/EGP (OTC)', name: 'US Dollar / Egyptian Pound', category: 'CURRENCIES' },
  { symbol: 'USD/INR (OTC)', name: 'US Dollar / Indian Rupee', category: 'CURRENCIES' },
  { symbol: 'EUR/SGD (OTC)', name: 'Euro / Singapore Dollar', category: 'CURRENCIES' },
  { symbol: 'GBP/NZD (OTC)', name: 'British Pound / New Zealand Dollar', category: 'CURRENCIES' },
  { symbol: 'NZD/CAD (OTC)', name: 'New Zealand Dollar / Canadian Dollar', category: 'CURRENCIES' },
  { symbol: 'AUD/JPY (OTC)', name: 'Australian Dollar / Japanese Yen', category: 'CURRENCIES' },
  { symbol: 'EUR/GBP (OTC)', name: 'Euro / British Pound', category: 'CURRENCIES' },
  { symbol: 'NZD/JPY (OTC)', name: 'New Zealand Dollar / Japanese Yen', category: 'CURRENCIES' },
  { symbol: 'USD/JPY (OTC)', name: 'US Dollar / Japanese Yen', category: 'CURRENCIES' },
  { symbol: 'EUR/USD (OTC)', name: 'Euro / US Dollar', category: 'CURRENCIES' },
  { symbol: 'AUD/NZD (OTC)', name: 'Australian Dollar / New Zealand Dollar', category: 'CURRENCIES' },
  { symbol: 'USD/TRY (OTC)', name: 'US Dollar / Turkish Lira', category: 'CURRENCIES' },
  { symbol: 'AUD/USD (OTC)', name: 'Australian Dollar / US Dollar', category: 'CURRENCIES' },
  { symbol: 'CAD/CHF (OTC)', name: 'Canadian Dollar / Swiss Franc', category: 'CURRENCIES' },
  { symbol: 'EUR/JPY (OTC)', name: 'Euro / Japanese Yen', category: 'CURRENCIES' },
  { symbol: 'GBP/USD (OTC)', name: 'British Pound / US Dollar', category: 'CURRENCIES' },
  { symbol: 'AUD/CAD (OTC)', name: 'Australian Dollar / Canadian Dollar', category: 'CURRENCIES' },
  { symbol: 'GBP/CHF (OTC)', name: 'British Pound / Swiss Franc', category: 'CURRENCIES' },
  { symbol: 'EUR/CAD (OTC)', name: 'Euro / Canadian Dollar', category: 'CURRENCIES' },
  { symbol: 'EUR/CHF (OTC)', name: 'Euro / Swiss Franc', category: 'CURRENCIES' },
  { symbol: 'GBP/AUD (OTC)', name: 'British Pound / Australian Dollar', category: 'CURRENCIES' },
  { symbol: 'USD/CAD (OTC)', name: 'US Dollar / Canadian Dollar', category: 'CURRENCIES' },
  { symbol: 'USD/IDR (OTC)', name: 'US Dollar / Indonesian Rupiah', category: 'CURRENCIES' },
  { symbol: 'USD/PKR (OTC)', name: 'US Dollar / Pakistani Rupee', category: 'CURRENCIES' },
  { symbol: 'USD/MXN (OTC)', name: 'US Dollar / Mexican Peso', category: 'CURRENCIES' },
  { symbol: 'USD/PHP (OTC)', name: 'US Dollar / Philippine Peso', category: 'CURRENCIES' },
  { symbol: 'USD/NGN (OTC)', name: 'US Dollar / Nigerian Naira', category: 'CURRENCIES' },
  { symbol: 'CHF/JPY (OTC)', name: 'Swiss Franc / Japanese Yen', category: 'CURRENCIES' },
  { symbol: 'EUR/AUD (OTC)', name: 'Euro / Australian Dollar', category: 'CURRENCIES' },
  { symbol: 'GBP/CAD (OTC)', name: 'British Pound / Canadian Dollar', category: 'CURRENCIES' },
  { symbol: 'GBP/JPY (OTC)', name: 'British Pound / Japanese Yen', category: 'CURRENCIES' },
  { symbol: 'NZD/USD (OTC)', name: 'New Zealand Dollar / US Dollar', category: 'CURRENCIES' },
  { symbol: 'USD/ZAR (OTC)', name: 'US Dollar / South African Rand', category: 'CURRENCIES' },
  { symbol: 'USD/COP (OTC)', name: 'US Dollar / Colombian Peso', category: 'CURRENCIES' },
  { symbol: 'NZD/CHF (OTC)', name: 'New Zealand Dollar / Swiss Franc', category: 'CURRENCIES' },

  // CRYPTO
  { symbol: 'Dogecoin (OTC)', name: 'Doge Coin', category: 'CRYPTO' },
  { symbol: 'Bitcoin (OTC)', name: 'Bitcoin', category: 'CRYPTO' },
  { symbol: 'Pepe (OTC)', name: 'Pepe Coin', category: 'CRYPTO' },

  // COMMODITIES
  { symbol: 'USCrude (OTC)', name: 'US Crude Oil', category: 'COMMODITIES' },
  { symbol: 'Silver (OTC)', name: 'Silver', category: 'COMMODITIES' },
  { symbol: 'UKBrent (OTC)', name: 'UK Brent Crude Oil', category: 'COMMODITIES' },
  { symbol: 'Gold (OTC)', name: 'Gold', category: 'COMMODITIES' },

  // STOCKS
  { symbol: 'JOHNSON & JOHNSON (OTC)', name: 'Johnson & Johnson', category: 'STOCKS' },
  { symbol: 'MCDONALDS (OTC)', name: "McDonald's Corporation", category: 'STOCKS' },
  { symbol: 'MICROSOFT (OTC)', name: 'Microsoft Corporation', category: 'STOCKS' },
  { symbol: 'BOEING COMPANY (OTC)', name: 'The Boeing Company', category: 'STOCKS' },
  { symbol: 'AMERICAN EXPRESS (OTC)', name: 'American Express Company', category: 'STOCKS' },
  { symbol: 'FACEBOOK INC (OTC)', name: 'Facebook, Inc.', category: 'STOCKS' },
  { symbol: 'INTEL (OTC)', name: 'Intel Corporation', category: 'STOCKS' },
  { symbol: 'PFIZER INC (OTC)', name: 'Pfizer Inc.', category: 'STOCKS' },
  { symbol: 'IBEX 35 (OTC)', name: 'IBEX 35', category: 'STOCKS' },
];

const CATEGORIES = ['ALL', 'CURRENCIES', 'CRYPTO', 'COMMODITIES', 'STOCKS'];

const SelectPairModal = ({ isOpen, onClose, selectedPair, onSelectPair }) => {
  const [activeCategory, setActiveCategory] = useState('CURRENCIES');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['USD/BRL (OTC)', 'EUR/USD (OTC)', 'Bitcoin (OTC)']);

  const toggleFavorite = (e, symbol) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(symbol) ? prev.filter((item) => item !== symbol) : [...prev, symbol]
    );
  };

  const filteredPairs = useMemo(() => {
    return TRADE_PAIRS.filter((pair) => {
      const matchesCategory =
        activeCategory === 'ALL' || pair.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        pair.symbol.toLowerCase().includes(query) ||
        pair.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleSelectPair = (symbol) => {
    onSelectPair(symbol);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Select trade pair</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 pb-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative py-2">
          <Search className="absolute left-3.5 top-5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pair or asset..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-5 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Table Header - Name only as requested */}
        <div className="flex items-center justify-between pt-3 pb-2 border-b border-slate-800/80 px-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">
          <span>Name</span>
        </div>

        {/* Pair List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-1 custom-scrollbar">
          {filteredPairs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No trade pairs match your search query &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredPairs.map((pair) => {
              const isSelected = selectedPair === pair.symbol;
              const isFav = favorites.includes(pair.symbol);

              return (
                <div
                  key={pair.symbol}
                  onClick={() => handleSelectPair(pair.symbol)}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-all border ${isSelected
                      ? 'bg-sky-500/15 border-sky-500/40 text-white'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-200 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Favorite Star */}
                    <button
                      onClick={(e) => toggleFavorite(e, pair.symbol)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-1"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`h-4 w-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                          {pair.symbol}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {pair.name}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                      <Check className="h-3.5 w-3.5" />
                      Active
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectPairModal;
