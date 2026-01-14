
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, LayoutGrid, List as ListIcon, Wallet, PieChart as ChartIcon, 
  ChevronLeft, ChevronRight, X, User, Settings2, CalendarDays,
  CreditCard, Landmark, Banknote, Trash2, CheckCircle2, HandCoins, Info,
  Menu, PiggyBank, ReceiptText, BarChart3, Coins, Ghost, Edit3, 
  ShoppingBasket, Bus, Ticket, Utensils, Heart, Gift, Smile, ShoppingBag, 
  PawPrint, GraduationCap, Plane, ChevronDown, TrendingUp, Circle, Calendar,
  ArrowRight, ArrowLeftRight, Download, Settings
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  View, Category, Account, Transaction, AccountType, AppState 
} from './types';
import { CURRENCY } from './constants';
import { loadState, saveState } from './storage';
import CategoryCircle from './components/CategoryCircle';
import DonutChart from './components/DonutChart';
import Keypad from './components/Keypad';
import IconRenderer from './components/IconRenderer';

type AccountSubTab = 'accounts' | 'debts' | 'finances';
type PeriodType = 'month' | 'year' | 'last_year' | 'custom';

const COLOR_PALETTE = [
  '#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', 
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', 
  '#f97316', '#ef4444', '#f43f5e', '#ec4899', '#d946ef', 
  '#a855f7', '#8b5cf6', '#64748b', '#475569', '#1e293b'
];

const ACCOUNT_ICON_LIST = ['Wallet', 'CreditCard', 'Landmark', 'Banknote', 'PiggyBank', 'Coins', 'ReceiptText', 'HandCoins'];
const CATEGORY_ICON_LIST = ['ShoppingBasket', 'Bus', 'Ticket', 'Utensils', 'Heart', 'Gift', 'Smile', 'ShoppingBag', 'PawPrint', 'GraduationCap', 'Plane', 'Home', 'Car', 'Smartphone', 'Gamepad2', 'Coffee', 'Shirt', 'Dumbbell', 'Music', 'Camera', 'Book', 'Wine', 'IceCream', 'Pizza'];

