
import React, { useState, useMemo } from 'react';
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
  View, Category, Account, Transaction, AccountType 
} from './types';
import { INITIAL_CATEGORIES, INITIAL_ACCOUNTS, CURRENCY } from './constants';
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

const CATEGORY_ICON_LIST = [
  'ShoppingBasket', 'Bus', 'Ticket', 'Utensils', 'Heart', 'Gift', 'Smile', 'ShoppingBag', 
  'PawPrint', 'GraduationCap', 'Plane', 'Home', 'Car', 'Smartphone', 'Gamepad2', 'Coffee',
  'Shirt', 'Dumbbell', 'Music', 'Camera', 'Book', 'Wine', 'IceCream', 'Pizza'
];

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [selectedPeriod, setSelectedPeriod] = useState(new Date()); 
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [amountStr, setAmountStr] = useState('0');
  const [activeAccount, setActiveAccount] = useState<Account>(accounts[0]);
  const [transactionType, setTransactionType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [toAccount, setToAccount] = useState<Account | null>(null);

  const [accountSubTab, setAccountSubTab] = useState<AccountSubTab>('accounts');
  const [showAccountEditModal, setShowAccountEditModal] = useState(false);
  const [showAccountActionsModal, setShowAccountActionsModal] = useState(false);
  const [showBalanceCorrectionModal, setShowBalanceCorrectionModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [tempAccountData, setTempAccountData] = useState<{
    name: string;
    balance: number;
    icon: string;
    color: string;
    type: AccountType;
  }>({ name: '', balance: 0, icon: 'Wallet', color: '#4f46e5', type: 'regular' });

  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tempCategoryData, setTempCategoryData] = useState<{
    name: string;
    icon: string;
    color: string;
  }>({ name: '', icon: 'Circle', color: '#4f46e5' });

  const [isSelectingAccount, setIsSelectingAccount] = useState(false);
  const [isSelectingToAccount, setIsSelectingToAccount] = useState(false);
  const [isSelectingCategory, setIsSelectingCategory] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (periodType === 'month') {
        return tDate.getMonth() === selectedPeriod.getMonth() && 
               tDate.getFullYear() === selectedPeriod.getFullYear();
      } else if (periodType === 'year') {
        return tDate.getFullYear() === selectedPeriod.getFullYear();
      } else if (periodType === 'last_year') {
        const lastYear = new Date().getFullYear() - 1;
        return tDate.getFullYear() === lastYear;
      } else if (periodType === 'custom') {
        if (!customRange.start || !customRange.end) return true;
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);
        return tDate >= start && tDate <= end;
      }
      return true;
    });
  }, [transactions, selectedPeriod, periodType, customRange]);

  const totalRegularBalance = useMemo(() => accounts.filter(a => a.type === 'regular').reduce((acc, a) => acc + a.balance, 0), [accounts]);
  const totalSavingsBalance = useMemo(() => accounts.filter(a => a.type === 'savings').reduce((acc, a) => acc + a.balance, 0), [accounts]);
  const totalDebts = useMemo(() => accounts.filter(a => a.type === 'debt').reduce((acc, a) => acc + a.balance, 0), [accounts]);
  
  const netWealth = totalRegularBalance + totalSavingsBalance - Math.abs(totalDebts);
  
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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayTotal = filteredTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(todayStr))
      .reduce((acc, t) => acc + t.amount, 0);

    const daysInMonth = new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth() + 1, 0).getDate();
    const avgPerDay = totals.expenses / daysInMonth;

    return { todayTotal, avgPerDay };
  }, [filteredTransactions, totals.expenses, selectedPeriod]);

  const chartData = useMemo(() => {
    const daysInMonth = new Date(selectedPeriod.getFullYear(), selectedPeriod.getMonth() + 1, 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = `${selectedPeriod.getFullYear()}-${String(selectedPeriod.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const amount = filteredTransactions
        .filter(t => t.type === 'expense' && t.date.startsWith(dayStr))
        .reduce((acc, t) => acc + t.amount, 0);
      data.push({ day: i, amount });
    }
    return data;
  }, [filteredTransactions, selectedPeriod]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const amount = filteredTransactions
          .filter(t => t.categoryId === cat.id)
          .reduce((acc, t) => acc + t.amount, 0);
        return { ...cat, amount };
      })
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    return breakdown;
  }, [categories, filteredTransactions]);

  const getCategoryTotal = (catId: string) => {
    return filteredTransactions
      .filter(t => t.categoryId === catId)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const handleCategoryClick = (cat: Category) => {
    if (isCategoryEditMode) {
      setEditingCategory(cat);
      setTempCategoryData({ name: cat.name, icon: cat.icon, color: cat.color });
      setShowCategoryEditModal(true);
    } else {
      setTransactionType('expense');
      setActiveCategory(cat);
      setAmountStr('0');
      setIsSelectingAccount(false);
      setIsSelectingCategory(false);
      setShowTransactionModal(true);
    }
  };

  const handleSaveCategory = () => {
    if (!tempCategoryData.name) return;
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...tempCategoryData } : c));
    } else {
      const newCat: Category = {
        id: Math.random().toString(36).substr(2, 9),
        ...tempCategoryData,
        type: 'expense'
      };
      setCategories(prev => {
        const lastIndex = prev.findIndex(c => c.id === '12');
        const newArr = [...prev];
        newArr.splice(lastIndex === -1 ? prev.length : lastIndex, 0, newCat);
        return newArr;
      });
    }
    setShowCategoryEditModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setShowCategoryEditModal(false);
  };

  const handleAddTransaction = () => {
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    if (transactionType === 'transfer') {
      if (!toAccount) return;
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount,
        categoryId: 'transfer',
        accountId: activeAccount.id,
        toAccountId: toAccount.id,
        date: new Date().toISOString(),
        type: 'transfer'
      };
      setTransactions(prev => [newTransaction, ...prev]);
      setAccounts(prev => prev.map(acc => {
        if (acc.id === activeAccount.id) return { ...acc, balance: acc.balance - amount };
        if (acc.id === toAccount.id) return { ...acc, balance: acc.balance + amount };
        return acc;
      }));
    } else {
      if (!activeCategory) return;
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount,
        categoryId: activeCategory.id,
        accountId: activeAccount.id,
        date: new Date().toISOString(),
        type: transactionType
      };
      setTransactions(prev => [newTransaction, ...prev]);
      setAccounts(prev => prev.map(acc => acc.id === activeAccount.id ? 
        { ...acc, balance: transactionType === 'expense' ? acc.balance - amount : acc.balance + amount } : acc
      ));
    }

    setShowTransactionModal(false);
    setActiveCategory(null);
    setAmountStr('0');
    setToAccount(null);
  };

  const handleOpenAccountEdit = (acc?: Account, defaultType: AccountType = 'regular') => {
    if (acc) {
      setEditingAccount(acc);
      setTempAccountData({ name: acc.name, balance: acc.balance, icon: acc.icon, color: acc.color, type: acc.type });
    } else {
      setEditingAccount(null);
      setTempAccountData({ name: '', balance: 0, icon: 'Wallet', color: '#4f46e5', type: defaultType });
    }
    setShowAccountActionsModal(false);
    setShowAccountEditModal(true);
  };

  const handleSaveAccount = (forceNoCorrection: boolean = false) => {
    if (!tempAccountData.name) return;
    
    if (editingAccount && editingAccount.balance !== tempAccountData.balance && !forceNoCorrection && !showBalanceCorrectionModal) {
      setShowBalanceCorrectionModal(true);
      return;
    }

    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...tempAccountData } : a));
    } else {
      const newAcc: Account = {
        id: Math.random().toString(36).substr(2, 9),
        ...tempAccountData
      };
      setAccounts(prev => [...prev, newAcc]);
    }
    setShowAccountEditModal(false);
    setShowBalanceCorrectionModal(false);
  };

  const handleCorrectionWithTransaction = () => {
    if (!editingAccount) return;
    const diff = tempAccountData.balance - editingAccount.balance;
    const type = diff > 0 ? 'income' : 'expense';
    const amount = Math.abs(diff);

    // Creating special correction transaction
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      categoryId: type === 'income' ? '13' : '1', // Default correction category
      accountId: editingAccount.id,
      date: new Date().toISOString(),
      type: type,
      note: 'Корректировка баланса'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    handleSaveAccount(true);
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
    setShowAccountEditModal(false);
  };

  const changePeriod = (offset: number) => {
    const next = new Date(selectedPeriod);
    if (periodType === 'month') {
      next.setMonth(next.getMonth() + offset);
    } else {
      next.setFullYear(next.getFullYear() + offset);
    }
    setSelectedPeriod(next);
  };

  const renderDashboard = () => {
    const expenseCats = categories.filter(c => c.type === 'expense');
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="bg-[#6366f1] pt-12 pb-6 px-6 rounded-b-[40px] relative text-white shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <button className="p-2 bg-white/10 rounded-full"><Menu size={20}/></button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] opacity-70 font-medium">Все счета</span>
              <span className="text-2xl font-bold">
                {netWealth.toLocaleString('ru-RU')} {CURRENCY}
              </span>
            </div>
            <button 
              onClick={() => setIsCategoryEditMode(!isCategoryEditMode)} 
              className={`p-2 rounded-full transition-colors ${isCategoryEditMode ? 'bg-white text-indigo-600' : 'bg-white/10 text-white'}`}
            >
              {isCategoryEditMode ? <CheckCircle2 size={20}/> : <Edit3 size={20}/>}
            </button>
          </div>
          <div className="text-center text-[10px] font-bold tracking-widest mt-4 uppercase">КАТЕГОРИИ</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 relative">
          <div className="grid grid-cols-4 gap-x-2 gap-y-10 items-start">
            {expenseCats.slice(0, 4).map(cat => (
              <CategoryCircle key={cat.id} category={cat} amount={getCategoryTotal(cat.id)} onClick={handleCategoryClick} />
            ))}
            <div className="flex flex-col gap-10">
              {expenseCats.slice(4, 6).map(cat => (
                <CategoryCircle key={cat.id} category={cat} amount={getCategoryTotal(cat.id)} onClick={handleCategoryClick} />
              ))}
            </div>
            <div className="col-span-2 flex justify-center items-center">
              <DonutChart 
                transactions={filteredTransactions} 
                categories={categories} 
                totalBalance={netWealth} 
                totalExpenses={totals.expenses} 
              />
            </div>
            <div className="flex flex-col gap-10">
              {expenseCats.slice(6, 8).map(cat => (
                <CategoryCircle key={cat.id} category={cat} amount={getCategoryTotal(cat.id)} onClick={handleCategoryClick} />
              ))}
            </div>
            {expenseCats.slice(8).map(cat => (
              <CategoryCircle key={cat.id} category={cat} amount={getCategoryTotal(cat.id)} onClick={handleCategoryClick} />
            ))}
            {isCategoryEditMode && (
              <div onClick={() => { setEditingCategory(null); setTempCategoryData({ name: '', icon: 'Plus', color: '#6366f1' }); setShowCategoryEditModal(true); }} className="flex flex-col items-center gap-1 cursor-pointer w-full">
                <div className="text-[11px] font-medium mb-0.5 text-slate-400">Добавить</div>
                <div className="w-[54px] h-[54px] rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
                  <Plus size={26} />
                </div>
                <div className="text-[10px] font-bold mt-0.5 opacity-40">Новая</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAccountsView = () => (
    <div className="flex flex-col h-full bg-slate-50">
       <div className="bg-[#6366f1] pt-12 pb-6 px-6 rounded-b-[40px] relative text-white shadow-lg z-10">
          <div className="flex justify-between items-center mb-1">
            <button className="p-2 bg-white/10 rounded-full"><Menu size={20}/></button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] opacity-70 font-medium">Все счета</span>
              <span className="text-2xl font-bold">
                {netWealth.toLocaleString('ru-RU')} {CURRENCY}
              </span>
            </div>
            <button onClick={() => handleOpenAccountEdit()} className="p-2 bg-white/10 rounded-full"><Plus size={20} /></button>
          </div>
          <div className="flex gap-8 justify-center mt-6">
             <button onClick={() => setAccountSubTab('accounts')} className={`pb-1 border-b-2 font-bold text-xs uppercase transition-colors ${accountSubTab === 'accounts' ? 'border-white text-white' : 'border-transparent text-white/50'}`}>Счета</button>
             <button onClick={() => setAccountSubTab('debts')} className={`pb-1 border-b-2 font-bold text-xs uppercase transition-colors ${accountSubTab === 'debts' ? 'border-white text-white' : 'border-transparent text-white/50'}`}>Долги</button>
             <button onClick={() => setAccountSubTab('finances')} className={`pb-1 border-b-2 font-bold text-xs uppercase transition-colors ${accountSubTab === 'finances' ? 'border-white text-white' : 'border-transparent text-white/50'}`}>Обзор</button>
          </div>
       </div>
       <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          {accountSubTab === 'accounts' && (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">СЧЕТА</h3>
                  <span className="text-xs font-bold text-emerald-500">{totalRegularBalance.toLocaleString('ru-RU')} {CURRENCY}</span>
                </div>
                <div className="space-y-3">
                  {accounts.filter(a => a.type === 'regular').map(acc => (
                    <div key={acc.id} onClick={() => { setEditingAccount(acc); setShowAccountActionsModal(true); }} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between active:scale-98 transition-transform cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-100" style={{ color: acc.color }}>
                          <IconRenderer name={acc.icon} size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 text-sm">{acc.name}</div>
                          <div className="text-[10px] text-slate-400">Нажмите для действий</div>
                        </div>
                      </div>
                      <div className="font-bold text-emerald-500 text-sm">{acc.balance.toLocaleString('ru-RU')} {CURRENCY}</div>
                    </div>
                  ))}
                  <button onClick={() => handleOpenAccountEdit(undefined, 'regular')} className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                    <Plus size={16} /> Добавить счёт
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">СБЕРЕЖЕНИЯ</h3>
                  <span className="text-xs font-bold text-slate-400">{totalSavingsBalance.toLocaleString('ru-RU')} {CURRENCY}</span>
                </div>
                <div className="space-y-3">
                  {accounts.filter(a => a.type === 'savings').map(acc => (
                    <div key={acc.id} onClick={() => { setEditingAccount(acc); setShowAccountActionsModal(true); }} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between active:scale-98 transition-transform cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-slate-100" style={{ color: acc.color }}>
                          <IconRenderer name={acc.icon} size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 text-sm">{acc.name}</div>
                          <div className="text-[10px] text-slate-400">Нажмите для действий</div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-400 text-sm">{acc.balance.toLocaleString('ru-RU')} {CURRENCY}</div>
                    </div>
                  ))}
                  <button onClick={() => handleOpenAccountEdit(undefined, 'savings')} className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                    <Plus size={16} /> Добавить цель
                  </button>
                </div>
              </div>
            </>
          )}
          {accountSubTab === 'debts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">КРЕДИТЫ И ДОЛГИ</h3>
                <span className="text-xs font-bold text-pink-500">{totalDebts.toLocaleString('ru-RU')} {CURRENCY}</span>
              </div>
              <div className="space-y-3">
                {accounts.filter(a => a.type === 'debt').map(acc => (
                  <div key={acc.id} onClick={() => { setEditingAccount(acc); setShowAccountActionsModal(true); }} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between active:scale-98 transition-transform cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-slate-100" style={{ color: acc.color }}>
                        <IconRenderer name={acc.icon} size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-sm">{acc.name}</div>
                        <div className="text-[10px] text-slate-400">Нажмите для действий</div>
                      </div>
                    </div>
                    <div className="font-bold text-pink-500 text-sm">{acc.balance.toLocaleString('ru-RU')} {CURRENCY}</div>
                  </div>
                ))}
                <button onClick={() => handleOpenAccountEdit(undefined, 'debt')} className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs flex items-center justify-center gap-2">
                  <Plus size={16} /> Добавить долг
                </button>
              </div>
            </div>
          )}
          {accountSubTab === 'finances' && (
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6">
                <div className="text-[11px] font-bold text-slate-400 uppercase mb-4 tracking-wider">МОИ ФИНАНСЫ</div>
                <div className="grid grid-cols-[40px_1fr_1fr] mb-6 border-b border-slate-50 pb-6">
                  <div className="flex items-center justify-center text-slate-300">
                    <span className="text-2xl font-light">{CURRENCY}</span>
                  </div>
                  <div className="flex flex-col items-center border-r border-slate-50 px-2">
                    <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">АКТИВЫ</span>
                    <span className="text-lg font-bold text-emerald-500">
                      {(totalRegularBalance + totalSavingsBalance).toLocaleString('ru-RU')} <span className="text-sm font-semibold">{CURRENCY}</span>
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">ДОЛГИ</span>
                    <span className="text-lg font-bold text-pink-500">
                      {Math.abs(totalDebts).toLocaleString('ru-RU')} <span className="text-sm font-semibold">{CURRENCY}</span>
                    </span>
                  </div>
                </div>
                <div className="bg-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center shadow-lg shadow-emerald-100 transition-transform active:scale-98">
                  <div className="text-[10px] font-bold text-emerald-100 uppercase mb-1">ЧИСТЫЙ КАПИТАЛ</div>
                  <div className="text-xl font-bold text-white flex items-baseline gap-1">
                    {netWealth.toLocaleString('ru-RU')} <span>{CURRENCY}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
       </div>
    </div>
  );

  const renderOverview = () => {
    return (
      <div className="flex flex-col h-full bg-[#f8f9fa]">
        {/* Header Section */}
        <div className="bg-[#6366f1] pt-12 pb-4 px-6 text-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <button className="p-2 bg-white/10 rounded-full"><Menu size={20}/></button>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] opacity-70 font-bold uppercase tracking-widest cursor-pointer">
                Все счета <ChevronDown size={14}/>
              </div>
              <span className="text-2xl font-bold">
                {netWealth.toLocaleString('ru-RU')} {CURRENCY}
              </span>
            </div>
            <button className="p-2 bg-white/10 rounded-full"><Calendar size={20}/></button>
          </div>
          
          <div 
            onClick={() => setShowPeriodModal(true)}
            className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2 mt-4 cursor-pointer hover:bg-white/20 transition-colors"
          >
             <button onClick={(e) => { e.stopPropagation(); changePeriod(-1); }} className="p-1"><ChevronLeft size={20}/></button>
             <div className="flex items-center gap-2 text-xs font-bold uppercase">
                <CalendarDays size={14}/>
                {periodType === 'month' && selectedPeriod.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase()}
                {periodType === 'year' && `${selectedPeriod.getFullYear()} ГОД`}
                {periodType === 'last_year' && `${new Date().getFullYear() - 1} ГОД (ПРОШЛЫЙ)`}
                {periodType === 'custom' && `ПЕРИОД`}
             </div>
             <button onClick={(e) => { e.stopPropagation(); changePeriod(1); }} className="p-1"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24">
          <div className="flex justify-between items-center p-6 bg-white border-b">
             <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Баланс</span>
                <span className="text-xl font-bold text-emerald-500">
                   {netWealth.toLocaleString('ru-RU')} {CURRENCY}
                </span>
             </div>
             <div className="relative w-12 h-12 flex items-center justify-center border-2 border-emerald-500 rounded-full">
                <span className="text-xs font-bold text-emerald-500">{savingsIndicator}</span>
             </div>
          </div>

          <div className="grid grid-cols-2">
             <div className="p-4 flex flex-col items-center justify-center bg-[#ef5350] text-white">
                <span className="text-[11px] font-bold uppercase opacity-80 mb-1">Расходы</span>
                <span className="text-lg font-bold">{totals.expenses.toLocaleString('ru-RU')} {CURRENCY}</span>
             </div>
             <div className="p-4 flex flex-col items-center justify-center bg-white border-b border-l text-emerald-500">
                <span className="text-[11px] font-bold uppercase text-slate-400 mb-1">Доходы</span>
                <span className="text-lg font-bold">{totals.incomes.toLocaleString('ru-RU')} {CURRENCY}</span>
             </div>
          </div>

          <div className="p-4 bg-white h-48 border-b">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded-lg shadow-sm text-[10px] font-bold">
                           {payload[0].value} {CURRENCY}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#66bb6a' : '#eceff1'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-[10px] text-slate-300 font-bold mt-2 uppercase">
               <span>1 {selectedPeriod.toLocaleString('ru-RU', { month: 'short' })}</span>
               <span>10</span>
               <span>17</span>
               <span>24</span>
               <span>{chartData.length} {selectedPeriod.toLocaleString('ru-RU', { month: 'short' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 bg-white border-b">
             <div className="p-4 flex flex-col items-center border-r">
                <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">День (сред.)</span>
                <span className="text-xs font-bold text-pink-400">{Math.round(stats.avgPerDay).toLocaleString('ru-RU')} {CURRENCY}</span>
             </div>
             <div className="p-4 flex flex-col items-center border-r">
                <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Сегодня</span>
                <span className="text-xs font-bold text-slate-400">{stats.todayTotal.toLocaleString('ru-RU')} {CURRENCY}</span>
             </div>
             <div className="p-4 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Неделя</span>
                <span className="text-xs font-bold text-pink-400">{totals.expenses.toLocaleString('ru-RU')} {CURRENCY}</span>
             </div>
          </div>

          <div className="mt-4 px-4 pb-12 space-y-4">
             {categoryBreakdown.map(cat => {
               const percentage = totals.expenses > 0 ? Math.round((cat.amount / totals.expenses) * 100) : 0;
               return (
                 <div key={cat.id} className="flex items-center gap-4">
                    <div className="p-2.5 rounded-full" style={{ backgroundColor: cat.color }}>
                       <IconRenderer name={cat.icon} size={18} color="white" />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-baseline mb-1">
                          <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                          <span className="text-sm font-bold text-slate-400">{cat.amount.toLocaleString('ru-RU')} {CURRENCY}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: cat.color }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{percentage}%</span>
                       </div>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto h-screen relative bg-white overflow-hidden flex flex-col font-sans">
      <div className="flex-1 overflow-hidden">
        {view === View.DASHBOARD && renderDashboard()}
        {view === View.ACCOUNTS && renderAccountsView()}
        {view === View.HISTORY && (
          <div className="flex flex-col h-full bg-slate-50">
             <div className="bg-[#6366f1] pt-12 pb-6 px-6 rounded-b-[40px] relative text-white shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <button className="p-2 bg-white/10 rounded-full"><Menu size={20}/></button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] opacity-70 font-medium">Операции</span>
                    <span className="text-lg font-bold">История транзакций</span>
                  </div>
                  <button className="p-2 bg-white/10 rounded-full"><Plus size={20}/></button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {filteredTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic">Никаких операций пока нет</div>
                ) : (
                  [...filteredTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                    const cat = categories.find(c => c.id === t.categoryId);
                    return (
                      <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat?.color}20`, color: cat?.color }}>
                              <IconRenderer name={cat?.icon || 'Circle'} size={20} />
                           </div>
                           <div>
                              <div className="font-bold text-sm text-slate-700">{cat?.name || (t.type === 'transfer' ? 'Перевод' : 'Без категории')}</div>
                              <div className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
                           </div>
                         </div>
                         <div className={`font-bold text-sm ${t.type === 'expense' ? 'text-pink-500' : t.type === 'transfer' ? 'text-slate-400' : 'text-emerald-500'}`}>
                           {t.type === 'expense' ? '-' : t.type === 'transfer' ? '' : '+'}{t.amount.toLocaleString('ru-RU')} {CURRENCY}
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        )}
        {view === View.PLANNING && renderOverview()}
      </div>

      <div className="bg-white border-t px-6 py-2 flex items-center justify-between z-20">
        <button onClick={() => setView(View.ACCOUNTS)} className={`flex flex-col items-center gap-1 ${view === View.ACCOUNTS ? 'text-indigo-600' : 'text-slate-400'}`}>
          <CreditCard size={22}/>
          <span className="text-[10px] font-bold">Счета</span>
        </button>
        <button onClick={() => setView(View.DASHBOARD)} className={`flex flex-col items-center gap-1 ${view === View.DASHBOARD ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutGrid size={22}/>
          <span className="text-[10px] font-bold">Категории</span>
        </button>
        <button onClick={() => setView(View.HISTORY)} className={`flex flex-col items-center gap-1 ${view === View.HISTORY ? 'text-indigo-600' : 'text-slate-400'}`}>
          <ReceiptText size={22}/>
          <span className="text-[10px] font-bold">Операции</span>
        </button>
        <button onClick={() => setView(View.PLANNING)} className={`flex flex-col items-center gap-1 ${view === View.PLANNING ? 'text-indigo-600' : 'text-slate-400'}`}>
          <BarChart3 size={22}/>
          <span className="text-[10px] font-bold">Обзор</span>
        </button>
      </div>

      {/* Меню действий со счетом */}
      {showAccountActionsModal && editingAccount && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl" style={{ backgroundColor: editingAccount.color + '20', color: editingAccount.color }}>
                      <IconRenderer name={editingAccount.icon} size={20}/>
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-slate-800">{editingAccount.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{editingAccount.balance.toLocaleString('ru-RU')} {CURRENCY}</p>
                   </div>
                </div>
                <button onClick={() => setShowAccountActionsModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
             </div>
             
             <div className="grid grid-cols-3 gap-3 pb-8">
                <button 
                  onClick={() => {
                    setTransactionType('transfer');
                    setActiveAccount(editingAccount);
                    setAmountStr('0');
                    setShowAccountActionsModal(false);
                    setShowTransactionModal(true);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                   <ArrowLeftRight size={20} className="text-indigo-500" />
                   <span className="text-[10px] font-bold uppercase text-slate-500">Перевод</span>
                </button>
                <button 
                  onClick={() => {
                    setTransactionType('income');
                    setActiveAccount(editingAccount);
                    setActiveCategory(categories.find(c => c.type === 'income') || null);
                    setAmountStr('0');
                    setShowAccountActionsModal(false);
                    setShowTransactionModal(true);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                   <Download size={20} className="text-emerald-500" />
                   <span className="text-[10px] font-bold uppercase text-slate-500">Пополнить</span>
                </button>
                <button 
                  onClick={() => handleOpenAccountEdit(editingAccount)}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                   <Settings size={20} className="text-slate-500" />
                   <span className="text-[10px] font-bold uppercase text-slate-500">Изменить</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Подтверждение корректировки баланса */}
      {showBalanceCorrectionModal && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                    <Info size={32} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">Баланс изменен</h3>
                 <p className="text-sm text-slate-500">Как вы хотите отразить изменение баланса на {Math.abs(tempAccountData.balance - (editingAccount?.balance || 0)).toLocaleString('ru-RU')} {CURRENCY}?</p>
                 
                 <div className="w-full flex flex-col gap-2 mt-2">
                    <button 
                      onClick={handleCorrectionWithTransaction}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100"
                    >
                      Создать операцию
                    </button>
                    <button 
                      onClick={() => handleSaveAccount(true)}
                      className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-sm"
                    >
                      Просто заменить баланс
                    </button>
                    <button 
                      onClick={() => setShowBalanceCorrectionModal(false)}
                      className="w-full py-4 text-slate-400 font-bold text-sm"
                    >
                      Отмена
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Модальное окно выбора периода */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Выберите период</h2>
              <button onClick={() => setShowPeriodModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => { setPeriodType('month'); setShowPeriodModal(false); }} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${periodType === 'month' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-50 text-slate-400'}`}>Месяц</button>
               <button onClick={() => { setPeriodType('year'); setShowPeriodModal(false); }} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${periodType === 'year' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-50 text-slate-400'}`}>Год</button>
               <button onClick={() => { setPeriodType('last_year'); setShowPeriodModal(false); }} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${periodType === 'last_year' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-50 text-slate-400'}`}>Прошлый год</button>
               <button onClick={() => setPeriodType('custom')} className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${periodType === 'custom' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-50 text-slate-400'}`}>Произвольный</button>
            </div>

            {periodType === 'custom' && (
              <div className="space-y-4 animate-in fade-in zoom-in duration-200">
                 <div className="flex items-center gap-4">
                    <div className="flex-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Начало</label>
                       <input type="date" value={customRange.start} onChange={(e) => setCustomRange({...customRange, start: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <ArrowRight className="text-slate-300 mt-6" size={20}/>
                    <div className="flex-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Конец</label>
                       <input type="date" value={customRange.end} onChange={(e) => setCustomRange({...customRange, end: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                 </div>
                 <button onClick={() => setShowPeriodModal(false)} disabled={!customRange.start || !customRange.end} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 disabled:opacity-50">Применить</button>
              </div>
            )}
            <div className="pb-4"></div>
          </div>
        </div>
      )}

      {/* Модальное окно категорий */}
      {showCategoryEditModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editingCategory ? 'Редактировать категорию' : 'Новая категория'}</h2>
              <button onClick={() => setShowCategoryEditModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Название</label>
                  <input type="text" value={tempCategoryData.name} onChange={(e) => setTempCategoryData({...tempCategoryData, name: e.target.value})} placeholder="Напр. Кафе, Интернет..." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 mt-2" />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Иконка и цвет</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORY_ICON_LIST.map(iconName => (
                      <button key={iconName} onClick={() => setTempCategoryData({...tempCategoryData, icon: iconName})} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tempCategoryData.icon === iconName ? 'shadow-lg text-white' : 'bg-slate-50 text-slate-400'}`} style={{ backgroundColor: tempCategoryData.icon === iconName ? tempCategoryData.color : undefined }}>
                         <IconRenderer name={iconName} size={22} color={tempCategoryData.icon === iconName ? '#fff' : '#94a3b8'} />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {COLOR_PALETTE.map(color => (
                      <button key={color} onClick={() => setTempCategoryData({...tempCategoryData, color})} className={`w-8 h-8 rounded-full border-2 transition-transform ${tempCategoryData.color === color ? 'border-indigo-500 scale-125 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
               </div>
            </div>
            <div className="flex gap-4 mt-8 pb-4">
               {editingCategory && (
                 <button onClick={() => handleDeleteCategory(editingCategory.id)} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><Trash2 size={18} /> Удалить</button>
               )}
               <button onClick={handleSaveCategory} disabled={!tempCategoryData.name} className="flex-[2] py-4 bg-[#6366f1] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"><CheckCircle2 size={18} /> {editingCategory ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования счета */}
      {showAccountEditModal && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{editingAccount ? 'Редактировать счет' : 'Новый счет'}</h2>
              <button onClick={() => setShowAccountEditModal(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Тип счета</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                     <button onClick={() => setTempAccountData({...tempAccountData, type: 'regular'})} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition-all ${tempAccountData.type === 'regular' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400'}`}><Banknote size={16}/> Наличные/Карта</button>
                     <button onClick={() => setTempAccountData({...tempAccountData, type: 'savings'})} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition-all ${tempAccountData.type === 'savings' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400'}`}><PiggyBank size={16}/> Сбережения</button>
                     <button onClick={() => setTempAccountData({...tempAccountData, type: 'debt'})} className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition-all ${tempAccountData.type === 'debt' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-50 text-slate-400'}`}><HandCoins size={16}/> Долг/Кредит</button>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Название</label>
                  <input type="text" value={tempAccountData.name} onChange={(e) => setTempAccountData({...tempAccountData, name: e.target.value})} placeholder="Напр. Зарплата, Отпуск..." className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 mt-2" />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Баланс</label>
                  <input type="number" value={tempAccountData.balance} onChange={(e) => setTempAccountData({...tempAccountData, balance: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 mt-2" />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Иконка и цвет</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ACCOUNT_ICON_LIST.map(iconName => (
                      <button key={iconName} onClick={() => setTempAccountData({...tempAccountData, icon: iconName})} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${tempAccountData.icon === iconName ? 'shadow-lg text-white' : 'bg-slate-50 text-slate-400'}`} style={{ backgroundColor: tempAccountData.icon === iconName ? tempAccountData.color : undefined }}>
                         <IconRenderer name={iconName} size={22} color={tempAccountData.icon === iconName ? '#fff' : '#94a3b8'} />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {COLOR_PALETTE.map(color => (
                      <button key={color} onClick={() => setTempAccountData({...tempAccountData, color})} className={`w-8 h-8 rounded-full border-2 transition-transform ${tempAccountData.color === color ? 'border-indigo-500 scale-125 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
               </div>
            </div>
            <div className="flex gap-4 mt-8 pb-4">
               {editingAccount && (
                 <button onClick={() => handleDeleteAccount(editingAccount.id)} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><Trash2 size={18} /> Удалить</button>
               )}
               <button onClick={() => handleSaveAccount()} disabled={!tempAccountData.name} className="flex-[2] py-4 bg-[#6366f1] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"><CheckCircle2 size={18} /> {editingAccount ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно транзакции */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-[40px] flex flex-col overflow-hidden relative shadow-2xl max-h-[95%]">
            <div className="flex h-24 border-b">
              {transactionType === 'transfer' ? (
                <>
                  <button onClick={() => { setIsSelectingAccount(!isSelectingAccount); setIsSelectingToAccount(false); }} className={`flex-1 p-4 flex flex-col justify-center relative transition-colors ${isSelectingAccount ? 'bg-indigo-100' : 'bg-indigo-50'}`}>
                    <div className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-sm">
                      <IconRenderer name={activeAccount.icon} size={16} color={activeAccount.color}/>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-indigo-400">Списать с</div>
                    <div className="text-lg font-bold text-indigo-600 truncate w-full">{activeAccount.name}</div>
                  </button>
                  <button onClick={() => { setIsSelectingToAccount(!isSelectingToAccount); setIsSelectingAccount(false); }} className={`flex-1 p-4 flex flex-col justify-center relative transition-colors ${isSelectingToAccount ? 'bg-emerald-100' : 'bg-emerald-50'}`}>
                    <div className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                      {toAccount ? <IconRenderer name={toAccount.icon} size={16} color={toAccount.color}/> : <ArrowRight size={16} className="text-slate-300"/>}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400 text-right">Зачислить на</div>
                    <div className="text-lg font-bold text-emerald-600 text-right truncate w-full">{toAccount?.name || 'Выбрать счет'}</div>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setIsSelectingAccount(!isSelectingAccount); setIsSelectingCategory(false); }} className={`flex-1 p-4 flex flex-col justify-center relative transition-colors ${isSelectingAccount ? 'bg-slate-200' : 'bg-slate-100'}`}>
                    <div className="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-sm">
                      <IconRenderer name={activeAccount.icon} size={16} color={activeAccount.color}/>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Счет</div>
                    <div className="text-lg font-bold text-slate-700 truncate w-full">{activeAccount.name}</div>
                  </button>
                  <button onClick={() => { setIsSelectingCategory(!isSelectingCategory); setIsSelectingAccount(false); }} className={`flex-1 p-4 flex flex-col justify-center relative transition-colors ${isSelectingCategory ? 'bg-orange-100' : 'bg-orange-50'}`}>
                    <div className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                      <IconRenderer name={activeCategory?.icon || 'Circle'} size={16} color={activeCategory?.color}/>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-orange-300 text-right">Категория</div>
                    <div className="text-lg font-bold text-orange-400 text-right truncate w-full">{activeCategory?.name || 'Выбрать'}</div>
                  </button>
                </>
              )}
            </div>
            {(isSelectingAccount || isSelectingToAccount || isSelectingCategory) && (
              <div className="p-4 bg-slate-50 border-b max-h-64 overflow-y-auto grid grid-cols-2 gap-2">
                {isSelectingAccount && accounts.map(acc => (
                  <button key={acc.id} onClick={() => { setActiveAccount(acc); setIsSelectingAccount(false); }} className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <IconRenderer name={acc.icon} size={16} color={acc.color}/>
                    <span className="text-xs font-bold text-slate-600 truncate">{acc.name}</span>
                  </button>
                ))}
                {isSelectingToAccount && accounts.filter(a => a.id !== activeAccount.id).map(acc => (
                  <button key={acc.id} onClick={() => { setToAccount(acc); setIsSelectingToAccount(false); }} className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <IconRenderer name={acc.icon} size={16} color={acc.color}/>
                    <span className="text-xs font-bold text-slate-600 truncate">{acc.name}</span>
                  </button>
                ))}
                {isSelectingCategory && categories.filter(c => c.type === transactionType).map(cat => (
                  <button key={cat.id} onClick={() => { setActiveCategory(cat); setIsSelectingCategory(false); }} className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <IconRenderer name={cat.icon} size={16} color={cat.color}/>
                    <span className="text-xs font-bold text-slate-600 truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
            {!isSelectingAccount && !isSelectingToAccount && !isSelectingCategory && (
              <>
                <div className="p-4 flex flex-col items-center">
                   <div className="text-xs font-bold text-slate-400 uppercase mt-4">
                      {transactionType === 'transfer' ? 'Сумма перевода' : transactionType === 'income' ? 'Доход' : 'Расход'}
                   </div>
                   <div className={`text-4xl font-bold mt-1 mb-6 flex items-baseline gap-2 ${transactionType === 'income' ? 'text-emerald-500' : transactionType === 'transfer' ? 'text-indigo-500' : 'text-orange-400'}`}>
                     {amountStr} <span className="text-2xl font-medium">{CURRENCY}</span>
                   </div>
                </div>
                <Keypad 
                  onKeyPress={(key) => setAmountStr(prev => prev === '0' ? key : prev + key)}
                  onDelete={() => setAmountStr(prev => prev.length > 1 ? prev.slice(0, -1) : '0')}
                  onConfirm={handleAddTransaction}
                />
              </>
            )}
            <button onClick={() => setShowTransactionModal(false)} className="absolute top-0 right-0 p-2 text-slate-300"><X size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
