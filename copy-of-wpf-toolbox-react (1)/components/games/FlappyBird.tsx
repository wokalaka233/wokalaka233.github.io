import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

export const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Game Constants - Difficulty Adjusted (Easier)
  const GRAVITY = 0.45; // Slower fall (was 0.6)
  const JUMP = -7; // Adjusted jump (was -8)
  const PIPE_SPEED = 2.5; // Slower pipes (was 3)
  const PIPE_SPAWN_RATE = 120; // More space between pipes (was 100)
  const GAP_SIZE = 180; // Wider gap (was 150)

  // Refs for loop variables to avoid closures
  const stateRef = useRef({
    birdY: 200,
    birdVelocity: 0,
    pipes: [] as { x: number, topHeight: number }[],
    frame: 0
  });
  const requestRef = useRef<number>(0);

  const resetGame = () => {
    stateRef.current = {
      birdY: 200,
      birdVelocity: 0,
      pipes: [],
      frame: 0
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = stateRef.current;
    
    // Physics
    if (isPlaying && !gameOver) {
        state.birdVelocity += GRAVITY;
        state.birdY += state.birdVelocity;
        state.frame++;

        // Spawn Pipes
        if (state.frame % PIPE_SPAWN_RATE === 0) {
            const minPipe = 50;
            const maxPipe = canvas.height - GAP_SIZE - minPipe;
            const height = Math.floor(Math.random() * (maxPipe - minPipe + 1)) + minPipe;
            state.pipes.push({ x: canvas.width, topHeight: height });
        }

        // Update Pipes
        state.pipes.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
        });

        // Remove off-screen pipes
        if (state.pipes.length > 0 && state.pipes[0].x < -50) {
            state.pipes.shift();
            setScore(s => s + 1);
        }

        // Collision Detection
        // 1. Ground/Ceiling
        if (state.birdY + 20 > canvas.height || state.birdY < 0) {
            setGameOver(true);
            setIsPlaying(false);
        }

        // 2. Pipes
        state.pipes.forEach(pipe => {
            // Bird hitbox: x=50, w=30, y=birdY, h=30
            // Pipe x
            if (50 + 25 > pipe.x && 55 < pipe.x + 50) { // Slightly forgiving hitbox
                // Pipe y (Top Pipe or Bottom Pipe)
                if (state.birdY + 5 < pipe.topHeight || state.birdY + 25 > pipe.topHeight + GAP_SIZE) {
                    setGameOver(true);
                    setIsPlaying(false);
                }
            }
        });
    }

    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.arc(140, 90, 40, 0, Math.PI * 2);
    ctx.arc(180, 100, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Bird
    ctx.fillStyle = '#f48c06'; // Bird Body
    ctx.beginPath();
    ctx.arc(50 + 15, state.birdY + 15, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff'; // Eye
    ctx.beginPath();
    ctx.arc(50 + 20, state.birdY + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d00000'; // Wing
    ctx.beginPath();
    ctx.ellipse(50 + 5, state.birdY + 18, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pipes
    state.pipes.forEach(pipe => {
        // Top Pipe
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + 50, 0);
        gradient.addColorStop(0, '#73be2e');
        gradient.addColorStop(0.5, '#b8e994');
        gradient.addColorStop(1, '#558c22');
        
        ctx.fillStyle = gradient;
        
        ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
        ctx.strokeStyle = '#3e6b18';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, 50, pipe.topHeight);
        
        // Pipe Cap
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, 54, 20);
        ctx.strokeRect(pipe.x - 2, pipe.topHeight - 20, 54, 20);

        // Bottom Pipe
        const bottomY = pipe.topHeight + GAP_SIZE;
        ctx.fillStyle = gradient;
        ctx.fillRect(pipe.x, bottomY, 50, canvas.height - bottomY);
        ctx.strokeRect(pipe.x, bottomY, 50, canvas.height - bottomY);
        
        // Pipe Cap
        ctx.fillRect(pipe.x - 2, bottomY, 54, 20);
        ctx.strokeRect(pipe.x - 2, bottomY, 54, 20);
    });

    // Ground
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = '#78a638'; // Grass
    ctx.fillRect(0, canvas.height - 20, canvas.width, 5);
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx, canvas);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, gameOver]); 

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score]);

  const jump = (e?: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
    if(e) e.preventDefault(); 
    if (!isPlaying && !gameOver) {
        resetGame();
    } else if (isPlaying) {
        stateRef.current.birdVelocity = JUMP;
    } else if (gameOver) {
        resetGame();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.code === 'Space') jump();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying, gameOver]);


  return (
    <div className="w-full flex flex-col items-center animate-fade-in-up">
      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20 relative">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">像素小鸟 (简单版)</h2>
        
        <canvas 
            ref={canvasRef}
            width={320} 
            height={480}
            className="rounded-lg shadow-inner cursor-pointer"
            onClick={jump}
            onTouchStart={jump}
        />

        {(!isPlaying && !gameOver) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 text-white p-4 rounded-xl backdrop-blur-sm text-center">
                    <Play size={48} className="mx-auto mb-2"/>
                    <p>点击屏幕或按空格开始</p>
                </div>
            </div>
        )}

        {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-red-500/90 text-white p-6 rounded-xl backdrop-blur-sm text-center transform scale-110 shadow-2xl border-4 border-white">
                    <h3 className="text-3xl font-bold mb-2">Game Over</h3>
                    <p className="text-xl mb-4">得分: {score}</p>
                    <div className="flex items-center justify-center gap-2 bg-white/20 p-2 rounded-lg">
                        <RotateCcw size={20}/>
                        <span>点击重试</span>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between mt-4 font-bold text-gray-600 px-4">
            <div>分数: <span className="text-indigo-600 text-xl">{score}</span></div>
            <div>最高: <span className="text-amber-500 text-xl">{highScore}</span></div>
        </div>
      </div>
    </div>
  );
};