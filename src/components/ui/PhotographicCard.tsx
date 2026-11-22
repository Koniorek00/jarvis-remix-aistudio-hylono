import React, { useState } from 'react';

interface PhotographicCardProps {
  imageUrl: string;
  fallbackGradient: string;
  alt: string;
  eager?: boolean;
  belowFold?: boolean;
  className?: string;
  scrimClassName?: string;
  accentColor?: string;
  children: React.ReactNode;
}

export const PhotographicCard: React.FC<PhotographicCardProps> = React.memo(
  ({
    imageUrl,
    fallbackGradient,
    alt,
    eager = false,
    belowFold = false,
    className = '',
    scrimClassName = 'photographic-scrim',
    accentColor,
    children,
  }) => {
    const [imgFailed, setImgFailed] = useState(false);

    return (
      <div
        className={`gpu-card relative overflow-hidden rounded-[20px] bg-[#0B0E14] text-slate-100 border border-white/10 ${
          belowFold ? 'below-fold-card' : ''
        } ${className}`}
        style={{
          backgroundImage: fallbackGradient,
          boxShadow: accentColor
            ? `inset 0 1px 0 0 rgba(255,255,255,0.06), 0 10px 30px -12px rgba(0,0,0,0.45)`
            : undefined,
        }}
      >
        {!imgFailed && (
          <img
            src={imageUrl}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right select-none"
          />
        )}
        <div className={`pointer-events-none absolute inset-0 ${scrimClassName}`} aria-hidden="true" />
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    );
  }
);

PhotographicCard.displayName = 'PhotographicCard';
