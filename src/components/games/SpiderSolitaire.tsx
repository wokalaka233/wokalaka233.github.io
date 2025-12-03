import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

interface Card {
  id: number;
  suit: string; // 'spades'
  rank: number; // 1-13 (A-K)
  faceUp: boolean;
}

interface DragState {
  isDragging: boolean;
  colIdx: number;
  cardIdx: number;
  startX: number;
  startY: number;
  currX: number;
  currY: number;
  draggedCards: Card[];
  dragWidth: number; // Store width of dragged card for visual consistency
}

const SUIT_SYMBOL = '♠';
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SpiderSolitaire: React.FC = () => {
  const [columns, setColumns] = useState<Card[][]>([]);
  const [stock, setStock] = useState<Card[]>([]);
  const [completedStacks, setCompletedStacks] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Drag State
  const [dragState, setDragState] = useState<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardSpacing = isMobile ? 18 : 28; // Tighter spacing on mobile

  // Initialize Game
  const initGame = () => {
    let deck: Card[] = [];
    for (let i = 0; i < 8; i++) {
        for (let r = 1; r <= 13; r++) {
            deck.push({ id: i * 13 + r + Math.random(), suit: 'spades', rank: r, faceUp: false });
        }
    }
    deck.sort(() => Math.random() - 0.5);

    const newCols: Card[][] = Array(10).fill([]).map(() => []);
    for(let i=0; i<54; i++) {
        const colIdx = i % 10;
        const card = deck.pop()!;
        newCols[colIdx].push(card);
    }
    
    newCols.forEach(col => {
        if(col.length > 0) col[col.length-1].faceUp = true;
    });

    setColumns(newCols);
    setStock(deck);
    setCompletedStacks(0);
    setDragState(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  // --- Drag and Drop Logic ---

  const getValidSequenceFromIndex = (col: Card[], idx: number) => {
      if (!col[idx].faceUp) return false;
      for (let i = idx; i < col.length - 1; i++) {
          if (col[i].rank !== col[i+1].rank + 1) return false;
      }
      return true;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, colIdx: number, cardIdx: number) => {
      const col = columns[colIdx];
      if (!getValidSequenceFromIndex(col, cardIdx)) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      // Get width of the card element being dragged
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      setDragState({
          isDragging: true,
          colIdx,
          cardIdx,
          startX: clientX,
          startY: clientY,
          currX: clientX,
          currY: clientY,
          draggedCards: col.slice(cardIdx),
          dragWidth: rect.width
      });
  };

  useEffect(() => {
      const handleMove = (e: MouseEvent | TouchEvent) => {
          if (!dragState?.isDragging) return;
          
          const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

          setDragState(prev => prev ? ({ ...prev, currX: clientX, currY: clientY }) : null);
          e.preventDefault(); 
      };

      const handleUp = (e: MouseEvent | TouchEvent) => {
          if (!dragState?.isDragging) return;

          const clientX = 'touches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
          const clientY = 'touches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

          // Simple hit detection based on column X coordinates (assuming mostly vertical layout)
          const elements = document.elementsFromPoint(clientX, clientY);
          let targetColIdx = -1;
          
          for (let el of elements) {
              const colDiv = el.closest('[data-col-idx]');
              if (colDiv) {
                  targetColIdx = parseInt(colDiv.getAttribute('data-col-idx') || '-1');
                  break;
              }
          }

          if (targetColIdx !== -1 && targetColIdx !== dragState.colIdx) {
              attemptMove(dragState.colIdx, targetColIdx, dragState.draggedCards);
          }

          setDragState(null);
      };

      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);

      return () => {
          window.removeEventListener('mousemove', handleMove);
          window.removeEventListener('touchmove', handleMove);
          window.removeEventListener('mouseup', handleUp);
          window.removeEventListener('touchend', handleUp);
      };
  }, [dragState, columns]);

  const attemptMove = (fromIdx: number, toIdx: number, cardsToMove: Card[]) => {
    const newCols = [...columns];
    const targetCol = newCols[toIdx];
    const sourceCol = newCols[fromIdx];
    
    const topMovingCard = cardsToMove[0];
    const targetTop = targetCol[targetCol.length - 1];
    
    let canMove = false;
    if (!targetTop) {
        canMove = true;
    } else if (targetTop.rank === topMovingCard.rank + 1) {
        canMove = true;
    }

    if (canMove) {
        newCols[fromIdx] = sourceCol.slice(0, sourceCol.length - cardsToMove.length);
        newCols[toIdx] = [...targetCol, ...cardsToMove];

        if (newCols[fromIdx].length > 0) {
            newCols[fromIdx][newCols[fromIdx].length - 1].faceUp = true;
        }

        checkCompletedSequence(newCols, toIdx);
        setColumns(newCols);
    }
  };

  const checkCompletedSequence = (cols: Card[][], colIdx: number) => {
     const col = cols[colIdx];
     if (col.length < 13) return;

     const potentialSeq = col.slice(col.length - 13);
     let isSeq = true;
     if (potentialSeq[0].rank !== 13) isSeq = false; 
     for (let i = 0; i < 12; i++) {
         if (potentialSeq[i].rank !== potentialSeq[i+1].rank + 1) {
             isSeq = false; break;
         }
     }

     if (isSeq) {
         cols[colIdx] = col.slice(0, col.length - 13);
         setCompletedStacks(prev => prev + 1);
         if (cols[colIdx].length > 0) {
             cols[colIdx][cols[colIdx].length - 1].faceUp = true;
         }
     }
  };

  const dealStock = () => {
    if (stock.length === 0) return;
    if (columns.some(c => c.length === 0)) {
        alert("不能发牌：所有列必须至少有一张牌");
        return;
    }
    const newCols = [...columns];
    const newStock = [...stock];
    for (let i = 0; i < 10; i++) {
        if (newStock.length > 0) {
            const card = newStock.pop()!;
            card.faceUp = true;
            newCols[i].push(card);
            checkCompletedSequence(newCols, i);
        }
    }
    setColumns(newCols);
    setStock(newStock);
  };

  const getRankDisplay = (rank: number) => RANKS[rank - 1];

  return (
    <div className="w-full flex flex-col items-center animate-fade-in-up">
       <div 
         ref={containerRef}
         className="bg-[#2a4d33] w-full max-w-6xl p-2 md:p-4 rounded-xl shadow-2xl border-2 md:border-4 border-[#3e6b4a] min-h-[85vh] md:min-h-[700px] flex flex-col relative overflow-hidden touch-none"
       >
          {/* Header */}
          <div className="flex justify-between text-white/90 mb-2 md:mb-4 px-1 select-none items-center">
             <div className="flex gap-2 md:gap-4">
                 <button onClick={initGame} className="flex items-center gap-1 bg-white/20 px-2 py-1 md:px-3 rounded text-sm hover:bg-white/30"><RotateCcw size={14}/> <span className="hidden md:inline">重玩</span></button>
             </div>
             <div className="font-bold text-sm md:text-xl">已完成: {completedStacks} / 8</div>
          </div>

          {/* Tableau */}
          <div className="flex-1 relative w-full">
            {/* Using grid/percentage for absolute mobile fit */}
            <div className="flex justify-between w-full h-full">
                {columns.map((col, colIdx) => (
                    <div 
                        key={colIdx} 
                        data-col-idx={colIdx}
                        className="relative"
                        style={{ width: '9.2%', height: '100%' }} // Fit 10 columns with spacing
                    >
                        {col.length === 0 && (
                            <div className="w-full aspect-[2/3] border border-dashed border-white/20 rounded"></div>
                        )}
                        {col.map((card, idx) => {
                            const isBeingDragged = dragState?.isDragging && dragState.colIdx === colIdx && idx >= dragState.cardIdx;
                            if (isBeingDragged) return null;

                            return (
                                <div
                                    key={card.id}
                                    onMouseDown={(e) => handleMouseDown(e, colIdx, idx)}
                                    onTouchStart={(e) => handleMouseDown(e, colIdx, idx)}
                                    className={`absolute w-full aspect-[2/3] rounded border border-gray-400 shadow-sm flex flex-col justify-between p-[2px] md:p-1 select-none cursor-pointer
                                        ${card.faceUp ? 'bg-white' : 'bg-blue-800 border-white/50'}
                                    `}
                                    style={{ 
                                        top: `${idx * cardSpacing}px`, // Dynamic spacing
                                        zIndex: idx 
                                    }}
                                >
                                    {card.faceUp ? (
                                        <>
                                            <div className="text-[10px] md:text-xs font-bold leading-none text-black">
                                                {getRankDisplay(card.rank)}<br/>{SUIT_SYMBOL}
                                            </div>
                                            <div className="self-center text-sm md:text-2xl text-black">{SUIT_SYMBOL}</div>
                                            {/* Hide rotated bottom text on very small screens to save space/clutter */}
                                            <div className="hidden md:block text-xs font-bold leading-none self-end rotate-180 text-black">
                                                {getRankDisplay(card.rank)}<br/>{SUIT_SYMBOL}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,#1e3a8a,#1e3a8a_5px,#172554_5px,#172554_10px)] rounded opacity-80"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Dragging Proxy */}
            {dragState && dragState.isDragging && (
                 <div 
                    className="fixed pointer-events-none z-[9999]"
                    style={{ 
                        left: dragState.currX, 
                        top: dragState.currY,
                        width: dragState.dragWidth, // Match the source column width exactly
                        transform: 'translate(-50%, -20%)'
                    }}
                 >
                     <div className="w-full relative">
                         {dragState.draggedCards.map((card, idx) => (
                             <div
                                key={card.id}
                                className="absolute w-full aspect-[2/3] rounded border border-gray-400 shadow-2xl flex flex-col justify-between p-[2px] md:p-1 bg-white"
                                style={{ top: `${idx * cardSpacing}px`, zIndex: 100 + idx }}
                             >
                                <div className="text-[10px] md:text-xs font-bold leading-none text-black">
                                    {getRankDisplay(card.rank)}<br/>{SUIT_SYMBOL}
                                </div>
                                <div className="self-center text-sm md:text-xl text-black">{SUIT_SYMBOL}</div>
                             </div>
                         ))}
                     </div>
                 </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="h-20 md:h-24 border-t border-white/10 mt-2 flex items-center justify-center gap-4 md:gap-8 relative z-10 bg-[#2a4d33]">
             <div className="relative cursor-pointer group active:scale-95 transition-transform" onClick={dealStock}>
                {stock.length > 0 ? (
                    <>
                        <div className="w-12 md:w-16 h-16 md:h-24 bg-blue-800 rounded border border-white shadow-xl relative top-0 left-0"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-white text-shadow text-xs md:text-base">
                            {Math.floor(stock.length / 10)}
                        </div>
                    </>
                ) : (
                    <div className="w-12 md:w-16 h-16 md:h-24 border-2 border-dashed border-white/30 rounded flex items-center justify-center text-white/30 text-xs">
                        空
                    </div>
                )}
                <div className="text-white/60 text-[10px] md:text-xs text-center mt-1">发牌</div>
             </div>

             <div className="flex -space-x-8 md:-space-x-10 pl-4">
                {Array.from({length: completedStacks}).map((_, i) => (
                    <div key={i} className="w-12 md:w-16 h-16 md:h-24 bg-white rounded border border-gray-400 shadow-xl flex items-center justify-center text-xl md:text-4xl text-black">
                        K{SUIT_SYMBOL}
                    </div>
                ))}
                {completedStacks === 0 && <div className="text-white/30 text-xs self-center">暂无完成</div>}
             </div>
          </div>
       </div>
    </div>
  );
};