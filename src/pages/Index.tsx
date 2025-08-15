import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  metrics: {
    totalOrders: number;
    avgProcessingTime: number;
    complianceRate: number;
    efficiencyScore: number;
  };
  charts: {
    distribution: any[];
    compliance: any[];
  };
}

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    metrics: {
      totalOrders: 0,
      avgProcessingTime: 0,
      complianceRate: 0,
      efficiencyScore: 0
    },
    charts: {
      distribution: [],
      compliance: []
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sheetId, setSheetId] = useState("1oyCjFS754qAW88vpEcqWeR_avTgwv3FWvVV66GJNqI4");
  const { toast } = useToast();

  const connectToSheet = async (newSheetId?: string) => {
    try {
      const targetSheetId = newSheetId || sheetId;
      setIsConnected(false);
      
      // Simulate Google Sheets connection and data processing
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv&gid=0`
      );
      
      if (!response.ok) {
        throw new Error('Failed to connect to Google Sheets. Please check the Sheet ID and permissions.');
      }

      // Simulate data processing (in real app, you'd use PapaParse here)
      const mockData: DashboardData = {
        metrics: {
          totalOrders: 1250,
          avgProcessingTime: 18.5,
          complianceRate: 94.2,
          efficiencyScore: 87.8
        },
        charts: {
          distribution: [
            { name: 'Processing', value: 35 },
            { name: 'Printed', value: 28 },
            { name: 'Manifest', value: 37 }
          ],
          compliance: [
            { name: 'On Time', value: 94.2 },
            { name: 'Delayed', value: 5.8 }
          ]
        }
      };

      setDashboardData(mockData);
      setIsConnected(true);
      setLastUpdate(new Date());
      
      toast({
        title: "Connected Successfully",
        description: "Dashboard data has been updated from Google Sheets.",
      });
      
    } catch (error) {
      setIsConnected(false);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  useEffect(() => {
    // Auto-connect on load
    connectToSheet();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (isConnected) {
        connectToSheet();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <DashboardHeader 
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        
        <StatusBar 
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onRefresh={() => connectToSheet()}
        />
        
        <div className="animate-slide-in space-y-8">
          <MetricsGrid metrics={dashboardData.metrics} />
          <ChartsSection data={dashboardData.charts} />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sheetId={sheetId}
        onSheetIdChange={setSheetId}
        onConnect={connectToSheet}
      />
    </div>
  );
};

export default Index;