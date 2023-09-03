import { useEffect, useState } from 'react';

const CountdownTimer: React.FC<{ remainingTime: number }> = ({
  remainingTime,
}) => {
  const [time, setTime] = useState(remainingTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime - 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    const daysText = days > 0 ? `${days} d, ` : '';
    const hoursText = hours > 0 ? `${hours} h, ` : '';
    const minutesText = minutes > 0 ? `${minutes} m, ` : '';
    const secondsText = `${seconds} s`;

    return `${daysText}${hoursText}${minutesText}${secondsText}`;
  };

  return <span>{formatTime(time)}</span>;
};

export default CountdownTimer;
