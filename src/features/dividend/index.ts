/** dividend feature 배럴 익스포트 */
export { default as DividendCalendar } from './components/DividendCalendar';
export { default as DividendSimulator } from './components/DividendSimulator';
export { default as DividendCalendarCard } from './components/DividendCalendarCard';
// 훅은 배럴 제외 — 컴포넌트 내부에서 직접 import할 것
export type { DividendCalendarRow, SimulatorParams, SimulatorResult, YearlyProjection } from './types';
export { calculateDividend, formatKRW, getSimulatorCount, incrementSimulatorCount, FREE_LIMIT } from './types';
