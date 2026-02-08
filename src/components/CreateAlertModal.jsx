import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mockAsteroids } from "@/lib/asteroidData";

export default function CreateAlertModal({ isOpen, onClose, onCreate }) {
  const [asteroidId, setAsteroidId] = useState('');
  const [type, setType] = useState('approach');
  const [threshold, setThreshold] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const asteroid = mockAsteroids.find(a => a.id === asteroidId);
    
    const newAlert = {
      id: Date.now().toString(),
      type,
      title: type === 'hazardous' ? 'High Risk Alert' : type === 'threshold' ? 'Threshold Breached' : 'Close Approach Alert',
      description: `Asteroid ${asteroid ? asteroid.name : 'Unknown'} has triggered a ${type} alert.${threshold ? ` Threshold: ${threshold}` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
      asteroidName: asteroid ? asteroid.name : 'Unknown',
    };

    onCreate(newAlert);
    onClose();
    // Reset form
    setAsteroidId('');
    setType('approach');
    setThreshold('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border border-blue-500/30 text-blue-50">
        <DialogHeader>
          <DialogTitle>Create Planetary Defense Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Target Object</Label>
            <Select onValueChange={setAsteroidId} value={asteroidId}>
              <SelectTrigger className="bg-blue-900/20 border-blue-500/30">
                <SelectValue placeholder="Select Asteroid" />
              </SelectTrigger>
              <SelectContent className="bg-black border-blue-500/30">
                {mockAsteroids.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name} (Risk: {a.riskScore})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Alert Type</Label>
            <Select onValueChange={setType} value={type}>
              <SelectTrigger className="bg-blue-900/20 border-blue-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-blue-500/30">
                <SelectItem value="approach">Close Approach</SelectItem>
                <SelectItem value="hazardous">High Risk / Hazardous</SelectItem>
                <SelectItem value="threshold">Threshold Breach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'threshold' && (
            <div className="space-y-2">
              <Label>Risk Threshold Value</Label>
              <Input 
                type="number" 
                value={threshold} 
                onChange={e => setThreshold(e.target.value)}
                className="bg-blue-900/20 border-blue-500/30"
                placeholder="e.g. 80"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Broadcast Alert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
