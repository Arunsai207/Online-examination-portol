import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialMinutes, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (onTimeoutRef.current) onTimeoutRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((minutes) => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = timeLeft <= 300 && timeLeft > 60; // 5 min
  const isDanger = timeLeft <= 60; // 1 min
  const percentage = initialMinutes > 0 ? (timeLeft / (initialMinutes * 60)) * 100 : 0;

  return {
    timeLeft,
    minutes,
    seconds,
    formattedTime,
    isRunning,
    isWarning,
    isDanger,
    percentage,
    start,
    pause,
    reset
  };
};
