export const msToTime = (s: number): string => {
  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const mins = s % 60;
  const hrs = (s - mins) / 60;

  return `${hrs}:${mins}:${secs}.${ms}`;
};
export const msToSecond = (ms: number): string => {
  const ms1 = ms % 1000;
  const s = (ms - ms1) / 1000;
  return `${s}.${ms1}`;
};
