
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Category, Transaction } from '../types';
import { CURRENCY } from '../constants';

interface DonutChartProps {
  transactions: Transaction[];
  categories: Category[];
  totalBalance: number;
  totalExpenses: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ transactions, categories, totalBalance, totalExpenses }) => {
  const data = categories
    .filter(cat => cat.type === 'expense' && cat.id !== '12')
    .map(cat => {
      const sum = transactions
        .filter(t => t.categoryId === cat.id)
        .reduce((acc, t) => acc + t.amount, 0);
      return {
        name: cat.name,
        value: sum,
        color: cat.color
      };
    })
    .filter(d => d.value > 0);

  const displayData = data.length > 0 ? data : [{ name: 'Empty', value: 1, color: '#f1f5f9' }];

  return (
    <div className="relative w-full aspect-square max-w-[180px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius="85%"
            outerRadius="100%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={450}
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-slate-500 text-[10px] font-medium mb-0.5">Расходы</span>
        <span className="text-xl font-bold text-pink-500">
           {totalExpenses.toLocaleString('ru-RU')} {CURRENCY}
        </span>
        <span className="text-emerald-400 text-[10px] font-bold mt-1">
           1 500 {CURRENCY}
        </span>
      </div>
    </div>
  );
};

export default DonutChart;
