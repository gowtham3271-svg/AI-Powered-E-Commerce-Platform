import React, { useState } from 'react';
import { Laptop, Smartphone, Headphones, Watch, HardDrive, Package } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  categoryName?: string;
  fallbackSrc?: string;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  'Laptops': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  'Smartwatches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&auto=format&fit=crop&q=80',
};

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  categoryName,
  fallbackSrc,
  ...props
}) => {
  const [errorCount, setErrorCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const getFallback = () => {
    if (fallbackSrc) return fallbackSrc;
    if (categoryName && CATEGORY_FALLBACKS[categoryName]) {
      return CATEGORY_FALLBACKS[categoryName];
    }
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
  };

  const handleError = () => {
    setErrorCount(prev => prev + 1);
  };

  // If both primary and remote fallback fail, render a gorgeous SVG tech placeholder
  if (errorCount >= 2 || (!src && errorCount >= 1)) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400 p-4 border border-slate-700/50 ${className}`}>
        {categoryName === 'Laptops' && <Laptop size={36} className="text-brand-400 mb-2" />}
        {categoryName === 'Smartphones' && <Smartphone size={36} className="text-indigo-400 mb-2" />}
        {categoryName === 'Headphones' && <Headphones size={36} className="text-purple-400 mb-2" />}
        {categoryName === 'Smartwatches' && <Watch size={36} className="text-emerald-400 mb-2" />}
        {categoryName === 'Accessories' && <HardDrive size={36} className="text-amber-400 mb-2" />}
        {!['Laptops', 'Smartphones', 'Headphones', 'Smartwatches', 'Accessories'].includes(categoryName || '') && (
          <Package size={36} className="text-slate-400 mb-2" />
        )}
        <span className="text-[11px] font-medium text-slate-300 text-center line-clamp-1">{alt || 'Product'}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">{categoryName || 'Electronics'}</span>
      </div>
    );
  }

  const currentSrc = errorCount === 0 && src ? src : getFallback();

  return (
    <div className={`relative overflow-hidden bg-slate-900/60 ${className}`}>
      {/* Skeleton Shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt || 'Product'}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

