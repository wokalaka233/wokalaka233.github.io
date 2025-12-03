import React, { useState } from 'react';
import { SectionType } from '../types';
import { Home, Calculator, Gamepad2, Activity, Zap, Grid3X3, Spade, Bird, ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeSection: SectionType;
  onNavigate: (section: SectionType) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, isOpen, onCloseMobile }) => {
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(true);

  const mainItems: { id: SectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'intro', label: '关于website', icon: <Home size={20} /> },
    { id: 'bmi', label: 'BMI计算器', icon: <Activity size={20} /> },
    { id: 'calculator', label: '基础计算器', icon: <Calculator size={20} /> },
  ];

  const gameItems: { id: SectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'tetris', label: '俄罗斯方块', icon: <Gamepad2 size={18} /> },
    { id: 'tetris-fun', label: '爽版俄罗斯方块', icon: <Zap size={18} /> },
    { id: 'match3', label: '消消乐', icon: <Grid3X3 size={18} /> },
    { id: 'spider', label: '蜘蛛纸牌', icon: <Spade size={18} /> },
    { id: 'flappy', label: '像素小鸟', icon: <Bird size={18} /> },
  ];

  const isGameActive = gameItems.some(g => g.id === activeSection);

  return (
    <div 
      className={`fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:h-screen md:shrink-0 overflow-y-auto`}
    >
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          wpf的工具箱
        </h1>
        <p className="text-sm text-gray-500 mt-1">小小工具</p>
      </div>
      
      <nav className="mt-6 px-2">
        <ul className="space-y-1">
          {mainItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-purple-50 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                }`}
              >
                <span className={activeSection === item.id ? 'text-purple-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}

          {/* Game Section Accordion */}
          <li className="pt-2">
            <button
              onClick={() => setIsGameMenuOpen(!isGameMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                isGameActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isGameActive ? 'text-indigo-600' : 'text-gray-400'}>
                  <Gamepad2 size={20} />
                </span>
                <span className="font-medium">游戏乐园</span>
              </div>
              {isGameMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {/* Submenu */}
            <div className={`overflow-hidden transition-all duration-300 ${isGameMenuOpen ? 'max-h-80 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              <ul className="pl-4 space-y-1 border-l-2 border-gray-100 ml-4">
                {gameItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onNavigate(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left rounded-lg transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};