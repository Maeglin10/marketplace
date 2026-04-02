import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number; // positive = up, negative = down, percentage
  description?: string;
  className?: string;
}

export function StatsCard({ label, value, icon, trend, description, className }: StatsCardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const isPositive = hasTrend && trend >= 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3',
        'dark:bg-gray-900 dark:border-gray-800',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* Top row: icon + trend badge */}
      <div className="flex items-start justify-between">
        {icon ? (
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        ) : (
          <div />
        )}

        {hasTrend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full',
              isPositive
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d={
                  isPositive
                    ? 'M5 10l7-7m0 0l7 7m-7-7v18'
                    : 'M19 14l-7 7m0 0l-7-7m7 7V3'
                }
              />
            </svg>
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value + label */}
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none tabular-nums">
          {value}
        </p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
