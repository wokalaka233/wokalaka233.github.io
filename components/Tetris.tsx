import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCw, ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, Trash2 } from 'lucide-react';
import { TetrisStats } from '../types';

interface TetrisProps {
  isFunMode?: boolean;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = ['#667eea', '#764ba2', '#ff4d6d', '#4CAF50', '#ff9800', '#2196F3', '#9C27B0'];

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
];

export const Tetris: React.FC<TetrisProps> = ({ isFunMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<TetrisStats>({ score: 0, level: 1, lines: 0 });
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  
  // Game state refs (to avoid stale closures in interval)
  const boardRef = useRef<string[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill("")));
  const pieceRef = useRef<any>(null);
  const gameLoopRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0);
      ctx.lineTo(i * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE);
      ctx.lineTo(canvas.width, i * BLOCK_SIZE);
      ctx.stroke();
    }

    // Draw Board Blocks
    boardRef.current.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        }
      });
    });

    // Draw Current Piece
    if (pieceRef.current) {
      ctx.fillStyle = pieceRef.current.color;
      pieceRef.current.shape.forEach((row: number[], y: number) => {
        row.forEach((cell, x) => {
          if (cell) {
            const px = (pieceRef.current.x + x) * BLOCK_SIZE + 1;
            const py = (pieceRef.current.y + y) * BLOCK_SIZE + 1;
            ctx.fillRect(px, py, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          }
        });
      });
    }

    // Paused Overlay
    if (gameState === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
    
    if (gameState === 'stopped' && stats.score > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }

  }, [gameState, stats.score]);

  // Game Logic Helpers
  const isValidMove = (shape: number[][], offsetX: number, offsetY: number) => {
    if (!pieceRef.current) return false;
    return shape.every((row, y) => {
      return row.every((cell, x) => {
        if (!cell) return true;
        const newX = pieceRef.current.x + x + offsetX;
        const newY = pieceRef.current.y + y + offsetY;
        return (
          newX >= 0 &&
          newX < COLS &&
          newY < ROWS &&
          (newY < 0 || !boardRef.current[newY]?.[newX])
        );
      });
    });
  };

  const spawnPiece = () => {
    const idx = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[idx];
    const color = COLORS[idx];
    pieceRef.current = {
      shape,
      color,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: 0
    };

    if (!isValidMove(shape, 0, 0)) {
      setGameState('stopped');
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  };

  const mergePiece = () => {
    if (!pieceRef.current) return;
    pieceRef.current.shape.forEach((row: number[], y: number) => {
      row.forEach((cell, x) => {
        if (cell) {
          const by = pieceRef.current.y + y;
          const bx = pieceRef.current.x + x;
          if (by >= 0) boardRef.current[by][bx] = pieceRef.current.color;
        }
      });
    });
    
    // Clear lines
    let linesCleared = 0;
    const newBoard = boardRef.current.filter(row => {
      if (row.every(cell => cell !== "")) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(""));
    }
    boardRef.current = newBoard;

    if (linesCleared > 0) {
      setStats(prev => {
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        return {
          score: prev.score + (linesCleared * 100 * prev.level),
          lines: newLines,
          level: newLevel
        };
      });
    }

    spawnPiece();
  };

  const move = (dx: number, dy: number) => {
    if (gameState !== 'playing' || !pieceRef.current) return;
    
    if (isValidMove(pieceRef.current.shape, dx, dy)) {
      pieceRef.current.x += dx;
      pieceRef.current.y += dy;
      draw();
    } else if (dy > 0) {
      mergePiece();
      draw();
    }
  };

  const rotate = () => {
    if (gameState !== 'playing' || !pieceRef.current) return;
    const shape = pieceRef.current.shape;
    const rotated = shape[0].map((_: any, i: number) => shape.map((row: any[]) => row[i]).reverse());
    
    if (isValidMove(rotated, 0, 0)) {
      pieceRef.current.shape = rotated;
    } else if (isValidMove(rotated, 1, 0)) {
       pieceRef.current.x += 1;
       pieceRef.current.shape = rotated;
    } else if (isValidMove(rotated, -1, 0)) {
       pieceRef.current.x -= 1;
       pieceRef.current.shape = rotated;
    }
    draw();
  };

  const drop = () => {
    if (gameState !== 'playing' || !pieceRef.current) return;
    while (isValidMove(pieceRef.current.shape, 0, 1)) {
      pieceRef.current.y += 1;
    }
    mergePiece();
    draw();
  };

  const clearScreen = () => {
    if (gameState !== 'playing') return;
    boardRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(""));
    draw();
  };

  // Loop management
  useEffect(() => {
    if (gameState === 'playing') {
      const speed = Math.max(100, 1000 - (stats.level - 1) * 100);
      gameLoopRef.current = window.setInterval(() => {
        move(0, 1);
      }, isFunMode ? 800 : speed); // Fun mode is slightly faster by default or constant? Keeping consistent.
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, stats.level, isFunMode]);

  // Initial Draw
  useEffect(() => {
    draw();
  }, [draw]);

  // Keyboard Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowUp') rotate();
      if (e.key === ' ') drop();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);


  const startGame = () => {
    boardRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(""));
    setStats({ score: 0, level: 1, lines: 0 });
    spawnPiece();
    setGameState('playing');
  };

  const togglePause = () => {
    if (gameState === 'stopped') return;
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const btnBase = "p-3 rounded-full text-white shadow-lg active:scale-90 transition-transform select-none touch-manipulation";
  const btnPrimary = `${btnBase} bg-gradient-to-r from-blue-500 to-indigo-600`;
  const btnSpecial = `${btnBase} bg-gradient-to-r from-orange-400 to-red-500`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-4xl mx-auto animate-fade-in-up">
      {/* Game Board */}
      <div className="relative p-2 bg-white rounded-lg shadow-xl border-4 border-gray-200">
        <canvas 
          ref={canvasRef} 
          width={COLS * BLOCK_SIZE} 
          height={ROWS * BLOCK_SIZE}
          className="bg-gray-50 rounded"
        />
        {/* Mobile Info Overlay */}
        <div className="lg:hidden flex justify-between px-4 py-2 bg-gray-100 mt-2 rounded">
          <div className="text-center">
            <div className="text-xs text-gray-500">分数</div>
            <div className="font-bold text-indigo-600">{stats.score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">等级</div>
            <div className="font-bold text-indigo-600">{stats.level}</div>
          </div>
        </div>
      </div>

      {/* Controls & Info */}
      <div className="w-full lg:w-64 flex flex-col gap-6">
        {/* PC Info */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
           <div className="bg-white/90 p-4 rounded-xl shadow-sm text-center">
              <h3 className="text-gray-500 text-sm mb-1">分数</h3>
              <p className="text-2xl font-bold text-indigo-600">{stats.score}</p>
           </div>
           <div className="bg-white/90 p-4 rounded-xl shadow-sm text-center">
              <h3 className="text-gray-500 text-sm mb-1">等级</h3>
              <p className="text-2xl font-bold text-indigo-600">{stats.level}</p>
           </div>
        </div>

        {/* Action Buttons (Mixed PC/Mobile logic) */}
        <div className="grid grid-cols-2 gap-3">
           <button 
            onClick={gameState === 'playing' || gameState === 'paused' ? togglePause : startGame}
            className={`col-span-2 py-3 rounded-xl font-bold text-white shadow-md transition-all ${
              gameState === 'playing' 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
           >
             {gameState === 'stopped' ? '开始游戏' : (gameState === 'playing' ? '暂停' : '继续')}
           </button>
        </div>

        {/* Mobile D-Pad */}
        <div className="lg:hidden grid grid-cols-3 gap-4 w-full max-w-[280px] mx-auto">
           <div className="col-start-2 flex justify-center">
             <button onClick={rotate} className={btnPrimary}><RotateCw size={24}/></button>
           </div>
           <div className="col-start-1 row-start-2 flex justify-center">
             <button onClick={() => move(-1, 0)} className={btnPrimary}><ArrowLeft size={24}/></button>
           </div>
           <div className="col-start-2 row-start-2 flex justify-center">
             <button onClick={() => move(0, 1)} className={btnPrimary}><ArrowDown size={24}/></button>
           </div>
           <div className="col-start-3 row-start-2 flex justify-center">
             <button onClick={() => move(1, 0)} className={btnPrimary}><ArrowRight size={24}/></button>
           </div>
           <div className="col-start-2 row-start-3 flex justify-center">
             <button onClick={drop} className={isFunMode ? btnSpecial : btnPrimary}>
                <ChevronsDown size={24}/>
             </button>
           </div>
           {isFunMode && (
             <div className="col-start-3 row-start-3 flex justify-center">
                <button onClick={clearScreen} className={btnSpecial}><Trash2 size={24}/></button>
             </div>
           )}
        </div>

        {/* PC Controls Guide / Extra Buttons */}
        <div className="hidden lg:flex flex-col gap-2">
            <button onClick={() => move(-1, 0)} className="bg-white p-2 rounded shadow text-gray-700 hover:bg-gray-50 text-left px-4">← 左移</button>
            <button onClick={() => move(1, 0)} className="bg-white p-2 rounded shadow text-gray-700 hover:bg-gray-50 text-left px-4">→ 右移</button>
            <button onClick={rotate} className="bg-white p-2 rounded shadow text-gray-700 hover:bg-gray-50 text-left px-4">↑ 旋转</button>
            <button onClick={() => move(0, 1)} className="bg-white p-2 rounded shadow text-gray-700 hover:bg-gray-50 text-left px-4">↓ 下移</button>
            <button onClick={drop} className={`${isFunMode ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-gray-700'} p-2 rounded shadow hover:opacity-80 text-left px-4`}>Space 一键下落</button>
            {isFunMode && (
              <button onClick={clearScreen} className="bg-red-100 text-red-700 border border-red-200 p-2 rounded shadow hover:bg-red-200 text-left px-4 transition-colors">🗑️ 一键清屏</button>
            )}
            
            <div className="mt-4 text-xs text-gray-500 text-center bg-white/50 p-2 rounded">
              支持键盘操作
            </div>
        </div>
      </div>
    </div>
  );
};