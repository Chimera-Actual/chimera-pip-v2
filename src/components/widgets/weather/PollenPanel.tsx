// Pollen Levels Display Panel
import React from 'react';
import { Flower2, TreePine, Wheat, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PollenData } from '@/services/weatherService';
import { cn } from '@/lib/utils';

interface PollenPanelProps {
  pollen: PollenData;
  isPipBoyMode?: boolean;
  className?: string;
}

export const PollenPanel: React.FC<PollenPanelProps> = ({
  pollen,
  isPipBoyMode = false,
  className
}) => {
  const pollenTypes = [
    {
      name: 'Tree',
      value: pollen.tree,
      icon: TreePine,
      color: 'text-green-600'
    },
    {
      name: 'Grass',
      value: pollen.grass,
      icon: Wheat,
      color: 'text-yellow-600'
    },
    {
      name: 'Weed',
      value: pollen.weed,
      icon: Leaf,
      color: 'text-orange-600'
    }
  ];

  const getPollenLevelColor = (level: number) => {
    if (isPipBoyMode) return "primary";
    
    if (level <= 2) return "green";
    else if (level <= 3) return "yellow";  
    else if (level <= 4) return "orange";
    else return "red";
  };

  const getPollenLevelText = (level: number) => {
    if (level <= 2) return "Low";
    else if (level <= 3) return "Moderate";
    else if (level <= 4) return "High";
    else return "Very High";
  };

  const getPollenIcon = (level: number) => {
    if (level <= 2) {
      return <div className={cn("h-5 w-5 rounded-full bg-green-500", isPipBoyMode && "bg-primary")} />;
    } else if (level <= 3) {
      return <div className={cn("h-5 w-5 rounded-full bg-yellow-500", isPipBoyMode && "bg-primary")} />;
    } else if (level <= 4) {
      return <div className={cn("h-5 w-5 rounded-full bg-orange-500", isPipBoyMode && "bg-primary")} />;
    } else {
      return <div className={cn("h-5 w-5 rounded-full bg-red-500", isPipBoyMode && "bg-primary")} />;
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      isPipBoyMode && "border-primary/50 bg-background/95 backdrop-blur-sm",
      className
    )}>
      <CardHeader>
        <CardTitle className={cn(
          "flex items-center gap-2 text-lg",
          isPipBoyMode && "text-primary font-mono tracking-wider"
        )}>
          <Flower2 className="h-5 w-5" />
          Pollen Levels
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Pollen Level */}
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg",
          "bg-muted/50",
          isPipBoyMode && "bg-primary/10 border border-primary/20"
        )}>
          <div className="flex items-center gap-3">
            {getPollenIcon(pollen.overall)}
            <div>
              <div className={cn(
                "text-2xl font-bold",
                isPipBoyMode && "text-primary font-mono"
              )}>
                {pollen.overall}
              </div>
              <div className={cn(
                "text-sm text-muted-foreground",
                isPipBoyMode && "text-primary/70 font-mono"
              )}>
                Overall
              </div>
            </div>
          </div>

          <div className="text-right">
            <Badge 
              variant="secondary"
              className={cn(
                "mb-1",
                isPipBoyMode && "bg-primary/20 text-primary border-primary/30"
              )}
            >
              {pollen.category}
            </Badge>
            <div className={cn(
              "text-xs text-muted-foreground",
              isPipBoyMode && "text-primary/70"
            )}>
              {pollen.description}
            </div>
          </div>
        </div>

        {/* Overall Pollen Progress */}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between text-sm",
            isPipBoyMode && "text-primary/70 font-mono"
          )}>
            <span>Pollen Level</span>
            <span>{pollen.overall}/5</span>
          </div>
          <Progress 
            value={(pollen.overall / 5) * 100} 
            className={cn(
              "h-2",
              isPipBoyMode && "bg-primary/20"
            )}
          />
          <div className={cn(
            "flex justify-between text-xs text-muted-foreground",
            isPipBoyMode && "text-primary/50 font-mono"
          )}>
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Individual Pollen Types */}
        <div className="space-y-3">
          <div className={cn(
            "text-sm font-medium",
            isPipBoyMode && "text-primary font-mono"
          )}>
            Pollen Breakdown
          </div>
          
          <div className="space-y-3">
            {pollenTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.name}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md",
                    "bg-muted/30",
                    isPipBoyMode && "bg-primary/5 border border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={cn(
                      "h-5 w-5",
                      isPipBoyMode ? "text-primary" : type.color
                    )} />
                    <div>
                      <div className={cn(
                        "text-sm font-medium",
                        isPipBoyMode && "text-primary font-mono"
                      )}>
                        {type.name}
                      </div>
                      <div className={cn(
                        "text-xs text-muted-foreground",
                        isPipBoyMode && "text-primary/70"
                      )}>
                        {getPollenLevelText(type.value)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right min-w-16">
                      <Progress 
                        value={(type.value / 5) * 100} 
                        className={cn(
                          "h-1 w-12",
                          isPipBoyMode && "bg-primary/20"
                        )}
                      />
                    </div>
                    <div className={cn(
                      "text-lg font-bold w-8 text-center",
                      isPipBoyMode && "text-primary font-mono"
                    )}>
                      {type.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Allergy Recommendations */}
        <div className={cn(
          "p-3 rounded-lg bg-muted/30 border-l-4",
          pollen.overall <= 2 ? "border-green-500" :
          pollen.overall <= 3 ? "border-yellow-500" :
          pollen.overall <= 4 ? "border-orange-500" : "border-red-500",
          isPipBoyMode && "bg-primary/5 border-primary/50"
        )}>
          <div className={cn(
            "text-xs font-medium mb-1",
            isPipBoyMode && "text-primary font-mono"
          )}>
            Allergy Advisory
          </div>
          <div className={cn(
            "text-xs text-muted-foreground",
            isPipBoyMode && "text-primary/70"
          )}>
            {pollen.overall <= 2 
              ? "Low pollen levels. Great day for outdoor activities!"
              : pollen.overall <= 3
              ? "Moderate pollen levels. Sensitive individuals may experience mild symptoms."
              : pollen.overall <= 4
              ? "High pollen levels. Allergy sufferers should take precautions."
              : "Very high pollen levels. Stay indoors if you're sensitive to pollen."
            }
          </div>
        </div>

        {/* Peak Pollen Times */}
        <div className={cn(
          "text-xs text-center text-muted-foreground",
          isPipBoyMode && "text-primary/60 font-mono"
        )}>
          Peak pollen times: 6-10 AM and 7-10 PM
        </div>
      </CardContent>
    </Card>
  );
};