import { Button } from "@/components/ui/button";
import { Settings, Github, Zap } from "lucide-react";

interface DashboardHeaderProps {
  onSettingsClick: () => void;
}

export const DashboardHeader = ({ onSettingsClick }: DashboardHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-6 bg-card border border-card-border rounded-lg shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center glow-effect">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Photawn Speed Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time operations monitoring and metrics
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onSettingsClick}
          className="border-card-border hover:bg-accent/50"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-card-border hover:bg-accent/50"
        >
          <a 
            href="https://github.com/yourusername/photawn-dashboard" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </a>
        </Button>
      </div>
    </header>
  );
};