'use client';

import { useState, useEffect } from 'react';

type ChartTheme = {
  chart1: string;
  chart2: string;
  chartBest: string;
  chartWorst: string;
  chartBarBg: string;
  engagementLine1: string;
  engagementLine2: string;
  engagementFill1Start: string;
  engagementFill2Start: string;
  gaSessions: string;
  gaFormSubmits: string;
  gaViewSearchResults: string;
  gaBookingConfirmed: string;
  tooltipStyle: {
    background: string;
    border: string;
    borderRadius: string;
    fontSize: string;
    color: string;
  };
};

const lightTheme: ChartTheme = {
  chart1: '#d4d4d8',
  chart2: '#52525b',
  chartBest: '#09090b',
  chartWorst: '#a1a1aa',
  chartBarBg: '#f4f4f5',
  engagementLine1: '#d4d4d8',
  engagementLine2: '#09090b',
  engagementFill1Start: 'rgba(212, 212, 216, 0.2)',
  engagementFill2Start: 'rgba(9, 9, 11, 0.1)',
  gaSessions: '#3b82f6',
  gaFormSubmits: '#22c55e',
  gaViewSearchResults: '#f59e0b',
  gaBookingConfirmed: '#a855f7',
  tooltipStyle: {
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#09090b',
  },
};

const darkTheme: ChartTheme = {
  chart1: '#a1a1aa',
  chart2: '#52525b',
  chartBest: '#fafafa',
  chartWorst: '#52525b',
  chartBarBg: '#09090b',
  engagementLine1: '#a1a1aa',
  engagementLine2: '#fafafa',
  engagementFill1Start: 'rgba(161, 161, 170, 0.15)',
  engagementFill2Start: 'rgba(250, 250, 250, 0.08)',
  gaSessions: '#60a5fa',
  gaFormSubmits: '#4ade80',
  gaViewSearchResults: '#fbbf24',
  gaBookingConfirmed: '#c084fc',
  tooltipStyle: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#fafafa',
  },
};

export function useChartTheme(): ChartTheme {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark ? darkTheme : lightTheme;
}
