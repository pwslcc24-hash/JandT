import { useEffect, useState } from "react";

export function useCountdown(targetDate) {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.ceil(
        (new Date(targetDate).getTime() - Date.now()) / 86400000
      );
      setDays(diff > 0 ? diff : 0);
    };

    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  return days;
}
