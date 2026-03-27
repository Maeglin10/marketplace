import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function ServiceCardSkeleton() {
  return (
    <Card>
      {/* Image placeholder */}
      <Skeleton variant="card" className="w-full h-48 rounded-t-lg rounded-b-none" />

      <CardContent className="pt-4 space-y-3">
        {/* Title */}
        <Skeleton variant="text" className="w-full h-5" />
        <Skeleton variant="text" className="w-3/4 h-5" />

        {/* Description */}
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-5/6 h-4" />

        {/* Price + Author */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton variant="text" className="w-16 h-7" />
          <Skeleton variant="text" className="w-24 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}
