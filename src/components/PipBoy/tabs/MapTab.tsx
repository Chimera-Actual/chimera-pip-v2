import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Clock, AlertTriangle, Compass, Target } from 'lucide-react';

const currentLocation = {
  name: 'Sanctuary Hills',
  coordinates: '42.3601° N, 71.0589° W',
  region: 'Commonwealth',
  discovered: true
};

const nearbyLocations = [
  { name: 'Red Rocket Truck Stop', distance: '0.2 miles', threat: 'Low', discovered: true },
  { name: 'Concord', distance: '1.5 miles', threat: 'Medium', discovered: true },
  { name: 'Vault 111', distance: '0.8 miles', threat: 'None', discovered: true },
  { name: 'Super Duper Mart', distance: '2.1 miles', threat: 'High', discovered: false },
];

const recentRoutes = [
  { from: 'Home', to: 'Office Complex', duration: '23 min', status: 'completed' },
  { from: 'Office Complex', to: 'Central Market', duration: '15 min', status: 'completed' },
  { from: 'Central Market', to: 'Home', duration: '28 min', status: 'active' },
];

export const MapTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Current Location */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <MapPin className="h-5 w-5" />
            <span>Current Position</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-pip-text-muted font-pip-mono">LOCATION</div>
              <div className="text-lg font-pip-display font-bold text-primary pip-text-glow">
                {currentLocation.name}
              </div>
              <div className="text-xs text-pip-text-secondary font-pip-mono">
                {currentLocation.region}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-pip-text-muted font-pip-mono">COORDINATES</div>
              <div className="text-sm font-pip-mono text-pip-text-bright">
                {currentLocation.coordinates}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-pip-text-muted font-pip-mono">STATUS</div>
              <Badge variant="default" className="font-pip-mono">
                DISCOVERED
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tactical Map Display */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Compass className="h-5 w-5" />
            <span>Tactical Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-pip-bg-secondary/50 border border-pip-border rounded relative overflow-hidden">
            {/* Map Placeholder with Grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-10 grid-rows-6 h-full">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="border border-pip-green-primary/20"></div>
                ))}
              </div>
            </div>
            
            {/* Location Markers */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse pip-glow"></div>
              <div className="text-xs font-pip-mono text-primary mt-1 text-center">YOU</div>
            </div>
            
            <div className="absolute top-1/3 left-1/3">
              <div className="w-3 h-3 bg-pip-green-secondary rounded-full"></div>
            </div>
            
            <div className="absolute bottom-1/3 right-1/4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            
            {/* Map Controls */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <Button size="sm" variant="outline" className="text-xs font-pip-mono">+</Button>
              <Button size="sm" variant="outline" className="text-xs font-pip-mono">-</Button>
            </div>
            
            {/* Compass */}
            <div className="absolute top-2 left-2">
              <div className="w-8 h-8 border border-primary rounded-full flex items-center justify-center bg-pip-bg-primary/80">
                <span className="text-xs font-pip-display font-bold text-primary">N</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4 space-x-2">
            <Button variant="outline" size="sm" className="font-pip-mono">
              <Target className="h-4 w-4 mr-1" />
              CENTER
            </Button>
            <Button variant="outline" size="sm" className="font-pip-mono">
              <Navigation className="h-4 w-4 mr-1" />
              NAVIGATE
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Locations */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Target className="h-5 w-5" />
            <span>Nearby Locations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nearbyLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded border border-pip-border bg-pip-bg-secondary/50 hover:border-primary/40 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="font-pip-mono text-pip-text-bright">{location.name}</div>
                    {!location.discovered && (
                      <Badge variant="secondary" className="text-xs font-pip-mono">UNKNOWN</Badge>
                    )}
                  </div>
                  <div className="text-xs text-pip-text-muted font-pip-mono">
                    {location.distance} • Threat Level: {location.threat}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    location.threat === 'Low' ? 'bg-pip-green-secondary' :
                    location.threat === 'Medium' ? 'bg-yellow-500' :
                    location.threat === 'High' ? 'bg-red-500' : 'bg-pip-green-primary'
                  }`}></div>
                  <Button size="sm" variant="ghost" className="text-pip-text-secondary hover:text-primary">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route History */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Clock className="h-5 w-5" />
            <span>Recent Routes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded border border-pip-border bg-pip-bg-secondary/50">
                <div>
                  <div className="font-pip-mono text-pip-text-bright">
                    {route.from} → {route.to}
                  </div>
                  <div className="text-xs text-pip-text-muted font-pip-mono">
                    Duration: {route.duration}
                  </div>
                </div>
                <Badge variant={route.status === 'active' ? 'default' : 'secondary'} className="font-pip-mono">
                  {route.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};