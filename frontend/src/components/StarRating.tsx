import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  showValue = false,
  interactive = false,
  onRate,
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = rating >= starValue;
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`transition-colors duration-150 ${
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
            }`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-800 text-slate-700'
              }`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="text-xs font-semibold text-slate-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
