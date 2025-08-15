import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";

interface StatusBarProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  onRefresh: () => void;
}

export const StatusBar = ({ isConnected, lastUpdate, onRefresh }: StatusBarProps) => {
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return "Never";
    return new Intl.DateTimeFormat('en-US', {
      timeStyle: 'medium',
      dateStyle: 'short'
    }).format(date);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-card-border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-error" />
          )}
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className={isConnected ? "bg-success text-success-foreground" : ""}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        {lastUpdate && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Last updated: {formatLastUpdate(lastUpdate)}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">
          v1.0.0
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={!isConnected}
          className="border-card-border hover:bg-accent/50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};