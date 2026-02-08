import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'destructive';
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary/30 bg-primary/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      case 'destructive':
        return 'border-destructive/30 bg-destructive/5';
      default:
        return 'border-border/50';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary bg-primary/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'destructive':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className={`glass-card p-5 ${getVariantStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-3xl font-display font-bold text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? 'text-success' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${getIconStyles()}`}>{icon}</div>
      </div>
    </div>
  );
}
