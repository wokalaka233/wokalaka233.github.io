import React, { useState, useEffect, useRef } from 'react';
import { Delete, Eraser } from 'lucide-react';

interface CalculatorProps {
  triggerEasterEgg: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ triggerEasterEgg }) => {
  const [display, setDisplay] = useState('0');
  const [isEasterEggActive, setIsEasterEggActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount for desktop, but avoid on mobile to prevent keyboard
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInput = (val: string) => {
    if (isEasterEggActive) {
      setDisplay(val);
      setIsEasterEggActive(false);
      return;
    }

    if (val === 'AC') {
      setDisplay('0');
      return;
    }

    if (val === 'back') {
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }

    setDisplay(prev => {
      if (prev === '0' && !['.', '+', '-', '*', '/', '%'].includes(val)) {
        return val;
      }
      return prev + val;
    });
  };

  const calculate = () => {
    const triggerWords = ['奈奈熊', '披萨老头', '蜥蜴的征途'];
    
    // Check Easter Egg
    if (triggerWords.some(word => display.includes(word))) {
      setDisplay('520');
      triggerEasterEgg();
      setIsEasterEggActive(true);
      // Blur input to hide keyboard on mobile
      if (inputRef.current) {
        inputRef.current.blur();
      }
      return;
    }

    try {
      // Safe replacement of visual operators
      let expression = display.replace(/×/g, '*').replace(/÷/g, '/');
      // Handle percentage
      expression = expression.replace(/(\d+)%/g, '($1/100)');
      
      // eslint-disable-next-line no-eval
      let result = eval(expression);
      
      // Handle floating point precision
      if (result.toString().includes('.')) {
        result = parseFloat(result.toFixed(10));
      }
      
      setDisplay(String(result));
    } catch (e) {
      setDisplay('错误');
      setTimeout(() => setDisplay('0'), 1000);
    }
  };

  const scientific = (type: 'sqrt' | 'sqr') => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) throw new Error();
      
      if (type === 'sqrt') {
        if (val < 0) {
          setDisplay('错误');
        } else {
          setDisplay(String(Math.sqrt(val)));
        }
      } else {
        setDisplay(String(val * val));
      }
    } catch {
      setDisplay('错误');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    if (/[0-9.]/.test(key)) handleInput(key);
    if (['+', '-', '*', '/', '%'].includes(key)) handleInput(key);
    if (key === 'Enter') calculate();
    if (key === 'Backspace') handleInput('back');
    if (key === 'Escape') handleInput('AC');
  };

  const btnClass = "h-16 text-xl font-medium rounded-xl transition-all duration-200 active:scale-95 shadow-sm";
  const numClass = `${btnClass} bg-white hover:bg-gray-50 text-gray-800`;
  const opClass = `${btnClass} bg-indigo-100 hover:bg-indigo-200 text-indigo-700`;
  const fnClass = `${btnClass} bg-orange-100 hover:bg-orange-200 text-orange-700`;
  const eqClass = `${btnClass} bg-green-500 hover:bg-green-600 text-white col-span-2 shadow-green-200`;

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in-up">
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
        <div className="mb-6 relative">
          <input
            ref={inputRef}
            type="text"
            value={display}
            onChange={(e) => setDisplay(e.target.value)}
            onKeyDown={handleKeyDown}
            // Mobile: readOnly prevents virtual keyboard from popping up, user uses on-screen buttons
            // Desktop: can type normally
            className="w-full h-20 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 text-right text-3xl text-gray-800 font-mono focus:outline-none focus:border-indigo-400 transition-colors"
            placeholder="0"
          />
          <div className="text-xs text-gray-400 text-center mt-2">
            手机端直接点击按钮 • 电脑端支持键盘输入
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => handleInput('AC')} className={fnClass}>AC</button>
          <button onClick={() => handleInput('back')} className={fnClass}><Delete className="mx-auto" size={24}/></button>
          <button onClick={() => handleInput('%')} className={opClass}>%</button>
          <button onClick={() => handleInput('/')} className={opClass}>÷</button>

          <button onClick={() => handleInput('7')} className={numClass}>7</button>
          <button onClick={() => handleInput('8')} className={numClass}>8</button>
          <button onClick={() => handleInput('9')} className={numClass}>9</button>
          <button onClick={() => handleInput('*')} className={opClass}>×</button>

          <button onClick={() => handleInput('4')} className={numClass}>4</button>
          <button onClick={() => handleInput('5')} className={numClass}>5</button>
          <button onClick={() => handleInput('6')} className={numClass}>6</button>
          <button onClick={() => handleInput('-')} className={opClass}>-</button>

          <button onClick={() => handleInput('1')} className={numClass}>1</button>
          <button onClick={() => handleInput('2')} className={numClass}>2</button>
          <button onClick={() => handleInput('3')} className={numClass}>3</button>
          <button onClick={() => handleInput('+')} className={opClass}>+</button>

          <button onClick={() => handleInput('0')} className={numClass}>0</button>
          <button onClick={() => handleInput('.')} className={numClass}>.</button>
          <button onClick={() => scientific('sqrt')} className={fnClass}>√</button>
          <button onClick={() => scientific('sqr')} className={fnClass}>x²</button>

          <button onClick={calculate} className={eqClass}>=</button>
        </div>
      </div>
    </div>
  );
};