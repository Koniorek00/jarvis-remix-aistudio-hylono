import React from 'react';

interface SparklineSvgProps {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
  label?: string;
}

export const SparklineSvg: React.FC<SparklineSvgProps> = React.memo(
  ({ values, color = '#14F1D9', height = 40, width = 180, label }) => {
    if (!values.length) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pad = 4;

    const points = values.map((v, i) => {
      const x = pad + (i / Math.max(1, values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const areaPoints = [
      `${pad},${height - pad}`,
      ...points,
      `${width - pad},${height - pad}`,
    ].join(' ');

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        role="img"
        aria-label={label ?? 'Trend chart'}
      >
        <polygon points={areaPoints} fill={color} fillOpacity={0.12} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(' ')}
        />
      </svg>
    );
  }
);

SparklineSvg.displayName = 'SparklineSvg';