const App: React.FC = () => {
  // --- Состояние приложения ---
  const [data, setData] = useState<AppState>(() => loadState());
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date()); 
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // Сохранение при каждом изменении данных
  useEffect(() => {
    saveState(data);
  }, [data]);

  // --- UI Состояние ---
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [amountStr, setAmountStr] = useState('0');
  const [activeAccount, setActiveAccount] = useState<Account>(data.accounts[0]);
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [toAccount, setToAccount] = useState<Account | null>(null);

  const [accountSubTab, setAccountSubTab] = useState<AccountSubTab>('accounts');
  const [showAccountEditModal, setShowAccountEditModal] = useState(false);
  const [showAccountActionsModal, setShowAccountActionsModal] = useState(false);
  const [showBalanceCorrectionModal, setShowBalanceCorrectionModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [tempAccountData, setTempAccountData] = useState<{ name: string; balance: number; icon: string; color: string; type: AccountType; }>({ name: '', balance: 0, icon: 'Wallet', color: '#4f46e5', type: 'regular' });

  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tempCategoryData, setTempCategoryData] = useState<{ name: string; icon: string; color: string; }>({ name: '', icon: 'Circle', color: '#4f46e5' });

  const [isSelectingAccount, setIsSelectingAccount] = useState(false);
  const [isSelectingToAccount, setIsSelectingToAccount] = useState(false);
  const [isSelectingCategory, setIsSelectingCategory] = useState(false);

  // --- Вычисления и Фильтрация ---
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(t => {
      const tDate = new Date(t.date);
      if (periodType === 'month') {
        return tDate.getMonth() === selectedPeriod.getMonth() && tDate.getFullYear() === selectedPeriod.getFullYear();
      } else if (periodType === 'year') {
        return tDate.getFullYear() === selectedPeriod.getFullYear();
      } else if (periodType === 'last_year') {
        return tDate.getFullYear() === new Date().getFullYear() - 1;
      } else if (periodType === 'custom') {
        if (!customRange.start || !customRange.end) return true;
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);
        return tDate >= start && tDate <= end;
      }
      return true;
    });
  }, [data.transactions, selectedPeriod, periodType, customRange]);

  const assetsBalance = useMemo(() => data.accounts.filter(a => a.type !== 'debt').reduce((acc, a) => acc + a.balance, 0), [data.accounts]);
  const debtsBalance = useMemo(() => data.accounts.filter(a => a.type === 'debt').reduce((acc, a) => acc + a.balance, 0), [data.accounts]);
  const netWealth = assetsBalance - Math.abs(debtsBalance);
  
  const totals = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const incomes = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    return { expenses, incomes };
  }, [filteredTransactions]);

  const savingsIndicator = useMemo(() => {
    if (totals.incomes === 0) return 0;
    const ratio = 1 - (totals.expenses / totals.incomes);
    return Math.max(0, Math.round(ratio * 100));
  }, [totals]);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTotal = filteredTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(todayStr))
      .reduce((acc, t) => acc + t.amount, 0);
    const daysInMonth = new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth() + 1, 0).getDate();
    return { todayTotal, avgPerDay: totals.expenses / daysInMonth };
  }, [filteredTransactions, totals.expenses, selectedPeriod]);

  // Fix for error in App.tsx: Cannot find name 'chartData'
  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        const date = new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric' });
        days[date] = (days[date] || 0) + t.amount;
      }
    });
    return Object.entries(days).map(([name, amount]) => ({ name, amount }));
  }, [filteredTransactions]);

  // Fix for error in App.tsx: Cannot find name 'categoryBreakdown'
  const categoryBreakdown = useMemo(() => {
    return data.categories
      .filter(c => c.type === 'expense')
      .map(cat => ({
        ...cat,
        amount: filteredTransactions
          .filter(t => t.categoryId === cat.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      }))
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [data.categories, filteredTransactions]);

  // --- Обработчики ---
  const handleAddTransaction = () => {
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 11),
      amount,
      date: new Date().toISOString(),
      accountId: activeAccount.id,
      type: transactionType,
      categoryId: activeCategory?.id || (transactionType === 'transfer' ? 'transfer' : '1')
    };

    if (transactionType === 'transfer' && toAccount) {
      newTx.toAccountId = toAccount.id;
    }

    setData(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      accounts: prev.accounts.map(acc => {
        if (acc.id === activeAccount.id) {
          return { ...acc, balance: transactionType === 'expense' || transactionType === 'transfer' ? acc.balance - amount : acc.balance + amount };
        }
        if (transactionType === 'transfer' && toAccount && acc.id === toAccount.id) {
          return { ...acc, balance: acc.balance + amount };
        }
        return acc;
      })
    }));

    setShowTransactionModal(false);
    setAmountStr('0');
    setToAccount(null);
  };

  // Fix for error in App.tsx: Cannot find name 'handleOpenAccountEdit'
  const handleOpenAccountEdit = (acc: Account) => {
    setEditingAccount(acc);
    setTempAccountData({
      name: acc.name,
      balance: acc.balance,
      icon: acc.icon,
      color: acc.color,
      type: acc.type
    });
    setShowAccountEditModal(true);
    setShowAccountActionsModal(false);
  };

  const handleSaveAccount = (forceNoCorrection: boolean = false) => {
    if (!tempAccountData.name) return;
    
    if (editingAccount && editingAccount.balance !== tempAccountData.balance && !forceNoCorrection) {
      setShowBalanceCorrectionModal(true);
      return;
    }

    setData(prev => {
      const updatedAccounts = editingAccount 
        ? prev.accounts.map(a => a.id === editingAccount.id ? { ...a, ...tempAccountData } : a)
        : [...prev.accounts, { id: Math.random().toString(36).substring(2, 9), ...tempAccountData }];
      return { ...prev, accounts: updatedAccounts };
    });

    setShowAccountEditModal(false);
    setShowBalanceCorrectionModal(false);
    setEditingAccount(null);
  };

  const handleCorrectionWithTransaction = () => {
    if (!editingAccount) return;
    const diff = tempAccountData.balance - editingAccount.balance;
    const type = diff > 0 ? 'income' : 'expense';
    
    const correctionTx: Transaction = {
      id: Math.random().toString(36).substring(2, 11),
      amount: Math.abs(diff),
      date: new Date().toISOString(),
      accountId: editingAccount.id,
      type: type,
      categoryId: 'adjustment',
      note: 'Корректировка баланса'
    };

    setData(prev => ({
      ...prev,
      transactions: [correctionTx, ...prev.transactions],
      accounts: prev.accounts.map(a => a.id === editingAccount.id ? { ...a, ...tempAccountData } : a)
    }));
    
    setShowAccountEditModal(false);
    setShowBalanceCorrectionModal(false);
    setEditingAccount(null);
  };

  const changePeriod = (offset: number) => {
    const next = new Date(selectedPeriod);
    if (periodType === 'month') next.setMonth(next.getMonth() + offset);
    else next.setFullYear(next.getFullYear() + offset);
    setSelectedPeriod(next);
  };

  // --- Отрисовка Вкладок ---
  const renderDashboard = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="bg-[#6366f1] pt-12 pb-6 px-6 rounded-b-[40px] text-white shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <button className="p-2 bg-white/10 rounded-full"><Menu size={20}/></button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-70 font-medium">Чистый капитал</span>
            <span className="text-2xl font-bold">{netWealth.toLocaleString('ru-RU')} {CURRENCY}</span>
          </div>
          <button onClick={() => setIsCategoryEditMode(!isCategoryEditMode)} className={`p-2 rounded-full transition-colors ${isCategoryEditMode ? 'bg-white text-indigo-600' : 'bg-white/10 text-white'}`}>
            {isCategoryEditMode ? <CheckCircle2 size={20}/> : <Edit3 size={20}/>}
          </button>
        </div>
        <div className="text-center text-[10px] font-bold tracking-widest mt-4 uppercase">Категории расходов</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-x-2 gap-y-10 items-start">
          {data.categories.filter(c => c.type === 'expense').map(cat => (
            <CategoryCircle key={cat.id} category={cat} amount={filteredTransactions.filter(t => t.categoryId === cat.id).reduce((acc, t) => acc + t.amount, 0)} onClick={() => {
              if (isCategoryEditMode) { setEditingCategory(cat); setTempCategoryData({ name: cat.name, icon: cat.icon, color: cat.color }); setShowCategoryEditModal(true); }
              else { setTransactionType('expense'); setActiveCategory(cat); setShowTransactionModal(true); }
            }} />
          ))}
          <div className="col-span-2 row-start-2 col-start-2 flex justify-center">
            <DonutChart transactions={filteredTransactions} categories={data.categories} totalBalance={netWealth} totalExpenses={totals.expenses} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-[#6366f1] pt-12 pb-6 px-6 rounded-b-[40px] text-white shadow-lg z-10">
        <div className="flex justify-between items-center mb-1">
          <button className="p-2 bg-white/10 rounded-full"><Menu size={20}/></button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] opacity-70 font-medium">Все счета</span>
            <span className="text-2xl font-bold">{netWealth.toLocaleString('ru-RU')} {CURRENCY}</span>
          </div>
          <button onClick={() => { setEditingAccount(null); setTempAccountData({ name: '', balance: 0, icon: 'Wallet', color: '#4f46e5', type: 'regular' }); setShowAccountEditModal(true); }} className="p-2 bg-white/10 rounded-full"><Plus size={20}/></button>
        </div>
        <div className="flex gap-8 justify-center mt-6">
          {(['accounts', 'debts', 'finances'] as const).map(tab => (
            <button key={tab} onClick={() => setAccountSubTab(tab)} className={`pb-1 border-b-2 font-bold text-xs uppercase ${accountSubTab === tab ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
              {tab === 'accounts' ? 'Счета' : tab === 'debts' ? 'Долги' : 'Обзор'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {accountSubTab === 'accounts' && data.accounts.filter(a => a.type !== 'debt').map(acc => (
          <div key={acc.id} onClick={() => { setEditingAccount(acc); setShowAccountActionsModal(true); }} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-100" style={{ color: acc.color }}><IconRenderer name={acc.icon} size={24}/></div>
              <span className="font-bold text-slate-700">{acc.name}</span>
            </div>
            <span className="font-bold text-emerald-500">{acc.balance.toLocaleString('ru-RU')} {CURRENCY}</span>
          </div>
        ))}
        {accountSubTab === 'debts' && data.accounts.filter(a => a.type === 'debt').map(acc => (
          <div key={acc.id} onClick={() => { setEditingAccount(acc); setShowAccountActionsModal(true); }} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-100" style={{ color: acc.color }}><IconRenderer name={acc.icon} size={24}/></div>
              <span className="font-bold text-slate-700">{acc.name}</span>
            </div>
            <span className="font-bold text-red-500">{acc.balance.toLocaleString('ru-RU')} {CURRENCY}</span>
          </div>
        ))}
        {accountSubTab === 'finances' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-4">Мои Финансы</div>
            <div className="flex justify-around mb-6">
              <div><div className="text-[10px] text-slate-400">АКТИВЫ</div><div className="font-bold text-emerald-500">{assetsBalance.toLocaleString('ru-RU')} ₽</div></div>
              <div><div className="text-[10px] text-slate-400">ДОЛГИ</div><div className="font-bold text-red-500">{debtsBalance.toLocaleString('ru-RU')} ₽</div></div>
            </div>
            <div className="bg-emerald-500 rounded-2xl p-4 text-white">
              <div className="text-[10px] opacity-80 uppercase">Чистый капитал</div>
              <div className="text-xl font-bold">{netWealth.toLocaleString('ru-RU')} ₽</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-[#6366f1] pt-12 pb-6 px-6 rounded-b-[40px] text-white shadow-lg">
        <h2 className="text-lg font-bold text-center">История операций</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTransactions.map(t => {
          const cat = data.categories.find(c => c.id === t.categoryId);
          const acc = data.accounts.find(a => a.id === t.accountId);
          return (
            <div key={t.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100" style={{ color: cat?.color }}><IconRenderer name={cat?.icon || 'Circle'} size={20}/></div>
                <div>
                  <div className="font-bold text-sm">{cat?.name || (t.type === 'transfer' ? 'Перевод' : 'Корректировка')}</div>
                  <div className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString('ru-RU')} • {acc?.name}</div>
                </div>
              </div>
              <div className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                {t.type === 'expense' ? '-' : '+'}{t.amount.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-[#6366f1] pt-12 pb-4 px-6 text-white shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <Menu size={20}/>
          <div className="text-center">
            <div className="text-[10px] opacity-70 uppercase">Баланс</div>
            <div className="text-xl font-bold">{netWealth.toLocaleString('ru-RU')} ₽</div>
          </div>
          <Calendar size={20}/>
        </div>
        <div onClick={() => setShowPeriodModal(true)} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2 mt-4 cursor-pointer">
          <ChevronLeft onClick={(e) => { e.stopPropagation(); changePeriod(-1); }} size={20}/>
          <span className="text-xs font-bold uppercase">{periodType === 'month' ? selectedPeriod.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }) : periodType === 'year' ? `${selectedPeriod.getFullYear()} ГОД` : 'ПЕРИОД'}</span>
          <ChevronRight onClick={(e) => { e.stopPropagation(); changePeriod(1); }} size={20}/>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex justify-between items-center p-6 bg-white border-b">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase">Баланс</span>
            <span className="text-lg font-bold text-emerald-500">{netWealth.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="w-12 h-12 flex items-center justify-center border-2 border-emerald-500 rounded-full text-xs font-bold text-emerald-500">{savingsIndicator}</div>
        </div>
        <div className="grid grid-cols-2 text-center text-white font-bold">
          <div className="bg-red-500 p-4"><div>РАСХОДЫ</div><div>{totals.expenses.toLocaleString('ru-RU')} ₽</div></div>
          <div className="bg-white text-emerald-500 p-4 border-b"><div>ДОХОДЫ</div><div>{totals.incomes.toLocaleString('ru-RU')} ₽</div></div>
        </div>
        <div className="bg-white p-4 h-48 border-b">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}><Bar dataKey="amount" fill="#66bb6a" radius={[4, 4, 0, 0]}/></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 bg-white border-b text-center p-4">
          <div><div className="text-[10px] text-slate-400">СРЕДНЕЕ/ДЕНЬ</div><div className="text-sm font-bold">{Math.round(stats.avgPerDay)} ₽</div></div>
          <div><div className="text-[10px] text-slate-400">СЕГОДНЯ</div><div className="text-sm font-bold">{stats.todayTotal} ₽</div></div>
          <div><div className="text-[10px] text-slate-400">НЕДЕЛЯ</div><div className="text-sm font-bold">{totals.expenses} ₽</div></div>
        </div>
        <div className="p-4 space-y-4 bg-white">
          {categoryBreakdown.map(cat => {
            const perc = totals.expenses > 0 ? Math.round((cat.amount / totals.expenses) * 100) : 0;
            return (
              <div key={cat.id} className="flex items-center gap-4">
                <div className="p-2 rounded-full" style={{ backgroundColor: cat.color }}><IconRenderer name={cat.icon} size={16} color="white"/></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-bold"><span>{cat.name}</span><span>{cat.amount} ₽</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden"><div className="h-full" style={{ width: `${perc}%`, backgroundColor: cat.color }}></div></div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 w-6 text-right">{perc}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-white overflow-hidden flex flex-col font-sans">
      <div className="flex-1 overflow-hidden">
        {view === View.DASHBOARD && renderDashboard()}
        {view === View.ACCOUNTS && renderAccounts()}
        {view === View.HISTORY && renderHistory()}
        {view === View.PLANNING && renderOverview()}
      </div>

      <div className="bg-white border-t px-6 py-2 flex items-center justify-between z-20">
        {(Object.values(View)).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`flex flex-col items-center gap-1 ${view === v ? 'text-indigo-600' : 'text-slate-400'}`}>
            <IconRenderer name={v === View.ACCOUNTS ? 'CreditCard' : v === View.DASHBOARD ? 'LayoutGrid' : v === View.HISTORY ? 'ReceiptText' : 'BarChart3'} size={22}/>
            <span className="text-[10px] font-bold">{v === View.ACCOUNTS ? 'Счета' : v === View.DASHBOARD ? 'Категории' : v === View.HISTORY ? 'Операции' : 'Обзор'}</span>
          </button>
        ))}
      </div>

      {/* Модальные окна */}
      {showAccountActionsModal && editingAccount && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full rounded-t-[40px] p-6 animate-in slide-in-from-bottom">
            <div className="flex justify-between mb-4">
              <span className="font-bold">{editingAccount.name}</span>
              <X onClick={() => setShowAccountActionsModal(false)}/>
            </div>
            <div className="grid grid-cols-3 gap-4 pb-8">
              <button onClick={() => { setTransactionType('transfer'); setActiveAccount(editingAccount); setShowTransactionModal(true); setShowAccountActionsModal(false); }} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2"><ArrowLeftRight className="text-indigo-500"/><span className="text-[10px] font-bold">ПЕРЕВОД</span></button>
              <button onClick={() => { setTransactionType('income'); setActiveAccount(editingAccount); setActiveCategory(data.categories.find(c => c.type === 'income')!); setShowTransactionModal(true); setShowAccountActionsModal(false); }} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2"><Download className="text-emerald-500"/><span className="text-[10px] font-bold">ПОПОЛНИТЬ</span></button>
              <button onClick={() => handleOpenAccountEdit(editingAccount)} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2"><Settings className="text-slate-500"/><span className="text-[10px] font-bold">ИЗМЕНИТЬ</span></button>
            </div>
          </div>
        </div>
      )}

      {showBalanceCorrectionModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-6 rounded-[32px] w-full max-w-xs space-y-4">
            <h3 className="font-bold">Баланс изменен</h3>
            <p className="text-sm text-slate-500">Отразить это изменение как операцию в истории?</p>
            <button onClick={handleCorrectionWithTransaction} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Создать операцию</button>
            <button onClick={() => handleSaveAccount(true)} className="w-full py-4 bg-slate-50 rounded-2xl font-bold">Просто заменить</button>
            <button onClick={() => setShowBalanceCorrectionModal(false)} className="w-full py-2 text-slate-400">Отмена</button>
          </div>
        </div>
      )}

      {showTransactionModal && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-[40px] overflow-hidden relative max-h-[95%]">
            <div className="flex h-24 border-b">
              <button onClick={() => { setIsSelectingAccount(true); setIsSelectingToAccount(false); setIsSelectingCategory(false); }} className="flex-1 bg-indigo-50 p-4 text-center">
                <div className="text-[10px] font-bold text-indigo-400">ОТКУДА</div>
                <div className="font-bold truncate">{activeAccount.name}</div>
              </button>
              <button onClick={() => { if (transactionType === 'transfer') setIsSelectingToAccount(true); else setIsSelectingCategory(true); setIsSelectingAccount(false); }} className="flex-1 bg-emerald-50 p-4 text-center">
                <div className="text-[10px] font-bold text-emerald-400">{transactionType === 'transfer' ? 'КУДА' : 'КАТЕГОРИЯ'}</div>
                <div className="font-bold truncate">{transactionType === 'transfer' ? toAccount?.name || '...' : activeCategory?.name || '...'}</div>
              </button>
            </div>
            
            {(isSelectingAccount || isSelectingToAccount || isSelectingCategory) && (
              <div className="p-4 bg-slate-50 border-b grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {isSelectingAccount && data.accounts.map(acc => <button key={acc.id} onClick={() => { setActiveAccount(acc); setIsSelectingAccount(false); }} className="bg-white p-2 rounded-xl shadow-sm text-xs font-bold">{acc.name}</button>)}
                {isSelectingToAccount && data.accounts.map(acc => <button key={acc.id} onClick={() => { setToAccount(acc); setIsSelectingToAccount(false); }} className="bg-white p-2 rounded-xl shadow-sm text-xs font-bold">{acc.name}</button>)}
                {isSelectingCategory && data.categories.filter(c => c.type === (transactionType === 'expense' ? 'expense' : 'income')).map(cat => <button key={cat.id} onClick={() => { setActiveCategory(cat); setIsSelectingCategory(false); }} className="bg-white p-2 rounded-xl shadow-sm text-xs font-bold">{cat.name}</button>)}
              </div>
            )}

            <div className="p-6 text-center">
              <div className="text-[10px] text-slate-400 uppercase">{transactionType === 'transfer' ? 'СУММА ПЕРЕВОДА' : 'СУММА'}</div>
              <div className={`text-4xl font-bold ${transactionType === 'income' ? 'text-emerald-500' : 'text-indigo-600'}`}>{amountStr} ₽</div>
            </div>
            <Keypad onKeyPress={v => setAmountStr(p => p === '0' ? v : p + v)} onDelete={() => setAmountStr(p => p.length > 1 ? p.slice(0, -1) : '0')} onConfirm={handleAddTransaction}/>
            <X className="absolute top-2 right-2 text-slate-300" onClick={() => setShowTransactionModal(false)}/>
          </div>
        </div>
      )}

      {/* Выбор периода */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-[40px] p-6 space-y-4 animate-in slide-in-from-bottom">
            <h2 className="font-bold uppercase tracking-widest text-center">Выберите период</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setPeriodType('month'); setShowPeriodModal(false); }} className={`p-4 rounded-2xl border-2 font-bold ${periodType === 'month' ? 'border-indigo-500' : 'border-slate-100'}`}>Месяц</button>
              <button onClick={() => { setPeriodType('year'); setShowPeriodModal(false); }} className={`p-4 rounded-2xl border-2 font-bold ${periodType === 'year' ? 'border-indigo-500' : 'border-slate-100'}`}>Год</button>
              <button onClick={() => { setPeriodType('last_year'); setShowPeriodModal(false); }} className={`p-4 rounded-2xl border-2 font-bold ${periodType === 'last_year' ? 'border-indigo-500' : 'border-slate-100'}`}>Прошлый год</button>
              <button onClick={() => setPeriodType('custom')} className={`p-4 rounded-2xl border-2 font-bold ${periodType === 'custom' ? 'border-indigo-500' : 'border-slate-100'}`}>Произвольный</button>
            </div>
            {periodType === 'custom' && (
              <div className="flex gap-2 items-end">
                <input type="date" value={customRange.start} onChange={e => setCustomRange(p => ({...p, start: e.target.value}))} className="flex-1 bg-slate-100 p-2 rounded-lg"/>
                <input type="date" value={customRange.end} onChange={e => setCustomRange(p => ({...p, end: e.target.value}))} className="flex-1 bg-slate-100 p-2 rounded-lg"/>
                <button onClick={() => setShowPeriodModal(false)} className="bg-indigo-600 text-white p-2 rounded-lg">ОК</button>
              </div>
            )}
            <button onClick={() => setShowPeriodModal(false)} className="w-full p-2 text-slate-400">Закрыть</button>
          </div>
        </div>
      )}

      {/* Редактирование счета */}
      {showAccountEditModal && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full rounded-t-[40px] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold">{editingAccount ? 'Изменить счет' : 'Новый счет'}</h2>
            <input value={tempAccountData.name} onChange={e => setTempAccountData({...tempAccountData, name: e.target.value})} placeholder="Название" className="w-full bg-slate-100 p-4 rounded-2xl font-bold"/>
            <input type="number" value={tempAccountData.balance} onChange={e => setTempAccountData({...tempAccountData, balance: parseFloat(e.target.value) || 0})} placeholder="Баланс" className="w-full bg-slate-100 p-4 rounded-2xl font-bold"/>
            <div className="flex gap-2">
              {(['regular', 'savings', 'debt'] as AccountType[]).map(t => (
                <button key={t} onClick={() => setTempAccountData({...tempAccountData, type: t})} className={`flex-1 p-2 border-2 rounded-xl text-[10px] font-bold ${tempAccountData.type === t ? 'border-indigo-600' : 'border-slate-100'}`}>{t === 'debt' ? 'ДОЛГ' : t === 'savings' ? 'ЦЕЛЬ' : 'СЧЕТ'}</button>
              ))}
            </div>
            <button onClick={() => handleSaveAccount()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold">Сохранить</button>
            <button onClick={() => setShowAccountEditModal(false)} className="w-full py-2 text-slate-400">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
