'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
  /** Optional ring border around the avatar */
  ring?: boolean;
}

/** Deterministic colour palette derived from the name hash */
const PALETTE = [
  'bg-rose-500',
  'bg-pink-500',
  'bg-fuchsia-500',
  'bg-purple-500',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-blue-500',
  'bg-sky-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-green-500',
  'bg-lime-600',
  'bg-yellow-500',
  'bg-amber-500',
  'bg-orange-500',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_CLASSES: Record<AvatarSize, { wrapper: string; text: string }> = {
  sm: { wrapper: 'w-8 h-8', text: 'text-xs' },
  md: { wrapper: 'w-10 h-10', text: 'text-sm' },
  lg: { wrapper: 'w-14 h-14', text: 'text-lg' },
  xl: { wrapper: 'w-20 h-20', text: 'text-2xl' },
};

export function Avatar({ name, src, size = 'md', className, ring = false }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const { wrapper, text } = SIZE_CLASSES[size];
  const colorClass = PALETTE[hashName(name) % PALETTE.length];
  const initials = getInitials(name);
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden select-none',
        wrapper,
        !showImage && colorClass,
        ring && 'ring-2 ring-white dark:ring-gray-900 ring-offset-0',
        className
      )}
      title={name}
      aria-label={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={cn('font-semibold text-white leading-none', text)}>{initials}</span>
      )}
    </div>
  );
}
