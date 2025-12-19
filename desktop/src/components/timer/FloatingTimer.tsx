import React, { useState } from 'react';
import { X, Minimize2, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';

export function FloatingTimer() {
  const {
    timerState,
    isVisible,
    isMinimized,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    toggleMinimize,
    hideTimer,
  } = useTimer();

  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div
        className="fixed z-[9999] cursor-move select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center shadow-2xl border border-white/20 hover:scale-110 transition-transform cursor-pointer"
          onClick={toggleMinimize}
        >
          <div className="text-white text-center">
            <div className="text-xs font-bold">{formatTime(timerState.elapsedSeconds)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed z-[9999] w-80 cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-white/30 rounded-full cursor-grab active:cursor-grabbing" />
          </div>
          <div className="flex gap-1">
            <button
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={hideTimer}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="px-6 py-8 text-center">
          <div className="text-6xl font-bold text-white font-mono tracking-wider mb-2">
            {formatTime(timerState.elapsedSeconds)}
          </div>
          <div className="text-sm text-white/60 uppercase tracking-wide">
            {timerState.type === 'focus' ? 'Focus Time' :
              timerState.type === 'short_break' ? 'Short Break' :
                'Long Break'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-6 pb-6">
          <button
            onClick={() => timerState.isRunning ? pauseTimer() : startTimer()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {timerState.isRunning ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={stopTimer}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all border border-red-500/30 hover:border-red-500/50 hover:scale-105 active:scale-95"
          >
            <Square className="w-5 h-5 text-red-400" fill="currentColor" />
          </button>

          <button
            onClick={resetTimer}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-500/20 hover:bg-gray-500/30 transition-all border border-gray-500/30 hover:border-gray-500/50 hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
