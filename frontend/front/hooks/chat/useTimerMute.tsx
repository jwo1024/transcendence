import { useEffect, useState } from "react";

const useTimerMute = (minute: number) => {
  const [issuedAt, setIssuedAt] = useState<Date | null>(null); // at
  const [intervalState, setIntervalState] = useState<NodeJS.Timeout | null>(
    null
  );
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    if (issuedAt) {
      if (intervalState) clearInterval(intervalState);
      const intervalId = setInterval(() => {
        setTimeStr(timer());
        if (timer() === "") setIssuedAt(null);
      }, 500);
      setIntervalState(intervalId);
    }
  }, [issuedAt]);

  const timer = (): string => {
    if (issuedAt) {
      const time = new Date(issuedAt);
      const now = new Date();
      const diff = now.getTime() - time.getTime();
      const remainingTime = minute * 60 * 1000 - diff;
      if (remainingTime <= 0) return "";
      const min = Math.floor(remainingTime / 60000);
      const sec = Math.floor((remainingTime - min * 60000) / 1000);
      return `${min} : ${sec}`;
    }
    return "";
  };

  return { timeStr, setIssuedAt };
};

export default useTimerMute;
