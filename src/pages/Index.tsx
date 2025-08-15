import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { TimeMetricsGrid } from "@/components/dashboard/TimeMetricsGrid";
import { OrderDetailsView } from "@/components/dashboard/OrderDetailsView";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { useToast } from "@/hooks/use-toast";

interface OrderData {
  id: string;
  darkstoreName: string;
  brandName: string;
  createdAt: Date;
  importAt: Date;
  assignedAt: Date;
  confirmedAt: Date;
  printedAt: Date;
  manifestAt: Date;
  importCutoff: number; // minutes
  inventoryAssignCutoff: number; // minutes
  batchPickCutoff: number; // minutes
  labelCutoff: number; // minutes
  pickupCutoff: number; // minutes
}

interface MetricBucket {
  range: string;
  count: number;
  orders: OrderData[];
}

interface TimeMetrics {
  importCutoff: MetricBucket[];
  inventoryAssign: MetricBucket[];
  batchPick: MetricBucket[];
  labelPrint: MetricBucket[];
  pickupCutoff: MetricBucket[];
}

interface DashboardData {
  orders: OrderData[];
  metrics: TimeMetrics;
  summary: {
    totalOrders: number;
    avgImportTime: number;
    avgTotalTime: number;
    onTimeRate: number;
  };
}

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    orders: [],
    metrics: {
      importCutoff: [],
      inventoryAssign: [],
      batchPick: [],
      labelPrint: [],
      pickupCutoff: []
    },
    summary: {
      totalOrders: 0,
      avgImportTime: 0,
      avgTotalTime: 0,
      onTimeRate: 0
    }
  });
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
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

      // Simulate CSV parsing and data processing
      const csvText = await response.text();
      const processedData = processSheetData(csvText);
      
      setDashboardData(processedData);

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

  const processSheetData = (csvText: string): DashboardData => {
    // Mock data processing - in real implementation, use Papa Parse
    const mockOrders: OrderData[] = Array.from({ length: 120 }, (_, i) => {
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const importAt = new Date(createdAt.getTime() + Math.random() * 30 * 60 * 1000);
      const assignedAt = new Date(importAt.getTime() + Math.random() * 20 * 60 * 1000);
      const confirmedAt = new Date(assignedAt.getTime() + Math.random() * 25 * 60 * 1000);
      const printedAt = new Date(confirmedAt.getTime() + Math.random() * 15 * 60 * 1000);
      const manifestAt = new Date(printedAt.getTime() + Math.random() * 20 * 60 * 1000);

      return {
        id: `ORD-${String(i + 1).padStart(4, '0')}`,
        darkstoreName: `Store ${Math.floor(Math.random() * 10) + 1}`,
        brandName: ['PhotonX', 'SpeedMart', 'QuickBuy', 'FlashCart'][Math.floor(Math.random() * 4)],
        createdAt,
        importAt,
        assignedAt,
        confirmedAt,
        printedAt,
        manifestAt,
        importCutoff: Math.round((importAt.getTime() - createdAt.getTime()) / (1000 * 60)),
        inventoryAssignCutoff: Math.round((assignedAt.getTime() - importAt.getTime()) / (1000 * 60)),
        batchPickCutoff: Math.round((confirmedAt.getTime() - assignedAt.getTime()) / (1000 * 60)),
        labelCutoff: Math.round((printedAt.getTime() - confirmedAt.getTime()) / (1000 * 60)),
        pickupCutoff: Math.round((manifestAt.getTime() - printedAt.getTime()) / (1000 * 60))
      };
    });

    const categorizeBucket = (time: number): string => {
      if (time <= 15) return '0-15 mins';
      if (time <= 25) return '15-25 mins';
      return '25+ mins';
    };

    const createMetricBuckets = (orders: OrderData[], metricKey: keyof Pick<OrderData, 'importCutoff' | 'inventoryAssignCutoff' | 'batchPickCutoff' | 'labelCutoff' | 'pickupCutoff'>): MetricBucket[] => {
      const buckets = ['0-15 mins', '15-25 mins', '25+ mins'];
      return buckets.map(range => ({
        range,
        count: orders.filter(order => categorizeBucket(order[metricKey] as number) === range).length,
        orders: orders.filter(order => categorizeBucket(order[metricKey] as number) === range)
      }));
    };

    return {
      orders: mockOrders,
      metrics: {
        importCutoff: createMetricBuckets(mockOrders, 'importCutoff'),
        inventoryAssign: createMetricBuckets(mockOrders, 'inventoryAssignCutoff'),
        batchPick: createMetricBuckets(mockOrders, 'batchPickCutoff'),
        labelPrint: createMetricBuckets(mockOrders, 'labelCutoff'),
        pickupCutoff: createMetricBuckets(mockOrders, 'pickupCutoff')
      },
      summary: {
        totalOrders: mockOrders.length,
        avgImportTime: Math.round(mockOrders.reduce((sum, o) => sum + o.importCutoff, 0) / mockOrders.length),
        avgTotalTime: Math.round(mockOrders.reduce((sum, o) => sum + (o.manifestAt.getTime() - o.createdAt.getTime()) / (1000 * 60), 0) / mockOrders.length),
        onTimeRate: Math.round((mockOrders.filter(o => o.importCutoff <= 15 && o.inventoryAssignCutoff <= 15).length / mockOrders.length) * 100)
      }
    };
  };

  const handleMetricClick = (metricType: string, bucketRange: string) => {
    setSelectedMetric(metricType);
    setSelectedBucket(bucketRange);
    setShowOrderDetails(true);
  };

  const getSelectedOrders = (): OrderData[] => {
    if (!selectedMetric || !selectedBucket) return [];
    const metric = dashboardData.metrics[selectedMetric as keyof TimeMetrics];
    const bucket = metric?.find(b => b.range === selectedBucket);
    return bucket?.orders || [];
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
          {!showOrderDetails ? (
            <>
              <MetricsOverview summary={dashboardData.summary} />
              <TimeMetricsGrid 
                metrics={dashboardData.metrics}
                onMetricClick={handleMetricClick}
              />
              <ChartsSection metrics={dashboardData.metrics} />
            </>
          ) : (
            <OrderDetailsView 
              orders={getSelectedOrders()}
              metricType={selectedMetric!}
              bucketRange={selectedBucket!}
              onBack={() => setShowOrderDetails(false)}
            />
          )}
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