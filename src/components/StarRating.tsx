/**
 * @file StarRating.tsx
 * @description Star visualization for 1-5 rating metrics with numerical readout.
 */

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  showNumber = true,
}) => {
  if (rating === null || rating === undefined) {
    return <span className="text-xs text-slate-400 font-medium">No reviews yet</span>;
  }

  const num = Math.min(5, Math.max(0, Number(rating)));
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-semibold' : 'text-sm font-medium';

  return (
    <div className="inline-flex items-center gap-1.5" title={`${num.toFixed(2)} out of 5.0`}>
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = num >= starIndex;
          const half = !filled && num >= starIndex - 0.5;
          return (
            <Star
              key={starIndex}
              className={`${iconSize} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-300/60 text-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className={`${textSize} text-slate-700 font-mono`}>
          {num.toFixed(2)}
        </span>
      )}
    </div>
  );
};
