import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Radar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThreeHeroScene } from "@/components/ThreeHeroScene";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Animated rings */}
      <div className="absolute inset-0">
        <ThreeHeroScene />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Live Tracking Active</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">MONITOR THE</span>
            <br />
            <span className="text-primary text-glow-primary">COSMIC FRONTIER</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Real-time Near-Earth Object tracking powered by NASA data. 
            Analyze asteroid trajectories, assess impact risks, and stay informed 
            about celestial bodies approaching our planet.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary group">
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border hover:bg-muted">
              Learn More
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <Radar className="h-6 w-6" />,
                title: 'Real-Time Tracking',
                description: 'Live data from NASA NeoWs API with continuous updates',
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: 'Risk Analysis',
                description: 'Advanced algorithms to calculate impact probability',
              },
              {
                icon: <Bell className="h-6 w-6" />,
                title: 'Smart Alerts',
                description: 'Customizable notifications for close approach events',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="glass-card p-6 text-left animate-fade-in"
                style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
