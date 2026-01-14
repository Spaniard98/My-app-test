
import React from 'react';
import { Delete, Check, Divide, X, Minus, Plus, Calendar } from 'lucide-react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onDelete, onConfirm }) => {
  const buttons = [
    { label: <Divide size={20}/>, type: 'op', value: '/' },
    { label: '7', type: 'num', value: '7' },
    { label: '8', type: 'num', value: '8' },
    { label: '9', type: 'num', value: '9' },
    { label: <Delete size={20}/>, type: 'del', value: 'del' },
    
    { label: <X size={18}/>, type: 'op', value: '*' },
    { label: '4', type: 'num', value: '4' },
    { label: '5', type: 'num', value: '5' },
    { label: '6', type: 'num', value: '6' },
    { label: <Calendar size={20}/>, type: 'cal', value: 'cal' },
    
    { label: <Minus size={22}/>, type: 'op', value: '-' },
    { label: '1', type: 'num', value: '1' },
    { label: '2', type: 'num', value: '2' },
    { label: '3', type: 'num', value: '3' },
    { label: '', type: 'confirm', rowSpan: 2 }, // Placeholder for the big check
    
    { label: <Plus size={22}/>, type: 'op', value: '+' },
    { label: '₽', type: 'cur', value: 'cur' },
    { label: '0', type: 'num', value: '0' },
    { label: ',', type: 'num', value: '.' },
  ];

  return (
    <div className="grid grid-cols-5 gap-0.5 bg-slate-200 border-t">
      {buttons.map((btn, i) => {
        if (btn.type === 'confirm') return null;
        
        return (
          <button
            key={i}
            onClick={() => {
              if (btn.type === 'del') onDelete();
              else if (btn.value) onKeyPress(btn.value);
            }}
            className={`h-14 flex items-center justify-center text-xl font-medium active:bg-slate-300 transition-colors bg-white`}
          >
            {btn.label}
          </button>
        );
      })}
      
      {/* Absolute positioned check button to match rowSpan feel in a grid */}
      <button
        onClick={onConfirm}
        className="absolute bottom-0 right-0 w-[20%] h-[112px] bg-orange-300 active:bg-orange-400 text-white flex items-center justify-center"
      >
        <Check size={32} />
      </button>
    </div>
  );
};

export default Keypad;
