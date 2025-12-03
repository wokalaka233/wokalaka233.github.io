import React, { useState, useEffect, useCallback } from 'react';

const WIDTH = 8;
const FRUITS = ['🍎', '🍇', '🍊', '🥝', '🥥', '🍓'];

export const Match3: React.FC = () => {
  const [board, setBoard] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pure logic to generate a random fruit
  const getRandomFruit = () => FRUITS[Math.floor(Math.random() * FRUITS.length)];

  // Pure logic to check matches
  const checkMatches = (currentBoard: string[]) => {
    const matchedIndices = new Set<number>();
    let points = 0;

    // Horizontal
    for (let i = 0; i < 64; i++) {
      const rowOfThree = [i, i + 1, i + 2];
      const excluded = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
      if (excluded.includes(i)) continue;

      if (rowOfThree.every(idx => currentBoard[idx] === currentBoard[i] && currentBoard[idx])) {
        rowOfThree.forEach(idx => matchedIndices.add(idx));
        points += 3;
      }
    }

    // Vertical
    for (let i = 0; i <= 47; i++) {
      const colOfThree = [i, i + WIDTH, i + WIDTH * 2];
      if (colOfThree.every(idx => currentBoard[idx] === currentBoard[i] && currentBoard[idx])) {
        colOfThree.forEach(idx => matchedIndices.add(idx));
        points += 3;
      }
    }

    return { matchedIndices, points };
  };

  // Pure logic to apply gravity (drop items and fill top)
  const applyGravity = (currentBoard: string[]) => {
    const newBoard = Array(64).fill('');
    
    // Process column by column
    for (let col = 0; col < WIDTH; col++) {
      let writeIdx = 56 + col; // Start from bottom of column
      // Scan column from bottom to top
      for (let row = 7; row >= 0; row--) {
        const readIdx = row * WIDTH + col;
        if (currentBoard[readIdx] !== '') {
          newBoard[writeIdx] = currentBoard[readIdx];
          writeIdx -= WIDTH;
        }
      }
      // Fill remaining top spaces with new fruits
      while (writeIdx >= 0) {
        newBoard[writeIdx] = getRandomFruit();
        writeIdx -= WIDTH;
      }
    }
    return newBoard;
  };

  // Main Game Loop - Linear Sequence
  const processBoard = useCallback(async (startBoard: string[]) => {
    setIsProcessing(true);
    let currentBoard = [...startBoard];
    let stabilityLoopCount = 0;
    const MAX_LOOPS = 10; // Prevent infinite loops just in case

    while (stabilityLoopCount < MAX_LOOPS) {
      // 1. Check
      const { matchedIndices, points } = checkMatches(currentBoard);

      if (matchedIndices.size === 0) {
        break; // Board is stable
      }

      // 2. Clear Matches (Visual wait)
      setScore(prev => prev + points);
      const clearedBoard = [...currentBoard];
      matchedIndices.forEach(idx => {
        clearedBoard[idx] = '';
      });
      setBoard(clearedBoard);
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait for clear

      // 3. Drop & Fill (Visual wait)
      const filledBoard = applyGravity(clearedBoard);
      setBoard(filledBoard);
      currentBoard = filledBoard; // Update local ref for next loop
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait for drop

      stabilityLoopCount++;
    }

    setIsProcessing(false);
  }, []);

  // Initialize Game
  useEffect(() => {
    const initGame = () => {
      const newBoard = [];
      for (let i = 0; i < WIDTH * WIDTH; i++) {
        newBoard.push(getRandomFruit());
      }
      setBoard(newBoard);
      setScore(0);
      // Run initial check to clear any lucky start matches
      processBoard(newBoard);
    };
    initGame();
  }, [processBoard]);

  const handleClick = async (index: number) => {
    if (isProcessing) return;

    if (dragStart === null) {
      setDragStart(index);
    } else {
      // Try Swap
      const start = dragStart;
      const end = index;
      setDragStart(null); // Deselect immediately

      if (start === end) return;

      const validMoves = [start - 1, start + 1, start - WIDTH, start + WIDTH];
      if (validMoves.includes(end)) {
        // 1. Optimistic Swap
        setIsProcessing(true);
        const tempBoard = [...board];
        [tempBoard[start], tempBoard[end]] = [tempBoard[end], tempBoard[start]];
        setBoard(tempBoard);

        await new Promise(resolve => setTimeout(resolve, 200));

        // 2. Check Validity
        const { matchedIndices } = checkMatches(tempBoard);
        
        if (matchedIndices.size > 0) {
          // Valid move, process it
          await processBoard(tempBoard);
        } else {
          // Invalid move, swap back
          const revertedBoard = [...tempBoard];
          [revertedBoard[start], revertedBoard[end]] = [revertedBoard[end], revertedBoard[start]];
          setBoard(revertedBoard);
          setIsProcessing(false);
        }
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/40 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-pink-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center drop-shadow-sm">缤纷水果消消乐</h2>
        
        <div className="flex justify-between items-center mb-6 px-6 bg-white/60 p-3 rounded-2xl w-full shadow-inner border border-white/50">
            <span className="text-gray-500 font-medium">当前得分</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent transition-all duration-300 transform key={score}">{score}</span>
        </div>
        
        <div className="grid grid-cols-8 gap-2 bg-black/5 p-3 rounded-2xl shadow-inner touch-none relative z-10">
          {board.map((fruit, index) => (
            <div
              key={index}
              className={`
                w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-2xl md:text-3xl select-none cursor-pointer transition-all duration-200
                bg-white shadow-sm border border-white/50
                ${dragStart === index ? 'ring-4 ring-pink-300 scale-110 z-20 shadow-lg bg-pink-50' : 'hover:scale-105 hover:shadow-md hover:bg-white'}
                ${!fruit ? 'invisible opacity-0 scale-50' : 'opacity-100 scale-100'}
              `}
              onClick={() => handleClick(index)}
            >
              {fruit}
            </div>
          ))}
        </div>
        
        <button 
            onClick={() => {
                const newBoard = Array(64).fill('').map(getRandomFruit);
                setBoard(newBoard);
                setScore(0);
                processBoard(newBoard);
            }}
            disabled={isProcessing}
            className={`mt-8 w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg 
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl active:scale-95'}
            `}
        >
            {isProcessing ? '正在处理...' : '重新开始'}
        </button>
      </div>
    </div>
  );
};