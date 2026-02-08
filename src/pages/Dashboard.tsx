import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import HologramCard from "@/components/HologramCard";
import RiskMeter3D from "@/components/RiskMeter3D";
import AsteroidTile from "@/components/AsteroidTile";
import { useAsteroids } from "@/hooks/useAsteroids";
import { mockAsteroids, Asteroid } from "@/lib/asteroidData";
import { useWatchlist } from "@/context/WatchlistContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AsteroidChat from "@/components/Chat/AsteroidChat";
import {
  Satellite,
  AlertTriangle,
  Activity,
  Globe,
  Search,
  RefreshCw,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { mountDashboardScene } from "@/three/DashboardScene";
import "@/styles/hologram.css";
import "@/styles/buttons.css";

export default function Dashboard() {
  const { data: asteroids, isLoading, error, refetch } = useAsteroids();
  const [searchTerm, setSearchTerm] = useState("");
  const { watchedIds, toggleWatch } = useWatchlist();
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  // Use API data or fallback to mock data
  const displayAsteroids = asteroids ?? mockAsteroids;

  const handleChat = (asteroid: any) => {
    setActiveChat({ id: asteroid.id, name: asteroid.name });
  };

  const filteredAsteroids = displayAsteroids.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nasaId.includes(searchTerm),
  );

  const hazardousCount = displayAsteroids.filter((a) => a.isHazardous).length;
  const avgRiskScore = Math.round(
    displayAsteroids.reduce((sum, a) => sum + a.riskScore, 0) /
      displayAsteroids.length,
  );
  const closestApproach = displayAsteroids.reduce(
    (min, a) => (a.missDistance < min ? a.missDistance : min),
    Infinity,
  );

  useEffect(() => {
    if (!bgRef.current) return;
    const cleanup = mountDashboardScene(bgRef.current);
    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div className="cw-page3d bg-background flex flex-col">
      <div className="cw-threeBg" ref={bgRef} />
      <div className="cw-uiLayer">
        <Navbar />

        <main className="flex-1 relative pt-24 pb-12 px-4 cw-dashboardMain">
        <div className="container mx-auto cw-dashboardContainer">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Global Near-Earth Threat Monitoring Center
              </h1>
              <p className="text-muted-foreground">
                Mission-grade situational awareness • real-time object telemetry
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 cw-dashboardKpiGrid">
            <HologramCard accent="rgba(87,185,255,0.25)">
              <div className="cw-holoHeader">
                <div>
                  <div className="cw-holoTitle">Total Objects</div>
                  <div className="cw-holoValue">{displayAsteroids.length}</div>
                  <div className="cw-holoSub">Tracked this week</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "rgba(87,185,255,0.10)", color: "rgba(155,231,255,0.95)" }}>
                  <Satellite className="h-6 w-6" />
                </div>
              </div>
            </HologramCard>
            <HologramCard accent="rgba(255,80,120,0.28)">
              <div className="cw-holoHeader">
                <div>
                  <div className="cw-holoTitle">Hazardous Objects</div>
                  <div className="cw-holoValue">{hazardousCount}</div>
                  <div className="cw-holoSub">Potentially dangerous</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "rgba(255,80,120,0.10)", color: "rgba(255,150,180,0.95)" }}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </HologramCard>
            <HologramCard accent="rgba(255,214,85,0.26)">
              <div className="cw-holoHeader">
                <div>
                  <div className="cw-holoTitle">Aggregate Risk</div>
                  <div className="cw-holoValue">{avgRiskScore}</div>
                  <div className="cw-holoSub">Out of 100</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "rgba(255,214,85,0.10)", color: "rgba(255,235,160,0.95)" }}>
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <div style={{ marginTop: 12 }} className="cw-riskBar">
                <div className={`cw-riskFill ${avgRiskScore >= 70 ? "is-critical" : avgRiskScore >= 50 ? "is-high" : avgRiskScore >= 30 ? "is-moderate" : ""}`} style={{ "--p": `${Math.min(avgRiskScore, 100)}%` } as React.CSSProperties} />
              </div>
            </HologramCard>
            <HologramCard accent="rgba(45,255,192,0.22)">
              <div className="cw-holoHeader">
                <div>
                  <div className="cw-holoTitle">Closest Approach</div>
                  <div className="cw-holoValue">{`${(closestApproach / 1000000).toFixed(2)}M`}</div>
                  <div className="cw-holoSub">Kilometers</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "rgba(45,255,192,0.10)", color: "rgba(165,255,235,0.95)" }}>
                  <Globe className="h-6 w-6" />
                </div>
              </div>
            </HologramCard>
          </div>

          {/* Risk Overview Panel */}
          <HologramCard className="mb-8" padding="22px" accent={avgRiskScore >= 70 ? "rgba(255,80,120,0.28)" : "rgba(87,185,255,0.22)"}>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold mb-4 text-foreground">
                  3D Radar Risk Meter
                </h2>
                <p className="text-muted-foreground mb-4">
                  Current threat level based on aggregate analysis of all
                  tracked NEOs. Risk factors include proximity, velocity, size,
                  and trajectory uncertainty.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">
                      Low (0-29)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                    <span className="text-sm text-muted-foreground">
                      Moderate (30-49)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-warning" />
                    <span className="text-sm text-muted-foreground">
                      High (50-69)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-destructive" />
                    <span className="text-sm text-muted-foreground">
                      Critical (70+)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <RiskMeter3D score={avgRiskScore} />
              </div>
            </div>
          </HologramCard>

          {/* Asteroid List */}
          <HologramCard padding="22px">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50 border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6 bg-muted/50">
                <TabsTrigger value="all">All Objects</TabsTrigger>
                <TabsTrigger value="hazardous">Hazardous Only</TabsTrigger>
                <TabsTrigger value="watched">Watchlist</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAsteroids.map((asteroid) => (
                    <AsteroidTile
                      key={asteroid.id}
                      asteroid={asteroid}
                      isWatched={watchedIds.has(asteroid.id)}
                      onWatch={toggleWatch}
                      onChat={handleChat}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hazardous">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAsteroids
                    .filter((a) => a.isHazardous)
                    .map((asteroid) => (
                      <AsteroidTile
                        key={asteroid.id}
                        asteroid={asteroid}
                        isWatched={watchedIds.has(asteroid.id)}
                        onWatch={toggleWatch}
                        onChat={handleChat}
                      />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="watched">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAsteroids
                    .filter((a) => watchedIds.has(a.id))
                    .map((asteroid) => (
                      <AsteroidTile
                        key={asteroid.id}
                        asteroid={asteroid}
                        isWatched={true}
                        onWatch={toggleWatch}
                        onChat={handleChat}
                      />
                    ))}
                  {watchedIds.size === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No asteroids in your watchlist yet.</p>
                      <p className="text-sm">
                        Click "Watch" on any asteroid to add it here.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Using demo data. Connect your NASA API key for live data.</p>
              </div>
            )}
          </HologramCard>
        </div>
        </main>

        {activeChat && (
          <AsteroidChat
            asteroidId={activeChat.id}
            asteroidName={activeChat.name}
            onClose={() => setActiveChat(null)}
          />
        )}

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
    </div>
  );
}
