import { Asteroid, formatDistance, formatVelocity, getRiskLevel } from '@/lib/asteroidData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star, AlertTriangle, Zap, Target } from 'lucide-react';

interface AsteroidCardProps {
  asteroid: Asteroid;
  onWatch?: (id: string) => void;
  onView?: (id: string) => void;
  isWatched?: boolean;
}

export function AsteroidCard({ asteroid, onWatch, onView, isWatched }: AsteroidCardProps) {
  const risk = getRiskLevel(asteroid.riskScore);

  const getRiskStyles = () => {
    switch (risk.color) {
      case 'destructive':
        return 'border-destructive/50 bg-destructive/5 shadow-[0_0_30px_-5px] shadow-destructive/20';
      case 'warning':
        return 'border-warning/50 bg-warning/5 shadow-[0_0_30px_-5px] shadow-warning/20';
      case 'accent':
        return 'border-accent/50 bg-accent/5';
      default:
        return 'border-success/50 bg-success/5';
    }
  };

  const getBadgeVariant = () => {
    switch (risk.color) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'secondary'; // Changed from 'warning' as any to 'secondary' since 'warning' is not a valid variant
      default:
        return 'secondary';
    }
  };

  return (
    <div
      className={`glass-card p-5 transition-all duration-300 hover:scale-[1.02] ${getRiskStyles()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {asteroid.name}
          </h3>
          <p className="text-sm text-muted-foreground">ID: {asteroid.nasaId}</p>
        </div>
        <div className="flex items-center gap-2">
          {asteroid.isHazardous && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Hazardous
            </Badge>
          )}
          <Badge variant={getBadgeVariant()}>
            {risk.label} Risk
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Target className="h-3 w-3" /> Distance
          </p>
          <p className="font-semibold text-foreground">
            {formatDistance(asteroid.missDistance)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3 w-3" /> Velocity
          </p>
          <p className="font-semibold text-foreground">
            {formatVelocity(asteroid.velocity)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Diameter</p>
          <p className="font-semibold text-foreground">
            {asteroid.diameter.min.toFixed(2)} - {asteroid.diameter.max.toFixed(2)} {asteroid.diameter.unit}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Approach Date</p>
          <p className="font-semibold text-foreground">
            {new Date(asteroid.closeApproachDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Risk Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Risk Score</span>
          <span className="font-semibold text-foreground">{asteroid.riskScore}/100</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              risk.color === 'destructive'
                ? 'bg-destructive'
                : risk.color === 'warning'
                ? 'bg-warning'
                : risk.color === 'accent'
                ? 'bg-accent'
                : 'bg-success'
            }`}
            style={{ width: `${asteroid.riskScore}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(asteroid.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
        <Button
          variant={isWatched ? 'default' : 'outline'}
          size="sm"
          className={`flex-1 ${isWatched ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => onWatch?.(asteroid.id)}
        >
          <Star className={`h-4 w-4 mr-1 ${isWatched ? 'fill-current' : ''}`} />
          {isWatched ? 'Watching' : 'Watch'}
        </Button>
      </div>
    </div>
  );
}
