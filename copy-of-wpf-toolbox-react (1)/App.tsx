import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SectionType } from './types';
import { BMI } from './components/BMI';
import { Tetris } from './components/Tetris';
import { Calculator } from './components/Calculator';
import { HeartRain } from './components/HeartRain';
import { Match3 } from './components/games/Match3';
import { FlappyBird } from './components/games/FlappyBird';
import { SpiderSolitaire } from './components/games/SpiderSolitaire';
import { Menu } from 'lucide-react';

const IntroSection = () => (
  <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 drop-shadow-lg">
      欢迎来到 wpf的工具箱
    </h2>
    <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-left space-y-6 text-gray-700 leading-relaxed">
      <p>大家好我是wpf！这是一个有许多小工具的网站，目前包含四个核心板块：</p>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong className="text-indigo-600">个人空间：</strong>是wokalaka的小小工具箱！（后续功能敬请期待）</li>
        <li><strong className="text-indigo-600">BMI计算器：</strong>计算并反馈详细BMI状态</li>
        <li><strong className="text-indigo-600">俄罗斯方块：</strong>经典怀旧游戏，支持键盘操作，完美适配手机</li>
        <li><strong className="text-indigo-600">爽版俄罗斯方块：</strong>在经典版基础上增加了便捷功能（一键清屏/下落）</li>
        <li><strong className="text-indigo-600">基础计算器：</strong>支持加减乘除、开根号、平方，内含隐藏彩蛋！</li>
        <li><strong className="text-indigo-600">一些小游戏：</strong>包含消消乐、蜘蛛纸牌、像素小鸟，休闲解压好去处！</li>
      </ul>
      <p className="border-t pt-4 text-gray-500 text-sm">
        网站采用简洁美观的渐变设计风格，适配电脑和手机等多种设备，希望能给你带来便捷又有趣的使用体验～
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {[
        { title: '个性化BMI', desc: '关注健康，科学管理身材' },
        { title: '趣味游戏', desc: '消消乐、纸牌、俄罗斯方块...' },
        { title: '便捷计算', desc: '日常运算，探索隐藏惊喜' }
      ].map((card, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all cursor-default">
          <h3 className="text-xl font-bold mb-2">{card.title}</h3>
          <p className="text-sm opacity-90">{card.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionType>('intro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHeartRain, setShowHeartRain] = useState(false);

  const triggerEasterEgg = () => {
    setShowHeartRain(true);
    // Let it rain for a while then stop
    setTimeout(() => {
        setShowHeartRain(false);
    }, 8000); 
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'intro': return <IntroSection />;
      case 'bmi': return <BMI />;
      case 'tetris': return <Tetris isFunMode={false} />;
      case 'tetris-fun': return <Tetris isFunMode={true} />;
      case 'calculator': return <Calculator triggerEasterEgg={triggerEasterEgg} />;
      case 'match3': return <Match3 />;
      case 'spider': return <SpiderSolitaire />;
      case 'flappy': return <FlappyBird />;
      default: return <IntroSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col md:flex-row overflow-hidden relative">
      {/* Easter Egg Overlay */}
      {showHeartRain && <HeartRain />}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="pointer-events-auto p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg active:scale-95 transition-transform"
        >
          <Menu size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative">
         <div className={`
           min-h-full flex flex-col items-center justify-center
           ${activeSection === 'spider' ? 'p-1 md:p-12 pt-20 md:pt-12' : 'p-6 md:p-12 pt-20 md:pt-12'}
         `}>
            {renderContent()}
         </div>
      </main>
    </div>
  );
}