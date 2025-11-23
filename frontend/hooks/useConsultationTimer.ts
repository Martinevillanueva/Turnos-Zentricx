import { useState, useEffect } from 'react';

export function useConsultationTimer(consultationStartTime?: string) {
  const [elapsed, setElapsed] = useState<string>('');

  useEffect(() => {
    if (!consultationStartTime) {
      setElapsed('');
      return;
    }

    const updateElapsed = () => {
      try {
        const start = new Date(consultationStartTime);
        const now = new Date();
        if (Number.isNaN(start.getTime())) {
          setElapsed('--:--');
          return;
        }
        const diffMs = now.getTime() - start.getTime();
        if (diffMs < 0) {
          setElapsed('00:00');
          return;
        }
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
        if (hours > 0) {
          setElapsed(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setElapsed(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } catch (error) {
        setElapsed('--:--');
      }
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [consultationStartTime]);

  return elapsed;
}
