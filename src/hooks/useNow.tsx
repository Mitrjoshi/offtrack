import { useState, useEffect } from "react";

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now()); // lazy init: called once
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
