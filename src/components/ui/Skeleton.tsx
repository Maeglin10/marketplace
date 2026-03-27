import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'card' | 'avatar' | 'button';
}

export function Skeleton({ className, width, height, variant = 'text' }: SkeletonProps) {
  const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
    text: 'h-4 rounded',
    card: 'rounded-lg',
    avatar: 'rounded-full h-10 w-10',
    button: 'h-10 rounded-md',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn('animate-pulse bg-gray-200', variantClasses[variant], className)}
      style={style}
    />
  );
}
