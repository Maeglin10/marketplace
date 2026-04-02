'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

type FillType = 'full' | 'half' | 'empty';

function StarIcon({ fill, className }: { fill: FillType; className?: string }) {
  const id = React.useId();

  if (fill === 'full') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn('text-yellow-400', className)}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  if (fill === 'empty') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn('text-gray-300 dark:text-gray-600', className)}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  // Half star using SVG gradient
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`half-${id}`}>
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="50%" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={`url(#half-${id})`}
      />
    </svg>
  );
}

function getStarFill(starIndex: number, value: number): FillType {
  const diff = value - starIndex;
  if (diff >= 1) return 'full';
  if (diff >= 0.5) return 'half';
  return 'empty';
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayValue = hovered !== null ? hovered : value;

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const fill = getStarFill(i, displayValue);

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={Math.round(value) === starValue}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(null)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded transition-transform hover:scale-110"
            >
              <StarIcon fill={fill} className={sizeMap[size]} />
            </button>
          );
        }

        return <StarIcon key={i} fill={fill} className={cn(sizeMap[size])} />;
      })}
    </div>
  );
}

export default Rating;
