import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function DrawAlarm() {
  const [step, setStep] = useState('hour'); // 'hour', 'minute', 'second', 'done'
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const canvasRef = useRef(null);
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

  const handleErase = () => {
    setPath([]);
  };

  const handleSetAlarm = () => {
    setStep('done');
  };

  const handleReset = () => {
    setStep('hour');
    setHour(0);
    setMinute(0);
    setSecond(0);
    setPath([]);
  };

  const getPromptText = () => {
    if (step === 'hour') return 'SET HOUR';
    if (step === 'minute') return 'SET MINUTE';
    if (step === 'second') return 'SET SECOND';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Clock className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            DrawAlarm ✏️
          </h1>
        </div>

        {step !== 'done' && step !== 'confirm' && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {getPromptText()}
            </h2>
            <p className="text-center text-gray-600 text-sm">
              Click and hold the left mouse button while drawing a line on the board. The length of your line determines the time value!
            </p>
            {hour > 0 && step !== 'hour' && (
              <p className="text-center text-green-600 font-semibold mt-2">
                ✓ Hour set: {hour.toFixed(2)}
              </p>
            )}
            {minute > 0 && step === 'second' && (
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

        {step !== 'done' && step !== 'confirm' && (
          <div className="mb-4 flex justify-center">
            <div 
              className="relative border-4 border-gray-800 bg-white"
              style={{ 
                width: `${BOARD_WIDTH}px`, 
                height: `${BOARD_HEIGHT}px`,
                cursor: cursorInCanvas ? 'crosshair' : 'default'
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
                className="w-full h-full"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                30cm × 20cm
              </div>
            </div>
          </div>
        )}

        {step !== 'done' && step !== 'confirm' && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              Current line length: {calculateLineLength().toFixed(2)} cm
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {step !== 'done' && step !== 'confirm' && (
            <>
              <button
                onClick={handleSet}
                disabled={path.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                SET
              </button>
              <button
                onClick={handleErase}
                disabled={path.length === 0}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                ERASE
              </button>
            </>
          )}

          {step === 'confirm' && (
            <button
              onClick={handleSetAlarm}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
            >
              SET ALARM
            </button>
          )}

          {(step === 'confirm' || step === 'done') && (
            <button
              onClick={handleReset}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-700 transition-all transform hover:scale-105"
            >
              RESET
            </button>
          )}
        </div>

        {step === 'done' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg border-2 border-green-500">
            <h2 className="text-2xl font-bold text-center text-green-800 mb-3">
              ✅ ALARM SET SUCCESSFULLY!
            </h2>
            <p className="text-center text-gray-700 text-lg">
              Time is set for: <span className="font-bold">{hour.toFixed(2)} hours, {minute.toFixed(2)} minutes, {second.toFixed(2)} seconds</span>
            </p>
            <p className="text-center text-gray-600 text-sm mt-2">
              Total time: {(hour * 3600 + minute * 60 + second).toFixed(2)} seconds
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>💡 Pro tip: Draw longer lines for bigger numbers!</p>
          <p className="mt-1">🎨 Remember to click and hold while drawing</p>
        </div>
      </div>
    </div>
  );
}
