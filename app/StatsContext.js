'use client';

import { createContext, useContext, useState } from 'react';

const StatsCtx = createContext(null);

export function StatsProvider({ children }) {
  const [stats, setStats] = useState(null);
  return <StatsCtx.Provider value={{ stats, setStats }}>{children}</StatsCtx.Provider>;
}

export const useStats = () => useContext(StatsCtx);
