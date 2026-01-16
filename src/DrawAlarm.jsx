import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function DrawAlarm() {
  const [step, setStep] = useState('hour'); // 'hour', 'minute', 'second', 'confirm', 'countdown', 'ringing', 'done'
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const [cursorInCanvas, setCursorInCanvas] = useState(false);

  const BOARD_WIDTH_CM = 30;
  const BOARD_HEIGHT_CM = 20;
  const PIXELS_PER_CM = 20;
  const BOARD_WIDTH = BOARD_WIDTH_CM * PIXELS_PER_CM;
  const BOARD_HEIGHT = BOARD_HEIGHT_CM * PIXELS_PER_CM;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    
    if (path.length > 0) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
  }, [path]);

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (step === 'countdown' && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            setStep('ringing');
            setIsRinging(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, remainingTime]);

  // High-pitch alarm sound effect
  useEffect(() => {
    if (isRinging) {
      playAlarmSound();
    } else {
      stopAlarmSound();
    }
    return () => stopAlarmSound();
  }, [isRinging]);

  const playAlarmSound = () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioContextRef.current;
      
      const playBeep = () => {
        if (!isRinging) return;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // High pitch frequency (2000-3000 Hz range)
        oscillator.frequency.setValueAtTime(2500, ctx.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      };
      
      playBeep();
      oscillatorRef.current = setInterval(playBeep, 700);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const stopAlarmSound = () => {
    if (oscillatorRef.current) {
      clearInterval(oscillatorRef.current);
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setIsDrawing(true);
      setPath([{ x, y }]);
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPath(prev => [...prev, { x, y }]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = BOARD_WIDTH / rect.width;
    const scaleY = BOARD_HEIGHT / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    setIsDrawing(true);
    setPath([{ x, y }]);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (isDrawing) {
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = BOARD_WIDTH / rect.width;
      const scaleY = BOARD_HEIGHT / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      setPath(prev => [...prev, { x, y }]);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const calculateLineLength = () => {
    let length = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i-1].x;
      const dy = path[i].y - path[i-1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length / PIXELS_PER_CM; // Convert to cm
  };

  const handleSet = () => {
    const length = calculateLineLength();
    
    if (step === 'hour') {
      if (length > 24) {
        alert('Hour cannot be greater than 24! Please draw again.');
        setPath([]);
        return;
      }
      setHour(length);
      setStep('minute');
      setPath([]);
    } else if (step === 'minute') {
      if (length > 60) {
        alert('Minute cannot be greater than 60! Please draw again.');
        setPath([]);
        return;
      }
      setMinute(length);
      setStep('second');
      setPath([]);
    } else if (step === 'second') {
      if (length > 60) {
        alert('Second cannot be greater than 60! Please draw again.');
        setPath([]);
        return;
      }
      setSecond(length);
      setStep('confirm');
      setPath([]);
    }
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleErase = () => {
    setPath([]);
  };

  const handleSetAlarm = () => {
    const totalSeconds = Math.floor(hour * 3600 + minute * 60 + second);
    if (totalSeconds === 0) {
      // If total time is 0, go directly to ringing
      setStep('ringing');
      setIsRinging(true);
    } else {
      setRemainingTime(totalSeconds);
      setStep('countdown');
    }
  };

  const handleStopAlarm = () => {
    setIsRinging(false);
    setStep('done');
  };

  const handleReset = () => {
    setIsRinging(false);
    stopAlarmSound();
    setStep('hour');
    setHour(0);
    setMinute(0);
    setSecond(0);
    setRemainingTime(0);
    setPath([]);
  };

  const getPromptText = () => {
    if (step === 'hour') return 'SET HOUR';
    if (step === 'minute') return 'SET MINUTE';
    if (step === 'second') return 'SET SECOND';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-8 w-full max-w-4xl">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            DrawAlarm ✏️
          </h1>
        </div>

        {(step === 'hour' || step === 'minute' || step === 'second') && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {getPromptText()}
            </h2>
            <p className="text-center text-gray-600 text-xs sm:text-sm">
              <span className="hidden sm:inline">Click and hold the left mouse button while drawing a line on the board.</span>
              <span className="sm:hidden">Touch and drag to draw a line on the board.</span>
              {' '}The length of your line determines the time value!
            </p>
            <p className="text-center text-yellow-600 text-xs mt-1">
              💡 Don't draw anything and click SET to keep value as 0
            </p>
            {step !== 'hour' && (
              <p className="text-center text-green-600 font-semibold mt-2">
                ✓ Hour set: {hour.toFixed(2)}
              </p>
            )}
            {step === 'second' && (
              <p className="text-center text-green-600 font-semibold mt-1">
                ✓ Minute set: {minute.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              CONFIRM YOUR ALARM
            </h2>
            <p className="text-center text-gray-600">
              Hour: {hour.toFixed(2)} | Minute: {minute.toFixed(2)} | Second: {second.toFixed(2)}
            </p>
          </div>
        )}

        {(step === 'hour' || step === 'minute' || step === 'second') && (
          <div className="mb-4 flex justify-center">
            <div 
              className="relative border-4 border-gray-800 bg-white w-full max-w-[600px] aspect-[3/2]"
              style={{ 
                cursor: cursorInCanvas ? 'crosshair' : 'default',
                touchAction: 'none'
              }}
              onMouseEnter={() => setCursorInCanvas(true)}
              onMouseLeave={() => setCursorInCanvas(false)}
            >
              <canvas
                ref={canvasRef}
                width={BOARD_WIDTH}
                height={BOARD_HEIGHT}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full"
                style={{ touchAction: 'none' }}
              />
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-[10px] sm:text-xs text-gray-400">
                30cm × 20cm
              </div>
            </div>
          </div>
        )}

        {(step === 'hour' || step === 'minute' || step === 'second') && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              Current line length: {calculateLineLength().toFixed(2)} cm
            </p>
          </div>
        )}

        {/* Countdown Display */}
        {step === 'countdown' && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              ⏳ COUNTDOWN
            </h2>
            <div className="text-6xl sm:text-8xl font-mono font-bold text-center text-purple-600 mb-4">
              {formatTime(remainingTime)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(remainingTime / Math.floor(hour * 3600 + minute * 60 + second)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Ringing Display */}
        {step === 'ringing' && (
          <div className="mb-6">
            <div className="animate-pulse">
              <h2 className="text-4xl sm:text-6xl font-bold text-center text-red-600 mb-4">
                🔔 ALARM! 🔔
              </h2>
            </div>
            <div className="text-2xl text-center text-gray-700 mb-4 animate-bounce">
              ⏰ TIME'S UP! ⏰
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
          {(step === 'hour' || step === 'minute' || step === 'second') && (
            <>
              <button
                onClick={handleSet}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
              >
                SET
              </button>
              <button
                onClick={handleErase}
                disabled={path.length === 0}
                className="bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                ERASE
              </button>
            </>
          )}

          {step === 'confirm' && (
            <button
              onClick={handleSetAlarm}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105 active:scale-95"
            >
              START ALARM
            </button>
          )}

          {step === 'countdown' && (
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95"
            >
              CANCEL
            </button>
          )}

          {step === 'ringing' && (
            <button
              onClick={handleStopAlarm}
              className="bg-red-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-lg font-bold text-xl sm:text-2xl hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 animate-pulse"
            >
              🛑 STOP ALARM
            </button>
          )}

          {(step === 'confirm' || step === 'done') && (
            <button
              onClick={handleReset}
              className="bg-gray-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-700 transition-all transform hover:scale-105 active:scale-95"
            >
              RESET
            </button>
          )}
        </div>

        {step === 'done' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border-2 border-green-500">
            <h2 className="text-2xl font-bold text-center text-green-800 mb-3">
              ✅ ALARM COMPLETED!
            </h2>
            <p className="text-center text-gray-700 text-lg">
              Timer was set for: <span className="font-bold">{hour.toFixed(2)} hours, {minute.toFixed(2)} minutes, {second.toFixed(2)} seconds</span>
            </p>
          </div>
        )}

        {(step === 'hour' || step === 'minute' || step === 'second') && (
          <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500">
            <p>💡 Pro tip: Draw longer lines for bigger numbers!</p>
            <p className="mt-1 hidden sm:block">🎨 Remember to click and hold while drawing</p>
            <p className="mt-1 sm:hidden">🎨 Touch and drag to draw!</p>
          </div>
        )}
      </div>
    </div>
  );
}
