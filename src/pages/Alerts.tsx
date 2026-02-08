import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertTriangle, Clock, Trash2, Settings, PlusCircle } from "lucide-react";
import AlertModule from "@/components/AlertModule";
import HologramCard from "@/components/HologramCard";
import { mountAlertsScene } from "@/three/AlertsScene";
import CreateAlertModal from "@/components/CreateAlertModal";
import io from 'socket.io-client';
import "@/styles/hologram.css";
import "@/styles/buttons.css";

const SOCKET_URL = 'http://localhost:3001';

interface Alert {
  id: string;
  type: "approach" | "hazardous" | "threshold";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  asteroidName?: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "hazardous",
    title: "New Hazardous Object Detected",
    description:
      "Asteroid (2024 CC) has been classified as potentially hazardous with a risk score of 85.",
    timestamp: "2024-02-15T10:30:00Z",
    read: false,
    asteroidName: "(2024 CC)",
  },
  {
    id: "2",
    type: "approach",
    title: "Close Approach in 24 Hours",
    description:
      "Asteroid (2024 AA) will make its closest approach to Earth tomorrow.",
    timestamp: "2024-02-15T08:15:00Z",
    read: false,
    asteroidName: "(2024 AA)",
  },
  {
    id: "3",
    type: "threshold",
    title: "Risk Threshold Exceeded",
    description:
      "Your watched asteroid (2024 EE) has exceeded your custom risk threshold of 50.",
    timestamp: "2024-02-14T16:45:00Z",
    read: true,
    asteroidName: "(2024 EE)",
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [settings, setSettings] = useState({
    closeApproach: true,
    hazardous: true,
    riskThreshold: true,
    emailNotifications: false,
  });
  const bgRef = useRef<HTMLDivElement | null>(null);
  
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("cosmicwatch_userRole");
    console.log("Current Role:", role);
    setCurrentRole(role);
  }, []);

  const isScientist = currentRole?.toLowerCase() === "scientist";

  const unreadCount = alerts.filter((a) => !a.read).length;

  useEffect(() => {
    // Socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('receive_alert', (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!bgRef.current) return;
    const cleanup = mountAlertsScene(bgRef.current);
    return () => cleanup?.();
  }, []);

  const handleCreateAlert = (newAlert: Alert) => {
    const alertWithAuth = { ...newAlert, role: currentRole?.toLowerCase() }; // Attach role for server validation
    if (socket) {
      socket.emit('create_alert', alertWithAuth);
    } else {
      // Fallback if socket fails
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const markAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "hazardous":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "approach":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "hazardous":
        return <Badge variant="destructive">Hazardous</Badge>;
      case "approach":
        return (
          <Badge className="bg-warning text-warning-foreground">Approach</Badge>
        );
      default:
        return <Badge variant="secondary">Threshold</Badge>;
    }
  };

  return (
    <div className="cw-page3d bg-background flex flex-col">
      <div className="cw-threeBg" ref={bgRef} />
      <div className="cw-uiLayer">
        <Navbar />

        <main className="flex-1 relative pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                Planetary Defense Alerts
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                Critical updates • impact probability • orbit deviations
                <Badge variant="outline" className="text-xs uppercase tracking-widest border-primary/50 text-primary">
                  ID: {currentRole || 'UNAUTHORIZED'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2">
              {isScientist && (
                <Button 
                  className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 transition-all hover:scale-105"
                  onClick={() => setIsModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Global Alert
                </Button>
              )}
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Alert List */}
            <div className="lg:col-span-2 space-y-4">
              <HologramCard padding="22px" accent="rgba(255,80,120,0.18)">
                <div className="cw-holoHeader" style={{ marginBottom: 14 }}>
                  <div>
                    <div className="cw-holoTitle">Recent Alerts</div>
                    <div className="cw-holoSub">Radar sweep + mission modules</div>
                  </div>
                  <div className="cw-holoTitle">UNREAD: {unreadCount}</div>
                </div>

                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <AlertModule
                        key={alert.id}
                        alert={alert}
                        icon={getAlertIcon(alert.type)}
                        badge={getAlertBadge(alert.type)}
                        onMarkRead={() => markAsRead(alert.id)}
                        onDelete={() => deleteAlert(alert.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No alerts yet</p>
                  </div>
                )}
              </HologramCard>
            </div>

            {/* Settings Panel */}
            <div className="space-y-4">
              <HologramCard padding="18px" accent="rgba(87,185,255,0.18)">
                <div className="cw-holoHeader" style={{ marginBottom: 12 }}>
                  <div>
                    <div className="cw-holoTitle">Notification Settings</div>
                    <div className="cw-holoSub">Signal routing & thresholds</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Close Approaches
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Alert 24h before approach
                      </p>
                    </div>
                    <Switch
                      checked={settings.closeApproach}
                      onCheckedChange={(checked) =>
                        setSettings((s) => ({ ...s, closeApproach: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Hazardous Objects
                      </p>
                      <p className="text-sm text-muted-foreground">
                        New hazardous detections
                      </p>
                    </div>
                    <Switch
                      checked={settings.hazardous}
                      onCheckedChange={(checked) =>
                        setSettings((s) => ({ ...s, hazardous: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Risk Threshold
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Custom score exceeded
                      </p>
                    </div>
                    <Switch
                      checked={settings.riskThreshold}
                      onCheckedChange={(checked) =>
                        setSettings((s) => ({ ...s, riskThreshold: checked }))
                      }
                    />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          Email Notifications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requires account
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings((s) => ({
                            ...s,
                            emailNotifications: checked,
                          }))
                        }
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </HologramCard>

              <HologramCard padding="18px" accent="rgba(87,185,255,0.20)">
                <div className="cw-holoTitle">Pro Tip</div>
                <div style={{ marginTop: 10 }} className="cw-holoSub">
                  Create an account to enable email notifications and sync your
                  alert preferences across devices.
                </div>
                <Button className="w-full mt-4" size="sm">
                  Sign Up Free
                </Button>
              </HologramCard>
            </div>
          </div>
        </div>
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

      <CreateAlertModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateAlert} 
      />
    </div>
  );
}
