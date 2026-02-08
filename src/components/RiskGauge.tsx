interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskGauge({ score, size = 'md' }: RiskGaugeProps) {
  const sizes = {
    sm: { width: 80, stroke: 8 },
    md: { width: 120, stroke: 10 },
    lg: { width: 160, stroke: 12 },
  };

  const { width, stroke } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * Math.PI;
  const progress = (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return 'hsl(0 84% 60%)'; // destructive
    if (score >= 50) return 'hsl(38 92% 50%)'; // warning
    if (score >= 30) return 'hsl(270 100% 65%)'; // accent
    return 'hsl(142 76% 45%)'; // success
  };

  const getLabel = () => {
    if (score >= 70) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 30) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        width={width}
        height={width / 2 + 10}
        viewBox={`0 0 ${width} ${width / 2 + 10}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke="hsl(220 30% 18%)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()})`,
          }}
        />
        {/* Score text */}
        <text
          x={width / 2}
          y={width / 2 - 5}
          textAnchor="middle"
          className="fill-foreground font-display text-2xl font-bold"
        >
          {score}
        </text>
        <text
          x={width / 2}
          y={width / 2 + 12}
          textAnchor="middle"
          className="fill-muted-foreground text-xs uppercase tracking-wider"
        >
          {getLabel()}
        </text>
      </svg>
    </div>
  );
}
