import React, { useState, useEffect } from 'react';
import { BmiRecord } from '../types';

export const BMI: React.FC = () => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{val: string, status: string, color: string} | null>(null);
  const [history, setHistory] = useState<BmiRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bmiHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (!name || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      alert("请输入有效的姓名、体重和身高！");
      return;
    }

    const bmiVal = (w / (h * h)).toFixed(1);
    let status = '';
    let color = '';

    const bmiNum = parseFloat(bmiVal);
    if (bmiNum < 18.5) {
      status = '偏瘦';
      color = 'text-amber-500';
    } else if (bmiNum < 24) {
      status = '正常';
      color = 'text-green-600';
    } else if (bmiNum < 28) {
      status = '超重';
      color = 'text-orange-500';
    } else {
      status = '肥胖';
      color = 'text-red-600';
    }

    const newResult = { val: bmiVal, status, color };
    setResult(newResult);

    const newHistory = [{
      name,
      bmi: bmiVal,
      status,
      time: new Date().toLocaleString()
    }, ...history].slice(0, 10);

    setHistory(newHistory);
    localStorage.setItem('bmiHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">BMI 健康计算器</h2>
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-gray-600 mb-2 font-medium">姓名</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="例如：奈奈"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-2 font-medium">体重 (kg)</label>
              <input 
                type="number" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="45"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2 font-medium">身高 (m)</label>
              <input 
                type="number" 
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="1.70"
              />
            </div>
          </div>
          
          <button 
            onClick={calculate}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            开始计算
          </button>
        </div>

        {result && (
          <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100 text-center animate-pulse-once">
            <p className="text-gray-600 mb-2">{name} 的 BMI 指数为</p>
            <div className={`text-5xl font-bold mb-2 ${result.color}`}>{result.val}</div>
            <div className={`text-xl font-medium ${result.color}`}>属于 {result.status} 范围</div>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">历史记录 (最近10条)</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-4">暂无记录</p>
            ) : (
              history.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded border border-gray-100 text-sm hover:shadow-sm transition-shadow">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className={`${
                    item.status === '正常' ? 'text-green-600' : 'text-orange-500'
                  }`}>{item.bmi} ({item.status})</span>
                  <span className="text-gray-400 text-xs">{item.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};