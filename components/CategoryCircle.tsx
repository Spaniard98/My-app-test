
import React from 'react';
import IconRenderer from './IconRenderer';
import { Category } from '../types';
import { CURRENCY } from '../constants';

interface CategoryCircleProps {
  category: Category;
  amount?: number;
  onClick: (category: Category) => void;
  isSmall?: boolean;
}

const CategoryCircle: React.FC<CategoryCircleProps> = ({ category, amount = 0, onClick, isSmall = false }) => {
  const isDisabled = amount === 0 && category.id === '12'; // "More" button look
  
  return (
    <div 
      className="flex flex-col items-center gap-1 cursor-pointer w-full"
      onClick={() => onClick(category)}
    >
      <div className={`text-[11px] font-medium mb-0.5 line-clamp-1 h-3.5 ${amount > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
        {category.name}
      </div>
      <div 
        className={`rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm`}
        style={{ 
          backgroundColor: amount > 0 ? category.color : '#f1f5f9',
          width: isSmall ? '48px' : '54px',
          height: isSmall ? '48px' : '54px'
        }}
      >
        <IconRenderer 
          name={category.icon} 
          color={amount > 0 ? '#ffffff' : '#94a3b8'} 
          size={isSmall ? 22 : 26} 
        />
      </div>
      <div className={`text-[10px] font-bold mt-0.5 ${amount > 0 ? 'opacity-100' : 'opacity-40'}`} style={{ color: amount > 0 ? category.color : '#64748b' }}>
        {amount.toLocaleString('ru-RU', { minimumFractionDigits: 0 })} {CURRENCY}
      </div>
    </div>
  );
};

export default CategoryCircle;
