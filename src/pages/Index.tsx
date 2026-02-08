import { Navbar } from "@/components/Navbar";
import { ThreeStarfield } from "@/components/ThreeStarfield";
import { HeroSection } from "@/components/HeroSection";
import { mockAsteroids, getRiskLevel } from "@/lib/asteroidData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Users, Database, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const topThreats = mockAsteroids.filter((a) => a.isHazardous).slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ThreeStarfield />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Live Threat Feed */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <Badge
                variant="outline"
                className="mb-4 border-destructive/50 text-destructive"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Live Threat Feed
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Current High-Priority Objects
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Real-time tracking of potentially hazardous asteroids with
                elevated risk scores
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {topThreats.map((asteroid, idx) => {
                const risk = getRiskLevel(asteroid.riskScore);
                return (
                  <div
                    key={asteroid.id}
                    className="glass-card p-6 border-destructive/30 animate-fade-in"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Threat #{idx + 1}
                      </span>
                      <Badge variant="destructive">{risk.label}</Badge>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {asteroid.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distance</span>
                        <span className="text-foreground">
                          {(asteroid.missDistance / 1000000).toFixed(2)}M km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Velocity</span>
                        <span className="text-foreground">
                          {asteroid.velocity
                            .toFixed(0)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          km/h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Risk Score
                        </span>
                        <span className="text-destructive font-semibold">
                          {asteroid.riskScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="group">
                  View All Objects
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative z-10 py-20 px-4 cosmic-gradient">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Platform Capabilities
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enterprise-grade space monitoring with advanced analysis tools
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Database className="h-8 w-8" />,
                  title: "NASA NeoWs Integration",
                  description:
                    "Direct feed from NASA Near Earth Object Web Service for accurate, up-to-date asteroid data.",
                },
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: "Risk Analysis Engine",
                  description:
                    "Proprietary algorithm combining size, velocity, and trajectory data for risk scoring.",
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Researcher Accounts",
                  description:
                    "Secure authentication for researchers and enthusiasts to save watchlists and alerts.",
                },
                {
                  icon: <AlertTriangle className="h-8 w-8" />,
                  title: "Custom Alerts",
                  description:
                    "Set personalized notifications for specific asteroids or risk thresholds.",
                },
                {
                  icon: (
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                  ),
                  title: "3D Visualization",
                  description:
                    "Interactive orbital mechanics viewer showing asteroid trajectories relative to Earth.",
                },
                {
                  icon: (
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 9h6M9 12h6M9 15h4" />
                    </svg>
                  ),
                  title: "API Documentation",
                  description:
                    "Fully documented REST API with Postman collection for seamless integration.",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="glass-card p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 px-4">
          <div className="container mx-auto">
            <div className="glass-card p-8 md:p-12 text-center border-primary/30 glow-primary">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Monitor the Cosmos?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join researchers and space enthusiasts tracking Near-Earth
                Objects in real-time. Create an account to save your watchlist
                and set custom alerts.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Free Account
                </Button>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold">
                COSMIC<span className="text-primary">WATCH</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Data provided by NASA NeoWs API • Built for safety awareness
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                API Docs
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
