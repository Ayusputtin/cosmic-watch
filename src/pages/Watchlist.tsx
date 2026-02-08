import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import HologramCard from "@/components/HologramCard";
import AsteroidTile from "@/components/AsteroidTile";
import { mockAsteroids } from "@/lib/asteroidData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, Bell, Settings } from "lucide-react";
import { mountWatchlistScene } from "@/three/WatchlistScene";
import { useWatchlist } from "@/context/WatchlistContext";
import AsteroidChat from "@/components/Chat/AsteroidChat";
import "@/styles/hologram.css";
import "@/styles/buttons.css";

export default function Watchlist() {
  const { watchedIds, toggleWatch } = useWatchlist();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChat, setActiveChat] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  const watchedAsteroids = mockAsteroids.filter((a) => watchedIds.has(a.id));
  const filteredWatched = watchedAsteroids.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nasaId.includes(searchTerm),
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to prevent blank screen flicker and ensure DOM is ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !bgRef.current) return;

    // Slight delay to ensure layout is computed
    const timer = setTimeout(() => {
      if (bgRef.current) {
        const cleanup = mountWatchlistScene(bgRef.current);
        // Store cleanup to use in unmount
        (bgRef.current as any).__cleanup = cleanup;
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (bgRef.current && (bgRef.current as HTMLElement & { __cleanup?: () => void }).__cleanup) {
        (bgRef.current as HTMLElement & { __cleanup?: () => void }).__cleanup();
      }
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="cw-page3d bg-background flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-primary font-display tracking-widest animate-pulse">
            LOADING SURVEILLANCE DATA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cw-page3d bg-background">
      <div className="cw-threeBg" ref={bgRef} />
      <div className="cw-uiLayer">
        <Navbar />

        <main className="relative pt-24 pb-12 px-4">
          <div className="container mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Star className="h-8 w-8 text-primary fill-primary" />
                  Active Asteroid Surveillance
                </h1>
                <p className="text-muted-foreground">
                  Objects under continuous monitoring • orbital paths • risk
                  drift
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Alert Settings
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <HologramCard accent="rgba(87,185,255,0.22)">
                <div className="cw-holoTitle">Watching</div>
                <div className="cw-holoValue">{watchedAsteroids.length}</div>
                <div className="cw-holoSub">objects</div>
              </HologramCard>
              <HologramCard accent="rgba(255,165,55,0.22)">
                <div className="cw-holoTitle">Hazardous</div>
                <div className="cw-holoValue">
                  {watchedAsteroids.filter((a) => a.isHazardous).length}
                </div>
                <div className="cw-holoSub">in surveillance</div>
              </HologramCard>
              <HologramCard accent="rgba(45,255,192,0.20)">
                <div className="cw-holoTitle">Next Approach</div>
                <div className="cw-holoValue">
                  {watchedAsteroids.length > 0
                    ? new Date(
                        Math.min(
                          ...watchedAsteroids.map((a) =>
                            new Date(a.closeApproachDate).getTime(),
                          ),
                        ),
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "--"}
                </div>
                <div className="cw-holoSub">closest event</div>
              </HologramCard>
            </div>

            {/* Watchlist */}
            <HologramCard padding="22px">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search watchlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>

              {filteredWatched.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWatched.map((asteroid) => (
                    <AsteroidTile
                      key={asteroid.id}
                      asteroid={asteroid}
                      isWatched={true}
                      onWatch={toggleWatch}
                      onChat={() =>
                        setActiveChat({ id: asteroid.id, name: asteroid.name })
                      }
                    />
                  ))}
                </div>
              ) : watchedAsteroids.length === 0 ? (
                <div className="text-center py-16">
                  <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No objects under active surveillance
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Add asteroids from the dashboard to track them here
                  </p>
                  <Button asChild>
                    <a href="/dashboard">Browse Asteroids</a>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No results found for "{searchTerm}"</p>
                </div>
              )}
            </HologramCard>
          </div>
        </main>
      </div>
      {activeChat && (
        <AsteroidChat
          asteroidId={activeChat.id}
          asteroidName={activeChat.name}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
