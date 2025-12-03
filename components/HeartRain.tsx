import React, { useEffect, useState } from 'react';

const HEARTS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'];

interface Heart {
  id: number;
  char: string;
  left: number; // percentage
  size: number; // em
  duration: number; // seconds
  delay: number; // seconds
}

export const HeartRain: React.FC = () => {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Generate hearts continuously
    const interval = setInterval(() => {
      const newHearts: Heart[] = [];
      // Spawn 5-8 hearts at a time for high density
      const count = Math.floor(Math.random() * 4) + 5; 
      
      for (let i = 0; i < count; i++) {
        newHearts.push({
          id: Date.now() + Math.random(),
          char: HEARTS[Math.floor(Math.random() * HEARTS.length)],
          left: Math.random() * 100,
          size: Math.random() * 2.5 + 1.5, // 1.5rem to 4rem for better visibility
          duration: Math.random() * 3 + 3, // 3s to 6s float duration
          delay: 0
        });
      }

      setHearts(prev => [...prev, ...newHearts]);
    }, 100);

    // Cleanup old hearts to prevent memory leak
    const cleanup = setInterval(() => {
      setHearts(prev => prev.slice(-300)); // Keep max 300 elements
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanup);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="heart-anim absolute"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}rem`,
            animationDuration: `${heart.duration}s`,
            opacity: 0, // start hidden, anim handles opacity
          }}
        >
          {heart.char}
        </div>
      ))}
    </div>
  );
};